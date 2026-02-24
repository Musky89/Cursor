import { prisma } from "@/lib/prisma";

export async function ensureDemoData(workspaceId: string) {
  const [productCount, audienceCount] = await Promise.all([
    prisma.product.count({ where: { workspaceId } }),
    prisma.audience.count({ where: { workspaceId } }),
  ]);

  if (productCount > 0 || audienceCount > 0) {
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        workspaceId,
        name: "RevenuePilot",
        description:
          "AI-powered campaign orchestration platform that automates creative testing and budget distribution.",
        price: 299,
        marginPct: 78,
        landingUrl: "https://example.com/revenuepilot",
      },
      {
        workspaceId,
        name: "CreatorLift Studio",
        description:
          "UGC production workflow that turns product benefits into short-form conversion assets at scale.",
        price: 149,
        marginPct: 65,
        landingUrl: "https://example.com/creatorlift",
      },
    ],
  });

  await prisma.audience.createMany({
    data: [
      {
        workspaceId,
        name: "DTC Operators",
        painPoints: "Volatile CAC, low creative hit rate, ad fatigue, uncertain attribution",
        desires: "Predictable ROAS, faster testing velocity, profitable scale",
        notes: "Teams spending above $20k/month on paid social",
      },
      {
        workspaceId,
        name: "Agency Growth Teams",
        painPoints: "Client churn from inconsistent outcomes, manual reporting, slow iteration cycles",
        desires: "Provable performance wins, automation leverage, retained clients",
        notes: "Performance agencies managing multiple ecommerce accounts",
      },
    ],
  });
}
