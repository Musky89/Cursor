import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  return _openai;
}

const updateSchema = z.object({
  lockedTerritory: z.string().optional(),
  status: z.enum(["draft", "locked"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id, client: { workspaceId: auth.workspace.id } },
    include: { strategy: true, client: { select: { name: true } } },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  return Response.json({ brand, strategy: brand.strategy });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);
  const { id } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id, client: { workspaceId: auth.workspace.id } },
    include: { client: true },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior brand strategist. Generate 4 distinct strategic territories for a brand. Each territory is a unique positioning angle the brand could own.

Return JSON:
{
  "positioning": "one-line brand positioning statement",
  "targetAudience": "detailed target audience description",
  "brandValues": "5 core brand values",
  "toneOfVoice": "how the brand speaks — formal/casual, humorous/serious, etc.",
  "competitiveEdge": "what makes this brand genuinely different",
  "territories": [
    {
      "name": "territory name (e.g. 'The Challenger')",
      "positioning": "positioning statement for this territory",
      "essence": "the core idea in one sentence",
      "visualDirection": "what this territory looks like visually",
      "messagingPillars": ["3 key messages"],
      "risks": "potential downsides of this positioning"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Brand: ${brand.name}. Industry: ${brand.industry ?? brand.client.industry ?? "general"}. Description: ${brand.description ?? ""}. Website: ${brand.website ?? ""}. Client: ${brand.client.name}.`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Strategy generation failed.", 502);

  const strategyData = JSON.parse(content);

  const strategy = await prisma.brandStrategy.upsert({
    where: { brandId: id },
    create: {
      brandId: id,
      positioning: strategyData.positioning,
      targetAudience: strategyData.targetAudience,
      territories: JSON.stringify(strategyData.territories),
      brandValues: strategyData.brandValues,
      toneOfVoice: strategyData.toneOfVoice,
      competitiveEdge: strategyData.competitiveEdge,
    },
    update: {
      positioning: strategyData.positioning,
      targetAudience: strategyData.targetAudience,
      territories: JSON.stringify(strategyData.territories),
      brandValues: strategyData.brandValues,
      toneOfVoice: strategyData.toneOfVoice,
      competitiveEdge: strategyData.competitiveEdge,
      status: "draft",
    },
  });

  return Response.json({ strategy, raw: strategyData });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid data.", 400);

  const strategy = await prisma.brandStrategy.update({
    where: { brandId: id },
    data: parsed.data,
  });

  return Response.json({ strategy });
}
