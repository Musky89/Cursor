"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Post = { id: string; scheduledAt: string; caption: string; hashtags: string | null; channel: string; format: string; imageUrl: string | null; status: string };
type Campaign = { id: string; name: string; description: string | null; status: string; channel: string | null; startDate: string | null; endDate: string | null };

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ scheduledAt: "", caption: "", hashtags: "", channel: "META", format: "1:1" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [campRes, postRes] = await Promise.all([
      fetch("/api/campaigns"),
      fetch(`/api/campaigns/${id}/posts`),
    ]);
    const campData = await campRes.json();
    const postData = await postRes.json();
    setCampaign(campData.campaigns?.find((c: Campaign) => c.id === id) ?? null);
    setPosts(postData.posts ?? []);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function addPost() {
    setLoading(true);
    await fetch(`/api/campaigns/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm({ scheduledAt: "", caption: "", hashtags: "", channel: "META", format: "1:1" });
    await load();
    setLoading(false);
  }

  if (!campaign) return <div className="p-6 text-zinc-500">Loading...</div>;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/app/campaigns" className="text-sm text-zinc-500 hover:text-white">← Campaigns</Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-300">{campaign.name}</span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          {campaign.description && <p className="mt-1 text-[13px] text-zinc-500">{campaign.description}</p>}
          <div className="mt-2 flex gap-3 text-[12px] text-zinc-500">
            <span className={`rounded-full px-2 py-0.5 font-medium ${campaign.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-cyan-500/20 text-cyan-300"}`}>{campaign.status}</span>
            {campaign.channel && <span>{campaign.channel}</span>}
            {campaign.startDate && <span>{new Date(campaign.startDate).toLocaleDateString()} — {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "Ongoing"}</span>}
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-zinc-950">
          + Add Post
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Schedule a Post</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input type="datetime-local" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            <div className="flex gap-2">
              <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="META">META</option><option value="TIKTOK">TIKTOK</option><option value="GOOGLE">GOOGLE</option>
              </select>
              <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                <option value="1:1">1:1 Feed</option><option value="4:5">4:5 Portrait</option><option value="9:16">9:16 Stories</option><option value="16:9">16:9 Landscape</option>
              </select>
            </div>
            <textarea rows={3} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm md:col-span-2" placeholder="Caption..." value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Hashtags (space-separated)" value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} />
            <button onClick={() => void addPost()} disabled={loading || !form.caption || !form.scheduledAt} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
              {loading ? "Adding..." : "Schedule Post"}
            </button>
          </div>
        </div>
      )}

      {/* Calendar-style week view */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="mb-4 text-[14px] font-semibold">Content Calendar</h3>
        {posts.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-zinc-600">No posts scheduled yet. Click &quot;+ Add Post&quot; to start planning.</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => <div key={d} className="text-center text-[11px] font-medium text-zinc-600">{d}</div>)}
            {posts.map((p) => {
              const date = new Date(p.scheduledAt);
              return (
                <div key={p.id} className="rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-2" style={{ gridColumn: date.getDay() === 0 ? 7 : date.getDay() }}>
                  <p className="text-[10px] text-zinc-600">{date.toLocaleDateString()}</p>
                  <p className="text-[10px] font-medium text-zinc-500">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{p.caption.substring(0, 60)}...</p>
                  <div className="mt-1 flex gap-1">
                    <span className="rounded bg-zinc-800 px-1 py-0.5 text-[9px] text-zinc-500">{p.channel}</span>
                    <span className="rounded bg-zinc-800 px-1 py-0.5 text-[9px] text-zinc-500">{p.format}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post list */}
      {posts.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-[14px] font-semibold">All Posts ({posts.length})</h3>
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[13px] text-zinc-300">{p.caption}</p>
                  {p.hashtags && <p className="mt-1 text-[11px] text-cyan-500/70">{p.hashtags}</p>}
                </div>
                <div className="ml-4 text-right">
                  <p className="text-[11px] text-zinc-500">{new Date(p.scheduledAt).toLocaleString()}</p>
                  <div className="mt-1 flex gap-1 justify-end">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{p.channel}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{p.format}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${p.status === "posted" ? "bg-emerald-500/20 text-emerald-300" : "bg-cyan-500/20 text-cyan-300"}`}>{p.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
