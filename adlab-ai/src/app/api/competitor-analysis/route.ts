import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  competitor: z.string().min(2).max(200),
  yourProduct: z.string().min(2).max(200),
  market: z.string().min(2).max(100),
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
  if (!parsed.success) return errorResponse("Provide competitor, yourProduct, and market.", 400);

  const { competitor, yourProduct, market } = parsed.data;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a competitive intelligence strategist for advertising. Analyze a competitor and generate attack angles for ad campaigns. Return JSON with:
- competitorWeaknesses: string[] (5 specific weaknesses to exploit in ads)
- attackAngles: array of objects, each with:
  - angle: string (the creative angle name)
  - headline: string (a punchy ad headline using this angle)
  - hook: string (the opening line of the ad)
  - tone: string (the emotional tone — aggressive, playful, factual, etc.)
- differentiators: string[] (5 things that make the challenger brand genuinely different)
- avoidTopics: string[] (3 topics to avoid in comparative advertising — legal/ethical risks)

Be specific, bold, and actionable. These should be ready to turn into ad concepts.`,
        },
        {
          role: "user",
          content: `Analyze "${competitor}" as a competitor to "${yourProduct}" in the ${market} market. Generate attack angles for ad campaigns that position ${yourProduct} as the superior choice.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return errorResponse("No response.", 502);

    const analysis = JSON.parse(content);
    return Response.json({ analysis });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed.", 502);
  }
}
