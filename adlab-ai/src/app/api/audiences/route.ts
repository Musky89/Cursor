import { getAuthContext } from "@/lib/auth";
import { parseJsonBody, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { audienceSchema } from "@/lib/validators";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const audiences = await prisma.audience.findMany({
    where: { workspaceId: auth.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ audiences });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return unauthorizedResponse();
  }

  const parsedBody = await parseJsonBody(request, audienceSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { name, painPoints, desires, notes } = parsedBody.data;

  const audience = await prisma.audience.create({
    data: {
      workspaceId: auth.workspace.id,
      name,
      painPoints,
      desires,
      notes: notes && notes.trim().length > 0 ? notes : null,
    },
  });

  return Response.json({ audience }, { status: 201 });
}
