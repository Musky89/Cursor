import { getAuthContext } from "@/lib/auth";
import { generateAdConcepts } from "@/lib/ai-generator";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { generateConceptsSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const parsedBody = await parseJsonBody(request, generateConceptsSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { productId, audienceId, channel, objective, count } = parsedBody.data;

  const [product, audience] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, workspaceId: auth.workspace.id, isActive: true },
    }),
    prisma.audience.findFirst({
      where: { id: audienceId, workspaceId: auth.workspace.id },
    }),
  ]);

  if (!product) {
    return errorResponse("Product not found.", 404);
  }

  if (!audience) {
    return errorResponse("Audience not found.", 404);
  }

  const generatedConcepts = await generateAdConcepts({
    count,
    objective,
    channel,
    product: {
      name: product.name,
      description: product.description,
      price: product.price,
      marginPct: product.marginPct,
      landingUrl: product.landingUrl,
    },
    audience: {
      name: audience.name,
      painPoints: audience.painPoints,
      desires: audience.desires,
      notes: audience.notes,
    },
  });

  const createdConcepts = await prisma.$transaction(
    generatedConcepts.map((concept) =>
      prisma.adConcept.create({
        data: {
          workspaceId: auth.workspace.id,
          productId: product.id,
          audienceId: audience.id,
          channel,
          angle: concept.angle,
          hook: concept.hook,
          painDesire: concept.painDesire,
          promise: concept.promise,
          proof: concept.proof,
          offer: concept.offer,
          cta: concept.cta,
          primaryText: concept.primaryText,
          headline: concept.headline,
          script: concept.script,
          imagePrompt: concept.imagePrompt,
          score: concept.score,
        },
      }),
    ),
  );

  return Response.json({
    concepts: createdConcepts,
    generatedCount: createdConcepts.length,
  });
}
