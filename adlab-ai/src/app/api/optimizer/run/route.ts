import { Decision, ExperimentStatus } from "@/generated/prisma/client";
import { getAuthContext } from "@/lib/auth";
import { decideConceptAllocation, normalizeAllocations } from "@/lib/optimizer";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { runOptimizerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const body = await request
    .json()
    .catch(() => ({}))
    .then((value) => (value && typeof value === "object" ? value : {}));
  const parsedBody = runOptimizerSchema.safeParse(body);
  if (!parsedBody.success) {
    return errorResponse(parsedBody.error.issues[0]?.message ?? "Invalid request body");
  }

  const experiments = await prisma.experiment.findMany({
    where: {
      workspaceId: auth.workspace.id,
      ...(parsedBody.data.experimentId ? { id: parsedBody.data.experimentId } : {}),
      status: {
        not: ExperimentStatus.COMPLETED,
      },
    },
    include: {
      conceptLinks: {
        include: {
          concept: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (experiments.length === 0) {
    return errorResponse("No eligible experiments found for optimization.", 404);
  }

  const optimizationResults = [];

  for (const experiment of experiments) {
    const conceptIds = experiment.conceptLinks.map((entry) => entry.conceptId);
    if (conceptIds.length === 0) {
      continue;
    }

    const stats = await prisma.metricSnapshot.groupBy({
      by: ["conceptId"],
      where: {
        workspaceId: auth.workspace.id,
        experimentId: experiment.id,
      },
      _sum: {
        spend: true,
        revenue: true,
        conversions: true,
        clicks: true,
        impressions: true,
      },
    });

    const statsByConcept = new Map(
      stats.map((item) => [
        item.conceptId,
        {
          spend: item._sum.spend ?? 0,
          revenue: item._sum.revenue ?? 0,
          conversions: item._sum.conversions ?? 0,
          clicks: item._sum.clicks ?? 0,
          impressions: item._sum.impressions ?? 0,
        },
      ]),
    );

    const decisions = experiment.conceptLinks.map((entry) => {
      const conceptStats = statsByConcept.get(entry.conceptId) ?? {
        spend: 0,
        revenue: 0,
        conversions: 0,
        clicks: 0,
        impressions: 0,
      };

      return decideConceptAllocation({
        conceptId: entry.conceptId,
        conceptScore: entry.concept.score,
        productPrice: entry.concept.product.price,
        productMarginPct: entry.concept.product.marginPct,
        spend: conceptStats.spend,
        revenue: conceptStats.revenue,
        conversions: conceptStats.conversions,
        clicks: conceptStats.clicks,
        impressions: conceptStats.impressions,
      });
    });

    const normalizedDecisions = normalizeAllocations(decisions);
    const decisionMap = new Map(normalizedDecisions.map((item) => [item.conceptId, item]));

    await prisma.$transaction([
      ...experiment.conceptLinks.map((entry) => {
        const decision = decisionMap.get(entry.conceptId)!;
        return prisma.experimentConcept.update({
          where: { id: entry.id },
          data: {
            allocationPct: decision.normalizedAllocationPct,
            isEnabled: decision.decision !== Decision.PAUSE,
          },
        });
      }),
      ...normalizedDecisions.map((decision) =>
        prisma.optimizationLog.create({
          data: {
            workspaceId: auth.workspace.id,
            experimentId: experiment.id,
            conceptId: decision.conceptId,
            decision: decision.decision,
            rationale: decision.rationale,
          },
        }),
      ),
      prisma.experiment.update({
        where: { id: experiment.id },
        data: {
          status: normalizedDecisions.every((item) => item.decision === Decision.PAUSE)
            ? ExperimentStatus.PAUSED
            : ExperimentStatus.RUNNING,
        },
      }),
    ]);

    optimizationResults.push({
      experimentId: experiment.id,
      experimentName: experiment.name,
      decisions: normalizedDecisions,
    });
  }

  return Response.json({
    ok: true,
    optimizedExperimentCount: optimizationResults.length,
    results: optimizationResults,
  });
}
