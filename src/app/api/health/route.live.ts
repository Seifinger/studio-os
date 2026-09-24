import { runHealthCheck } from "@/server/health";

// Route Handler mit GET werden seit Next.js 15 nicht gecacht; "no-store" sagt das
// zusätzlich jedem Proxy und CDN.
export function GET(): Response {
  const { report, problems } = runHealthCheck();

  if (problems.length > 0) {
    console.error(`[health] Serverkonfiguration ungültig: ${problems.join("; ")}`);
  }

  return Response.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
