import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  conceptIds: z.array(z.string()).min(1).max(20).optional(),
});

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);

  const conceptIds = parsed.success ? parsed.data?.conceptIds : undefined;

  const concepts = await prisma.adConcept.findMany({
    where: {
      workspaceId: auth.workspace.id,
      ...(conceptIds ? { id: { in: conceptIds } } : {}),
    },
    include: {
      product: { select: { name: true, price: true } },
      audience: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (concepts.length === 0) return errorResponse("No concepts found.", 404);

  const historicalData = await prisma.metricSnapshot.groupBy({
    by: ["conceptId"],
    where: { workspaceId: auth.workspace.id },
    _sum: { impressions: true, clicks: true, conversions: true, spend: true, revenue: true },
    _avg: { ctr: true, roas: true, cpa: true },
  });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an advertising performance prediction engine. Based on the concept details and any historical performance data, predict which concepts will perform best.

Score each concept on these dimensions (0-100):
- scrollStopPower: how likely it is to stop someone scrolling
- clickProbability: likelihood of getting a click
- conversionPotential: likelihood of driving a conversion
- viralPotential: likelihood of being shared/saved
- overallScore: weighted composite

Also provide:
- ranking: ordered list of concept IDs from best to worst predicted performance
- insights: why each concept scored the way it did
- recommendations: what to change to improve the weakest concepts

Return JSON:
{
  "predictions": [{
    "conceptId": "id",
    "headline": "headline",
    "scores": { "scrollStopPower": 0, "clickProbability": 0, "conversionPotential": 0, "viralPotential": 0, "overallScore": 0 },
    "insight": "why this score",
    "improvement": "what would make it better"
  }],
  "ranking": ["id1", "id2", ...],
  "topRecommendation": "the single most impactful change across all concepts",
  "budgetAllocation": "if you had $1000, how to split across concepts (with percentages)"
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          concepts: concepts.map((c) => ({
            id: c.id,
            headline: c.headline,
            hook: c.hook,
            angle: c.angle,
            cta: c.cta,
            channel: c.channel,
            score: c.score,
            product: c.product.name,
            audience: c.audience.name,
          })),
          historicalPerformance: historicalData.map((h) => ({
            conceptId: h.conceptId,
            avgCtr: h._avg.ctr,
            avgRoas: h._avg.roas,
            totalSpend: h._sum.spend,
            totalRevenue: h._sum.revenue,
          })),
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Prediction failed.", 502);

  return Response.json(JSON.parse(content));
}
