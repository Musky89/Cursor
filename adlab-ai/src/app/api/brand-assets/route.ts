import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const assets = await prisma.brandAsset.findMany({
    where: { workspaceId: auth.workspace.id },
    select: { id: true, type: true, name: true, description: true, mimeType: true, width: true, height: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ assets });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string | null;

  if (!file || !name || !type) return errorResponse("Provide file, name, and type.", 400);

  const buffer = Buffer.from(await file.arrayBuffer());

  const asset = await prisma.brandAsset.create({
    data: {
      workspaceId: auth.workspace.id,
      type,
      name,
      description,
      fileData: buffer,
      mimeType: file.type,
    },
  });

  return Response.json({ asset: { id: asset.id, name: asset.name, type: asset.type } });
}
