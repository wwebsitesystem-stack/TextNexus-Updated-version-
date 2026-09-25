# xkiro-gateway

Cloudflare Worker that proxies the TextNexus **AI Gateway** chat tab (ai-gateway.html) to `api.xkiro.com`.

- xKiro API key stays server-side (Worker secret), never reaches the browser
- Only **free** models are allowed (`access_tier: "free"` in xKiro's live `/v1/models`)
- CORS allowlist, per-IP rate limit, `max_tokens` cap, request-field allowlist
- Optional: route upstream through Cloudflare AI Gateway (logs / cache / analytics)

## Deploy

```bash
cd worker/xkiro-gateway
npx wrangler login
npx wrangler secret put XKIRO_API_KEY     # paste the xKiro key
npx wrangler deploy
```

Wrangler prints the URL (`https://xkiro-gateway.<subdomain>.workers.dev`). Put it in the app:
open the **AI Gateway** sidebar tab (under GhostLink), click the gear, paste it, "Save & reload models".
(Or set `AIGW_DEFAULT_URL` near the top of the script in `ai-gateway.html`.)

Add every origin that hosts GhostLink to `ALLOWED_ORIGINS` in `wrangler.toml`, then redeploy.

## Local dev

`.dev.vars` holds the key for `npx wrangler dev` (gitignored, do not commit).

## Cloudflare AI Gateway (optional)

1. Dashboard, AI, AI Gateway, create a gateway.
2. Add a custom provider `xkiro` with base URL `https://api.xkiro.com`.
3. Uncomment `AI_GATEWAY_BASE` in `wrangler.toml`; if the gateway is authenticated, `npx wrangler secret put AI_GATEWAY_TOKEN`.

## Endpoints

| Route | Notes |
|---|---|
| `GET /health` | liveness |
| `GET /v1/models` | free chat models only, with `vision` / `reasoning` flags |
| `POST /v1/chat/completions` | OpenAI-compatible, streaming supported; 403 for non-free models |

## No-CLI option (paste into dashboard)

`worker.local.js` is the same code as `src/index.js` in ONE file with the xKiro key already embedded (gitignored, never commit it).
Cloudflare dashboard, Workers & Pages, Create Worker, Edit code, paste it, Deploy. No secrets or config needed.
