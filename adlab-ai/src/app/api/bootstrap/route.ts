import { getAuthContext } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/http";
import { ensureDemoData } from "@/lib/seed";

export async function POST() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  await ensureDemoData(auth.workspace.id);
  return Response.json({ ok: true });
}
