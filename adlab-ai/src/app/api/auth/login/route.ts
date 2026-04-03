import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { errorResponse, parseJsonBody } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000);
  if (!rateCheck.allowed) {
    return errorResponse(`Too many login attempts. Try again in ${Math.ceil(rateCheck.resetIn / 1000)}s.`, 429);
  }

  const parsedBody = await parseJsonBody(request, loginSchema);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const { email, password } = parsedBody.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      workspaces: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return errorResponse("Invalid email or password.", 401);
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return errorResponse("Invalid email or password.", 401);
  }

  await setSessionCookie(user.id);

  return Response.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
    workspace: user.workspaces[0]
      ? {
          id: user.workspaces[0].id,
          name: user.workspaces[0].name,
        }
      : null,
  });
}
