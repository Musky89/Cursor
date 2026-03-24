"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, PageHeader, EmptyState, useToast } from "@/components/ui";

type Profile = {
  id: string;
  name: string;
  description: string;
  personality: string | null;
  createdAt: string;
};

export default function InfluencersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", personality: "" });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/influencers");
    const data = await res.json();
    setProfiles(data.profiles ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    setLoading(true);
    await fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowCreate(false);
    setForm({ name: "", description: "", personality: "" });
    await load();
    setLoading(false);
    addToast("Influencer profile saved");
  }

  async function autoGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/audience-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Create a fun, relatable South African brand influencer character for food/lifestyle content. Include exact physical appearance, fashion style, signature accessories, and personality traits.",
          market: "South Africa",
        }),
      });
      const data = await res.json();
      if (data.persona) {
        setForm({
          name: data.persona.name?.split("(")[0]?.trim() ?? "New Influencer",
          description: data.persona.painPoints ?? "",
          personality: data.persona.desires ?? "",
        });
        setShowCreate(true);
      }
    } catch { /* ignore */ } finally { setGenerating(false); }
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Influencer Profiles</h1>
          <p className="text-[13px] text-zinc-500">Create and save AI character profiles for consistent brand representation across campaigns.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void autoGenerate()} disabled={generating} className="rounded-lg border border-zinc-700 px-4 py-2 text-[13px] text-zinc-400 hover:text-white disabled:opacity-50">
            {generating ? "Generating..." : "🤖 Auto-Generate"}
          </button>
          <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-zinc-950">
            + Create Profile
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Create Influencer Profile</h2>
          <div className="space-y-3">
            <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Character name (e.g. Lerato)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea rows={4} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Physical description — be extremely specific: age, ethnicity, hair (style, color, length), skin tone, facial features (dimples, freckles), build, signature accessories (earrings, glasses), typical clothing style. The AI will use this to maintain consistency across all images." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <textarea rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Personality — tone of voice, catchphrases, energy level, vibe (e.g. 'bubbly, always laughing, uses lots of emojis, speaks in SA slang')" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} />
          </div>
          <button onClick={() => void create()} disabled={loading || form.name.length < 2 || form.description.length < 20} className="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <span className="text-4xl">👤</span>
          <p className="mt-3 text-[15px] font-medium text-zinc-400">No influencer profiles yet</p>
          <p className="text-[13px] text-zinc-600">Create AI characters that stay consistent across your campaign imagery.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-[16px] font-semibold">{p.name}</h3>
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-400">{p.description}</p>
              {p.personality && (
                <p className="mt-2 text-[11px] text-zinc-500"><span className="text-zinc-400">Personality:</span> {p.personality}</p>
              )}
              <p className="mt-3 text-[10px] text-zinc-600">Created {new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
