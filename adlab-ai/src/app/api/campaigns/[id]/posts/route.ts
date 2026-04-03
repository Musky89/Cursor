import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  scheduledAt: z.string(),
  caption: z.string().min(1).max(2200),
  hashtags: z.string().max(500).optional(),
  channel: z.enum(["META", "TIKTOK", "GOOGLE"]),
  format: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const posts = await prisma.campaignPost.findMany({
    where: { campaign: { id, workspaceId: auth.workspace.id } },
    orderBy: { scheduledAt: "asc" },
  });

  return Response.json({ posts });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });
  if (!campaign) return errorResponse("Campaign not found.", 404);

  const parsed = await parseJsonBody(request, createPostSchema);
  if (!parsed.ok) return parsed.response;

  const post = await prisma.campaignPost.create({
    data: {
      campaignId: id,
      scheduledAt: new Date(parsed.data.scheduledAt),
      caption: parsed.data.caption,
      hashtags: parsed.data.hashtags,
      channel: parsed.data.channel,
      format: parsed.data.format ?? "1:1",
      imageUrl: parsed.data.imageUrl,
    },
  });

  return Response.json({ post });
}
