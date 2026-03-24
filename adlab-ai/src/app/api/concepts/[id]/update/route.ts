import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  headline: z.string().min(3).max(200).optional(),
  hook: z.string().min(5).max(500).optional(),
  primaryText: z.string().min(10).max(2200).optional(),
  cta: z.string().min(2).max(150).optional(),
  painDesire: z.string().min(5).max(500).optional(),
  promise: z.string().min(5).max(500).optional(),
  proof: z.string().min(3).max(500).optional(),
  offer: z.string().min(3).max(500).optional(),
  script: z.string().min(10).max(2000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid update data.", 400);

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });
  if (!concept) return errorResponse("Concept not found.", 404);

  const updated = await prisma.adConcept.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({ concept: updated });
}
