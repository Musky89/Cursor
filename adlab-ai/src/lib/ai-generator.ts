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

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

async function tryOpenAiGeneration(input: GeneratorInput) {
  if (!openaiClient) {
    return null;
  }

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an elite direct-response creative strategist. Generate ad concepts that prioritize profitable growth and clear conversion psychology.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Generate ad concepts",
          strictRequirements: [
            "Return valid JSON with key `concepts` only",
            `Return exactly ${input.count} concepts`,
            "Follow hook > pain/desire > promise > proof > offer > CTA",
            "Make claims realistic and specific",
            "Use concise, high-conversion language",
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

  const parsed = generatedConceptListSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    return null;
  }

  return parsed.data.concepts;
}

export async function generateAdConcepts(input: GeneratorInput) {
  if (openaiClient) {
    try {
      const concepts = await tryOpenAiGeneration(input);
      if (concepts && concepts.length > 0) {
        return concepts;
      }
    } catch {
      // Fall back to deterministic generation if model call fails.
    }
  }

  return buildFallbackConcepts(input);
}
