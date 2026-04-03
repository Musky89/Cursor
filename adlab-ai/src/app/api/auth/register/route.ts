import { prisma } from "@/lib/prisma";
import { ensureDemoData } from "@/lib/seed";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { errorResponse, parseJsonBody } from "@/lib/http";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsedBody = await parseJsonBody(request, registerSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { fullName, email, password } = parsedBody.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return errorResponse("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email: normalizedEmail,
      passwordHash,
      workspaces: {
        create: {
          name: `${fullName.split(" ")[0]}'s Workspace`,
        },
      },
    },
    include: {
      workspaces: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const workspace = user.workspaces[0];
  await ensureDemoData(workspace.id);
  await setSessionCookie(user.id);

  return Response.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
  });
}
