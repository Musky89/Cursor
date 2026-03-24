"use client";

import { useCallback, useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  channel: string | null;
  startDate: string | null;
  endDate: string | null;
  _count: { images: number; posts: number };
  posts: { id: string; scheduledAt: string; caption: string; channel: string; status: string }[];
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", channel: "META", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    setLoading(true);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowCreate(false);
    setForm({ name: "", description: "", channel: "META", startDate: "", endDate: "" });
    await load();
    setLoading(false);
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-[13px] text-zinc-500">Plan, schedule, and track your content campaigns.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-zinc-950">
          + New Campaign
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Create Campaign</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="META">META</option>
              <option value="TIKTOK">TIKTOK</option>
              <option value="GOOGLE">GOOGLE</option>
            </select>
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <input type="date" className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <input type="date" className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <button onClick={() => void create()} disabled={loading || form.name.length < 2} className="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <span className="text-4xl">📅</span>
          <p className="mt-3 text-[15px] font-medium text-zinc-400">No campaigns yet</p>
          <p className="text-[13px] text-zinc-600">Create your first campaign to start scheduling content.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <a href={`/app/campaigns/${c.id}`} key={c.id} className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold">{c.name}</h3>
                  {c.description && <p className="mt-1 text-[12px] text-zinc-500">{c.description}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  c.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                  c.status === "completed" ? "bg-zinc-500/20 text-zinc-400" :
                  "bg-cyan-500/20 text-cyan-300"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="mt-4 flex gap-4 text-[12px] text-zinc-500">
                <span>{c._count.images} images</span>
                <span>{c._count.posts} posts</span>
                {c.channel && <span>{c.channel}</span>}
              </div>
              {c.startDate && (
                <p className="mt-2 text-[11px] text-zinc-600">
                  {new Date(c.startDate).toLocaleDateString()} — {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Ongoing"}
                </p>
              )}
              {c.posts.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-medium uppercase text-zinc-600">Upcoming Posts</p>
                  {c.posts.slice(0, 3).map((p) => (
                    <div key={p.id} className="rounded-md border border-zinc-800/50 bg-zinc-950/50 px-2 py-1.5 text-[11px]">
                      <span className="text-zinc-500">{new Date(p.scheduledAt).toLocaleDateString()}</span>
                      <span className="ml-2 text-zinc-400">{p.caption.substring(0, 50)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
