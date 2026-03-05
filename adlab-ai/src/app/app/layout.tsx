import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  return (
    <AppShell
      user={{ id: auth.user.id, fullName: auth.user.fullName, email: auth.user.email }}
      workspace={{ id: auth.workspace.id, name: auth.workspace.name }}
    >
      {children}
    </AppShell>
  );
}
