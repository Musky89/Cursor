"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, useToast } from "@/components/ui";

export default function QuickCreatePage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("1:1");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ caption: string; hashtags: string; imageUrl: string | null } | null>(null);
  const { addToast } = useToast();

  async function create() {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch(`/api/brands/${id}/quick-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform, format }),
      });
      const data = await res.json();
      if (data.asset) {
        setResult(data.asset);
        addToast("Asset created!");
      } else {
        addToast(data.error ?? "Failed", "error");
      }
    } catch { addToast("Failed", "error"); }
    finally { setGenerating(false); }
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href={`/app/brands/${id}`} className="hover:text-white">← Brand Hub</Link>
      </div>

      <h1 className="text-2xl font-bold">⚡ Quick Create</h1>
      <p className="mt-1 text-[13px] text-zinc-500">One prompt. One asset. Under 60 seconds.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <textarea
            rows={4}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-cyan-500"
            placeholder="Describe what you want — e.g. 'A winter comfort food post featuring loaded baked potatoes with Nola mayo, warm cozy kitchen setting'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex gap-3">
            <select className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
            </select>
            <select className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="1:1">1:1 Square</option>
              <option value="4:5">4:5 Portrait</option>
              <option value="9:16">9:16 Stories</option>
              <option value="16:9">16:9 Landscape</option>
            </select>
          </div>

          <Button onClick={() => void create()} disabled={generating || prompt.length < 5} loading={generating} size="lg" className="w-full">
            {generating ? "Generating (30-60s)..." : "⚡ Create Now"}
          </Button>
        </div>

        <div>
          {generating && (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
              <p className="mt-3 text-[13px] text-zinc-500">AI is art-directing and rendering...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {result.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-zinc-700">
                  <img src={result.imageUrl} alt="Generated" className="w-full" />
                </div>
              )}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-[11px] font-medium uppercase text-zinc-600">Caption</p>
                <p className="mt-1 text-[13px] text-zinc-300">{result.caption}</p>
              </div>
              {result.hashtags && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-[11px] font-medium uppercase text-zinc-600">Hashtags</p>
                  <p className="mt-1 text-[12px] text-cyan-400/70">{result.hashtags}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
