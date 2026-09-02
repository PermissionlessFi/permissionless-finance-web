/* Email newsletter capture. Provider-agnostic so it works the moment a
 * destination is configured — no code change needed:
 *   BUTTONDOWN_API_KEY     → subscribe directly via Buttondown (recommended)
 *   NEWSLETTER_WEBHOOK_URL  → POST {email, ts, source} to any webhook
 *                            (Google Apps Script → Sheet, Zapier, Make, etc.)
 * With neither set, the form stays graceful: 503 "not_configured", and the UI
 * falls back to the RSS feed rather than silently dropping addresses. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const buttondown = process.env.BUTTONDOWN_API_KEY;
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;

  try {
    if (buttondown) {
      const r = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: { Authorization: `Token ${buttondown}`, "content-type": "application/json" },
        body: JSON.stringify({ email_address: email }),
      });
      if (r.ok) return json({ ok: true });
      // Buttondown returns 400 when the address already exists — treat as success.
      const text = await r.text().catch(() => "");
      if (r.status === 400 && /already|exists|subscribed/i.test(text)) {
        return json({ ok: true, already: true });
      }
      return json({ ok: false, error: "provider_error" }, 502);
    }

    if (webhook) {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, ts: new Date().toISOString(), source: "permissionless.fi" }),
      });
      return json({ ok: r.ok }, r.ok ? 200 : 502);
    }

    return json({ ok: false, error: "not_configured" }, 503);
  } catch {
    return json({ ok: false, error: "upstream_error" }, 502);
  }
}
