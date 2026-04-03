import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum(["carousel", "blog", "email_sequence", "display_ads", "website_copy", "mood_board", "brand_naming", "repurpose"]),
  brief: z.string().min(5).max(3000),
  brandName: z.string().min(2).max(100).optional(),
  brandContext: z.string().max(2000).optional(),
  sourceContent: z.string().max(3000).optional(), // For repurpose
  targetPlatform: z.string().max(50).optional(),
  targetAudience: z.string().max(500).optional(),
});

let _openai: OpenAI | null | undefined;
function getClient() { if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null; return _openai; }

const TYPE_PROMPTS: Record<string, string> = {
  carousel: `Generate an Instagram carousel (up to 10 slides). Return JSON:
{slides: [{slideNumber, heading, body, visualDirection, designNotes}], coverSlide: {headline, hook}, caption, hashtags}
Each slide should build on the previous. Cover slide must stop the scroll.`,

  blog: `Generate a full blog article. Return JSON:
{title, metaTitle, metaDescription, slug, sections: [{heading, body, imageDirection}], wordCount, seoKeywords: [], internalLinkSuggestions: [], callToAction}
1500-2500 words. SEO-optimized headers. Engaging, authoritative tone.`,

  email_sequence: `Generate a complete email sequence. Return JSON:
{sequenceName, sequenceType, emails: [{emailNumber, subject, previewText, body, cta, sendTiming, segmentNotes}]}
Include: welcome, value delivery, social proof, offer, urgency. Each email builds on the last.`,

  display_ads: `Generate display ad copy sets for all IAB sizes. Return JSON:
{adSets: [{size, headline, description, cta, visualDirection}]}
Sizes: 300x250, 728x90, 160x600, 320x50, 300x600. Each size needs adapted copy. Headlines under 30 chars.`,

  website_copy: `Generate website copy page by page. Return JSON:
{pages: [{pageName, headline, subheadline, sections: [{heading, body}], cta, metaTitle, metaDescription}]}
Pages: Home, About, Services/Product, Contact. Clear hierarchy, benefit-driven, scannable.`,

  mood_board: `Generate a detailed mood board brief. Return JSON:
{theme, colorPalette: [{hex, name, mood}], typography: {primary, secondary, accent}, imageDirections: [{description, mood, reference}], textures: [], patterns: [], overallMood, keywords: []}
5-8 image directions. Each one specific enough to generate from.`,

  brand_naming: `Generate brand name options. Return JSON:
{names: [{name, type, rationale, domainAvailability, taglineSuggestion, toneFit, risks}]}
Types: descriptive, abstract, coined, metaphorical, acronym. 10 options. Rate each for memorability, distinctiveness, scalability.`,

  repurpose: `Adapt the source content for a different format/platform/audience. Return JSON:
{adapted: {format, platform, content, changes: [], rationale}}
Maintain the core message. Change the structure, length, tone, and format for the new context.`,
};

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide type and brief.", 400);

  const { type, brief, brandName, brandContext, sourceContent, targetPlatform, targetAudience } = parsed.data;

  let userContent = `Brief: ${brief}`;
  if (brandName) userContent += `\nBrand: ${brandName}`;
  if (brandContext) userContent += `\nBrand context: ${brandContext}`;
  if (sourceContent) userContent += `\nSource content to repurpose:\n${sourceContent}`;
  if (targetPlatform) userContent += `\nTarget platform: ${targetPlatform}`;
  if (targetAudience) userContent += `\nTarget audience: ${targetAudience}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TYPE_PROMPTS[type] ?? TYPE_PROMPTS.blog },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Generation failed.", 502);

  return Response.json({ type, result: JSON.parse(content) });
}
