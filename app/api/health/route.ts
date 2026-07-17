import { getOpportunityResponse } from "../../lib/opportunity-service";

export async function GET() {
  const opportunities = await getOpportunityResponse();
  const aiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const ready = opportunities.sourceStatus === "live" && aiConfigured;
  return Response.json({
    status: ready ? "ready" : "degraded",
    checks: {
      marketData: opportunities.sourceStatus,
      askRoven: aiConfigured ? "configured" : "not_configured",
    },
    snapshotAt: opportunities.snapshotAt,
    methodologyVersion: opportunities.methodologyVersion,
  }, {
    status: ready ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
