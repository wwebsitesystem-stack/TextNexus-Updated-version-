// PASTE-READY VERSION (key embedded). Do NOT commit or share this file.
// xKiro gateway: a Cloudflare Worker that proxies GhostLink's AI chat to api.xkiro.com.
//   - keeps the xKiro API key server-side (env.XKIRO_API_KEY)
//   - only lets FREE models through (access_tier === "free" in the live /v1/models catalog)
//   - CORS allowlist, per-IP rate limit, body/param caps
//   - optionally routes upstream traffic through Cloudflare AI Gateway (env.AI_GATEWAY_BASE)

const EMBEDDED_KEY = 'sk-xt-e9a4c90ac96d50eb79d9a3a4c1a87642a2ae9cb76a708987';
const XKIRO_BASE = 'https://api.xkiro.com';
const DEFAULT_ORIGINS = 'https://textnexus.me,http://127.0.0.1:5500,http://localhost:5500,http://localhost:5050,http://localhost:3000';
const MODELS_TTL_MS = 5 * 60 * 1000;
const MAX_BODY_BYTES = 20 * 1024 * 1024;

// Only these request fields are forwarded. Anything else (tools, web_search, ...) is dropped
// so a caller can't trigger paid features on the shared key.
const ALLOWED_FIELDS = [
  'model', 'messages', 'stream', 'max_tokens', 'temperature', 'top_p', 'stop',
  'frequency_penalty', 'presence_penalty', 'seed', 'response_format', 'reasoning_effort',
];

let modelsCache = { at: 0, list: null };
const hits = new Map(); // ip -> timestamps (best-effort; resets when the isolate recycles)

export default {
  async fetch(request, env0) {
    const env = { ...env0, XKIRO_API_KEY: env0.XKIRO_API_KEY || EMBEDDED_KEY };
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    }
    if (origin && !cors) return json({ error: { message: 'Origin not allowed', type: 'forbidden' } }, 403);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (path === '/' || path === '/health') {
        return json({ ok: true, service: 'xkiro-gateway', gateway: !!env.AI_GATEWAY_BASE }, 200, cors);
      }
      if (path === '/v1/models' && request.method === 'GET') {
        const models = await freeModels(env);
        return json({ object: 'list', data: models }, 200, cors);
      }
      if (path === '/v1/chat/completions' && request.method === 'POST') {
        return await chat(request, env, cors);
      }
      return json({ error: { message: 'Not found', type: 'not_found' } }, 404, cors);
    } catch (e) {
      return json({ error: { message: 'Gateway error: ' + ((e && e.message) || e), type: 'gateway_error' } }, 502, cors);
    }
  },
};

async function chat(request, env, cors) {
  if (!env.XKIRO_API_KEY) {
    return json({ error: { message: 'Gateway not configured (missing XKIRO_API_KEY)', type: 'config_error' } }, 500, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip, parseInt(env.RATE_LIMIT_PER_MIN, 10) || 30)) {
    return json({ error: { message: 'Too many requests, slow down', type: 'rate_limited' } }, 429, { ...cors, 'Retry-After': '30' });
  }

  const declared = parseInt(request.headers.get('Content-Length') || '0', 10);
  if (declared > MAX_BODY_BYTES) return json({ error: { message: 'Request too large', type: 'too_large' } }, 413, cors);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: { message: 'Request too large', type: 'too_large' } }, 413, cors);

  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: { message: 'Invalid JSON', type: 'bad_request' } }, 400, cors); }
  if (!body || typeof body.model !== 'string' || !Array.isArray(body.messages) || !body.messages.length) {
    return json({ error: { message: '"model" and non-empty "messages" are required', type: 'bad_request' } }, 400, cors);
  }

  const free = await freeModels(env);
  if (!free.some(m => m.id === body.model)) {
    return json({ error: { message: `Model "${body.model}" is not a free model`, type: 'model_not_free' } }, 403, cors);
  }

  const clean = {};
  for (const k of ALLOWED_FIELDS) if (body[k] !== undefined) clean[k] = body[k];
  const cap = parseInt(env.MAX_TOKENS_CAP, 10) || 8192;
  if (!(clean.max_tokens > 0) || clean.max_tokens > cap) clean.max_tokens = cap;

  const upstream = await fetch(upstreamBase(env) + '/v1/chat/completions', {
    method: 'POST',
    headers: upstreamHeaders(env, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(clean),
  });

  const headers = new Headers(cors || {});
  headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
  headers.set('Cache-Control', 'no-store');
  if (clean.stream) headers.set('X-Accel-Buffering', 'no');
  return new Response(upstream.body, { status: upstream.status, headers });
}

async function freeModels(env) {
  const now = Date.now();
  if (modelsCache.list && now - modelsCache.at < MODELS_TTL_MS) return modelsCache.list;
  const res = await fetch(upstreamBase(env) + '/v1/models', { headers: upstreamHeaders(env) });
  if (!res.ok) {
    if (modelsCache.list) return modelsCache.list; // serve stale rather than fail
    throw new Error('Could not load model catalog (' + res.status + ')');
  }
  const data = (await res.json()).data || [];
  const list = data
    .filter(m => m.access_tier === 'free' && (!m.modality || m.modality === 'chat'))
    .map(m => ({
      id: m.id,
      name: m.display_name || m.id,
      vision: !!(m.capabilities && m.capabilities.vision),
      reasoning: !!(m.capabilities && m.capabilities.reasoning),
      context_length: m.context_length,
      max_output_tokens: m.max_output_tokens,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  modelsCache = { at: now, list };
  return list;
}

function upstreamBase(env) {
  return (env.AI_GATEWAY_BASE || XKIRO_BASE).replace(/\/+$/, '');
}

function upstreamHeaders(env, extra = {}) {
  const h = { ...extra, Authorization: 'Bearer ' + env.XKIRO_API_KEY };
  if (env.AI_GATEWAY_TOKEN) h['cf-aig-authorization'] = 'Bearer ' + env.AI_GATEWAY_TOKEN;
  return h;
}

function rateLimited(ip, limit) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < 60000)) hits.delete(k);
  return recent.length > limit;
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(',').map(s => s.trim()).filter(Boolean);
  const any = allowed.includes('*');
  if (origin && !any && !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': any ? '*' : origin || allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(extra || {}) },
  });
}
