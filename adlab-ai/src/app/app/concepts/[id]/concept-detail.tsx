"use client";

import Link from "next/link";
import { useState } from "react";

type ConceptData = {
  id: string;
  channel: string;
  angle: string;
  hook: string;
  painDesire: string;
  promise: string;
  proof: string;
  offer: string;
  cta: string;
  primaryText: string;
  headline: string;
  script: string;
  imagePrompt: string;
  score: number;
  product: { id: string; name: string; description: string; price: number; marginPct: number };
  audience: { id: string; name: string; painPoints: string; desires: string; notes: string | null };
  performance: { spend: number; revenue: number; conversions: number; clicks: number; impressions: number; roas: number };
};

type Variation = { imageUrl: string; variationNote: string };

export function ConceptDetail({ concept }: { concept: ConceptData }) {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("hot-chicken");
  const [error, setError] = useState<string | null>(null);

  async function generateHero() {
    setIsGeneratingHero(true);
    setError(null);
    try {
      const res = await fetch(`/api/concepts/${concept.id}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandStyle: selectedStyle }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHeroImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsGeneratingHero(false);
    }
  }

  async function generateVariations() {
    setIsGeneratingVariations(true);
    setError(null);
    try {
      const res = await fetch(`/api/concepts/${concept.id}/variations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandStyle: selectedStyle, count: 3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVariations(data.variations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsGeneratingVariations(false);
    }
  }

  const scriptScenes = concept.script.split("\n").filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-zinc-100">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/app" className="text-sm text-zinc-500 transition hover:text-white">← Back</Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400">{concept.channel}</span>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-300">{concept.angle}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Image + Variations */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[12px] font-medium uppercase tracking-widest text-zinc-500">Brand Style</span>
              {["hot-chicken", "pepsi-inspired", "coke-inspired"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStyle(s)}
                  className={`rounded-lg px-3 py-1 text-[12px] font-medium transition ${selectedStyle === s ? "bg-white text-zinc-950" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}
                >
                  {s === "hot-chicken" ? "🍗 Hot Chicken" : s === "pepsi-inspired" ? "⚡ Pepsi" : "🔥 Coke"}
                </button>
              ))}
            </div>

            {heroImage ? (
              <div className="group relative overflow-hidden rounded-xl">
                <img src={heroImage} alt={concept.headline} className="w-full rounded-xl" />
                <button
                  type="button"
                  onClick={generateHero}
                  disabled={isGeneratingHero}
                  className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 text-[12px] text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                >
                  {isGeneratingHero ? "Regenerating…" : "🔄 Regenerate"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={generateHero}
                disabled={isGeneratingHero}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 py-32 text-[14px] text-zinc-500 transition hover:border-cyan-500 hover:text-cyan-300"
              >
                {isGeneratingHero ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" /> Generating hero image…</>
                ) : (
                  "🎨 Generate Hero Image"
                )}
              </button>
            )}
          </div>

          {/* Variations */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Image Variations</h3>
              <button
                type="button"
                onClick={generateVariations}
                disabled={isGeneratingVariations}
                className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {isGeneratingVariations ? "Generating 3 variations…" : "⚡ Generate 3 Variations"}
              </button>
            </div>
            {variations.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {variations.map((v, i) => (
                  <div key={i} className="group cursor-pointer overflow-hidden rounded-lg border border-zinc-800 transition hover:border-zinc-600" onClick={() => setHeroImage(v.imageUrl)}>
                    <img src={v.imageUrl} alt={`Variation ${i + 1}`} className="aspect-square w-full object-cover" />
                    <p className="p-2 text-[11px] text-zinc-500">{v.variationNote.replace("Use a ", "").replace(".", "")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-zinc-600">Click above to generate 3 different compositions of this concept.</p>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-900/30 px-3 py-2 text-[13px] text-red-300">{error}</p>}
        </div>

        {/* Right: Copy + Details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Headline + Score */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">{concept.channel} · {concept.product.name}</p>
                <h1 className="mt-1 text-[18px] font-bold leading-tight">{concept.headline}</h1>
              </div>
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 px-3 py-2 text-center">
                <span className="text-[22px] font-bold">{concept.score}</span>
                <p className="text-[10px] text-zinc-500">SCORE</p>
              </div>
            </div>
          </div>

          {/* Ad Copy Fields */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Ad Copy</h3>
            <CopyField label="Hook" value={concept.hook} />
            <CopyField label="Pain / Desire" value={concept.painDesire} />
            <CopyField label="Promise" value={concept.promise} />
            <CopyField label="Proof" value={concept.proof} />
            <CopyField label="Offer" value={concept.offer} />
            <CopyField label="CTA" value={concept.cta} />
          </div>

          {/* Primary Text */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Primary Ad Text</h3>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-300">{concept.primaryText}</p>
          </div>

          {/* Script Storyboard */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Video Script Storyboard</h3>
            <div className="space-y-3">
              {scriptScenes.map((scene, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-400">{i + 1}</span>
                  <p className="text-[13px] leading-relaxed text-zinc-400">{scene.replace(/^Scene \d+:\s*/i, "")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          {concept.performance.spend > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Performance</h3>
              <div className="grid grid-cols-3 gap-2 text-[12px]">
                <Stat label="Spend" value={`$${concept.performance.spend.toFixed(2)}`} />
                <Stat label="Revenue" value={`$${concept.performance.revenue.toFixed(2)}`} />
                <Stat label="ROAS" value={`${concept.performance.roas.toFixed(2)}x`} />
                <Stat label="Clicks" value={concept.performance.clicks.toLocaleString()} />
                <Stat label="Conversions" value={concept.performance.conversions.toLocaleString()} />
                <Stat label="Impressions" value={concept.performance.impressions.toLocaleString()} />
              </div>
            </div>
          )}

          {/* Audience Context */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Target Audience</h3>
            <p className="text-[14px] font-medium">{concept.audience.name}</p>
            {concept.audience.notes && <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{concept.audience.notes}</p>}
          </div>

          {/* Image Prompt */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Image Prompt (Art Direction)</h3>
            <p className="text-[12px] leading-relaxed text-zinc-500">{concept.imagePrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[11px] font-medium uppercase text-zinc-600">{label}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-300">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800/50 bg-zinc-950/50 px-2 py-1.5">
      <p className="text-[10px] text-zinc-600">{label}</p>
      <p className="text-[13px] font-medium">{value}</p>
    </div>
  );
}
