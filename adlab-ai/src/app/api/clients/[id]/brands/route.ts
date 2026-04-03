import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().max(100).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const client = await prisma.client.findFirst({ where: { id, workspaceId: auth.workspace.id } });
  if (!client) return errorResponse("Client not found.", 404);

  const brands = await prisma.brand.findMany({
    where: { clientId: id },
    include: { strategy: { select: { status: true, lockedTerritory: true } }, _count: { select: { quickAssets: true, logoDesigns: true, briefs: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ brands, client });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const client = await prisma.client.findFirst({ where: { id, workspaceId: auth.workspace.id } });
  if (!client) return errorResponse("Client not found.", 404);

  const parsed = await parseJsonBody(request, createSchema);
  if (!parsed.ok) return parsed.response;

  const brand = await prisma.brand.create({ data: { clientId: id, ...parsed.data } });
  return Response.json({ brand });
}
