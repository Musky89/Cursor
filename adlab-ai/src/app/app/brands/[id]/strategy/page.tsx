"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, useToast } from "@/components/ui";

type Territory = { name: string; positioning: string; essence: string; visualDirection: string; messagingPillars: string[]; risks: string };
type Strategy = { positioning: string; targetAudience: string; brandValues: string; toneOfVoice: string; competitiveEdge: string; territories: string; lockedTerritory: string | null; status: string };

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [brandName, setBrandName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [locking, setLocking] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/brands/${id}/strategy`);
    const data = await res.json();
    setBrandName(data.brand?.name ?? "");
    if (data.strategy) {
      setStrategy(data.strategy);
      try { setTerritories(JSON.parse(data.strategy.territories ?? "[]")); } catch { setTerritories([]); }
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function generate() {
    setGenerating(true);
    const res = await fetch(`/api/brands/${id}/strategy`, { method: "POST" });
    const data = await res.json();
    if (data.strategy) {
      setStrategy(data.strategy);
      try { setTerritories(JSON.parse(data.strategy.territories ?? "[]")); } catch { setTerritories([]); }
      addToast("Strategy generated — review territories below");
    }
    setGenerating(false);
  }

  async function lockTerritory(name: string) {
    setLocking(true);
    await fetch(`/api/brands/${id}/strategy`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockedTerritory: name, status: "locked" }),
    });
    await load();
    setLocking(false);
    addToast(`Locked territory: ${name}`);
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href="/app/clients" className="hover:text-white">Clients</Link>
        <span>/</span>
        <Link href={`/app/brands/${id}`} className="hover:text-white">{brandName}</Link>
        <span>/</span>
        <span className="text-zinc-300">Strategy</span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Strategy</h1>
          <p className="mt-1 text-[13px] text-zinc-500">Generate strategic territories, evaluate options, and lock a direction that gates all downstream creative.</p>
        </div>
        <Button onClick={() => void generate()} loading={generating} disabled={generating}>
          {strategy ? "Regenerate Strategy" : "Generate Strategy"}
        </Button>
      </div>

      {strategy && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-[12px] font-medium uppercase tracking-widest text-zinc-500">Positioning</h3>
            <p className="mt-2 text-[14px] text-zinc-200">{strategy.positioning}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-[12px] font-medium uppercase tracking-widest text-zinc-500">Target Audience</h3>
            <p className="mt-2 text-[14px] text-zinc-200">{strategy.targetAudience}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-[12px] font-medium uppercase tracking-widest text-zinc-500">Tone of Voice</h3>
            <p className="mt-2 text-[14px] text-zinc-200">{strategy.toneOfVoice}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-[12px] font-medium uppercase tracking-widest text-zinc-500">Competitive Edge</h3>
            <p className="mt-2 text-[14px] text-zinc-200">{strategy.competitiveEdge}</p>
          </div>
        </div>
      )}

      {territories.length > 0 && (
        <>
          <h2 className="mb-4 text-[16px] font-semibold">Strategic Territories</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {territories.map((t) => {
              const isLocked = strategy?.lockedTerritory === t.name;
              return (
                <div key={t.name} className={`rounded-xl border p-5 transition ${isLocked ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"}`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-[16px] font-bold">{t.name}</h3>
                    {isLocked ? <Badge variant="success">Locked ✓</Badge> : (
                      <Button size="sm" variant="secondary" onClick={() => void lockTerritory(t.name)} disabled={locking}>Lock this</Button>
                    )}
                  </div>
                  <p className="mt-2 text-[14px] font-medium text-cyan-300">{t.essence}</p>
                  <p className="mt-2 text-[13px] text-zinc-400">{t.positioning}</p>
                  <div className="mt-3">
                    <p className="text-[11px] font-medium uppercase text-zinc-600">Messaging Pillars</p>
                    <ul className="mt-1 space-y-1">
                      {t.messagingPillars.map((m, i) => <li key={i} className="text-[12px] text-zinc-400">• {m}</li>)}
                    </ul>
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-600">Visual: {t.visualDirection}</p>
                  <p className="mt-1 text-[11px] text-amber-500/70">⚠ Risk: {t.risks}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
