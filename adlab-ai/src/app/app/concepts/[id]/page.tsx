import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConceptDetail } from "./concept-detail";

export default async function ConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const { id } = await params;

  const concept = await prisma.adConcept.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: {
      product: { select: { id: true, name: true, description: true, price: true, marginPct: true } },
      audience: { select: { id: true, name: true, painPoints: true, desires: true, notes: true } },
    },
  });

  if (!concept) redirect("/app");

  const metrics = await prisma.metricSnapshot.aggregate({
    where: { conceptId: id },
    _sum: { spend: true, revenue: true, conversions: true, clicks: true, impressions: true },
  });

  return (
    <main className="min-h-screen bg-zinc-950">
      <ConceptDetail
        concept={{
          ...concept,
          performance: {
            spend: metrics._sum.spend ?? 0,
            revenue: metrics._sum.revenue ?? 0,
            conversions: metrics._sum.conversions ?? 0,
            clicks: metrics._sum.clicks ?? 0,
            impressions: metrics._sum.impressions ?? 0,
            roas: (metrics._sum.spend ?? 0) > 0 ? (metrics._sum.revenue ?? 0) / (metrics._sum.spend ?? 1) : 0,
          },
        }}
      />
    </main>
  );
}
