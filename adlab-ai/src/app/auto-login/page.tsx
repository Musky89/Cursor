import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, getSessionUserId } from "@/lib/auth";

export default async function AutoLoginPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/app");

  const email = "demo@adlab.ai";
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
  redirect("/app");
}
