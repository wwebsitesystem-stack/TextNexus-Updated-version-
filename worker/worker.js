/**
 * Xkiro proxy Worker (single file)
 * Required secret: XKIRO_API_KEY
 * Optional variable: ALLOWED_ORIGINS (comma-separated origins)
 *
 * API routes: GET /api/models, POST /api/chat,
 *             POST /api/images, GET /api/images/:id
 */
const XKIRO_API_BASE_URL = "https://api.xkiro.com/v1";
const DEFAULT_ORIGINS = new Set(["http://127.0.0.1:5500", "http://localhost:5500"]);
// The exact free models approved for Brindle's consumer-facing picker.
// Keep this list deliberately explicit: a new model in xKiro's catalog is
// not shown unless it has been reviewed and added here.
const APPROVED_FREE_MODEL_IDS = new Set([
  "deepseek/deepseek-v4.1-flash:free", "deepseek/deepseek-v4-pro", "deepseek/deepseek-v4-flash", "deepseek/deepseek-v3.2", "deepseek/deepseek-chat-v3.1",
  "mistralai/mistral-large-2512", "mistralai/mistral-medium-3.5", "mistralai/mistral-small-2603", "mistralai/codestral-2508", "mistralai/devstral-medium", "mistralai/ministral-14b", "mistralai/ministral-8b", "mistralai/ministral-3b",
  "minimax/minimax-m3:free", "minimax/minimax-m2.7:free", "minimax/minimax-m2.7-highspeed:free", "minimax/minimax-m2.5:free", "minimax/minimax-m2.5-highspeed:free", "minimax/minimax-m2.1:free", "minimax/minimax-m2.1-highspeed:free", "minimax/minimax-m2:free",
  "xiaomi/mimo-v2.6-flash:free",
  "qwen/qwen3.8-omni-flash:free", "qwen/qwen3.8-max:free", "qwen/qwen3.7-max:free", "qwen/qwen3.7-plus:free", "qwen/qwen3.7-flash:free", "qwen/qwen3.6-plus:free", "qwen/qwen3.6-max-preview:free", "qwen/qwen3.6-27b:free", "qwen/qwen3.5-plus:free", "qwen/qwen3.5-omni-plus:free", "qwen/qwen3.6-35b-a3b:free", "qwen/qwen3.5-flash:free", "qwen/qwen3.5-397b-a17b:free", "qwen/qwen3.5-omni-flash:free", "qwen/qwen3-max:free", "qwen/qwen-plus-2025-07-28:free", "qwen/qwen3-coder-plus:free", "qwen/qwen3-vl-plus:free", "qwen/qwen3-omni-flash:free",
  "dots-studio/dots-3-note-preview:free", "inclusionai/ling-3.0-flash-sante:free", "liquid/lfm-2.5-2.6b:free", "meta/muse-spark-1.3-contributor:free",
  "sensenova/sensenova-6.8-flash-lite", "sensenova/sensenova-6.7-flash-lite", "sensenova/sensenova-u1.5-lite",
  "cohere/command-a-plus", "cohere/north-mini-code", "cohere/command-a-reasoning", "cohere/command-a-vision", "cohere/command-a", "cohere/command-a-translate", "cohere/north-small-translate", "cohere/command-r-plus-08-2024", "cohere/command-r-08-2024", "cohere/command-r7b-12-2024", "cohere/aya-expanse-32b", "cohere/aya-vision-32b", "cohere/tiny-aya-global", "cohere/tiny-aya-earth", "cohere/tiny-aya-fire", "cohere/tiny-aya-water",
]);

function allowedOrigins(env) {
  const values = String(env.ALLOWED_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean);
  return values.length ? new Set(values) : DEFAULT_ORIGINS;
}
function cors(request, env) {
  const headers = new Headers({ Vary: "Origin" });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return headers;
}
function response(request, env, body, init = {}) {
  const headers = cors(request, env);
  new Headers(init.headers || {}).forEach((value, key) => headers.set(key, value));
  return new Response(body, { ...init, headers });
}
function json(request, env, body, status = 200) { return response(request, env, JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } }); }
function error(request, env, status, code, message) { return json(request, env, { error: { code, message } }, status); }
function apiPath(request) { return new URL(request.url).pathname.replace(/\/+$/, "") || "/"; }
function upstreamHeaders(env) { return { Authorization: `Bearer ${env.XKIRO_API_KEY}`, "Content-Type": "application/json" }; }
async function requestJson(request, env) { try { return await request.json(); } catch { throw error(request, env, 400, "bad_request", "Send a JSON request body."); } }
function clientModel(model) {
  const image = model.modality === "image";
  return { id: model.id, name: model.display_name || model.id, provider: model.owned_by || String(model.id || "xKiro").split("/")[0], kind: image ? "image" : "chat", status: "available", context: Number(model.context_length || 0), vision: Boolean(model.capabilities?.vision), tools: Boolean(model.capabilities?.tools), reasoning: Boolean(model.capabilities?.reasoning) };
}
function isConsumerFreeModel(model) {
  // The xKiro tier is the authority for price. Keep paid-model families out
  // of the consumer-facing free picker even if an upstream label is wrong.
  const identity = [model.id, model.display_name, model.owned_by].filter(Boolean).join(" ");
  return model.access_tier === "free" && APPROVED_FREE_MODEL_IDS.has(model.id) && !/\b(gpt|chatgpt|openai|claude|anthropic|o1|o3|o4)\b/i.test(identity);
}
async function models(request, env) {
  const upstream = await fetch(`${XKIRO_API_BASE_URL}/models?modality=all`);
  if (!upstream.ok) return error(request, env, 502, "upstream_error", "Could not load xKiro's model catalog.");
  const payload = await upstream.json();
  const models = (Array.isArray(payload.data) ? payload.data : [])
    // xKiro supplies access_tier as the source of truth.  Do not infer
    // availability from display names or a :free suffix.
    .filter(isConsumerFreeModel)
    .filter((model) => model.modality === "chat" || model.modality === "image")
    .map(clientModel)
    .sort((a, b) => a.name.localeCompare(b.name));
  return json(request, env, { configured: Boolean(env.XKIRO_API_KEY), freeOnly: true, models });
}
async function chat(request, env) {
  if (!env.XKIRO_API_KEY) return error(request, env, 503, "not_configured", "The Worker needs an XKIRO_API_KEY secret.");
  const input = await requestJson(request, env);
  if (!input || typeof input.model !== "string" || !Array.isArray(input.messages)) return error(request, env, 400, "bad_request", "A model and messages array are required.");
  const upstream = await fetch(`${XKIRO_API_BASE_URL}/chat/completions`, { method: "POST", headers: upstreamHeaders(env), body: JSON.stringify({ model: input.model, messages: input.messages.slice(-40), stream: true }) });
  if (!upstream.ok) return response(request, env, await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
  return response(request, env, upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" } });
}
async function createImage(request, env) {
  if (!env.XKIRO_API_KEY) return error(request, env, 503, "not_configured", "The Worker needs an XKIRO_API_KEY secret.");
  const input = await requestJson(request, env);
  if (!input || typeof input.model !== "string" || typeof input.prompt !== "string") return error(request, env, 400, "bad_request", "A model and prompt are required.");
  const upstream = await fetch(`${XKIRO_API_BASE_URL}/images/generations`, { method: "POST", headers: upstreamHeaders(env), body: JSON.stringify({ model: input.model, prompt: input.prompt, n: 1, size: "1024x1024" }) });
  return response(request, env, await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
}
async function imageStatus(request, env, id) {
  if (!env.XKIRO_API_KEY) return error(request, env, 503, "not_configured", "The Worker needs an XKIRO_API_KEY secret.");
  const upstream = await fetch(`${XKIRO_API_BASE_URL}/images/generations/${encodeURIComponent(id)}`, { headers: upstreamHeaders(env) });
  if (!upstream.ok) return response(request, env, await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
  const job = await upstream.json();
  return json(request, env, { status: job.status, url: job.data?.[0]?.url, error: job.error?.message || job.error });
}
export default {
  async fetch(request, env) {
    const path = apiPath(request);
    if (request.method === "OPTIONS") return response(request, env, null, { status: 204 });
    if (path === "/" || path === "/health") return json(request, env, { ok: true, service: "xkiro-proxy", configured: Boolean(env.XKIRO_API_KEY) });
    if (path === "/api/settings" && request.method === "GET") return json(request, env, { configured: Boolean(env.XKIRO_API_KEY), provider: "xkiro", allowedOrigins: [...allowedOrigins(env)] });
    if (path === "/api/models" && request.method === "GET") return models(request, env);
    if (path === "/api/chat" && request.method === "POST") return chat(request, env);
    if (path === "/api/images" && request.method === "POST") return createImage(request, env);
    const image = path.match(/^\/api\/images\/([^/]+)$/);
    if (image && request.method === "GET") return imageStatus(request, env, image[1]);
    return error(request, env, 404, "not_found", "Route not found.");
  },
};
