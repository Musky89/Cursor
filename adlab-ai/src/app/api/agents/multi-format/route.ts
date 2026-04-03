import { artDirectPrompt } from "@/lib/art-director";
import { getAuthContext } from "@/lib/auth";
import { brandStyles } from "@/lib/brand-styles";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const requestSchema = z.object({
  conceptId: z.string(),
  brandStyle: z.string().optional(),
  formats: z.array(z.enum(["1:1", "4:5", "9:16", "16:9", "21:9"])).optional(),
});

const FORMAT_SPECS: Record<string, { name: string; width: number; height: number; usage: string; direction: string }> = {
  "1:1": { name: "Instagram Feed", width: 1024, height: 1024, usage: "Instagram feed, Facebook feed", direction: "Square format. Subject centered. Equal visual weight top and bottom." },
  "4:5": { name: "Instagram Portrait", width: 1024, height: 1280, usage: "Instagram feed (portrait), Facebook feed", direction: "Tall portrait. Subject in upper 60%. Bottom 40% for text overlay or breathing room." },
  "9:16": { name: "Stories / Reels / TikTok", width: 768, height: 1365, usage: "Instagram Stories, TikTok, YouTube Shorts", direction: "Full vertical. Subject center-framed. Top 15% and bottom 20% kept clear for platform UI elements. Feels like a phone screenshot, not a cropped landscape." },
  "16:9": { name: "Facebook Cover / YouTube", width: 1365, height: 768, usage: "Facebook cover, YouTube thumbnail, Google Display", direction: "Wide landscape. Subject on left or right third. Generous horizontal space for headline text on the opposite side." },
  "21:9": { name: "Billboard / Web Banner", width: 1512, height: 648, usage: "Website hero, email header, outdoor billboard", direction: "Ultra-wide cinematic. Product hero on one end, text space on the other. Dramatic negative space." },
};

let _gemini: GoogleGenAI | null = null;
function getGemini() {
  if (!_gemini && process.env.GEMINI_API_KEY) {
    _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _gemini;
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const gemini = getGemini();
  if (!gemini) return errorResponse("GEMINI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide conceptId.", 400);

  const { conceptId, brandStyle: brandStyleKey, formats = ["1:1", "4:5", "9:16", "16:9"] } = parsed.data;

  const concept = await prisma.adConcept.findFirst({
    where: { id: conceptId, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const basePrompt = await artDirectPrompt({
    concept: { headline: concept.headline, hook: concept.hook, angle: concept.angle, cta: concept.cta, imagePrompt: concept.imagePrompt, channel: concept.channel },
    product: { name: concept.product.name, description: concept.product.description, price: concept.product.price },
    audience: { name: concept.audience.name, painPoints: concept.audience.painPoints, desires: concept.audience.desires, notes: concept.audience.notes },
    brandStyleKey,
  });

  const results: { format: string; name: string; usage: string; imageUrl: string | null }[] = [];

  for (const fmt of formats) {
    const spec = FORMAT_SPECS[fmt];
    if (!spec) continue;

    try {
      const formatPrompt = `${basePrompt}\n\nFORMAT: ${spec.name} (${fmt} aspect ratio, ${spec.width}x${spec.height}px)\nCOMPOSITION ADAPTATION: ${spec.direction}\nUSAGE: ${spec.usage}`;

      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
        contents: formatPrompt,
        config: { responseModalities: ["image", "text"] },
      });

      let imageUrl: string | null = null;
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/") && part.inlineData.data) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      results.push({ format: fmt, name: spec.name, usage: spec.usage, imageUrl });
    } catch {
      results.push({ format: fmt, name: spec.name, usage: spec.usage, imageUrl: null });
    }
  }

  return Response.json({ conceptId, formats: results, generatedCount: results.filter((r) => r.imageUrl).length });
}
