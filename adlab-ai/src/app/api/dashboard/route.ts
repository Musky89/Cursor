import { getAuthContext } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const [totals, conceptCount, experimentCount, snapshots, optimizationLogs] = await Promise.all([
    prisma.metricSnapshot.aggregate({
      where: { workspaceId: auth.workspace.id },
      _sum: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        revenue: true,
      },
    }),
    prisma.adConcept.count({
      where: { workspaceId: auth.workspace.id },
    }),
    prisma.experiment.count({
      where: { workspaceId: auth.workspace.id },
    }),
    prisma.metricSnapshot.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { date: "desc" },
      take: 400,
      include: {
        concept: {
          select: {
            id: true,
            headline: true,
            angle: true,
          },
        },
      },
    }),
    prisma.optimizationLog.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        concept: {
          select: { id: true, headline: true },
        },
        experiment: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const metricTotals = {
    impressions: totals._sum.impressions ?? 0,
    clicks: totals._sum.clicks ?? 0,
    spend: totals._sum.spend ?? 0,
    conversions: totals._sum.conversions ?? 0,
    revenue: totals._sum.revenue ?? 0,
  };

  const roas = metricTotals.spend > 0 ? metricTotals.revenue / metricTotals.spend : 0;
  const ctr = metricTotals.impressions > 0 ? metricTotals.clicks / metricTotals.impressions : 0;
  const cpa = metricTotals.conversions > 0 ? metricTotals.spend / metricTotals.conversions : 0;

  const byConcept = new Map<
    string,
    {
      conceptId: string;
      headline: string;
      angle: string;
      spend: number;
      revenue: number;
      conversions: number;
    }
  >();

  for (const snapshot of snapshots) {
    const existing = byConcept.get(snapshot.conceptId) ?? {
      conceptId: snapshot.conceptId,
      headline: snapshot.concept.headline,
      angle: snapshot.concept.angle,
      spend: 0,
      revenue: 0,
      conversions: 0,
    };
    existing.spend += snapshot.spend;
    existing.revenue += snapshot.revenue;
    existing.conversions += snapshot.conversions;
    byConcept.set(snapshot.conceptId, existing);
  }

  const topConcepts = Array.from(byConcept.values())
    .map((item) => ({
      ...item,
      roas: item.spend > 0 ? Number((item.revenue / item.spend).toFixed(2)) : 0,
      cpa: item.conversions > 0 ? Number((item.spend / item.conversions).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 8);

  const dailyTrendMap = new Map<
    string,
    {
      date: string;
      spend: number;
      revenue: number;
      conversions: number;
    }
  >();

  for (const snapshot of snapshots) {
    const key = snapshot.date.toISOString().slice(0, 10);
    const existing = dailyTrendMap.get(key) ?? {
      date: key,
      spend: 0,
      revenue: 0,
      conversions: 0,
    };
    existing.spend += snapshot.spend;
    existing.revenue += snapshot.revenue;
    existing.conversions += snapshot.conversions;
    dailyTrendMap.set(key, existing);
  }

  const dailyTrend = Array.from(dailyTrendMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map((row) => ({
      ...row,
      roas: row.spend > 0 ? Number((row.revenue / row.spend).toFixed(2)) : 0,
    }));

  return Response.json({
    totals: {
      ...metricTotals,
      roas: Number(roas.toFixed(2)),
      ctr: Number(ctr.toFixed(4)),
      cpa: Number(cpa.toFixed(2)),
    },
    conceptCount,
    experimentCount,
    topConcepts,
    dailyTrend,
    optimizationLogs,
  });
}
