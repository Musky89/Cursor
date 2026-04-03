import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const upsertSchema = z.object({
  clientId: z.string(),
  templateType: z.enum(["social-first", "performance", "content-led", "new-brand-build", "traditional-media", "full-service"]),
  activeServices: z.array(z.string()).optional(),
  recurringBriefs: z.array(z.object({ title: z.string(), cadence: z.string(), channel: z.string() })).optional(),
  qualityThresholds: z.object({ minOverallScore: z.number().optional(), minColorCompliance: z.number().optional() }).optional(),
  specialPipelines: z.array(z.string()).optional(),
  agentsAssigned: z.array(z.string()).optional(),
  monthlyAssetTarget: z.number().min(1).max(500).optional(),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const blueprints = await prisma.serviceBlueprint.findMany({
    where: { client: { workspaceId: auth.workspace.id } },
    include: { client: { select: { id: true, name: true, industry: true } } },
  });

  return Response.json({
    blueprints: blueprints.map((b) => ({
      ...b,
      activeServices: JSON.parse(b.activeServices ?? "[]"),
      recurringBriefs: JSON.parse(b.recurringBriefs ?? "[]"),
      qualityThresholds: JSON.parse(b.qualityThresholds ?? "{}"),
      specialPipelines: JSON.parse(b.specialPipelines ?? "[]"),
      agentsAssigned: JSON.parse(b.agentsAssigned ?? "[]"),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid blueprint data.", 400);

  const client = await prisma.client.findFirst({ where: { id: parsed.data.clientId, workspaceId: auth.workspace.id } });
  if (!client) return errorResponse("Client not found.", 404);

  const blueprint = await prisma.serviceBlueprint.upsert({
    where: { clientId: parsed.data.clientId },
    create: {
      clientId: parsed.data.clientId,
      templateType: parsed.data.templateType,
      activeServices: JSON.stringify(parsed.data.activeServices ?? []),
      recurringBriefs: JSON.stringify(parsed.data.recurringBriefs ?? []),
      qualityThresholds: JSON.stringify(parsed.data.qualityThresholds ?? {}),
      specialPipelines: JSON.stringify(parsed.data.specialPipelines ?? []),
      agentsAssigned: JSON.stringify(parsed.data.agentsAssigned ?? []),
      monthlyAssetTarget: parsed.data.monthlyAssetTarget ?? 30,
    },
    update: {
      templateType: parsed.data.templateType,
      activeServices: JSON.stringify(parsed.data.activeServices ?? []),
      recurringBriefs: JSON.stringify(parsed.data.recurringBriefs ?? []),
      qualityThresholds: JSON.stringify(parsed.data.qualityThresholds ?? {}),
      specialPipelines: JSON.stringify(parsed.data.specialPipelines ?? []),
      agentsAssigned: JSON.stringify(parsed.data.agentsAssigned ?? []),
      monthlyAssetTarget: parsed.data.monthlyAssetTarget ?? 30,
    },
  });

  return Response.json({ blueprint });
}
