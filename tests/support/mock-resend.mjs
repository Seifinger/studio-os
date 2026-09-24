// Lokaler Ersatz für die Resend-API (nur Tests, ADR 0023). Nimmt POST /emails an wie Resend,
// verschickt nichts und merkt sich die Nachrichten im Speicher. Playwright startet ihn vor der App;
// die App zeigt über RESEND_BASE_URL hierher. So verlässt keine Test-Mail den Rechner.
//
//   GET    /__health  → 200
//   GET    /__sent    → alle angenommenen Nachrichten (JSON)
//   DELETE /__sent    → Speicher leeren
//
// Sonderadressen: unzustellbar…@example.org → 422 (Resend lehnt ab).

import { createServer } from "node:http";

const port = Number(process.env.MOCK_RESEND_PORT ?? 3111);
const expectedKey = process.env.MOCK_RESEND_KEY ?? "re_e2e_test";
const sent = [];
const byKey = new Map();

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/__health") return json(res, 200, { ok: true });
  if (req.method === "GET" && req.url === "/__sent") return json(res, 200, sent);
  if (req.method === "DELETE" && req.url === "/__sent") {
    sent.length = 0;
    byKey.clear();
    return json(res, 200, { ok: true });
  }
  if (req.method !== "POST" || req.url !== "/emails") return json(res, 404, { message: "Not found" });

  if (req.headers.authorization !== `Bearer ${expectedKey}`) return json(res, 401, { message: "API key is invalid" });
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { message: "Invalid JSON" });
  }
  if (!body.from || !Array.isArray(body.to) || !body.subject || !body.text) return json(res, 422, { message: "Missing fields" });
  if (body.to.some((address) => String(address).startsWith("unzustellbar"))) return json(res, 422, { message: "Invalid recipient" });

  // Wie Resend: gleicher Idempotency-Key → dieselbe Antwort, keine zweite Nachricht.
  const key = req.headers["idempotency-key"];
  if (typeof key === "string" && byKey.has(key)) return json(res, 200, { id: byKey.get(key) });
  const id = `mock-${sent.length + 1}`;
  if (typeof key === "string") byKey.set(key, id);
  sent.push({ id, idempotencyKey: key ?? null, ...body });
  return json(res, 200, { id });
});

server.listen(port, "127.0.0.1");
