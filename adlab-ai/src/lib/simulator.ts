import { AdConcept, Experiment, ExperimentConcept, Product } from "@/generated/prisma/client";

type SimulateInput = {
  experiment: Experiment;
  concepts: Array<
    ExperimentConcept & {
      concept: AdConcept & {
        product: Product;
      };
    }
  >;
};

type SimulatedMetric = {
  conceptId: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
};

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function simulateMetricsForExperiment({ experiment, concepts }: SimulateInput) {
  const enabledConcepts = concepts.filter((entry) => entry.isEnabled);
  if (enabledConcepts.length === 0) {
    return [];
  }

  const normalizedAllocations = enabledConcepts.map((entry) =>
    entry.allocationPct > 0 ? entry.allocationPct : 100 / enabledConcepts.length,
  );
  const allocationTotal = normalizedAllocations.reduce((sum, value) => sum + value, 0);

  return enabledConcepts.map((entry, index) => {
    const conceptStrength = clamp(entry.concept.score / 100, 0.45, 0.98);
    const budgetShare = normalizedAllocations[index] / allocationTotal;
    const budgetForConcept = experiment.dailyBudget * budgetShare;

    const cpc = clamp(randomFloat(0.35, 3.25) * (1.25 - conceptStrength), 0.3, 3.8);
    const clicks = Math.max(1, Math.floor(budgetForConcept / cpc));
    const ctr = clamp(randomFloat(0.007, 0.024) * conceptStrength * 1.4, 0.005, 0.04);
    const impressions = Math.max(clicks, Math.floor(clicks / ctr));
    const cvr = clamp(randomFloat(0.012, 0.08) * conceptStrength, 0.008, 0.1);
    const conversions = Math.max(0, Math.floor(clicks * cvr));
    const spend = Number((clicks * cpc).toFixed(2));
    const revenue = Number((conversions * entry.concept.product.price).toFixed(2));
    const cpa = conversions > 0 ? Number((spend / conversions).toFixed(2)) : spend;
    const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;

    return {
      conceptId: entry.conceptId,
      impressions,
      clicks,
      spend,
      conversions,
      revenue,
      ctr: Number((clicks / Math.max(impressions, 1)).toFixed(4)),
      cpc: Number((spend / Math.max(clicks, 1)).toFixed(2)),
      cpa,
      roas,
    } satisfies SimulatedMetric;
  });
}
