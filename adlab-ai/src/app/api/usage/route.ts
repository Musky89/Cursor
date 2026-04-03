import { getAuthContext } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/http";
import { getUsageStats } from "@/lib/usage-limits";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const stats = await getUsageStats(auth.workspace.id);
  return Response.json(stats);
}
