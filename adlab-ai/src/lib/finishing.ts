import "server-only";

import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

let _openai: OpenAI | null | undefined;
function getOpenAi() { if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null; return _openai; }

let _gemini: GoogleGenAI | null = null;
function getGemini() { if (!_gemini && process.env.GEMINI_API_KEY) _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); return _gemini; }

export type FinishingSpec = {
  headline?: string;
  subheadline?: string;
  cta?: string;
  logoDescription?: string;
  brandColors?: string[];
  targetFormat: string; // "1:1" | "4:5" | "9:16" | "16:9"
  platform: string;
};

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
};

export async function finishAsset(
  baseImageDescription: string,
  spec: FinishingSpec,
): Promise<{ imageUrl: string | null; model: string }> {
  const dims = FORMAT_DIMENSIONS[spec.targetFormat] ?? FORMAT_DIMENSIONS["1:1"];

  const finishingPrompt = buildFinishingPrompt(baseImageDescription, spec, dims);

  // Try Gemini first
  const gemini = getGemini();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
        contents: finishingPrompt,
        config: { responseModalities: ["image", "text"] },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/") && part.inlineData.data) {
            return {
              imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              model: "gemini-finishing",
            };
          }
        }
      }
    } catch { /* fall through */ }
  }

  // Fallback to DALL-E
  const openai = getOpenAi();
  if (openai) {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finishingPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      });
      const url = response.data?.[0]?.url;
      if (url) return { imageUrl: url, model: "dalle-finishing" };
    } catch { /* skip */ }
  }

  return { imageUrl: null, model: "none" };
}

function buildFinishingPrompt(baseImage: string, spec: FinishingSpec, dims: { width: number; height: number }): string {
  const lines: string[] = [
    `CREATE A FINISHED, PRODUCTION-READY ADVERTISEMENT.`,
    ``,
    `BASE VISUAL: ${baseImage}`,
    ``,
    `FORMAT: ${spec.targetFormat} (${dims.width}x${dims.height}px) for ${spec.platform}`,
    ``,
    `TEXT OVERLAYS TO INCLUDE:`,
  ];

  if (spec.headline) lines.push(`  HEADLINE (large, prominent, top or center): "${spec.headline}"`);
  if (spec.subheadline) lines.push(`  SUBHEADLINE (smaller, below headline): "${spec.subheadline}"`);
  if (spec.cta) lines.push(`  CTA BUTTON (bottom, high contrast, action-oriented): "${spec.cta}"`);

  lines.push(``);

  if (spec.brandColors && spec.brandColors.length > 0) {
    lines.push(`BRAND COLORS: Use these colors for text, overlays, and accents: ${spec.brandColors.join(", ")}`);
  }

  if (spec.logoDescription) {
    lines.push(`BRAND MARK: Include the brand logo in the bottom-right corner with appropriate clear space. Logo description: ${spec.logoDescription}`);
  }

  lines.push(
    ``,
    `FINISHING REQUIREMENTS:`,
    `- Text must be PERFECTLY LEGIBLE against the background — use contrast panels, drop shadows, or solid bars if needed`,
    `- Typography should be clean, modern, and professional`,
    `- The headline should be the first thing the eye sees`,
    `- CTA button should look clickable with a contrasting background color`,
    `- Overall composition must be balanced and production-ready`,
    `- This should look like a finished ad from a professional agency, not a raw AI generation`,
    `- Respect safe zones for ${spec.platform} (no text in top 10% or bottom 15% for Stories/Reels)`,
  );

  return lines.join("\n");
}

export async function adaptToFormats(
  baseImageDescription: string,
  spec: Omit<FinishingSpec, "targetFormat">,
  formats: string[] = ["1:1", "4:5", "9:16", "16:9"],
): Promise<{ format: string; imageUrl: string | null; model: string }[]> {
  const results: { format: string; imageUrl: string | null; model: string }[] = [];

  for (const format of formats) {
    const result = await finishAsset(baseImageDescription, { ...spec, targetFormat: format });
    results.push({ format, ...result });
  }

  return results;
}
