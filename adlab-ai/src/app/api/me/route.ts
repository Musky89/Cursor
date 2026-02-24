import { getAuthContext } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/http";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  return Response.json({
    user: {
      id: auth.user.id,
      fullName: auth.user.fullName,
      email: auth.user.email,
    },
    workspace: {
      id: auth.workspace.id,
      name: auth.workspace.name,
    },
  });
}
