import { Channel } from "@/generated/prisma/client";
import { getAuthContext } from "@/lib/auth";
import { errorResponse, parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createExperimentSchema } from "@/lib/validators";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const experiments = await prisma.experiment.findMany({
    where: { workspaceId: auth.workspace.id },
    include: {
      conceptLinks: {
        include: {
          concept: {
            select: {
              id: true,
              headline: true,
              angle: true,
              score: true,
            },
          },
        },
      },
      metricSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const shaped = experiments.map((experiment) => {
    const summary = experiment.metricSnapshots.reduce(
      (acc, snapshot) => {
        acc.impressions += snapshot.impressions;
        acc.clicks += snapshot.clicks;
        acc.spend += snapshot.spend;
        acc.conversions += snapshot.conversions;
        acc.revenue += snapshot.revenue;
        return acc;
      },
      {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      },
    );

    const roas = summary.spend > 0 ? summary.revenue / summary.spend : 0;

    return {
      ...experiment,
      summary: {
        ...summary,
        roas: Number(roas.toFixed(2)),
      },
    };
  });

  return Response.json({ experiments: shaped });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const parsedBody = await parseJsonBody(request, createExperimentSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { name, dailyBudget, conceptIds, channel } = parsedBody.data;

  const concepts = await prisma.adConcept.findMany({
    where: {
      id: { in: conceptIds },
      workspaceId: auth.workspace.id,
      channel: channel as Channel,
    },
    select: { id: true },
  });

  if (concepts.length !== conceptIds.length) {
    return errorResponse("One or more selected concepts were not found for this channel.", 404);
  }

  const evenAllocation = Number((100 / conceptIds.length).toFixed(2));

  const experiment = await prisma.experiment.create({
    data: {
      workspaceId: auth.workspace.id,
      name,
      channel,
      dailyBudget,
      conceptLinks: {
        create: conceptIds.map((conceptId) => ({
          conceptId,
          allocationPct: evenAllocation,
          isEnabled: true,
        })),
      },
    },
    include: {
      conceptLinks: true,
    },
  });

  return Response.json({ experiment }, { status: 201 });
}
