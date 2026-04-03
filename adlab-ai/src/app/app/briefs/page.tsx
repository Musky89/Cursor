"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader, useToast } from "@/components/ui";

export default function BriefCreatorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    objective: "",
    audience: "",
    keyMessage: "",
    channels: "",
    timeline: "",
    budget: "",
    deliverables: "",
    additionalContext: "",
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function createPipeline() {
    setLoading(true);
    const briefText = [
      `TITLE: ${form.title}`,
      `OBJECTIVE: ${form.objective}`,
      `TARGET AUDIENCE: ${form.audience}`,
      `KEY MESSAGE: ${form.keyMessage}`,
      `CHANNELS: ${form.channels}`,
      `TIMELINE: ${form.timeline}`,
      `BUDGET CONTEXT: ${form.budget}`,
      `DELIVERABLES: ${form.deliverables}`,
      form.additionalContext ? `ADDITIONAL CONTEXT: ${form.additionalContext}` : "",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, briefText }),
      });
      const data = await res.json();
      if (data.pipeline) {
        addToast("Pipeline created — 8 tasks queued");
        router.push("/app/review");
      } else {
        addToast(data.error ?? "Failed", "error");
      }
    } catch { addToast("Failed", "error"); }
    finally { setLoading(false); }
  }

  const fields = [
    { key: "title", label: "Project Title", placeholder: "e.g. Nola Winter Campaign 2026", required: true },
    { key: "objective", label: "Objective", placeholder: "What are we trying to achieve?", required: true, multiline: true },
    { key: "audience", label: "Target Audience", placeholder: "Who are we talking to? Demographics, psychographics, behaviors.", required: true, multiline: true },
    { key: "keyMessage", label: "Key Message", placeholder: "The single most important thing to communicate.", required: true },
    { key: "channels", label: "Channels", placeholder: "e.g. Instagram, TikTok, Facebook, Print, OOH" },
    { key: "timeline", label: "Timeline", placeholder: "e.g. Launch June 1, content needed by May 25" },
    { key: "budget", label: "Budget Context", placeholder: "e.g. R50,000 total, R30K media + R20K production" },
    { key: "deliverables", label: "Deliverables", placeholder: "e.g. 10 social posts, 3 hero images, 1 video script, campaign deck" },
    { key: "additionalContext", label: "Additional Context", placeholder: "Anything else the team should know — competitor activity, brand sensitivities, previous campaign learnings", multiline: true },
  ] as { key: keyof typeof form; label: string; placeholder: string; required?: boolean; multiline?: boolean }[];

  return (
    <div className="p-6 text-zinc-100">
      <PageHeader title="Create Brief" description="Define the project. The orchestration engine will decompose this into tasks and route to the right agents." />

      <div className="mx-auto max-w-3xl space-y-4">
        {fields.map((f) => (
          <label key={f.key} className="block space-y-1.5">
            <span className="text-[13px] font-medium text-zinc-400">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </span>
            {f.multiline ? (
              <textarea
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-cyan-500"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-cyan-500"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </label>
        ))}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-[12px] text-zinc-500">Submitting this brief will create an 8-stage pipeline:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Research", "Strategy", "Concepting", "Copy", "Art Direction", "Visual Production", "Quality Review", "Assembly"].map((s) => (
              <span key={s} className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{s}</span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">Each stage runs autonomously and pauses at quality gates for your review.</p>
        </div>

        <Button onClick={() => void createPipeline()} disabled={loading || form.title.length < 3 || form.objective.length < 10} loading={loading} size="lg" className="w-full">
          Launch Pipeline →
        </Button>
      </div>
    </div>
  );
}
