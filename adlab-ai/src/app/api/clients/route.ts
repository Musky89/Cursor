import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const clients = await prisma.client.findMany({
    where: { workspaceId: auth.workspace.id },
    include: { brands: { select: { id: true, name: true, industry: true } }, _count: { select: { brands: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ clients });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  const client = await prisma.client.create({
    data: { workspaceId: auth.workspace.id, ...parsed.data },
  });

  return Response.json({ client });
}
