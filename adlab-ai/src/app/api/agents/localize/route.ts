import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  conceptId: z.string(),
  markets: z.array(z.string().min(2).max(100)).min(1).max(5),
});

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide conceptId and markets array.", 400);

  const concept = await prisma.adConcept.findFirst({
    where: { id: parsed.data.conceptId, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) return errorResponse("Concept not found.", 404);

  const localizations: {
    market: string;
    headline: string;
    hook: string;
    primaryText: string;
    cta: string;
    culturalNotes: string;
  }[] = [];

  for (const market of parsed.data.markets) {
    try {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a localization expert who adapts advertising copy for different markets. You don't just translate — you culturally adapt. Use local slang, references, humor, and social norms. The result should feel native to the market, not translated.

Return JSON: {headline, hook, primaryText, cta, culturalNotes}
- culturalNotes explains what you changed and why for that specific market`,
          },
          {
            role: "user",
            content: JSON.stringify({
              sourceMarket: "South Africa",
              targetMarket: market,
              original: {
                headline: concept.headline,
                hook: concept.hook,
                primaryText: concept.primaryText,
                cta: concept.cta,
              },
              product: concept.product.name,
              audience: concept.audience.name,
            }),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const localized = JSON.parse(content);
        localizations.push({ market, ...localized });
      }
    } catch { /* skip failed markets */ }
  }

  return Response.json({ conceptId: concept.id, originalMarket: "South Africa", localizations });
}
