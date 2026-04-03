import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { reviewTask } from "@/lib/orchestration/engine";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();
  const { taskId } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide action (approve/reject).", 400);

  try {
    const result = await reviewTask(taskId, parsed.data.action, parsed.data.note);
    return Response.json({ result });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Review failed.", 500);
  }
}
