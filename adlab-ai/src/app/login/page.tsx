import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAuthContext } from "@/lib/auth";

export default async function LoginPage() {
  const auth = await getAuthContext();
  if (auth) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <LoginForm />
    </main>
  );
}
