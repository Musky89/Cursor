import { ExperimentStatus } from "@/generated/prisma/client";
import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { simulateMetricsForExperiment } from "@/lib/simulator";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const { id } = await params;

  const experiment = await prisma.experiment.findFirst({
    where: {
      id,
      workspaceId: auth.workspace.id,
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
  });

  if (!experiment) {
    return errorResponse("Experiment not found.", 404);
  }

  if (experiment.status === ExperimentStatus.COMPLETED) {
    return errorResponse("Completed experiments cannot be simulated.", 400);
  }

  const metrics = simulateMetricsForExperiment({
    experiment,
    concepts: experiment.conceptLinks,
  });

  if (metrics.length === 0) {
    return errorResponse("No active concepts available for simulation.", 400);
  }

  const date = startOfToday();

  await prisma.metricSnapshot.createMany({
    data: metrics.map((metric) => ({
      workspaceId: auth.workspace.id,
      experimentId: experiment.id,
      conceptId: metric.conceptId,
      date,
      impressions: metric.impressions,
      clicks: metric.clicks,
      spend: metric.spend,
      conversions: metric.conversions,
      revenue: metric.revenue,
      ctr: metric.ctr,
      cpc: metric.cpc,
      cpa: metric.cpa,
      roas: metric.roas,
    })),
  });

  return Response.json({
    ok: true,
    metrics,
    simulatedDate: date,
  });
}
