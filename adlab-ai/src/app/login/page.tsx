import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAuthContext } from "@/lib/auth";

export default async function LoginPage() {
  const auth = await getAuthContext();
  if (auth) redirect("/app");

  return (
    <main className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-cyan-950 via-zinc-900 to-fuchsia-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
            <span className="text-sm font-black text-white">A</span>
          </div>
          <span className="text-lg font-bold text-white">AdLab AI</span>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            AI ad creative that<br />
            <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">actually converts.</span>
          </h2>
          <p className="max-w-md text-zinc-400">
            Generate studio-quality ad copy and images in seconds. Art-directed by GPT. Rendered by Nano Banana. Optimized autonomously.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <div><span className="text-2xl font-bold text-white">9.5</span>/10 image quality</div>
            <div><span className="text-2xl font-bold text-white">3</span> channels</div>
            <div><span className="text-2xl font-bold text-white">&lt;30s</span> per ad</div>
          </div>
        </div>
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} AdLab AI</p>
      </div>

      <div className="flex w-full items-center justify-center bg-zinc-950 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
                <span className="text-sm font-black text-white">A</span>
              </div>
              <span className="text-lg font-bold text-white">AdLab AI</span>
            </Link>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
