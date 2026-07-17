import { getOpportunityResponse } from "../../lib/opportunity-service";

export async function GET() {
  const result = await getOpportunityResponse();
  return Response.json(result, {
    headers: {
      "cache-control": result.sourceStatus === "live"
        ? "public, max-age=60, s-maxage=300, stale-while-revalidate=900"
        : "no-store",
    },
  });
}
