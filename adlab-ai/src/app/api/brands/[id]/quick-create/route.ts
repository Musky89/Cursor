import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getCanonContext } from "@/lib/creative-canon";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(5).max(500),
  platform: z.enum(["instagram", "tiktok", "facebook", "linkedin", "twitter"]),
  format: z.enum(["1:1", "4:5", "9:16", "16:9"]),
});

let _openai: OpenAI | null | undefined;
function getOpenAi() { if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null; return _openai; }

let _gemini: GoogleGenAI | null = null;
function getGemini() { if (!_gemini && process.env.GEMINI_API_KEY) _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); return _gemini; }

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id, client: { workspaceId: auth.workspace.id } },
    include: { strategy: true, client: true },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide prompt, platform, and format.", 400);

  const { prompt, platform, format } = parsed.data;
  const openai = getOpenAi();
  const gemini = getGemini();

  // Step 1: GPT generates caption
  let caption = prompt;
  let hashtags = "";
  if (openai) {
    const captionRes = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `Write a ${platform} caption for a brand post. Return JSON: {caption, hashtags}. Brand: ${brand.name}. Tone: ${brand.strategy?.toneOfVoice ?? "professional and engaging"}.` },
        { role: "user", content: prompt },
      ],
    });
    const captionData = JSON.parse(captionRes.choices[0]?.message?.content ?? "{}");
    caption = captionData.caption ?? prompt;
    hashtags = captionData.hashtags ?? "";
  }

  // Step 2: GPT writes art direction
  let imagePrompt = prompt;
  if (openai) {
    const canon = getCanonContext(platform === "tiktok" ? "TIKTOK" : "META");
    const artRes = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: "system", content: `You are an art director. Write a photographic brief for this post. Brand: ${brand.name}. ${brand.strategy?.visualIdentity ?? ""}. ${canon}. Return ONLY the image prompt, 200-400 words.` },
        { role: "user", content: `${prompt}. Format: ${format}. Platform: ${platform}.` },
      ],
    });
    imagePrompt = artRes.choices[0]?.message?.content ?? prompt;
  }

  // Step 3: Generate image
  let imageData: Buffer | null = null;
  let mimeType = "image/png";

  if (gemini) {
    try {
      const r = await gemini.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
        contents: imagePrompt,
        config: { responseModalities: ["image", "text"] },
      });
      for (const p of (r.candidates?.[0]?.content?.parts ?? [])) {
        if (p.inlineData?.data) {
          imageData = Buffer.from(p.inlineData.data, "base64");
          mimeType = p.inlineData.mimeType ?? "image/png";
          break;
        }
      }
    } catch { /* fall through */ }
  }

  if (!imageData && openai) {
    try {
      const r = await openai.images.generate({ model: "dall-e-3", prompt: imagePrompt, n: 1, size: "1024x1024", quality: "hd" });
      const url = r.data?.[0]?.url;
      if (url) {
        const res = await fetch(url);
        imageData = Buffer.from(await res.arrayBuffer());
        mimeType = res.headers.get("content-type") ?? "image/png";
      }
    } catch { /* skip */ }
  }

  const asset = await prisma.quickAsset.create({
    data: {
      brandId: id,
      prompt,
      platform,
      format,
      caption,
      hashtags,
      imageData: imageData ? new Uint8Array(imageData) : null,
      mimeType,
    },
  });

  const imageUrl = imageData ? `data:${mimeType};base64,${imageData.toString("base64")}` : null;

  return Response.json({ asset: { id: asset.id, caption, hashtags, platform, format, imageUrl } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const assets = await prisma.quickAsset.findMany({
    where: { brandId: id, brand: { client: { workspaceId: auth.workspace.id } } },
    select: { id: true, prompt: true, platform: true, format: true, caption: true, hashtags: true, mimeType: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({
    assets: assets.map((a) => ({ ...a, imageUrl: `/api/images/${a.id}/serve` })),
  });
}
