import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { createPipeline } from "@/lib/orchestration/engine";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  briefText: z.string().min(10).max(5000),
  clientId: z.string().optional(),
  brandId: z.string().optional(),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const pipelines = await prisma.pipeline.findMany({
    where: { workspaceId: auth.workspace.id },
    include: { tasks: { select: { id: true, stage: true, status: true, title: true, agentType: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ pipelines });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const pipeline = await createPipeline(auth.workspace.id, parsed.data.clientId ?? null, parsed.data.brandId ?? null, parsed.data.title, parsed.data.briefText);
    const full = await prisma.pipeline.findUnique({ where: { id: pipeline.id }, include: { tasks: true } });
    return Response.json({ pipeline: full });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed.", 500);
  }
}
