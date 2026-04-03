import { prisma } from "./prisma";

const PLAN_LIMITS = {
  free: { conceptsPerMonth: 5, imagesPerMonth: 2, workspaces: 1, channels: ["META"] },
  pro: { conceptsPerMonth: -1, imagesPerMonth: 100, workspaces: 5, channels: ["META", "TIKTOK", "GOOGLE"] },
  agency: { conceptsPerMonth: -1, imagesPerMonth: -1, workspaces: -1, channels: ["META", "TIKTOK", "GOOGLE"] },
} as const;

type Plan = keyof typeof PLAN_LIMITS;

function getUserPlan(): Plan {
  // Until Stripe is integrated, everyone gets pro access
  return "pro";
}

export async function checkConceptLimit(workspaceId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const plan = getUserPlan();
  const limits = PLAN_LIMITS[plan];
  if (limits.conceptsPerMonth === -1) return { allowed: true, used: 0, limit: -1 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await prisma.adConcept.count({
    where: { workspaceId, createdAt: { gte: startOfMonth } },
  });

  return { allowed: count < limits.conceptsPerMonth, used: count, limit: limits.conceptsPerMonth };
}

export async function checkImageLimit(workspaceId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const plan = getUserPlan();
  const limits = PLAN_LIMITS[plan];
  if (limits.imagesPerMonth === -1) return { allowed: true, used: 0, limit: -1 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await prisma.generatedImage.count({
    where: { workspaceId, createdAt: { gte: startOfMonth } },
  });

  return { allowed: count < limits.imagesPerMonth, used: count, limit: limits.imagesPerMonth };
}

export async function getUsageStats(workspaceId: string) {
  const plan = getUserPlan();
  const limits = PLAN_LIMITS[plan];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [conceptCount, imageCount, workspaceCount] = await Promise.all([
    prisma.adConcept.count({ where: { workspaceId, createdAt: { gte: startOfMonth } } }),
    prisma.generatedImage.count({ where: { workspaceId, createdAt: { gte: startOfMonth } } }),
    prisma.workspace.count({ where: { owner: { workspaces: { some: { id: workspaceId } } } } }),
  ]);

  return {
    plan,
    concepts: { used: conceptCount, limit: limits.conceptsPerMonth },
    images: { used: imageCount, limit: limits.imagesPerMonth },
    workspaces: { used: workspaceCount, limit: limits.workspaces },
    channels: limits.channels,
  };
}
