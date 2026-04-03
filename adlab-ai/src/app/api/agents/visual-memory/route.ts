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

  const images = await prisma.generatedImage.findMany({
    where: { workspaceId: auth.workspace.id, status: { in: ["approved", "rejected"] } },
    select: { prompt: true, model: true, brandStyle: true, status: true, format: true, reviewNote: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (images.length < 3) {
    return Response.json({
      hasMemory: false,
      message: "Need at least 3 approved/rejected images to build visual memory.",
      approvedCount: images.filter((i) => i.status === "approved").length,
      rejectedCount: images.filter((i) => i.status === "rejected").length,
    });
  }

  const approved = images.filter((i) => i.status === "approved");
  const rejected = images.filter((i) => i.status === "rejected");

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are analyzing a client's creative approval history to build a "Visual Memory" — a learned preference profile. By comparing APPROVED vs REJECTED image prompts and their review notes, extract patterns about what this client likes and dislikes.

Return JSON:
- preferredStyles: string[] (visual styles consistently approved)
- avoidedStyles: string[] (visual styles consistently rejected)
- lightingPreference: string (what lighting the client gravitates toward)
- compositionPreference: string (composition patterns in approved work)
- moodPreference: string (emotional tone of approved work)
- colorPreference: string (color tendencies)
- artDirectorOverride: string (a 150-word instruction to prepend to ALL future art director briefs for this client, encoding their learned preferences)
- confidence: number (0-100, how confident you are in these patterns based on data volume)
- insights: string[] (3-5 specific actionable insights about this client's taste)`,
      },
      {
        role: "user",
        content: JSON.stringify({
          approvedPrompts: approved.map((i) => ({ prompt: i.prompt.substring(0, 300), brandStyle: i.brandStyle, note: i.reviewNote })),
          rejectedPrompts: rejected.map((i) => ({ prompt: i.prompt.substring(0, 300), brandStyle: i.brandStyle, note: i.reviewNote })),
          totalApproved: approved.length,
          totalRejected: rejected.length,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Analysis failed.", 502);

  const memory = JSON.parse(content);

  return Response.json({
    hasMemory: true,
    memory,
    dataPoints: images.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
  });
}
