import "server-only";

import { Channel } from "@/generated/prisma/client";
import OpenAI from "openai";
import { z } from "zod";

type GeneratorInput = {
  count: number;
  objective: string;
  channel: Channel;
  product: {
    name: string;
    description: string;
    price: number;
    marginPct: number;
    landingUrl: string;
  };
  audience: {
    name: string;
    painPoints: string;
    desires: string;
    notes: string | null;
  };
};

export const generatedConceptSchema = z.object({
  angle: z.string().min(3).max(120),
  hook: z.string().min(10).max(220),
  painDesire: z.string().min(10).max(280),
  promise: z.string().min(10).max(220),
  proof: z.string().min(5).max(220),
  offer: z.string().min(5).max(220),
  cta: z.string().min(3).max(120),
  primaryText: z.string().min(30).max(1000),
  headline: z.string().min(8).max(120),
  script: z.string().min(40).max(1400),
  imagePrompt: z.string().min(10).max(600),
  score: z.number().min(50).max(99),
});

export type GeneratedConcept = z.infer<typeof generatedConceptSchema>;

const generatedConceptListSchema = z.object({
  concepts: z.array(generatedConceptSchema).min(1).max(8),
});

const anglePool = [
  "Urgency-driven savings",
  "Proof-first conversion",
  "Pain disrupter",
  "Aspirational transformation",
  "Comparison takeover",
  "Risk reversal",
  "Speed-to-value",
  "Founder story authority",
];

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildFallbackConcepts(input: GeneratorInput): GeneratedConcept[] {
  const painTokens = input.audience.painPoints
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean);
  const desireTokens = input.audience.desires
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean);

  return Array.from({ length: input.count }).map((_, index) => {
    const pain = painTokens[index % Math.max(1, painTokens.length)] ?? "wasted ad spend";
    const desire = desireTokens[index % Math.max(1, desireTokens.length)] ?? "predictable growth";
    const angle = anglePool[index % anglePool.length];
    const score = Math.round(randomFloat(70, 96));

    return {
      angle,
      hook: `${input.audience.name}: stop losing budget to ${pain} and capture ${desire}.`,
      painDesire: `Teams struggle with ${pain}. This concept reframes the outcome around ${desire}.`,
      promise: `Use ${input.product.name} to improve acquisition quality while protecting margin in 14 days.`,
      proof: `${Math.round(randomFloat(18, 43))}% lower CPA in simulated benchmark cohorts.`,
      offer: `${Math.round(randomFloat(10, 25))}% launch incentive + onboarding support this week.`,
      cta: `Start your ${input.product.name} growth sprint`,
      primaryText: `${input.product.description}\n\nIf ${pain} is dragging performance, this campaign angle focuses on one outcome: ${desire}. Built for ${input.audience.name}, optimized for ${input.channel}, and tied to direct revenue impact.\n\nOffer: ${Math.round(randomFloat(10, 25))}% off this week.\n${input.objective}`,
      headline: `${input.product.name}: ${desire} without ${pain}`,
      script: `Scene 1: Call out ${pain} and quantify the cost of delay.\nScene 2: Introduce ${input.product.name} and the mechanism that removes friction.\nScene 3: Show before/after KPI shift and explain why ${input.audience.name} converts faster.\nScene 4: Deliver the offer and direct CTA to ${input.product.landingUrl}.`,
      imagePrompt: `Create a high-conversion ${input.channel} ad visual for ${input.product.name}. Show ${input.audience.name} moving from "${pain}" to "${desire}". Include clean typography, trust badges, and a strong CTA.`,
      score,
    };
  });
}

let _openaiClient: OpenAI | null | undefined;

function getOpenAiClient() {
  if (_openaiClient === undefined) {
    _openaiClient = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }
  return _openaiClient;
}

async function tryOpenAiGeneration(input: GeneratorInput) {
  const client = getOpenAiClient();
  if (!client) {
    return null;
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an elite direct-response creative strategist. Generate ad concepts that use authentic language matching the target audience. If audience notes mention specific cultural context, slang, or local references, weave them naturally into every piece of copy. Prioritize bold, memorable creative that stops the scroll.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Generate ad concepts",
          strictRequirements: [
            "Return valid JSON with key `concepts` only",
            `Return exactly ${input.count} concepts`,
            "Each concept MUST have exactly these keys: angle, hook, painDesire, promise, proof, offer, cta, primaryText, headline, script, imagePrompt, score",
            "score must be a number between 50 and 99",
            "headline: 8-120 chars",
            "hook: 10-220 chars",
            "primaryText: 30-1000 chars — write genuine ad body copy, not a summary",
            "script: 40-1400 chars — write a scene-by-scene video storyboard",
            "imagePrompt: 10-600 chars — describe the ideal ad visual in detail",
            "Make each concept have a distinct creative angle and tone",
            `Optimize copy for ${input.channel} platform conventions`,
            "Use the audience's own language — match their slang, cultural refs, and tone from the notes",
          ],
          context: input,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return null;
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    return null;
  }

  const parsed = generatedConceptListSchema.safeParse(parsedJson);
  if (!parsed.success) {
    // Zod rejected GPT's output — truncate fields that exceed limits and retry parse
    if (Array.isArray(parsedJson.concepts)) {
      for (const c of parsedJson.concepts) {
        if (typeof c.hook === "string" && c.hook.length > 220) c.hook = c.hook.slice(0, 220);
        if (typeof c.headline === "string" && c.headline.length > 120) c.headline = c.headline.slice(0, 120);
        if (typeof c.primaryText === "string" && c.primaryText.length > 1000) c.primaryText = c.primaryText.slice(0, 1000);
        if (typeof c.script === "string" && c.script.length > 1400) c.script = c.script.slice(0, 1400);
        if (typeof c.imagePrompt === "string" && c.imagePrompt.length > 600) c.imagePrompt = c.imagePrompt.slice(0, 600);
        if (typeof c.painDesire === "string" && c.painDesire.length > 280) c.painDesire = c.painDesire.slice(0, 280);
        if (typeof c.promise === "string" && c.promise.length > 220) c.promise = c.promise.slice(0, 220);
        if (typeof c.proof === "string" && c.proof.length > 220) c.proof = c.proof.slice(0, 220);
        if (typeof c.offer === "string" && c.offer.length > 220) c.offer = c.offer.slice(0, 220);
        if (typeof c.cta === "string" && c.cta.length > 120) c.cta = c.cta.slice(0, 120);
        if (typeof c.angle === "string" && c.angle.length > 120) c.angle = c.angle.slice(0, 120);
        if (typeof c.score === "number") c.score = Math.min(99, Math.max(50, Math.round(c.score)));
      }
      const retry = generatedConceptListSchema.safeParse(parsedJson);
      if (retry.success) return retry.data.concepts;
    }
    return null;
  }

  return parsed.data.concepts;
}

export async function generateAdConcepts(input: GeneratorInput) {
  const client = getOpenAiClient();
  if (client) {
    const concepts = await tryOpenAiGeneration(input);
    if (concepts && concepts.length > 0) {
      return concepts;
    }
  }

  return buildFallbackConcepts(input);
}
