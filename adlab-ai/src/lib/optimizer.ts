import { Decision } from "@/generated/prisma/client";

export type ConceptPerformance = {
  conceptId: string;
  conceptScore: number;
  productPrice: number;
  productMarginPct: number;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
};

export type OptimizerDecision = {
  conceptId: string;
  decision: Decision;
  rationale: string;
  targetAllocationPct: number;
};

function safeDivide(dividend: number, divisor: number) {
  return divisor === 0 ? 0 : dividend / divisor;
}

export function decideConceptAllocation(performance: ConceptPerformance): OptimizerDecision {
  const roas = safeDivide(performance.revenue, performance.spend);
  const cpa = performance.conversions > 0 ? performance.spend / performance.conversions : performance.spend;
  const ctr = safeDivide(performance.clicks, performance.impressions);
  const marginDollars = performance.productPrice * (performance.productMarginPct / 100);
  const targetCpa = marginDollars * 0.85;

  if (performance.spend >= 25 && performance.conversions === 0) {
    return {
      conceptId: performance.conceptId,
      decision: Decision.PAUSE,
      rationale: "No conversions after meaningful spend. Pause and replace the creative angle.",
      targetAllocationPct: 0,
    };
  }

  if (roas >= 2 && cpa <= targetCpa && ctr >= 0.012) {
    return {
      conceptId: performance.conceptId,
      decision: Decision.SCALE,
      rationale:
        "Strong ROAS with efficient CPA and healthy CTR. Increase budget allocation to compound gains.",
      targetAllocationPct: 1,
    };
  }

  if (roas < 1 || cpa > marginDollars * 1.2 || ctr < 0.006) {
    return {
      conceptId: performance.conceptId,
      decision: Decision.PAUSE,
      rationale: "Unit economics are below threshold. Pause to prevent further budget leakage.",
      targetAllocationPct: 0,
    };
  }

  return {
    conceptId: performance.conceptId,
    decision: Decision.HOLD,
    rationale: "Performance is mixed but recoverable. Keep running with controlled allocation.",
    targetAllocationPct: 0.55,
  };
}

export function normalizeAllocations(decisions: OptimizerDecision[]) {
  const weighted = decisions.map((item) => {
    if (item.decision === Decision.PAUSE) {
      return {
        ...item,
        normalizedAllocationPct: 0,
      };
    }

    return {
      ...item,
      normalizedAllocationPct: item.targetAllocationPct,
    };
  });

  const allocationTotal = weighted.reduce((sum, item) => sum + item.normalizedAllocationPct, 0);
  if (allocationTotal <= 0) {
    const pausedOnly = weighted.every((item) => item.decision === Decision.PAUSE);
    if (pausedOnly) {
      return weighted.map((item) => ({
        ...item,
        normalizedAllocationPct: 0,
      }));
    }

    const enabled = weighted.filter((item) => item.decision !== Decision.PAUSE);
    const evenShare = 100 / enabled.length;
    return weighted.map((item) => ({
      ...item,
      normalizedAllocationPct: item.decision === Decision.PAUSE ? 0 : evenShare,
    }));
  }

  return weighted.map((item) => ({
    ...item,
    normalizedAllocationPct:
      item.decision === Decision.PAUSE ? 0 : Number(((item.normalizedAllocationPct / allocationTotal) * 100).toFixed(2)),
  }));
}
