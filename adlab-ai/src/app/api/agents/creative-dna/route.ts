import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const requestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(10).optional(),
  websiteUrl: z.string().url().optional(),
  brandName: z.string().min(2).max(100),
});

let _gemini: GoogleGenAI | null = null;
function getGemini() {
  if (!_gemini && process.env.GEMINI_API_KEY) {
    _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _gemini;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    return { data: Buffer.from(buffer).toString("base64"), mimeType };
  } catch {
    return null;
  }
}

async function scrapeImagesFromUrl(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const srcMatches = html.match(/(?:src|srcset|data-src)=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi) ?? [];
    const urls: string[] = [];
    for (const match of srcMatches) {
      const urlMatch = match.match(/["']([^"']+)/);
      if (urlMatch?.[1]) {
        try {
          const resolved = new URL(urlMatch[1], url).href;
          urls.push(resolved);
        } catch { /* skip */ }
      }
    }
    return [...new Set(urls)].slice(0, 8);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const gemini = getGemini();
  if (!gemini) return errorResponse("GEMINI_API_KEY required for Creative DNA extraction.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide brandName and either imageUrls or websiteUrl.", 400);

  const { brandName, imageUrls, websiteUrl } = parsed.data;

  let imagesToAnalyze: { data: string; mimeType: string }[] = [];

  if (imageUrls && imageUrls.length > 0) {
    for (const url of imageUrls.slice(0, 6)) {
      const img = await fetchImageAsBase64(url);
      if (img) imagesToAnalyze.push(img);
    }
  }

  if (websiteUrl && imagesToAnalyze.length < 4) {
    const scraped = await scrapeImagesFromUrl(websiteUrl);
    for (const url of scraped) {
      if (imagesToAnalyze.length >= 6) break;
      const img = await fetchImageAsBase64(url);
      if (img && img.data.length > 5000) imagesToAnalyze.push(img);
    }
  }

  if (imagesToAnalyze.length === 0) {
    return errorResponse("Could not fetch any images. Provide direct image URLs.", 400);
  }

  const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  contents.push({ text: `Analyze these ${imagesToAnalyze.length} images from the brand "${brandName}". Extract the CREATIVE DNA — the exact visual rules and patterns that define this brand's photography style.` });

  for (const img of imagesToAnalyze) {
    contents.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  }

  contents.push({
    text: `Based on ALL images above, extract the brand's Creative DNA as JSON:

{
  "brandName": "${brandName}",
  "photographyStyle": {
    "lightingSetup": "exact description of lighting (direction, temperature, hardness, key/fill ratio)",
    "lightingPercentages": {"sideLight": 0, "topLight": 0, "backLight": 0, "naturalLight": 0},
    "cameraAngles": ["list of angles used with % frequency"],
    "depthOfField": "shallow/medium/deep and typical aperture",
    "colorTemperature": "warm/neutral/cool with Kelvin estimate"
  },
  "colorSignature": {
    "dominantColors": ["hex codes of 5 most used colors"],
    "accentColors": ["hex codes"],
    "backgroundTreatment": "description of how backgrounds are handled",
    "saturationLevel": "muted/normal/vibrant",
    "contrastLevel": "low/medium/high"
  },
  "compositionRules": {
    "subjectPlacement": "where the main subject sits (center, rule-of-thirds, etc.)",
    "negativeSpaceUsage": "how and where negative space is used",
    "textOverlayZones": "where text could safely go without covering the subject",
    "croppingStyle": "tight/medium/wide and any consistent crop patterns",
    "propsAndStyling": "common props, surfaces, backgrounds, textures"
  },
  "contentPatterns": {
    "subjectTypes": ["what appears in images — products, people, food, etc."],
    "humanPresence": "how people appear (hands only, full body, faces, never)",
    "productPlacement": "how the product is integrated into shots",
    "moodAndEmotion": "the feeling the images consistently evoke",
    "seasonalAdaptation": "any seasonal patterns in styling"
  },
  "doNot": ["5 things this brand NEVER does in their imagery"],
  "artDirectorBrief": "A 200-word brief that captures this brand's entire visual identity so precisely that any photographer could replicate it"
}`,
  });

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return errorResponse("No analysis returned.", 502);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return errorResponse("Could not parse analysis.", 502);

    const dna = JSON.parse(jsonMatch[0]);
    return Response.json({ dna, imagesAnalyzed: imagesToAnalyze.length });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Analysis failed.", 502);
  }
}
