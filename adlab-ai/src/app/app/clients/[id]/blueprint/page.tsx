"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, PageHeader, useToast } from "@/components/ui";

const SERVICE_OPTIONS = ["strategy", "creative_concepting", "copywriting", "social_content", "ad_creative", "brand_identity", "print_production", "video_scripts", "email_marketing", "content_marketing"];
const AGENT_OPTIONS = ["strategist", "creative_director", "copywriter", "designer", "brand_guardian", "producer"];
const TEMPLATE_TYPES = [
  { value: "social-first", label: "Social-First (Fashion, Lifestyle)", description: "40-60 assets/month, visual consistency, product compositing" },
  { value: "performance", label: "Performance (DTC E-commerce)", description: "Heavy A/B testing, creative refresh every 2 weeks" },
  { value: "content-led", label: "Content-Led (B2B SaaS)", description: "Long-form SEO, thought leadership, lead gen" },
  { value: "new-brand-build", label: "New Brand Build", description: "Full strategy, identity, CI, naming, launch" },
  { value: "traditional-media", label: "Traditional Media (Print, OOH)", description: "CMYK, bleed, publication templates" },
  { value: "full-service", label: "Full-Service Retainer", description: "Strategy + creative + content + reporting" },
];

export default function BlueprintPage() {
  const { id } = useParams<{ id: string }>();
  const [clientName, setClientName] = useState("");
  const [form, setForm] = useState({
    templateType: "full-service",
    activeServices: [] as string[],
    agentsAssigned: ["strategist", "creative_director", "copywriter", "designer", "brand_guardian"] as string[],
    monthlyAssetTarget: 30,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}/brands`);
    const data = await res.json();
    setClientName(data.client?.name ?? "");

    const bpRes = await fetch("/api/service-blueprints");
    const bpData = await bpRes.json();
    const existing = bpData.blueprints?.find((b: { client: { id: string } }) => b.client.id === id);
    if (existing) {
      setForm({
        templateType: existing.templateType,
        activeServices: existing.activeServices,
        agentsAssigned: existing.agentsAssigned,
        monthlyAssetTarget: existing.monthlyAssetTarget,
      });
      setSaved(true);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  function toggleService(s: string) {
    setForm((prev) => ({
      ...prev,
      activeServices: prev.activeServices.includes(s) ? prev.activeServices.filter((x) => x !== s) : [...prev.activeServices, s],
    }));
  }

  function toggleAgent(a: string) {
    setForm((prev) => ({
      ...prev,
      agentsAssigned: prev.agentsAssigned.includes(a) ? prev.agentsAssigned.filter((x) => x !== a) : [...prev.agentsAssigned, a],
    }));
  }

  async function save() {
    setLoading(true);
    await fetch("/api/service-blueprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, ...form }),
    });
    setSaved(true);
    setLoading(false);
    addToast("Service Blueprint saved");
  }

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href="/app/clients" className="hover:text-white">Clients</Link>
        <span>/</span>
        <Link href={`/app/clients/${id}`} className="hover:text-white">{clientName}</Link>
        <span>/</span>
        <span className="text-zinc-300">Service Blueprint</span>
      </div>

      <PageHeader title="Service Blueprint" description="Configure what the platform does for this client — services, cadence, quality standards, and team composition." />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Template Type */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Client Template</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {TEMPLATE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm({ ...form, templateType: t.value })}
                className={`rounded-lg border p-3 text-left transition ${form.templateType === t.value ? "border-cyan-500/50 bg-cyan-500/10" : "border-zinc-800 hover:border-zinc-600"}`}
              >
                <p className="text-[13px] font-medium">{t.label}</p>
                <p className="text-[11px] text-zinc-500">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Services */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Active Services</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleService(s)} className={`rounded-lg px-3 py-1.5 text-[12px] transition ${form.activeServices.includes(s) ? "bg-cyan-500 text-zinc-950 font-medium" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Agents Assigned</h3>
          <div className="flex flex-wrap gap-2">
            {AGENT_OPTIONS.map((a) => (
              <button key={a} onClick={() => toggleAgent(a)} className={`rounded-lg px-3 py-1.5 text-[12px] transition ${form.agentsAssigned.includes(a) ? "bg-fuchsia-500 text-white font-medium" : "border border-zinc-700 text-zinc-400 hover:text-white"}`}>
                {a.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Target */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Monthly Asset Target</h3>
          <div className="flex items-center gap-4">
            <input type="range" min={5} max={200} value={form.monthlyAssetTarget} onChange={(e) => setForm({ ...form, monthlyAssetTarget: parseInt(e.target.value) })} className="flex-1" />
            <span className="text-[18px] font-bold text-cyan-300">{form.monthlyAssetTarget}</span>
            <span className="text-[12px] text-zinc-500">assets/month</span>
          </div>
        </div>

        <Button onClick={() => void save()} loading={loading} size="lg" className="w-full">
          {saved ? "Update Blueprint" : "Save Blueprint"}
        </Button>
      </div>
    </div>
  );
}
