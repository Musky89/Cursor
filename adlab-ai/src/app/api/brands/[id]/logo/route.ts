import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(5).max(500),
  style: z.enum(["minimal", "bold", "vintage", "modern", "playful", "luxury"]).optional(),
  colorScheme: z.string().max(200).optional(),
  feedback: z.string().max(500).optional(),
  iterateFromId: z.string().optional(),
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
    include: { client: true },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide a prompt.", 400);

  const { prompt, style = "modern", colorScheme, feedback, iterateFromId } = parsed.data;

  let previousVersion = 0;
  if (iterateFromId) {
    const prev = await prisma.logoDesign.findUnique({ where: { id: iterateFromId } });
    if (prev) previousVersion = prev.version;
  }

  const openai = getOpenAi();
  const gemini = getGemini();

  let logoPrompt = `Design a professional logo for "${brand.name}" (${brand.client.name}). ${prompt}. Style: ${style}.`;
  if (colorScheme) logoPrompt += ` Color scheme: ${colorScheme}.`;
  if (feedback) logoPrompt += ` Previous iteration feedback: ${feedback}. Address this feedback in the new version.`;
  logoPrompt += ` The logo must be clean, scalable, and work on both light and dark backgrounds. Vector-style flat design. No photographic elements. Centered composition on a clean white background. Professional brand identity quality.`;

  // Enhance with GPT art direction
  if (openai) {
    const artRes = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: "You are a logo designer. Enhance this logo brief into a detailed generation prompt. Focus on: iconography, typography integration, negative space, scalability. Return ONLY the enhanced prompt." },
        { role: "user", content: logoPrompt },
      ],
    });
    logoPrompt = artRes.choices[0]?.message?.content ?? logoPrompt;
  }

  let imageData: Buffer | null = null;
  let mimeType = "image/png";

  if (gemini) {
    try {
      const r = await gemini.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
        contents: logoPrompt,
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
      const r = await openai.images.generate({ model: "dall-e-3", prompt: logoPrompt, n: 1, size: "1024x1024", quality: "hd" });
      const url = r.data?.[0]?.url;
      if (url) {
        const res = await fetch(url);
        imageData = Buffer.from(await res.arrayBuffer());
        mimeType = res.headers.get("content-type") ?? "image/png";
      }
    } catch { /* skip */ }
  }

  const logo = await prisma.logoDesign.create({
    data: {
      brandId: id,
      prompt,
      style,
      colorScheme,
      feedback,
      imageData: imageData ? new Uint8Array(imageData) : null,
      mimeType,
      version: previousVersion + 1,
    },
  });

  const imageUrl = imageData ? `data:${mimeType};base64,${imageData.toString("base64")}` : null;

  return Response.json({ logo: { id: logo.id, version: logo.version, style, imageUrl } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const logos = await prisma.logoDesign.findMany({
    where: { brandId: id, brand: { client: { workspaceId: auth.workspace.id } } },
    select: { id: true, prompt: true, style: true, colorScheme: true, feedback: true, version: true, mimeType: true, createdAt: true },
    orderBy: { version: "desc" },
  });

  return Response.json({ logos });
}
