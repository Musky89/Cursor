"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, PageHeader, useToast } from "@/components/ui";

type Scene = { sceneNumber: number; duration: string; shotType: string; cameraMovement: string; description: string; dialogue: string | null; onScreenText: string | null; audio: string; talent: string; location: string; lighting: string; directorNotes: string };
type ScriptData = { title: string; duration: string; style: string; concept: string; scenes: Scene[]; shotList: { shot: string; type: string; description: string; lens: string; notes: string }[]; productionNotes: Record<string, string> };

export default function ScriptShootPage() {
  const { id } = useParams<{ id: string }>();
  const [brief, setBrief] = useState("");
  const [duration, setDuration] = useState("30s");
  const [style, setStyle] = useState("lifestyle");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<ScriptData | null>(null);
  const { addToast } = useToast();

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/brands/${id}/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, duration, style }),
      });
      const data = await res.json();
      if (data.scenes) { setScript(data); addToast("Script generated"); }
      else addToast(data.error ?? "Failed", "error");
    } catch { addToast("Failed", "error"); }
    setGenerating(false);
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href={`/app/brands/${id}`} className="hover:text-white">← Brand Hub</Link>
      </div>

      <PageHeader title="🎬 Script & Shoot" description="Generate a complete video production package from a brief — script, shot list, and director's notes." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <textarea rows={5} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500" placeholder="Describe the video — e.g. 'A warm, feel-good TikTok showing a mom making dinner with Nola mayo while her kids help in the kitchen'" value={brief} onChange={(e) => setBrief(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="15s">15 seconds</option><option value="30s">30 seconds</option><option value="60s">60 seconds</option><option value="90s">90 seconds</option><option value="long-form">Long-form</option>
            </select>
            <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="testimonial">Testimonial</option><option value="product-demo">Product Demo</option><option value="lifestyle">Lifestyle</option><option value="tutorial">Tutorial</option><option value="storytelling">Storytelling</option><option value="ugc-style">UGC Style</option>
            </select>
          </div>

          <Button onClick={() => void generate()} disabled={generating || brief.length < 10} loading={generating} size="lg" className="w-full">Generate Production Package</Button>
        </div>

        <div className="lg:col-span-2">
          {script && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <h2 className="text-[18px] font-bold">{script.title}</h2>
                <p className="mt-1 text-[14px] text-cyan-300">{script.concept}</p>
                <div className="mt-2 flex gap-2"><Badge>{script.duration}</Badge><Badge variant="info">{script.style}</Badge></div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h3 className="mb-4 text-[14px] font-semibold">Scenes</h3>
                <div className="space-y-4">
                  {script.scenes.map((s) => (
                    <div key={s.sceneNumber} className="rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[12px] font-bold">{s.sceneNumber}</span>
                          <Badge>{s.duration}</Badge>
                          <Badge variant="default">{s.shotType}</Badge>
                          <Badge variant="default">{s.cameraMovement}</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-[13px] text-zinc-300">{s.description}</p>
                      {s.dialogue && <p className="mt-2 text-[13px] text-amber-300">🎤 &ldquo;{s.dialogue}&rdquo;</p>}
                      {s.onScreenText && <p className="mt-1 text-[12px] text-cyan-300">📝 {s.onScreenText}</p>}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
                        <span>🎵 {s.audio}</span>
                        <span>💡 {s.lighting}</span>
                        <span>📍 {s.location}</span>
                        <span>👤 {s.talent}</span>
                      </div>
                      {s.directorNotes && <p className="mt-2 text-[11px] text-fuchsia-300">🎬 Director: {s.directorNotes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {script.shotList && script.shotList.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h3 className="mb-3 text-[14px] font-semibold">Shot List</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead><tr className="border-b border-zinc-800 text-zinc-500"><th className="p-2 text-left">Shot</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Description</th><th className="p-2 text-left">Lens</th><th className="p-2 text-left">Notes</th></tr></thead>
                      <tbody>{script.shotList.map((s) => (
                        <tr key={s.shot} className="border-b border-zinc-800/50 text-zinc-300"><td className="p-2 font-medium">{s.shot}</td><td className="p-2">{s.type}</td><td className="p-2">{s.description}</td><td className="p-2">{s.lens}</td><td className="p-2 text-zinc-500">{s.notes}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {script.productionNotes && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                  <h3 className="mb-3 text-[14px] font-semibold">Production Notes</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(script.productionNotes).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-[11px] font-medium uppercase text-zinc-600">{key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-[13px] text-zinc-300">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
