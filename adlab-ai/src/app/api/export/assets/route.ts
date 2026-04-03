import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const url = new URL(request.url);
  const conceptId = url.searchParams.get("conceptId");

  const where = conceptId
    ? { workspaceId: auth.workspace.id, conceptId }
    : { workspaceId: auth.workspace.id };

  const images = await prisma.generatedImage.findMany({
    where,
    select: { id: true, model: true, brandStyle: true, mimeType: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json({
    assets: images.map((img) => ({
      id: img.id,
      downloadUrl: `/api/images/${img.id}/download`,
      serveUrl: `/api/images/${img.id}/serve`,
      model: img.model,
      brandStyle: img.brandStyle,
      mimeType: img.mimeType,
      status: img.status,
      createdAt: img.createdAt,
    })),
    total: images.length,
  });
}
