import { getAuthContext } from "@/lib/auth";
import { buildCreativeBrief, brandStyles } from "@/lib/brand-styles";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Replicate from "replicate";
import { z } from "zod";

const TRIGGER_WORD = "RAZZBUZZ_AD";

const requestSchema = z
  .object({
    brandStyle: z.string().optional(),
  })
  .optional();

let _replicate: Replicate | null = null;
function getReplicate() {
  if (!_replicate && process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL) {
    _replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }
  return _replicate;
}

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

async function generateWithFineTuned(replicate: Replicate, prompt: string) {
  const model = process.env.REPLICATE_MODEL!;
  const output = await replicate.run(model as `${string}/${string}`, {
    input: {
      prompt: `${TRIGGER_WORD} ${prompt}`,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 28,
      output_format: "png",
      output_quality: 100,
    },
  });

  if (Array.isArray(output) && output.length > 0) {
    const url = typeof output[0] === "string" ? output[0] : (output[0] as { url?: string })?.url;
    return url ?? null;
  }
  return null;
}

async function generateWithGemini(gemini: GoogleGenAI, prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: { responseModalities: ["image", "text"] },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const base64 = part.inlineData.data;
      if (!base64) continue;
      return `data:${part.inlineData.mimeType};base64,${base64}`;
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

function getActiveModel() {
  if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL) return `fine-tuned (${process.env.REPLICATE_MODEL})`;
  if (process.env.GEMINI_API_KEY) return "gemini-2.5-flash-image (Nano Banana)";
  if (process.env.OPENAI_API_KEY) return "dall-e-3";
  return "none";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const replicate = getReplicate();
  const gemini = getGemini();
  const openai = getOpenAi();
  if (!replicate && !gemini && !openai) {
    return errorResponse("No image generation API configured.", 503);
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
    // Priority 1: Fine-tuned model on Replicate
    if (replicate) {
      const imageUrl = await generateWithFineTuned(replicate, prompt);
      if (imageUrl) {
        return Response.json({ imageUrl, model: `fine-tuned:${process.env.REPLICATE_MODEL}`, brandStyle: brandStyleKey ?? "default" });
      }
    }

    // Priority 2: Gemini Nano Banana
    if (gemini) {
      const imageUrl = await generateWithGemini(gemini, prompt);
      if (imageUrl) {
        return Response.json({ imageUrl, model: "gemini-2.5-flash-image", brandStyle: brandStyleKey ?? "default" });
      }
    }

    // Priority 3: DALL-E 3
    if (openai) {
      const style = brandStyleKey === "coke-inspired" ? ("natural" as const) : ("vivid" as const);
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
    activeModel: getActiveModel(),
  });
}
