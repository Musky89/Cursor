"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, useToast } from "@/components/ui";

type LogoResult = { id: string; version: number; style: string; imageUrl: string | null };

export default function LogoStudioPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [colorScheme, setColorScheme] = useState("");
  const [feedback, setFeedback] = useState("");
  const [generating, setGenerating] = useState(false);
  const [logos, setLogos] = useState<LogoResult[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<LogoResult | null>(null);
  const { addToast } = useToast();

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/brands/${id}/logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          colorScheme: colorScheme || undefined,
          feedback: feedback || undefined,
          iterateFromId: selectedLogo?.id,
        }),
      });
      const data = await res.json();
      if (data.logo) {
        setLogos((prev) => [data.logo, ...prev]);
        setSelectedLogo(data.logo);
        addToast(`Logo v${data.logo.version} generated`);
        setFeedback("");
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

      <h1 className="text-2xl font-bold">✏️ Logo Studio</h1>
      <p className="mt-1 text-[13px] text-zinc-500">Design brand logos through conversation. Describe, generate, iterate.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="space-y-4 lg:col-span-2">
          <textarea
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-cyan-500"
            placeholder="Describe the logo — e.g. 'A bold, modern wordmark with an abstract flame icon. Should feel energetic and youth-oriented.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <select className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
              <option value="vintage">Vintage</option>
              <option value="modern">Modern</option>
              <option value="playful">Playful</option>
              <option value="luxury">Luxury</option>
            </select>
            <input className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Colors (e.g. red, black, gold)" value={colorScheme} onChange={(e) => setColorScheme(e.target.value)} />
          </div>

          {selectedLogo && (
            <div>
              <p className="text-[11px] font-medium uppercase text-zinc-600">Iteration Feedback</p>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-amber-500"
                placeholder="What to change — e.g. 'Make the icon simpler, increase letter spacing, try without the tagline'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          )}

          <Button onClick={() => void generate()} disabled={generating || prompt.length < 5} loading={generating} size="lg" className="w-full">
            {selectedLogo ? `Iterate (v${(selectedLogo.version ?? 0) + 1})` : "Generate Logo"}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          {generating && !selectedLogo && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
              <p className="mt-3 text-[13px] text-zinc-500">Designing your logo...</p>
            </div>
          )}

          {selectedLogo?.imageUrl && (
            <div className="animate-fade-in">
              <div className="overflow-hidden rounded-xl border border-zinc-700 bg-white p-8">
                <img src={selectedLogo.imageUrl} alt={`Logo v${selectedLogo.version}`} className="mx-auto max-h-80 w-auto" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[12px] text-zinc-500">Version {selectedLogo.version} · {selectedLogo.style}</p>
              </div>
            </div>
          )}

          {logos.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-[12px] font-medium uppercase text-zinc-600">Version History</p>
              <div className="grid grid-cols-4 gap-2">
                {logos.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLogo(l)}
                    className={`overflow-hidden rounded-lg border bg-white p-2 transition ${selectedLogo?.id === l.id ? "border-cyan-500" : "border-zinc-700 hover:border-zinc-500"}`}
                  >
                    {l.imageUrl && <img src={l.imageUrl} alt={`v${l.version}`} className="aspect-square w-full object-contain" />}
                    <p className="mt-1 text-center text-[10px] text-zinc-500">v{l.version}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
