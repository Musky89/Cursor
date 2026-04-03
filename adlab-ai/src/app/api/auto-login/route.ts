import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const email = "demo@adlab.ai";

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const passwordHash = await hashPassword("demo2026");
      user = await prisma.user.create({
        data: { email, fullName: "Demo User", passwordHash },
      });
      await prisma.workspace.create({
        data: { name: "Demo Workspace", ownerId: user.id },
      });
    }

    await setSessionCookie(user.id);
    return NextResponse.redirect(new URL("/app", "http://localhost:3000"));
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Auto-login failed" }, { status: 500 });
  }
}
