# Xkiro Worker

`worker.js` is the complete Worker source. It exposes the backend that the
Brindle/Xkiro page expects:

- `GET /health` and `GET /api/settings`
- `GET /api/models`
- `POST /api/chat` (streamed server-sent events)

The model endpoint intentionally returns only xKiro models whose live
`access_tier` is `free`; PAYG, paid, and premium models are excluded. GPT and
Claude/Anthropic families are also withheld from the consumer picker. The
remaining catalog is an explicit allowlist of the approved free model IDs.

## Configure after deployment

1. In the Worker **Settings → Variables and Secrets**, add the secret
   `XKIRO_API_KEY` with an xKiro API key.
2. Add the plain-text variable `ALLOWED_ORIGINS` with:
   `http://127.0.0.1:5500,http://localhost:5500`
3. Open the local app and use **Server Settings** to paste the Worker URL,
   such as `https://xkiro-api.<your-subdomain>.workers.dev`.

The origin must include the port. Firebase's authorized-domain entry only
needs `127.0.0.1`; the Worker CORS setting above is what permits port 5500.

## Hand-off

To give another person the same setup, share this folder (never an API key).
They can paste `worker.js` into a new Cloudflare Worker and add their own
secret and allowed origins. The Worker intentionally does not contain a
credential or a hard-coded account ID.
