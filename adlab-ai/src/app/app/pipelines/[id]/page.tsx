"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Badge, useToast } from "@/components/ui";

type Task = { id: string; stage: string; title: string; status: string; agentType: string; outputArtifact: string | null; reviewNote: string | null; startedAt: string | null; completedAt: string | null };
type Pipeline = { id: string; title: string; briefText: string; status: string; currentStage: string; createdAt: string; tasks: Task[] };

export default function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/pipelines");
    const data = await res.json();
    setPipeline(data.pipelines?.find((p: Pipeline) => p.id === id) ?? null);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function runAll() {
    setRunning(true);
    const res = await fetch(`/api/pipelines/${id}/run-all`, { method: "POST" });
    const data = await res.json();
    addToast(`Executed ${data.executed} stage${data.executed !== 1 ? "s" : ""}. ${data.reason === "quality_gate" ? "Paused at quality gate." : "Pipeline complete or blocked."}`);
    await load();
    setRunning(false);
  }

  async function review(taskId: string, action: "approve" | "reject") {
    await fetch(`/api/pipelines/${id}/tasks/${taskId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    addToast(`Task ${action}d`);
    await load();
  }

  if (!pipeline) return <div className="p-6 text-zinc-500">Loading...</div>;

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-500/20 text-emerald-300",
    approved: "bg-emerald-500/20 text-emerald-300",
    running: "bg-cyan-500/20 text-cyan-300 animate-pulse",
    awaiting_review: "bg-amber-500/20 text-amber-300",
    pending: "bg-zinc-800/50 text-zinc-500",
    blocked: "bg-zinc-800/30 text-zinc-600",
    rejected: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-zinc-500">
        <Link href="/app/review" className="hover:text-white">← Pipelines</Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pipeline.title}</h1>
          <div className="mt-1 flex gap-2">
            <Badge variant={pipeline.status === "active" ? "info" : "success"}>{pipeline.status}</Badge>
            <span className="text-[12px] text-zinc-500">Stage: {pipeline.currentStage}</span>
            <span className="text-[12px] text-zinc-600">{new Date(pipeline.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Button onClick={() => void runAll()} loading={running} size="lg">▶ Run Pipeline</Button>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-[11px] font-medium uppercase text-zinc-600">Brief</p>
        <p className="mt-1 whitespace-pre-wrap text-[13px] text-zinc-400">{pipeline.briefText}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1">
        {pipeline.tasks.map((t) => (
          <div key={t.id} className={`flex-1 rounded-md px-2 py-2 text-center text-[10px] font-medium ${statusColors[t.status] ?? statusColors.pending}`}>
            {t.stage.replace(/_/g, " ")}
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {pipeline.tasks.map((t) => {
          const output = t.outputArtifact ? JSON.parse(t.outputArtifact) : null;
          const isExpanded = expandedTask === t.id;

          return (
            <div key={t.id} className={`rounded-xl border p-5 transition ${t.status === "awaiting_review" ? "border-amber-500/30 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/40"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold">{t.title}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="default">{t.agentType}</Badge>
                    <Badge variant={t.status === "approved" || t.status === "completed" ? "success" : t.status === "awaiting_review" ? "warning" : t.status === "rejected" ? "danger" : "default"}>{t.status}</Badge>
                    {t.completedAt && <span className="text-[10px] text-zinc-600">{new Date(t.completedAt).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {output && <Button size="sm" variant="ghost" onClick={() => setExpandedTask(isExpanded ? null : t.id)}>{isExpanded ? "Collapse" : "View"}</Button>}
                  {t.status === "awaiting_review" && (
                    <>
                      <Button size="sm" variant="danger" onClick={() => void review(t.id, "reject")}>Reject</Button>
                      <Button size="sm" onClick={() => void review(t.id, "approve")}>Approve</Button>
                    </>
                  )}
                </div>
              </div>

              {t.reviewNote && <p className="mt-2 text-[12px] text-amber-300">📝 {t.reviewNote}</p>}

              {isExpanded && output && (
                <div className="mt-4 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-[13px] animate-fade-in">
                  {output.summary && <div><p className="text-[11px] font-medium uppercase text-zinc-600">Summary</p><p className="text-zinc-300">{output.summary}</p></div>}
                  {output.deliverable && (
                    <div>
                      <p className="text-[11px] font-medium uppercase text-zinc-600">Deliverable</p>
                      <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-[12px] text-zinc-400">{typeof output.deliverable === "string" ? output.deliverable : JSON.stringify(output.deliverable, null, 2)}</pre>
                    </div>
                  )}
                  {output.notes && <div><p className="text-[11px] font-medium uppercase text-zinc-600">Notes for next stage</p><p className="text-zinc-500">{output.notes}</p></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
