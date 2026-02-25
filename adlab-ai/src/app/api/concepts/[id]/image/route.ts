import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse("OPENAI_API_KEY is not configured.", 503);
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
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: concept.imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      return errorResponse("No image returned from DALL-E.", 502);
    }

    return Response.json({ imageUrl, model: "dall-e-3", quality: "hd" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return errorResponse(message, 502);
  }
}
