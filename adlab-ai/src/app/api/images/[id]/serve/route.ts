import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const image = await prisma.generatedImage.findUnique({
    where: { id },
    select: { imageData: true, mimeType: true },
  });

  if (!image || !image.imageData) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(image.imageData, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": image.imageData.length.toString(),
    },
  });
}
