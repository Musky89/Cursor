import { artDirectPrompt } from "@/lib/art-director";
import { getAuthContext } from "@/lib/auth";
import { brandStyles } from "@/lib/brand-styles";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const requestSchema = z.object({
  brandStyle: z.string().optional(),
  count: z.number().min(1).max(4).optional(),
}).optional();

let _gemini: GoogleGenAI | null = null;
function getGemini() {
  if (!_gemini && process.env.GEMINI_API_KEY) {
    _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _gemini;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const gemini = getGemini();
  if (!gemini) return errorResponse("GEMINI_API_KEY required for variations.", 503);

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  const brandStyleKey = parsed.success ? parsed.data?.brandStyle : undefined;
  const count = parsed.success ? (parsed.data?.count ?? 3) : 3;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const basePrompt = await artDirectPrompt({
    concept: {
      headline: concept.headline,
      hook: concept.hook,
      angle: concept.angle,
      cta: concept.cta,
      imagePrompt: concept.imagePrompt,
      channel: concept.channel,
    },
    product: { name: concept.product.name, description: concept.product.description, price: concept.product.price },
    audience: { name: concept.audience.name, painPoints: concept.audience.painPoints, desires: concept.audience.desires, notes: concept.audience.notes },
    brandStyleKey,
  });

  const variations: { imageUrl: string; variationNote: string }[] = [];
  const variationSuffixes = [
    "Use a close-up product hero shot composition.",
    "Use a wide lifestyle scene with people naturally interacting with the product.",
    "Use a bold graphic poster composition with strong typography and minimal elements.",
    "Use a candid street photography style with authentic, unposed energy.",
  ];

  for (let i = 0; i < Math.min(count, variationSuffixes.length); i++) {
    try {
      const prompt = `${basePrompt}\n\nVARIATION DIRECTION: ${variationSuffixes[i]}`;
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
        contents: prompt,
        config: { responseModalities: ["image", "text"] },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/") && part.inlineData.data) {
            variations.push({
              imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              variationNote: variationSuffixes[i],
            });
            break;
          }
        }
      }
    } catch {
      // Skip failed variations
    }
  }

  return Response.json({ variations, conceptId: id, count: variations.length });
}
