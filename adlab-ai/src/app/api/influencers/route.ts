import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(20).max(2000),
  personality: z.string().max(500).optional(),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const profiles = await prisma.influencerProfile.findMany({
    where: { workspaceId: auth.workspace.id },
    select: { id: true, name: true, description: true, personality: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ profiles });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  const profile = await prisma.influencerProfile.create({
    data: {
      workspaceId: auth.workspace.id,
      name: parsed.data.name,
      description: parsed.data.description,
      personality: parsed.data.personality,
    },
  });

  return Response.json({ profile });
}
