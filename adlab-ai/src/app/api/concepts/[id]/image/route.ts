import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL ?? "http://localhost:8100";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: { product: true, audience: true },
  });

  if (!concept) {
    return errorResponse("Concept not found.", 404);
  }

  try {
    const response = await fetch(`${IMAGE_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: concept.imagePrompt,
        width: 512,
        height: 512,
        steps: 4,
      }),
    });

    if (!response.ok) {
      return errorResponse("Image generation failed.", 502);
    }

    const data = (await response.json()) as { url: string; cached: boolean };
    const imageUrl = `${IMAGE_SERVICE_URL}${data.url}`;

    return Response.json({ imageUrl, cached: data.cached });
  } catch {
    return errorResponse("Image service unavailable. Start it with: cd image-service && python3 -m uvicorn server:app --port 8100", 503);
  }
}
