import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { finishAsset, adaptToFormats } from "@/lib/finishing";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  headline: z.string().max(200).optional(),
  subheadline: z.string().max(300).optional(),
  cta: z.string().max(100).optional(),
  logoDescription: z.string().max(500).optional(),
  brandColors: z.array(z.string()).optional(),
  targetFormat: z.string().optional(),
  platform: z.string().optional(),
  allFormats: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
  });
  if (!concept) return errorResponse("Concept not found.", 404);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid finishing spec.", 400);

  const spec = {
    headline: parsed.data?.headline ?? concept.headline,
    subheadline: parsed.data?.subheadline,
    cta: parsed.data?.cta ?? concept.cta,
    logoDescription: parsed.data?.logoDescription,
    brandColors: parsed.data?.brandColors,
    targetFormat: parsed.data?.targetFormat ?? "1:1",
    platform: parsed.data?.platform ?? "instagram",
  };

  try {
    if (parsed.data?.allFormats) {
      const results = await adaptToFormats(concept.imagePrompt, spec);
      return Response.json({ results });
    }

    const result = await finishAsset(concept.imagePrompt, spec);
    return Response.json({ result });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Finishing failed.", 502);
  }
}
