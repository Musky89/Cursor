import { redirect } from "next/navigation";
import { AdLabApp } from "@/components/adlab-app";
import { getAuthContext } from "@/lib/auth";

export default async function AppPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  return (
    <AdLabApp
      initialUser={{
        id: auth.user.id,
        fullName: auth.user.fullName,
        email: auth.user.email,
      }}
      initialWorkspace={{
        id: auth.workspace.id,
        name: auth.workspace.name,
      }}
    />
  );
}
