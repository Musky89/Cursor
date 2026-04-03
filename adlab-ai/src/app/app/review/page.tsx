"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Badge, PageHeader, EmptyState, useToast } from "@/components/ui";

type Task = { id: string; stage: string; title: string; status: string; agentType: string; outputArtifact: string | null; reviewNote: string | null; pipelineId: string };
type Pipeline = { id: string; title: string; status: string; currentStage: string; tasks: Task[] };

export default function ReviewQueuePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/pipelines");
    const data = await res.json();
    setPipelines(data.pipelines ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const reviewTasks = pipelines.flatMap((p) =>
    p.tasks.filter((t) => t.status === "awaiting_review").map((t) => ({ ...t, pipelineTitle: p.title, pipelineId: p.id }))
  );

  async function review(pipelineId: string, taskId: string, action: "approve" | "reject", note?: string) {
    await fetch(`/api/pipelines/${pipelineId}/tasks/${taskId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    addToast(`Task ${action}d`);
    await load();
  }

  async function executeNext(pipelineId: string) {
    const res = await fetch(`/api/pipelines/${pipelineId}/execute`, { method: "POST" });
    const data = await res.json();
    if (data.result) addToast(`${data.result.stage}: ${data.result.status}`);
    else addToast(data.message ?? "Nothing to execute", "info");
    await load();
  }

  return (
    <div className="p-6 text-zinc-100">
      <PageHeader title="Review Queue" description="Tasks awaiting your approval. Review, approve, or send back for revision." />

      {reviewTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-[14px] font-semibold text-amber-300">⚡ {reviewTasks.length} task{reviewTasks.length > 1 ? "s" : ""} awaiting review</h2>
          <div className="space-y-3">
            {reviewTasks.map((t) => {
              const output = t.outputArtifact ? JSON.parse(t.outputArtifact) : null;
              const isExpanded = expandedTask === t.id;
              return (
                <div key={t.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] text-zinc-500">{t.pipelineTitle} → {t.stage}</p>
                      <h3 className="text-[15px] font-semibold">{t.title}</h3>
                      <Badge variant="warning">{t.agentType}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setExpandedTask(isExpanded ? null : t.id)}>
                        {isExpanded ? "Collapse" : "View Output"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => void review(t.pipelineId, t.id, "reject", "Needs revision")}>Reject</Button>
                      <Button size="sm" onClick={() => void review(t.pipelineId, t.id, "approve")}>Approve</Button>
                    </div>
                  </div>
                  {isExpanded && output && (
                    <div className="mt-4 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-[13px] animate-fade-in">
                      {output.summary && <div><p className="text-[11px] font-medium uppercase text-zinc-600">Summary</p><p className="text-zinc-300">{output.summary}</p></div>}
                      {output.deliverable && (
                        <div>
                          <p className="text-[11px] font-medium uppercase text-zinc-600">Deliverable</p>
                          <pre className="mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-[12px] text-zinc-400">{typeof output.deliverable === "string" ? output.deliverable : JSON.stringify(output.deliverable, null, 2)}</pre>
                        </div>
                      )}
                      {output.notes && <div><p className="text-[11px] font-medium uppercase text-zinc-600">Notes for next stage</p><p className="text-zinc-500">{output.notes}</p></div>}
                      <p className="text-[11px] text-zinc-600">Confidence: {output.confidence}/10</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-[14px] font-semibold">All Pipelines</h2>
      {pipelines.length === 0 ? (
        <EmptyState icon="🔄" title="No pipelines yet" description="Create a brief to start a new pipeline." />
      ) : (
        <div className="space-y-4">
          {pipelines.map((p) => (
            <a href={`/app/pipelines/${p.id}`} key={p.id} className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold">{p.title}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={p.status === "active" ? "info" : p.status === "completed" ? "success" : "default"}>{p.status}</Badge>
                    <span className="text-[11px] text-zinc-500">Stage: {p.currentStage}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => void executeNext(p.id)}>▶ Execute Next</Button>
              </div>
              <div className="mt-4 flex gap-1">
                {p.tasks.map((t) => (
                  <div key={t.id} className={`flex-1 rounded-md px-2 py-1.5 text-center text-[10px] ${
                    t.status === "completed" || t.status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                    t.status === "running" ? "bg-cyan-500/20 text-cyan-300" :
                    t.status === "awaiting_review" ? "bg-amber-500/20 text-amber-300" :
                    t.status === "rejected" ? "bg-red-500/20 text-red-300" :
                    "bg-zinc-800/50 text-zinc-600"
                  }`} title={`${t.title} (${t.agentType})`}>
                    {t.stage.replace("_", " ")}
                  </div>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
