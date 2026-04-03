import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  originalCaption: z.string().min(5).max(2200),
  brand: z.string().min(2).max(100),
  tone: z.string().max(100).optional(),
  count: z.number().min(1).max(5).optional(),
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
  if (!parsed.success) return errorResponse("Provide originalCaption and brand.", 400);

  const { originalCaption, brand, tone = "casual and engaging", count = 5 } = parsed.data;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Generate ${count} alternative caption variations for a social media post. Each variation should:
- Keep the same core message but with different wording, hooks, and CTAs
- Match the brand voice
- Be Instagram-optimized (under 2200 chars, front-load the hook)
- Include emoji strategically

Return JSON: {variations: [{caption: string, tone: string, hook_style: string}]}
Tone styles to vary: question hook, bold statement, storytelling, emoji-heavy, minimal/clean`,
      },
      {
        role: "user",
        content: `Brand: ${brand}\nDesired tone: ${tone}\nOriginal caption:\n${originalCaption}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("No response.", 502);

  return Response.json(JSON.parse(content));
}
