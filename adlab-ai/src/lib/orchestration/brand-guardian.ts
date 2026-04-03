import "server-only";

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  return _openai;
}

export type QualityScoreCard = {
  overallScore: number;
  pass: boolean;
  dimensions: {
    colorCompliance: { score: number; pass: boolean; notes: string };
    toneCompliance: { score: number; pass: boolean; notes: string };
    messagingAlignment: { score: number; pass: boolean; notes: string };
    strategicAlignment: { score: number; pass: boolean; notes: string };
    compositionQuality: { score: number; pass: boolean; notes: string };
    platformReadiness: { score: number; pass: boolean; notes: string };
  };
  recommendations: string[];
  autoAction: "approve" | "flag_for_review" | "reject";
};

export async function runBrandGuardian(
  brandId: string | null,
  upstreamOutputs: Record<string, string>,
): Promise<QualityScoreCard> {
  const client = getClient();
  if (!client) throw new Error("OPENAI_API_KEY required for Brand Guardian.");

  let bibleContext = "No Brand Bible available — scoring against general best practices.";

  if (brandId) {
    const bible = await prisma.brandBible.findUnique({ where: { brandId } });
    if (bible) {
      bibleContext = [
        `BRAND BIBLE:`,
        `Visual Identity: ${bible.visualIdentity ?? "not set"}`,
        `Tone of Voice: ${bible.toneOfVoice ?? "not set"}`,
        `Messaging: ${bible.messaging ?? "not set"}`,
        `Channel Guidelines: ${bible.channelGuidelines ?? "not set"}`,
      ].join("\n");
    }

    const strategy = await prisma.brandStrategy.findUnique({ where: { brandId } });
    if (strategy?.lockedTerritory) {
      bibleContext += `\nLOCKED STRATEGY: ${strategy.lockedTerritory}\nPositioning: ${strategy.positioning ?? ""}\nTone: ${strategy.toneOfVoice ?? ""}`;
    }
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a Brand Guardian — the quality control gate in a creative agency pipeline. You evaluate all upstream work (strategy, concepts, copy, art direction, visuals) against the Brand Bible and strategic direction.

Score each dimension 1-10. Pass threshold is 7. Be rigorous — this is the last gate before the founder sees the work.

Return JSON:
{
  "overallScore": number (1-10, weighted average),
  "pass": boolean (true if ALL dimensions >= 7),
  "dimensions": {
    "colorCompliance": {"score": number, "pass": boolean, "notes": "specific feedback"},
    "toneCompliance": {"score": number, "pass": boolean, "notes": "specific feedback"},
    "messagingAlignment": {"score": number, "pass": boolean, "notes": "specific feedback"},
    "strategicAlignment": {"score": number, "pass": boolean, "notes": "specific feedback"},
    "compositionQuality": {"score": number, "pass": boolean, "notes": "specific feedback"},
    "platformReadiness": {"score": number, "pass": boolean, "notes": "specific feedback"}
  },
  "recommendations": ["specific actionable improvements"],
  "autoAction": "approve" (score >= 8) | "flag_for_review" (score 6-7.9) | "reject" (score < 6)
}`,
      },
      {
        role: "user",
        content: JSON.stringify({
          brandContext: bibleContext,
          workToEvaluate: upstreamOutputs,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Brand Guardian returned no response.");

  return JSON.parse(content) as QualityScoreCard;
}
