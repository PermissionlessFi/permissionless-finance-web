/**
 * ai-guard.ts — dependency-free request guard for the AI routes.
 *
 * Provides origin verification, an optional shared access token, a per-IP
 * sliding-window rate limit, and a daily token-cost cap.
 *
 * ⚠️  PER-INSTANCE STATE (single process only):
 * All state below (rate-limit windows in `requestLog`, the running
 * `tokensUsedToday` counter) lives in module-level variables. That means the
 * limits are enforced PER Node process / PER PM2 worker, NOT globally. This is
 * fine for a single-server / single-worker deployment. For any multi-instance,
 * serverless, or horizontally-scaled deployment, replace this module with a
 * shared store (e.g. Redis) so the counters are enforced across all instances.
 */

// ---- Tunables ---------------------------------------------------------------

const RATE_LIMIT_PER_MINUTE = 30;
const RATE_WINDOW_MS = 60_000; // 60s
const RATE_LIMIT_PER_DAY = 500;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_DAILY_TOKEN_CAP = 5_000_000;
// Guard against unbounded memory growth from many distinct IPs.
const MAX_TRACKED_IPS = 10_000;

function dailyTokenCap(): number {
  const raw = Number(process.env.AI_DAILY_TOKEN_CAP);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DAILY_TOKEN_CAP;
}

// ---- Per-IP rate-limit state ------------------------------------------------

// For each IP we keep the timestamps (ms) of its recent requests. Entries older
// than the longest window (24h) are pruned on access to bound memory.
const requestLog = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

// Opportunistic sweep so long-idle IPs don't accumulate forever.
function maybeSweep(now: number): void {
  if (requestLog.size <= MAX_TRACKED_IPS) return;
  for (const [ip, times] of requestLog) {
    const recent = times.filter((t) => now - t < DAY_WINDOW_MS);
    if (recent.length === 0) requestLog.delete(ip);
    else requestLog.set(ip, recent);
  }
}

// ---- Daily token counter ----------------------------------------------------

let tokensUsedToday = 0;
let currentUtcDay = utcDayKey();

function utcDayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function rolloverDayIfNeeded(): void {
  const today = utcDayKey();
  if (today !== currentUtcDay) {
    currentUtcDay = today;
    tokensUsedToday = 0;
  }
}

function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

// ---- Origin check -----------------------------------------------------------

function hostFromUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

// Accepts either full origins ("https://foo.com") or bare hosts ("foo.com",
// "foo.com:3000") in ALLOWED_ORIGINS and normalizes both to a host for compare.
function normalizeToHost(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("://")) return hostFromUrl(trimmed);
  return hostFromUrl(`https://${trimmed}`) ?? trimmed;
}

function isOriginAllowed(req: Request): boolean {
  const requestHost = req.headers.get("host");
  const source = req.headers.get("origin") || req.headers.get("referer");

  // No origin/referer at all (server-side fetch, curl, tests, etc.): allow only
  // outside production so local dev / SSR keeps working, but block in prod.
  if (!source) {
    return process.env.NODE_ENV !== "production";
  }

  const sourceHost = hostFromUrl(source);
  if (!sourceHost) {
    // Malformed origin/referer — treat like a missing header.
    return process.env.NODE_ENV !== "production";
  }

  // Same-origin browser fetches (Origin host === request Host).
  if (requestHost && sourceHost === requestHost) return true;

  // Explicit allow-list (comma-separated origins or hosts).
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalizeToHost)
    .filter((h): h is string => Boolean(h));

  return allowed.includes(sourceHost);
}

// ---- Public API -------------------------------------------------------------

/**
 * Guard an incoming AI request. Call at the very top of every AI route handler:
 *
 *   const blocked = guardAiRequest(req);
 *   if (blocked) return blocked;
 *
 * Returns a Response to short-circuit with (403 / 401 / 429) when the request
 * must be rejected, or `null` when the request is allowed to proceed. Only reads
 * request headers — safe to call before consuming the request body.
 */
export function guardAiRequest(req: Request): Response | null {
  // 1) Origin / referer check.
  if (!isOriginAllowed(req)) {
    return new Response("Forbidden", { status: 403 });
  }

  // 2) Optional shared token.
  const requiredToken = process.env.AI_ACCESS_TOKEN;
  if (requiredToken) {
    if (req.headers.get("x-ai-token") !== requiredToken) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // 3) Per-IP sliding-window rate limit (30/min AND 500/day).
  const now = Date.now();
  maybeSweep(now);
  const ip = getClientIp(req);
  const log = requestLog.get(ip) ?? [];
  const pruned = log.filter((t) => now - t < DAY_WINDOW_MS);
  const inLastMinute = pruned.filter((t) => now - t < RATE_WINDOW_MS).length;
  if (inLastMinute >= RATE_LIMIT_PER_MINUTE || pruned.length >= RATE_LIMIT_PER_DAY) {
    // Persist the pruned window but do NOT record the rejected request.
    requestLog.set(ip, pruned);
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }
  pruned.push(now);
  requestLog.set(ip, pruned);

  // 4) Daily token-cost cap (best-effort; fed by recordUsage()).
  rolloverDayIfNeeded();
  if (tokensUsedToday >= dailyTokenCap()) {
    return new Response("Daily token cap exceeded", {
      status: 429,
      headers: { "Retry-After": String(secondsUntilUtcMidnight()) },
    });
  }

  return null;
}

/**
 * Record token usage against today's running counter. Call after each Anthropic
 * response (non-streaming: pass `response.usage`; streaming: pass the final
 * `message.usage` from `stream.finalMessage()` where available, otherwise skip).
 * Missing/undefined usage is a no-op.
 */
export function recordUsage(
  usage: { input_tokens?: number; output_tokens?: number } | undefined | null
): void {
  if (!usage) return;
  rolloverDayIfNeeded();
  const input = typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
  const output = typeof usage.output_tokens === "number" ? usage.output_tokens : 0;
  tokensUsedToday += input + output;
}
