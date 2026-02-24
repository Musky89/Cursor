import { getAuthContext } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const [concepts, metricRollups] = await Promise.all([
    prisma.adConcept.findMany({
      where: { workspaceId: auth.workspace.id },
      include: {
        product: {
          select: { id: true, name: true, price: true, marginPct: true },
        },
        audience: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.metricSnapshot.groupBy({
      by: ["conceptId"],
      where: { workspaceId: auth.workspace.id },
      _sum: {
        spend: true,
        revenue: true,
        conversions: true,
        clicks: true,
        impressions: true,
      },
    }),
  ]);

  const rollupByConcept = new Map(
    metricRollups.map((item) => [
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

  const enrichedConcepts = concepts.map((concept) => {
    const rollup = rollupByConcept.get(concept.id) ?? {
      spend: 0,
      revenue: 0,
      conversions: 0,
      clicks: 0,
      impressions: 0,
    };

    const roas = rollup.spend > 0 ? rollup.revenue / rollup.spend : 0;
    const ctr = rollup.impressions > 0 ? rollup.clicks / rollup.impressions : 0;
    const cpa = rollup.conversions > 0 ? rollup.spend / rollup.conversions : rollup.spend;

    return {
      ...concept,
      performance: {
        ...rollup,
        roas: Number(roas.toFixed(2)),
        ctr: Number(ctr.toFixed(4)),
        cpa: Number(cpa.toFixed(2)),
      },
    };
  });

  return Response.json({ concepts: enrichedConcepts });
}
