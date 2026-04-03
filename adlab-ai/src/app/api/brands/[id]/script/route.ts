import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  brief: z.string().min(10).max(2000),
  duration: z.enum(["15s", "30s", "60s", "90s", "long-form"]).optional(),
  style: z.enum(["testimonial", "product-demo", "lifestyle", "tutorial", "storytelling", "ugc-style"]).optional(),
});

let _openai: OpenAI | null | undefined;
function getClient() { if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null; return _openai; }

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);
  const { id } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id, client: { workspaceId: auth.workspace.id } },
    include: { client: true, strategy: true },
  });
  if (!brand) return errorResponse("Brand not found.", 404);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide a brief.", 400);

  const { brief, duration = "30s", style = "lifestyle" } = parsed.data;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a video production specialist creating complete video production packages. Generate a detailed script with shot list that a production team can execute directly.

Return JSON:
{
  "title": "video title",
  "duration": "${duration}",
  "style": "${style}",
  "concept": "one-line creative concept",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": "0:00-0:05",
      "shotType": "wide/medium/close-up/extreme close-up/POV/aerial",
      "cameraMovement": "static/pan/tilt/dolly/tracking/handheld",
      "description": "what the viewer sees",
      "dialogue": "spoken words or voiceover (null if none)",
      "onScreenText": "text overlay (null if none)",
      "audio": "music/sound effects direction",
      "talent": "who is in the shot and what they're doing",
      "location": "where this is shot",
      "lighting": "lighting direction",
      "props": "required props",
      "directorNotes": "specific direction for performance/mood"
    }
  ],
  "shotList": [
    {"shot": "SH01", "type": "wide", "description": "establishing shot", "lens": "24mm", "notes": "golden hour"}
  ],
  "productionNotes": {
    "castingNotes": "who to cast",
    "locationRequirements": "locations needed",
    "wardrobe": "clothing/styling direction",
    "musicDirection": "music style, tempo, mood",
    "colorGrade": "post-production color direction",
    "editingStyle": "cut pace, transitions",
    "deliverables": "final formats needed"
  }
}`,
      },
      {
        role: "user",
        content: `Brand: ${brand.name} (${brand.client.name}). ${brand.strategy?.positioning ?? ""}. ${brand.strategy?.toneOfVoice ?? ""}.\n\nBrief: ${brief}\n\nDuration: ${duration}\nStyle: ${style}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Script generation failed.", 502);

  return Response.json(JSON.parse(content));
}
