import { getAuthContext } from "@/lib/auth";
import { analyzeCompetitorAds } from "@/lib/agents/ad-library";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { z } from "zod";

const requestSchema = z.object({
  competitor: z.string().min(2).max(100),
  yourBrand: z.string().min(2).max(100),
  market: z.string().min(2).max(100),
});

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide competitor, yourBrand, and market.", 400);

  try {
    const result = await analyzeCompetitorAds(parsed.data.competitor, parsed.data.yourBrand, parsed.data.market);
    return Response.json({ result });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Analysis failed.", 502);
  }
}
