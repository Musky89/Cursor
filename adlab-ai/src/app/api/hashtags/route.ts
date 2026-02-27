import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  caption: z.string().min(5).max(2200),
  brand: z.string().min(2).max(100),
  channel: z.string().min(2).max(20),
  market: z.string().min(2).max(100).optional(),
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
  if (!parsed.success) return errorResponse("Provide caption, brand, and channel.", 400);

  const { caption, brand, channel, market = "South Africa" } = parsed.data;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate optimized hashtag sets for Instagram/social media posts. Return JSON:
- primary: string[] (5 brand/campaign hashtags that should appear on every post)
- secondary: string[] (10 content-specific hashtags based on the caption)
- trending: string[] (5 currently trending hashtags relevant to the content and market)
- niche: string[] (5 low-competition niche hashtags for better discovery)
All hashtags should include the # symbol. Optimize for ${market} market reach.`,
      },
      {
        role: "user",
        content: `Brand: ${brand}\nChannel: ${channel}\nMarket: ${market}\nCaption: ${caption}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("No response.", 502);

  return Response.json(JSON.parse(content));
}
