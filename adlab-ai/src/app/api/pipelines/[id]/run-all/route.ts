import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { executeNextTask } from "@/lib/orchestration/engine";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const results: { stage: string; status: string; taskId: string }[] = [];
  let maxIterations = 20;

  while (maxIterations > 0) {
    maxIterations--;
    try {
      const result = await executeNextTask(id);
      if (!result) break; // No more tasks ready
      results.push({ stage: result.stage, status: result.status, taskId: result.taskId });
      if (result.status === "awaiting_review") break; // Hit quality gate
    } catch {
      break;
    }
  }

  return Response.json({
    executed: results.length,
    results,
    stoppedAt: results.length > 0 ? results[results.length - 1].stage : "none",
    reason: results.length > 0 && results[results.length - 1].status === "awaiting_review" ? "quality_gate" : "pipeline_complete_or_blocked",
  });
}
