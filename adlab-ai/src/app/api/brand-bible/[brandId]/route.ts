import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

let _openai: OpenAI | null | undefined;
function getClient() { if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null; return _openai; }

export async function GET(_req: Request, { params }: { params: Promise<{ brandId: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { brandId } = await params;

  const bible = await prisma.brandBible.findUnique({ where: { brandId } });
  if (!bible) return Response.json({ bible: null, message: "No Brand Bible yet. POST to generate one." });

  return Response.json({
    bible: {
      ...bible,
      visualIdentity: JSON.parse(bible.visualIdentity ?? "null"),
      toneOfVoice: JSON.parse(bible.toneOfVoice ?? "null"),
      messaging: JSON.parse(bible.messaging ?? "null"),
      channelGuidelines: JSON.parse(bible.channelGuidelines ?? "null"),
      competitiveContext: JSON.parse(bible.competitiveContext ?? "null"),
      promptTemplates: JSON.parse(bible.promptTemplates ?? "null"),
    },
  });
}

export async function POST(_req: Request, { params }: { params: Promise<{ brandId: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);
  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, client: { workspaceId: auth.workspace.id } },
    include: { client: true, strategy: true },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a brand strategist building a comprehensive Brand Bible. This is a living reference document that every agent in an AI creative agency reads before producing any work. It must be specific, actionable, and detailed enough that anyone reading it could produce on-brand work without further briefing.

Return JSON with these sections:
- visualIdentity: {colorPalette: [{hex, name, usage}], typography: {primary, secondary, rules}, photographyStyle: string, illustrationStyle: string, iconography: string, patterns: string}
- toneOfVoice: {personality: string[], toneDescriptors: string[], doExamples: string[], dontExamples: string[], vocabulary: string[], bannedWords: string[], channelVariations: {social: string, formal: string, advertising: string}}
- messaging: {purpose: string, vision: string, mission: string, tagline: string, valuePropositions: string[], pillars: [{name, description, proofPoints: string[]}], elevatorPitch: string, boilerplate: string}
- channelGuidelines: {instagram: {contentTypes, formats, hashtags, postingCadence}, tiktok: {contentTypes, formats}, facebook: {contentTypes}, linkedin: {contentTypes}}
- competitiveContext: {competitors: [{name, positioning, strengths, weaknesses}], differentiators: string[], categoryConventions: string[], positioningMap: string}
- promptTemplates: {imageGeneration: string, copywriting: string, socialPost: string, adCopy: string}`,
      },
      {
        role: "user",
        content: `Build a Brand Bible for: ${brand.name} (Client: ${brand.client.name}). Industry: ${brand.industry ?? brand.client.industry ?? "general"}. Description: ${brand.description ?? ""}. Website: ${brand.website ?? ""}. ${brand.strategy ? `Strategy: ${brand.strategy.positioning ?? ""}. Values: ${brand.strategy.brandValues ?? ""}. Tone: ${brand.strategy.toneOfVoice ?? ""}.` : ""}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Generation failed.", 502);

  const bibleData = JSON.parse(content);

  const bible = await prisma.brandBible.upsert({
    where: { brandId },
    create: {
      brandId,
      visualIdentity: JSON.stringify(bibleData.visualIdentity),
      toneOfVoice: JSON.stringify(bibleData.toneOfVoice),
      messaging: JSON.stringify(bibleData.messaging),
      channelGuidelines: JSON.stringify(bibleData.channelGuidelines),
      competitiveContext: JSON.stringify(bibleData.competitiveContext),
      promptTemplates: JSON.stringify(bibleData.promptTemplates),
    },
    update: {
      visualIdentity: JSON.stringify(bibleData.visualIdentity),
      toneOfVoice: JSON.stringify(bibleData.toneOfVoice),
      messaging: JSON.stringify(bibleData.messaging),
      channelGuidelines: JSON.stringify(bibleData.channelGuidelines),
      competitiveContext: JSON.stringify(bibleData.competitiveContext),
      promptTemplates: JSON.stringify(bibleData.promptTemplates),
      version: { increment: 1 },
    },
  });

  return Response.json({ bible: { ...bible, ...bibleData } });
}
