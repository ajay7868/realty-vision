# VKS Realty realtime co-browsing service

Standalone Node.js service for private, expiring property exploration sessions. It is intentionally separate from the Vercel static site because Serverless Functions are not a reliable place to hold long-lived SSE connections or in-memory shared session state.

## API

- `GET /health` — health check.
- `POST /api/sessions` — create a session. Body: `{"projectId":"vihaan-villa","sceneId":"lobby"}`. Returns a private host token and a guest invitation token.
- `GET /api/sessions/:id` — read current state (Bearer token or `?token=`).
- `GET /api/sessions/:id/events` — SSE stream. Sends the current state immediately, then `state` events; reconnecting clients receive the latest state on connect.
- `PATCH /api/sessions/:id/state` — update the shared project, scene and hotspot. Body: `{"projectId":"...","sceneId":"...","hotspotId":null}`.
- `POST /api/sessions/:id/close` — host-only session close.

## Run locally

```sh
cd realtime
npm install
ALLOWED_ORIGINS=http://localhost:5500,https://vks-realty-2-0.vercel.app npm run dev
```

The service defaults to port 8080 and a 60-minute session lifetime.

## Deploy

Deploy this directory as a standalone Node web service on a host that supports persistent Node processes and Server-Sent Events (for example Railway, Render or Fly.io). Set the service root to `realtime`, build command to `npm install`, start command to `npm start`, and configure:

- `ALLOWED_ORIGINS`: comma-separated exact frontend origins, including the production Vercel domain and any preview domains you intend to allow.
- `SESSION_TTL_MINUTES`: session lifetime (default 60).
- `MAX_SESSIONS`: in-memory capacity limit (default 500).
- `PORT`: supplied by most hosting providers.

Then set `window.VKS_REALTIME_URL` in a small frontend config script to the deployed HTTPS service origin. Do not put host or guest tokens in analytics, logs or CRM records.

## Current limitations / production hardening

This first milestone uses in-memory session storage. Sessions are lost on process restart and are not shared across multiple service instances. Use a shared store (Redis) with TTL and pub/sub before horizontal scaling or treating this as a production-grade collaboration service. Add provider-level rate limiting, observability and abuse controls before public launch. Tokens are high-entropy bearer credentials; invitation links grant access to the shared session until expiry. Do not place personal lead data in session state.

The browser integration is the next step after the realtime service has a stable HTTPS URL. No realtime service is deployed by this repository commit alone.
