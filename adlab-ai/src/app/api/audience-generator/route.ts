import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  description: z.string().min(10).max(500),
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
  if (!parsed.success) return errorResponse("Provide description (10-500 chars) and market.", 400);

  const { description, market } = parsed.data;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert consumer research strategist. Generate a detailed audience persona for advertising targeting. Return JSON with exactly these keys:
- name: string (audience segment name, e.g. "SA Gen-Z Foodies (18-25)")
- painPoints: string (5-7 specific pain points, comma-separated, written from their perspective)
- desires: string (5-7 specific desires, comma-separated, written from their perspective)
- notes: string (cultural context, media habits, buying behavior, slang they use, influencers they follow, where they shop, what motivates them — be specific to the market)

Make it hyper-specific to the market. Use their actual language and cultural references. No generic marketing speak.`,
        },
        {
          role: "user",
          content: `Generate an audience persona for: "${description}" in the ${market} market.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return errorResponse("No response from GPT.", 502);

    const persona = JSON.parse(content);
    return Response.json({ persona });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed.", 502);
  }
}
