import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]),
  note: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide action (approve/reject/request_changes).", 400);

  const image = await prisma.generatedImage.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });

  if (!image) return errorResponse("Image not found.", 404);

  const statusMap = {
    approve: "approved",
    reject: "rejected",
    request_changes: "draft",
  } as const;

  const updated = await prisma.generatedImage.update({
    where: { id },
    data: {
      status: statusMap[parsed.data.action],
      reviewNote: parsed.data.note,
    },
  });

  return Response.json({ image: { id: updated.id, status: updated.status, reviewNote: updated.reviewNote } });
}
