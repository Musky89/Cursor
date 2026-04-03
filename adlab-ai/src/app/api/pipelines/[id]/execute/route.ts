import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { executeNextTask } from "@/lib/orchestration/engine";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { id } = await params;

  try {
    const result = await executeNextTask(id);
    if (!result) return Response.json({ message: "No tasks ready to execute. Waiting for review or all tasks complete." });
    return Response.json({ result });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Execution failed.", 500);
  }
}
