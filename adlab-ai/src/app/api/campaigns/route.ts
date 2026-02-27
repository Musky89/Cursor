import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  channel: z.enum(["META", "TIKTOK", "GOOGLE"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: auth.workspace.id },
    include: {
      _count: { select: { images: true, posts: true } },
      posts: { orderBy: { scheduledAt: "asc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ campaigns });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: auth.workspace.id,
      name: parsed.data.name,
      description: parsed.data.description,
      channel: parsed.data.channel as "META" | "TIKTOK" | "GOOGLE" | undefined,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
  });

  return Response.json({ campaign });
}
