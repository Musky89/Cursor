"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, PageHeader, useToast } from "@/components/ui";

const CONTENT_TYPES = [
  { id: "carousel", label: "📱 Carousel", description: "Instagram carousel (up to 10 slides)" },
  { id: "blog", label: "📝 Blog Article", description: "SEO-optimized long-form content" },
  { id: "email_sequence", label: "✉️ Email Sequence", description: "Welcome, nurture, offer, urgency" },
  { id: "display_ads", label: "🖼️ Display Ads", description: "IAB sizes: 300x250, 728x90, etc." },
  { id: "website_copy", label: "🌐 Website Copy", description: "Page-by-page with meta tags" },
  { id: "mood_board", label: "🎨 Mood Board", description: "Visual direction with color + typography" },
  { id: "brand_naming", label: "💡 Brand Naming", description: "10 name options with rationale" },
  { id: "repurpose", label: "🔄 Repurpose", description: "Adapt existing content to new format" },
] as { id: string; label: string; description: string }[];

export default function ContentStudioPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState("carousel");
  const [brief, setBrief] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const { addToast } = useToast();

  async function generate() {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          brief,
          sourceContent: selectedType === "repurpose" ? sourceContent : undefined,
        }),
      });
      const data = await res.json();
      if (data.result) { setResult(data.result); addToast(`${selectedType} generated`); }
      else addToast(data.error ?? "Failed", "error");
    } catch { addToast("Failed", "error"); }
    setGenerating(false);
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href={`/app/brands/${id}`} className="hover:text-white">← Brand Hub</Link>
      </div>

      <PageHeader title="Content Studio" description="Generate any content type — carousels, blogs, emails, ads, mood boards, naming, and more." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_TYPES.map((t) => (
              <button key={t.id} onClick={() => { setSelectedType(t.id); setResult(null); }} className={`rounded-lg border p-3 text-left transition ${selectedType === t.id ? "border-cyan-500/50 bg-cyan-500/10" : "border-zinc-800 hover:border-zinc-600"}`}>
                <p className="text-[13px] font-medium">{t.label}</p>
                <p className="text-[10px] text-zinc-500">{t.description}</p>
              </button>
            ))}
          </div>

          <textarea rows={4} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500" placeholder="Describe what you need..." value={brief} onChange={(e) => setBrief(e.target.value)} />

          {selectedType === "repurpose" && (
            <textarea rows={4} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-amber-500" placeholder="Paste the original content to repurpose..." value={sourceContent} onChange={(e) => setSourceContent(e.target.value)} />
          )}

          <Button onClick={() => void generate()} disabled={generating || brief.length < 5} loading={generating} size="lg" className="w-full">
            Generate {CONTENT_TYPES.find((t) => t.id === selectedType)?.label.split(" ").slice(1).join(" ") ?? "Content"}
          </Button>
        </div>

        <div className="lg:col-span-2">
          {generating && (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
              <p className="mt-3 text-[13px] text-zinc-500">Generating {selectedType}...</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="success">{selectedType}</Badge>
              </div>
              <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-[12px] text-zinc-300">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
