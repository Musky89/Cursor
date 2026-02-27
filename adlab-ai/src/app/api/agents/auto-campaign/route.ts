import { getAuthContext } from "@/lib/auth";
import { analyzeBrand } from "@/lib/agents/brand-intel";
import { generateAdConcepts } from "@/lib/ai-generator";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  url: z.string().min(3).max(500),
  channel: z.enum(["META", "TIKTOK", "GOOGLE"]).optional(),
  market: z.string().min(2).max(100).optional(),
  conceptCount: z.number().min(1).max(8).optional(),
});

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) {
    _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return _openai;
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const client = getClient();
  if (!client) return errorResponse("OPENAI_API_KEY required.", 503);

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide a valid URL.", 400);

  const { url, channel = "META", market = "South Africa", conceptCount = 4 } = parsed.data;

  const steps: { step: string; status: string; data?: unknown }[] = [];

  try {
    // Step 1: Brand Intelligence
    steps.push({ step: "Analyzing brand from website...", status: "running" });
    const brand = await analyzeBrand(url);
    steps[steps.length - 1].status = "done";
    steps[steps.length - 1].data = { name: brand.name, products: brand.products.length };

    // Step 2: Create product in workspace
    steps.push({ step: "Creating product...", status: "running" });
    const productData = brand.products[0] ?? { name: brand.name, description: brand.description, price: "29.99" };
    const product = await prisma.product.create({
      data: {
        workspaceId: auth.workspace.id,
        name: productData.name,
        description: `${productData.description}. ${brand.description}`,
        price: parseFloat(productData.price.replace(/[^0-9.]/g, "")) || 29.99,
        marginPct: 60,
        landingUrl: url,
      },
    });
    steps[steps.length - 1].status = "done";

    // Step 3: Generate audience persona from brand data
    steps.push({ step: "Building audience persona...", status: "running" });
    const audienceCompletion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Generate a target audience persona as JSON: {name, painPoints, desires, notes}. Be specific to the market. Use the audience's actual language. Max 1000 chars per field.`,
        },
        {
          role: "user",
          content: `Brand: ${brand.name}. ${brand.description}. Target: ${brand.targetAudience}. Voice: ${brand.brandVoice.personality}. Market: ${market}. Vocabulary: ${brand.brandVoice.vocabulary.join(", ")}`,
        },
      ],
    });
    const audienceData = JSON.parse(audienceCompletion.choices[0]?.message?.content ?? "{}");

    const audience = await prisma.audience.create({
      data: {
        workspaceId: auth.workspace.id,
        name: audienceData.name ?? `${brand.name} Target Audience`,
        painPoints: audienceData.painPoints ?? "Generic pain points",
        desires: audienceData.desires ?? "Generic desires",
        notes: audienceData.notes ?? null,
      },
    });
    steps[steps.length - 1].status = "done";

    // Step 4: Generate ad concepts
    steps.push({ step: `Generating ${conceptCount} ad concepts...`, status: "running" });
    const objective = `Drive awareness and conversions for ${brand.name}. Position as ${brand.competitivePosition}. Target ${brand.targetAudience} in ${market}.`;

    const generatedConcepts = await generateAdConcepts({
      count: conceptCount,
      objective: objective.slice(0, 200),
      channel: channel as "META" | "TIKTOK" | "GOOGLE",
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

    const concepts = await prisma.$transaction(
      generatedConcepts.map((concept) =>
        prisma.adConcept.create({
          data: {
            workspaceId: auth.workspace.id,
            productId: product.id,
            audienceId: audience.id,
            channel,
            ...concept,
          },
        }),
      ),
    );
    steps[steps.length - 1].status = "done";

    return Response.json({
      success: true,
      brand: {
        name: brand.name,
        tagline: brand.tagline,
        description: brand.description,
        voice: brand.brandVoice,
        visualIdentity: brand.visualIdentity,
      },
      product: { id: product.id, name: product.name },
      audience: { id: audience.id, name: audience.name },
      concepts: concepts.map((c) => ({ id: c.id, headline: c.headline, score: c.score, channel: c.channel })),
      steps,
    });
  } catch (err) {
    steps.push({ step: "Error", status: "failed", data: err instanceof Error ? err.message : "Unknown error" });
    return errorResponse(err instanceof Error ? err.message : "Auto-campaign failed.", 502);
  }
}
