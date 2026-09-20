/**
 * Optional local bridge for a provider gateway using Rhetorix's contract.
 * No provider API key ever enters browser storage or a Vite environment variable.
 * Run: RHETORIX_UPSTREAM_URL=https://your-gateway.example/debate node server/example.mjs
 * Add RHETORIX_UPSTREAM_KEY only on the server, if your gateway requires a bearer token.
 * See README: adapt upstream request/response mapping to your chosen LLM provider.
 */
import http from "node:http";
const port = Number(process.env.RHETORIX_API_PORT || 8787);
const upstream = process.env.RHETORIX_UPSTREAM_URL;
const respond = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
};
http
  .createServer(async (req, res) => {
    if (req.url !== "/api/debate" || req.method !== "POST")
      return respond(res, 404, { error: "Not found" });
    if (!upstream)
      return respond(res, 503, {
        error: "Set RHETORIX_UPSTREAM_URL on the server.",
      });
    try {
      // This bridge is for local development, not an unauthenticated public proxy.
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 100000)
          return respond(res, 413, { error: "Conversation too large" });
        chunks.push(chunk);
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        return respond(res, 400, { error: "Invalid JSON" });
      }
      if (
        typeof body.system !== "string" ||
        body.system.length > 10000 ||
        !Array.isArray(body.messages) ||
        body.messages.length > 40 ||
        !body.messages.length ||
        !body.messages.every(
          (m) =>
            m &&
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string" &&
            m.content.length <= 12000,
        )
      )
        return respond(res, 400, { error: "Invalid debate request" });
      const headers = { "Content-Type": "application/json" };
      if (process.env.RHETORIX_UPSTREAM_KEY)
        headers.Authorization = `Bearer ${process.env.RHETORIX_UPSTREAM_KEY}`;
      const response = await fetch(upstream, {
        method: "POST",
        headers,
        body: JSON.stringify({ system: body.system, messages: body.messages }),
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok)
        return respond(res, 502, { error: "Upstream service failed" });
      const payload = await response.json();
      if (
        typeof payload.reply !== "string" ||
        !payload.reply.trim() ||
        payload.reply.length > 12000
      )
        return respond(res, 502, { error: "Invalid upstream reply" });
      respond(res, 200, { reply: payload.reply });
    } catch {
      respond(res, 502, { error: "Debate service unavailable" });
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Rhetorix API bridge: http://127.0.0.1:${port}`),
  );
