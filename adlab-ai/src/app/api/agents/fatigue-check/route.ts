import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const concepts = await prisma.adConcept.findMany({
    where: { workspaceId: auth.workspace.id },
    select: { id: true, angle: true, headline: true, hook: true, channel: true, score: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (concepts.length < 3) {
    return Response.json({ fatigueDetected: false, message: "Not enough concepts to analyze fatigue.", suggestions: [] });
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an advertising creative director analyzing a portfolio of ad concepts for creative fatigue. Look for:
- Overused angles (same positioning repeated)
- Repetitive language patterns
- Channel imbalance
- Stale messaging that an audience would tune out

Return JSON:
- fatigueDetected: boolean
- overusedAngles: [{angle, count, risk}]
- underexploredAngles: string[] (angles they should try)
- channelBalance: {meta: number, tiktok: number, google: number}
- recommendations: string[] (3-5 specific actionable suggestions)
- freshConceptIdeas: string[] (3 completely new concept directions they haven't tried)`,
      },
      {
        role: "user",
        content: JSON.stringify({
          totalConcepts: concepts.length,
          concepts: concepts.map((c) => ({
            angle: c.angle,
            headline: c.headline,
            hook: c.hook.substring(0, 100),
            channel: c.channel,
          })),
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Analysis failed.", 502);

  return Response.json(JSON.parse(content));
}
