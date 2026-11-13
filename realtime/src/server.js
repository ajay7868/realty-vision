import express from "express";
import cors from "cors";
import helmet from "helmet";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const app = express();
const PORT = Number(process.env.PORT || 8080);
const TTL_MS = Math.max(5, Number(process.env.SESSION_TTL_MINUTES || 60)) * 60_000;
const MAX_SESSIONS = Number(process.env.MAX_SESSIONS || 500);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://vks-realty-2-0.vercel.app")
  .split(",").map((value) => value.trim()).filter(Boolean);
const sessions = new Map();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed"));
  },
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "16kb" }));

function token() { return randomBytes(32).toString("base64url"); }
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function cleanSession(session) {
  return {
    id: session.id,
    state: session.state,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    participants: session.participants.size,
  };
}
function getSession(req, res) {
  const session = sessions.get(req.params.id);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) expireSession(session.id);
    res.status(404).json({ error: "Session not found or expired" });
    return null;
  }
  const supplied = req.get("authorization")?.replace(/^Bearer\s+/i, "") || req.query.token;
  const authorized = [...session.tokens.values()].some((candidate) => safeEqual(candidate, supplied));
  if (!authorized) {
    res.status(401).json({ error: "A valid session invitation token is required" });
    return null;
  }
  return session;
}
function publish(session, event, data) {
  const packet = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const response of session.clients) response.write(packet);
}
function expireSession(id) {
  const session = sessions.get(id);
  if (!session) return;
  publish(session, "expired", { message: "This exploration session has expired" });
  for (const response of session.clients) response.end();
  sessions.delete(id);
}
function validState(value) {
  return value && typeof value === "object" &&
    typeof value.projectId === "string" && value.projectId.length <= 80 &&
    typeof value.sceneId === "string" && value.sceneId.length <= 80 &&
    (value.hotspotId === null || typeof value.hotspotId === "string") &&
    (value.hotspotId === null || value.hotspotId.length <= 80);
}
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) if (session.expiresAt <= now) expireSession(id);
}, 30_000).unref();

app.get("/health", (_req, res) => res.json({ ok: true, service: "vks-realty-realtime" }));

app.post("/api/sessions", (req, res) => {
  if (sessions.size >= MAX_SESSIONS) return res.status(503).json({ error: "Session capacity reached" });
  const { projectId, sceneId } = req.body || {};
  if (typeof projectId !== "string" || projectId.length > 80 ||
      typeof sceneId !== "string" || sceneId.length > 80) {
    return res.status(400).json({ error: "projectId and sceneId are required" });
  }
  const id = randomUUID();
  const hostToken = token();
  const guestToken = token();
  const now = Date.now();
  const session = {
    id, createdAt: now, expiresAt: now + TTL_MS,
    state: { projectId, sceneId, hotspotId: null, updatedAt: now, updatedBy: "host" },
    tokens: new Map([["host", hostToken], ["guest", guestToken]]),
    participants: new Set(["host"]), clients: new Set(),
  };
  sessions.set(id, session);
  return res.status(201).json({ session: cleanSession(session), hostToken, guestToken });
});

app.get("/api/sessions/:id", (req, res) => {
  const session = getSession(req, res);
  if (!session) return;
  res.json({ session: cleanSession(session) });
});

app.get("/api/sessions/:id/events", (req, res) => {
  const session = getSession(req, res);
  if (!session) return;
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();
  session.clients.add(res);
  session.participants.add("guest");
  res.write(`event: state\ndata: ${JSON.stringify(session.state)}\n\n`);
  const heartbeat = setInterval(() => res.write(": keep-alive\\n\\n"), 20_000);
  req.on("close", () => {
    clearInterval(heartbeat);
    session.clients.delete(res);
  });
});

app.patch("/api/sessions/:id/state", (req, res) => {
  const session = getSession(req, res);
  if (!session) return;
  if (!validState(req.body)) return res.status(400).json({ error: "Invalid exploration state" });
  const supplied = req.get("authorization")?.replace(/^Bearer\s+/i, "") || req.query.token;
  const role = safeEqual(session.tokens.get("host"), supplied) ? "host" : "guest";
  session.state = { ...req.body, updatedAt: Date.now(), updatedBy: role };
  publish(session, "state", session.state);
  res.json({ state: session.state });
});

app.post("/api/sessions/:id/close", (req, res) => {
  const session = getSession(req, res);
  if (!session) return;
  const supplied = req.get("authorization")?.replace(/^Bearer\s+/i, "") || req.query.token;
  if (!safeEqual(session.tokens.get("host"), supplied)) return res.status(403).json({ error: "Only the host can close a session" });
  expireSession(session.id);
  res.json({ closed: true });
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin not allowed") return res.status(403).json({ error: error.message });
  res.status(500).json({ error: "Unexpected realtime service error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`VKS realtime service listening on ${PORT}`);
});
