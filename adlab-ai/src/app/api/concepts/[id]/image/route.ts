import { getAuthContext } from "@/lib/auth";
import { buildCreativeBrief, brandStyles } from "@/lib/brand-styles";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z
  .object({
    brandStyle: z.string().optional(),
  })
  .optional();

let _gemini: GoogleGenAI | null = null;
function getGemini() {
  if (!_gemini && process.env.GEMINI_API_KEY) {
    _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _gemini;
}

let _openai: OpenAI | null = null;
function getOpenAi() {
  if (!_openai && process.env.OPENAI_API_KEY) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

async function generateWithGemini(gemini: GoogleGenAI, prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
    config: {
      responseModalities: ["image", "text"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const base64 = part.inlineData.data;
      if (!base64) continue;
      const dataUrl = `data:${part.inlineData.mimeType};base64,${base64}`;
      return dataUrl;
    }
  }
  return null;
}

async function generateWithDalle(openai: OpenAI, prompt: string, style: "vivid" | "natural") {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    style,
  });
  return response.data[0]?.url ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const gemini = getGemini();
  const openai = getOpenAi();
  if (!gemini && !openai) {
    return errorResponse("No image generation API configured. Set GEMINI_API_KEY or OPENAI_API_KEY.", 503);
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  const brandStyleKey = parsed.success ? parsed.data?.brandStyle : undefined;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const prompt =
    brandStyleKey && brandStyles[brandStyleKey]
      ? buildCreativeBrief(
          concept.imagePrompt,
          brandStyleKey,
          concept.channel,
          { name: concept.product.name, description: concept.product.description },
          { name: concept.audience.name, notes: concept.audience.notes },
        )
      : concept.imagePrompt;

  try {
    if (gemini) {
      const imageUrl = await generateWithGemini(gemini, prompt);
      if (imageUrl) {
        return Response.json({ imageUrl, model: "gemini-2.5-flash-image", brandStyle: brandStyleKey ?? "default" });
      }
    }

    if (openai) {
      const style = brandStyleKey === "coke-inspired" ? "natural" as const : "vivid" as const;
      const imageUrl = await generateWithDalle(openai, prompt, style);
      if (imageUrl) {
        return Response.json({ imageUrl, model: "dall-e-3", brandStyle: brandStyleKey ?? "default" });
      }
    }

    return errorResponse("Image generation returned no results.", 502);
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
    activeModel: process.env.GEMINI_API_KEY ? "gemini-2.5-flash-image (Nano Banana)" : process.env.OPENAI_API_KEY ? "dall-e-3" : "none",
  });
}
