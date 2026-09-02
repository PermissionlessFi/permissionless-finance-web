import OpenAI from "openai";

/* AI backend: Kimi (Moonshot) — an OpenAI-compatible API, so we drive it with
 * the OpenAI SDK. Configured entirely through the environment:
 *   KIMI_API_KEY   — Moonshot API key
 *   KIMI_BASE_URL  — API endpoint, e.g. https://<host>/v1. Required: it must
 *                    match the endpoint your key is provisioned for, so there
 *                    is no built-in default (see the Moonshot console).
 *   KIMI_MODEL     — default "kimi-k3" (a reasoning model)
 * Both credentials fall back to placeholders so importing this module never
 * throws during the build when the env isn't present; a real request then
 * fails loudly with an auth/connection error instead of silently misrouting. */
export const ai = new OpenAI({
  apiKey: process.env.KIMI_API_KEY || "unset",
  baseURL: process.env.KIMI_BASE_URL || "https://api.invalid/v1",
});

export const MODEL = process.env.KIMI_MODEL || "kimi-k3";
