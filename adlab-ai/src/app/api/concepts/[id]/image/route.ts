import { artDirectPrompt } from "@/lib/art-director";
import { getAuthContext } from "@/lib/auth";
import { brandStyles } from "@/lib/brand-styles";
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
    customDirection: z.string().max(1000).optional(),
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
    model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
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
  return response.data?.[0]?.url ?? null;
}

function getActiveModel() {
  if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL) return `fine-tuned (${process.env.REPLICATE_MODEL})`;
  if (process.env.GEMINI_API_KEY) return `${process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview"} (Nano Banana Pro)`;
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
  const customDirection = parsed.success ? parsed.data?.customDirection : undefined;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const prompt = await artDirectPrompt({
    concept: {
      headline: concept.headline,
      hook: concept.hook,
      angle: concept.angle,
      cta: concept.cta,
      imagePrompt: concept.imagePrompt,
      channel: concept.channel,
    },
    product: {
      name: concept.product.name,
      description: concept.product.description,
      price: concept.product.price,
    },
    audience: {
      name: concept.audience.name,
      painPoints: concept.audience.painPoints,
      desires: concept.audience.desires,
      notes: concept.audience.notes,
    },
    brandStyleKey,
    customDirection,
  });

  try {
    let imageUrl: string | null = null;
    let modelUsed = "unknown";

    // Priority 1: Fine-tuned model on Replicate
    if (!imageUrl && replicate) {
      imageUrl = await generateWithFineTuned(replicate, prompt);
      if (imageUrl) modelUsed = `fine-tuned:${process.env.REPLICATE_MODEL}`;
    }

    // Priority 2: Gemini Nano Banana
    if (!imageUrl && gemini) {
      imageUrl = await generateWithGemini(gemini, prompt);
      if (imageUrl) modelUsed = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview";
    }

    // Priority 3: DALL-E 3
    if (!imageUrl && openai) {
      const style = brandStyleKey === "coke-inspired" ? ("natural" as const) : ("vivid" as const);
      imageUrl = await generateWithDalle(openai, prompt, style);
      if (imageUrl) modelUsed = "dall-e-3";
    }

    if (!imageUrl) return errorResponse("Image generation returned no results.", 502);

    // Save to database for persistence
    let imageData: Buffer | null = null;
    let mimeType = "image/png";
    if (imageUrl.startsWith("data:")) {
      const [header, base64] = imageUrl.split(",");
      mimeType = header?.match(/data:([^;]+)/)?.[1] ?? "image/png";
      imageData = Buffer.from(base64, "base64");
    } else {
      try {
        const res = await fetch(imageUrl);
        if (res.ok) {
          imageData = Buffer.from(await res.arrayBuffer());
          mimeType = res.headers.get("content-type") ?? "image/png";
        }
      } catch { /* skip save if fetch fails */ }
    }

    if (imageData) {
      await prisma.generatedImage.create({
        data: {
          workspaceId: auth.workspace.id,
          conceptId: id,
          imageData: new Uint8Array(imageData),
          mimeType,
          prompt,
          model: modelUsed,
          brandStyle: brandStyleKey,
        },
      });
    }

    return Response.json({ imageUrl, model: modelUsed, brandStyle: brandStyleKey ?? "default" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return errorResponse(message, 502);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({
      availableStyles: Object.entries(brandStyles).map(([key, style]) => ({ key, name: style.name, description: style.description })),
      activeModel: getActiveModel(),
    });
  }

  const { id } = await params;

  const images = await prisma.generatedImage.findMany({
    where: { conceptId: id, workspaceId: auth.workspace.id },
    select: { id: true, model: true, brandStyle: true, mimeType: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    images: images.map((img) => ({
      ...img,
      imageUrl: `/api/images/${img.id}/serve`,
    })),
    activeModel: getActiveModel(),
  });
}
