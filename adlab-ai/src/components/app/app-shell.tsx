"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToastProvider } from "@/components/ui";

type Props = {
  user: { id: string; fullName: string; email: string };
  workspace: { id: string; name: string };
  children: React.ReactNode;
};

const navItems = [
  { href: "/app/clients", label: "Clients", icon: "🏢" },
  { href: "/app", label: "Creative Studio", icon: "🎨" },
  { href: "/app/campaigns", label: "Campaigns", icon: "📅" },
  { href: "/app/assets", label: "Brand Assets", icon: "📦" },
  { href: "/app/influencers", label: "Influencers", icon: "👤" },
];

export function AppShell({ user, workspace, children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    window.location.href = "/login";
  }

  return (
    <ToastProvider>
    <div className="flex min-h-screen bg-zinc-950">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-3 top-3 z-50 rounded-lg bg-zinc-900 p-2 text-zinc-400 shadow-lg md:hidden"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-zinc-800/50 bg-zinc-950 transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-fuchsia-500">
            <span className="text-[10px] font-black text-white">A</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-100">AdLab AI</p>
            <p className="truncate text-[11px] text-zinc-500">{workspace.name}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map((item) => {
            const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition ${
                  isActive
                    ? "bg-zinc-800/70 text-white"
                    : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
                }`}
              >
                <span className="text-[15px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/50 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-zinc-400">{user.fullName}</p>
              <p className="truncate text-[11px] text-zinc-600">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded px-2 py-1 text-[11px] text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen md:ml-56">
        {children}
      </main>
    </div>
    </ToastProvider>
  );
}
