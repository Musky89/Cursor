"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type BrandData = { id: string; name: string; description: string | null; industry: string | null; website: string | null; client: { id: string; name: string }; strategy: { status: string; positioning: string | null; toneOfVoice: string | null } | null };

export default function BrandHubPage() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<BrandData | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/brands/${id}/strategy`);
    const data = await res.json();
    setBrand(data.brand);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (!brand) return <div className="p-6 text-zinc-500">Loading...</div>;

  const tools = [
    { href: `/app/brands/${id}/bible`, icon: "📖", name: "Brand Bible", description: "The living reference document every agent reads — visual identity, tone, messaging" },
    { href: `/app/brands/${id}/memory`, icon: "🧠", name: "Creative Memory", description: "All generated work, approval patterns, and what's working for this brand" },
    { href: `/app/brands/${id}/strategy`, icon: "🎯", name: "Brand Strategy", description: "Define positioning, territories, and strategic direction", status: brand.strategy?.status === "locked" ? "Locked" : "Draft" },
    { href: `/app/brands/${id}/quick-create`, icon: "⚡", name: "Quick Create", description: "Generate an ad asset in under 60 seconds" },
    { href: `/app/brands/${id}/logo`, icon: "✏️", name: "Logo Studio", description: "Design and iterate on brand logos with AI" },
    { href: `/app/brands/${id}/content`, icon: "📦", name: "Content Studio", description: "Carousels, blogs, emails, display ads, website copy, mood boards, naming, repurpose" },
    { href: `/app/brands/${id}/script`, icon: "🎬", name: "Script & Shoot", description: "Generate video production packages — scripts, shot lists, director notes" },
    { href: "/app", icon: "🎨", name: "Full Creative Pipeline", description: "Concepts, art direction, image generation, campaigns" },
    { href: "/app/campaigns", icon: "📅", name: "Campaigns", description: "Plan and schedule content" },
    { href: "/app/assets", icon: "📦", name: "Brand Assets", description: "Upload product photos, logos, references" },
  ];

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href="/app/clients" className="hover:text-white">Clients</Link>
        <span>/</span>
        <Link href={`/app/clients/${brand.client.id}`} className="hover:text-white">{brand.client.name}</Link>
        <span>/</span>
        <span className="text-zinc-300">{brand.name}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{brand.name}</h1>
        {brand.description && <p className="mt-1 text-[14px] text-zinc-400">{brand.description}</p>}
        {brand.strategy?.positioning && (
          <p className="mt-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[13px] text-cyan-300">
            🎯 {brand.strategy.positioning}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <a key={t.href} href={t.href} className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/60">
            <div className="flex items-start justify-between">
              <span className="text-2xl">{t.icon}</span>
              {t.status && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.status === "Locked" ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>{t.status}</span>
              )}
            </div>
            <h3 className="mt-3 text-[15px] font-semibold group-hover:text-white">{t.name}</h3>
            <p className="mt-1 text-[12px] text-zinc-500">{t.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
