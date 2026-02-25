import { getAuthContext } from "@/lib/auth";
import { buildCreativeBrief, brandStyles } from "@/lib/brand-styles";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  brandStyle: z.string().optional(),
}).optional();

let _openai: OpenAI | null = null;
function getOpenAi() {
  if (!_openai && process.env.OPENAI_API_KEY) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const openai = getOpenAi();
  if (!openai) return errorResponse("OPENAI_API_KEY is not configured.", 503);

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  const brandStyleKey = parsed.success ? parsed.data?.brandStyle : undefined;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const prompt = brandStyleKey && brandStyles[brandStyleKey]
    ? buildCreativeBrief(
        concept.imagePrompt,
        brandStyleKey,
        concept.channel,
        { name: concept.product.name, description: concept.product.description },
        { name: concept.audience.name, notes: concept.audience.notes },
      )
    : concept.imagePrompt;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: brandStyleKey === "coke-inspired" ? "natural" : "vivid",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) return errorResponse("No image returned from DALL-E.", 502);

    return Response.json({
      imageUrl,
      model: "dall-e-3",
      quality: "hd",
      brandStyle: brandStyleKey ?? "default",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return errorResponse(message, 502);
  }
}

export async function GET() {
  return Response.json({
    availableStyles: Object.entries(brandStyles).map(([key, style]) => ({
      key,
      name: style.name,
      description: style.description,
    })),
  });
}
