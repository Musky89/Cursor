import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const image = await prisma.generatedImage.findUnique({
    where: { id },
    select: { imageData: true, mimeType: true, model: true, brandStyle: true },
  });

  if (!image || !image.imageData) {
    return new Response("Not found", { status: 404 });
  }

  const ext = image.mimeType.includes("png") ? "png" : image.mimeType.includes("webp") ? "webp" : "jpg";
  const filename = `adlab-${id.slice(0, 8)}.${ext}`;

  return new Response(image.imageData, {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": image.imageData.length.toString(),
    },
  });
}
