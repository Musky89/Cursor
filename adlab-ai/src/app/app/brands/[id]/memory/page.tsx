"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, PageHeader, EmptyState, StatCard, useToast } from "@/components/ui";

type MemoryData = {
  totalGenerated: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number;
  topAngles: { angle: string; count: number }[];
  topChannels: { channel: string; count: number }[];
  recentWork: { id: string; headline: string; score: number; channel: string; angle: string; createdAt: string }[];
  patterns: { insight: string; confidence: string }[];
};

export default function CreativeMemoryPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/visual-memory`);
      const memory = await res.json();

      // Also get concepts for this brand context
      const conceptsRes = await fetch("/api/concepts");
      const conceptsData = await conceptsRes.json();
      const concepts = conceptsData.concepts ?? [];

      const approved = concepts.filter((c: { score: number }) => c.score >= 85).length;
      const rejected = concepts.filter((c: { score: number }) => c.score < 70).length;

      const angleMap: Record<string, number> = {};
      const channelMap: Record<string, number> = {};
      for (const c of concepts) {
        angleMap[c.angle] = (angleMap[c.angle] ?? 0) + 1;
        channelMap[c.channel] = (channelMap[c.channel] ?? 0) + 1;
      }

      setData({
        totalGenerated: concepts.length,
        totalApproved: approved,
        totalRejected: rejected,
        approvalRate: concepts.length > 0 ? Math.round((approved / concepts.length) * 100) : 0,
        topAngles: Object.entries(angleMap).map(([angle, count]) => ({ angle, count: count as number })).sort((a, b) => b.count - a.count).slice(0, 5),
        topChannels: Object.entries(channelMap).map(([channel, count]) => ({ channel, count: count as number })).sort((a, b) => b.count - a.count),
        recentWork: concepts.slice(0, 10).map((c: { id: string; headline: string; score: number; channel: string; angle: string; createdAt: string }) => ({
          id: c.id, headline: c.headline, score: c.score, channel: c.channel, angle: c.angle, createdAt: c.createdAt,
        })),
        patterns: memory.hasMemory ? (memory.memory?.insights ?? []).map((i: string) => ({ insight: i, confidence: "high" })) : [],
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function analyzePatterns() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/agents/visual-memory");
      const memory = await res.json();
      if (memory.hasMemory && data) {
        setData({
          ...data,
          patterns: (memory.memory?.insights ?? []).map((i: string) => ({ insight: i, confidence: "high" })),
        });
        addToast("Pattern analysis complete");
      } else {
        addToast("Need more approved/rejected work for pattern analysis", "info");
      }
    } catch { addToast("Analysis failed", "error"); }
    setAnalyzing(false);
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading creative memory...</div>;

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href={`/app/brands/${id}`} className="hover:text-white">← Brand Hub</Link>
      </div>

      <PageHeader title="Creative Memory" description="Everything this brand has generated — patterns, preferences, and what works." actions={<Button onClick={() => void analyzePatterns()} loading={analyzing} variant="secondary">🧠 Analyze Patterns</Button>} />

      {!data || data.totalGenerated === 0 ? (
        <EmptyState icon="🧠" title="No creative memory yet" description="Generate concepts and images to build the brand's creative memory." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard label="Total Generated" value={String(data.totalGenerated)} icon="📊" />
            <StatCard label="High Score (85+)" value={String(data.totalApproved)} icon="✅" />
            <StatCard label="Low Score (<70)" value={String(data.totalRejected)} icon="❌" />
            <StatCard label="High Score Rate" value={`${data.approvalRate}%`} icon="📈" change={data.approvalRate >= 70 ? "+good" : "-needs work"} />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Most Used Angles</h3>
              {data.topAngles.map((a) => (
                <div key={a.angle} className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] text-zinc-300">{a.angle}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-cyan-500/30" style={{ width: `${Math.min(a.count * 20, 100)}px` }}>
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(a.count * 20, 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-500">{a.count}x</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Channel Distribution</h3>
              {data.topChannels.map((c) => (
                <div key={c.channel} className="mb-2 flex items-center justify-between">
                  <Badge>{c.channel}</Badge>
                  <span className="text-[13px] text-zinc-300">{c.count} concepts</span>
                </div>
              ))}
            </div>
          </div>

          {data.patterns.length > 0 && (
            <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-cyan-400">🧠 Learned Patterns</h3>
              {data.patterns.map((p, i) => (
                <div key={i} className="mb-2 flex items-start gap-2">
                  <span className="text-cyan-400">→</span>
                  <p className="text-[13px] text-zinc-300">{p.insight}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Recent Work</h3>
            <div className="space-y-2">
              {data.recentWork.map((w) => (
                <a key={w.id} href={`/app/concepts/${w.id}`} className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3 transition hover:border-zinc-600">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-300">{w.headline.substring(0, 60)}{w.headline.length > 60 ? "..." : ""}</p>
                    <div className="mt-1 flex gap-2"><Badge>{w.channel}</Badge><Badge variant="default">{w.angle}</Badge></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[16px] font-bold ${w.score >= 85 ? "text-emerald-400" : w.score >= 70 ? "text-amber-400" : "text-red-400"}`}>{w.score}</span>
                    <p className="text-[10px] text-zinc-600">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
