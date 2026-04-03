"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Tabs, Badge, PageHeader, EmptyState, useToast } from "@/components/ui";

type BibleData = {
  visualIdentity: { colorPalette?: { hex: string; name: string; usage: string }[]; typography?: { primary: string; secondary: string; rules: string }; photographyStyle?: string; illustrationStyle?: string } | null;
  toneOfVoice: { personality?: string[]; toneDescriptors?: string[]; doExamples?: string[]; dontExamples?: string[]; vocabulary?: string[]; bannedWords?: string[]; channelVariations?: Record<string, string> } | null;
  messaging: { purpose?: string; vision?: string; mission?: string; tagline?: string; valuePropositions?: string[]; pillars?: { name: string; description: string; proofPoints?: string[] }[]; elevatorPitch?: string; boilerplate?: string } | null;
  channelGuidelines: Record<string, { contentTypes?: string; formats?: string; hashtags?: string; postingCadence?: string }> | null;
  competitiveContext: { competitors?: { name: string; positioning: string; strengths: string; weaknesses: string }[]; differentiators?: string[]; categoryConventions?: string[] } | null;
  promptTemplates: Record<string, string> | null;
  version: number;
};

export default function BrandBiblePage() {
  const { id } = useParams<{ id: string }>();
  const [bible, setBible] = useState<BibleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/brand-bible/${id}`);
    const data = await res.json();
    setBible(data.bible);
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function generate() {
    setGenerating(true);
    const res = await fetch(`/api/brand-bible/${id}`, { method: "POST" });
    const data = await res.json();
    if (data.bible) { setBible(data.bible); addToast("Brand Bible generated"); }
    else addToast(data.error ?? "Failed", "error");
    setGenerating(false);
  }

  const tabs = [
    { id: "visual", label: "Visual Identity" },
    { id: "tone", label: "Tone of Voice" },
    { id: "messaging", label: "Messaging" },
    { id: "channels", label: "Channels" },
    { id: "competitive", label: "Competitive" },
    { id: "prompts", label: "Prompt Templates" },
  ];

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href={`/app/brands/${id}`} className="hover:text-white">← Brand Hub</Link>
      </div>

      <PageHeader
        title="Brand Bible"
        description="The living reference document every agent reads before producing work. Version-controlled and queryable."
        actions={
          <Button onClick={() => void generate()} loading={generating}>
            {bible ? `Regenerate (v${bible.version})` : "Generate Brand Bible"}
          </Button>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading...</div>
      ) : !bible ? (
        <EmptyState icon="📖" title="No Brand Bible yet" description="Generate one to establish the brand's rules. Every agent will reference this." action={<Button onClick={() => void generate()} loading={generating}>Generate Brand Bible</Button>} />
      ) : (
        <>
          <div className="mb-6">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === "visual" && bible.visualIdentity && (
            <div className="space-y-4">
              {bible.visualIdentity.colorPalette && (
                <Section title="Color Palette">
                  <div className="flex flex-wrap gap-3">
                    {bible.visualIdentity.colorPalette.map((c, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="mb-2 h-12 w-20 rounded-md border border-zinc-700" style={{ background: c.hex }} />
                        <p className="text-[12px] font-medium">{c.name}</p>
                        <p className="text-[10px] text-zinc-500">{c.hex}</p>
                        <p className="text-[10px] text-zinc-600">{c.usage}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {bible.visualIdentity.typography && (
                <Section title="Typography">
                  <p className="text-[13px] text-zinc-300"><span className="text-zinc-500">Primary:</span> {bible.visualIdentity.typography.primary}</p>
                  <p className="text-[13px] text-zinc-300"><span className="text-zinc-500">Secondary:</span> {bible.visualIdentity.typography.secondary}</p>
                  <p className="mt-2 text-[12px] text-zinc-400">{bible.visualIdentity.typography.rules}</p>
                </Section>
              )}
              {bible.visualIdentity.photographyStyle && <Section title="Photography Style"><p className="text-[13px] text-zinc-300">{bible.visualIdentity.photographyStyle}</p></Section>}
            </div>
          )}

          {activeTab === "tone" && bible.toneOfVoice && (
            <div className="space-y-4">
              {bible.toneOfVoice.personality && <Section title="Personality Traits"><div className="flex flex-wrap gap-2">{bible.toneOfVoice.personality.map((t, i) => <Badge key={i}>{t}</Badge>)}</div></Section>}
              {bible.toneOfVoice.doExamples && <Section title="Do ✓"><ul className="space-y-1">{bible.toneOfVoice.doExamples.map((e, i) => <li key={i} className="text-[13px] text-emerald-300">✓ {e}</li>)}</ul></Section>}
              {bible.toneOfVoice.dontExamples && <Section title="Don't ✕"><ul className="space-y-1">{bible.toneOfVoice.dontExamples.map((e, i) => <li key={i} className="text-[13px] text-red-300">✕ {e}</li>)}</ul></Section>}
              {bible.toneOfVoice.vocabulary && <Section title="Vocabulary"><div className="flex flex-wrap gap-1.5">{bible.toneOfVoice.vocabulary.map((w, i) => <span key={i} className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">{w}</span>)}</div></Section>}
              {bible.toneOfVoice.bannedWords && <Section title="Banned Words"><div className="flex flex-wrap gap-1.5">{bible.toneOfVoice.bannedWords.map((w, i) => <span key={i} className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">{w}</span>)}</div></Section>}
            </div>
          )}

          {activeTab === "messaging" && bible.messaging && (
            <div className="space-y-4">
              {bible.messaging.purpose && <Section title="Purpose"><p className="text-[14px] font-medium text-zinc-200">{bible.messaging.purpose}</p></Section>}
              {bible.messaging.tagline && <Section title="Tagline"><p className="text-[18px] font-bold text-cyan-300">"{bible.messaging.tagline}"</p></Section>}
              {bible.messaging.valuePropositions && <Section title="Value Propositions"><ul className="space-y-1">{bible.messaging.valuePropositions.map((v, i) => <li key={i} className="text-[13px] text-zinc-300">• {v}</li>)}</ul></Section>}
              {bible.messaging.pillars && (
                <Section title="Brand Pillars">
                  <div className="grid gap-3 md:grid-cols-2">
                    {bible.messaging.pillars.map((p, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                        <h4 className="text-[14px] font-semibold">{p.name}</h4>
                        <p className="mt-1 text-[12px] text-zinc-400">{p.description}</p>
                        {p.proofPoints && <div className="mt-2">{p.proofPoints.map((pp, j) => <p key={j} className="text-[11px] text-zinc-500">→ {pp}</p>)}</div>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {bible.messaging.elevatorPitch && <Section title="Elevator Pitch"><p className="text-[13px] text-zinc-300">{bible.messaging.elevatorPitch}</p></Section>}
            </div>
          )}

          {activeTab === "channels" && bible.channelGuidelines && (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(bible.channelGuidelines).map(([channel, rules]) => (
                <Section key={channel} title={channel.charAt(0).toUpperCase() + channel.slice(1)}>
                  {Object.entries(rules).map(([key, val]) => (
                    <p key={key} className="text-[12px] text-zinc-400"><span className="text-zinc-500">{key}:</span> {String(val)}</p>
                  ))}
                </Section>
              ))}
            </div>
          )}

          {activeTab === "competitive" && bible.competitiveContext && (
            <div className="space-y-4">
              {bible.competitiveContext.competitors && (
                <Section title="Competitors">
                  <div className="grid gap-3 md:grid-cols-2">
                    {bible.competitiveContext.competitors.map((c, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                        <h4 className="text-[14px] font-semibold">{c.name}</h4>
                        <p className="text-[12px] text-zinc-400">{c.positioning}</p>
                        <p className="mt-1 text-[11px] text-emerald-400/70">+ {c.strengths}</p>
                        <p className="text-[11px] text-red-400/70">- {c.weaknesses}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {bible.competitiveContext.differentiators && <Section title="Our Differentiators"><ul className="space-y-1">{bible.competitiveContext.differentiators.map((d, i) => <li key={i} className="text-[13px] text-cyan-300">★ {d}</li>)}</ul></Section>}
            </div>
          )}

          {activeTab === "prompts" && bible.promptTemplates && (
            <div className="space-y-4">
              {Object.entries(bible.promptTemplates).map(([key, template]) => (
                <Section key={key} title={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}>
                  <pre className="whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-[12px] text-zinc-400">{String(template)}</pre>
                </Section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      {children}
    </div>
  );
}
