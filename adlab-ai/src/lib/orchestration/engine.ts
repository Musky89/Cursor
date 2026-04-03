import "server-only";

import { prisma } from "@/lib/prisma";
import { runBrandGuardian } from "./brand-guardian";
import OpenAI from "openai";

let _openai: OpenAI | null | undefined;
function getClient() {
  if (_openai === undefined) _openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  return _openai;
}

const PIPELINE_STAGES = [
  { stage: "research", agentType: "strategist", title: "Market Research & Insights", dependsOn: [] },
  { stage: "strategy", agentType: "strategist", title: "Strategic Direction & Territories", dependsOn: ["research"] },
  { stage: "concepting", agentType: "creative_director", title: "Creative Concepting", dependsOn: ["strategy"] },
  { stage: "copy", agentType: "copywriter", title: "Copy & Messaging", dependsOn: ["strategy"] },
  { stage: "art_direction", agentType: "creative_director", title: "Art Direction Briefs", dependsOn: ["concepting"] },
  { stage: "visual_production", agentType: "designer", title: "Visual Production", dependsOn: ["art_direction", "copy"] },
  { stage: "quality_review", agentType: "brand_guardian", title: "Brand Quality Scoring", dependsOn: ["visual_production"] },
  { stage: "assembly", agentType: "designer", title: "Assembly & Export", dependsOn: ["quality_review"] },
] as const;

export async function createPipeline(workspaceId: string, clientId: string | null, brandId: string | null, title: string, briefText: string, useSmartDecomp: boolean = true) {
  const client = getClient();

  let stages = PIPELINE_STAGES as readonly { stage: string; agentType: string; title: string; dependsOn: readonly string[] }[];

  if (useSmartDecomp && client) {
    try {
      const decomposed = await decomposeBrief(client, briefText);
      if (decomposed.length >= 2) stages = decomposed;
    } catch { /* fall back to fixed stages */ }
  }

  const firstStage = stages[0]?.stage ?? "research";
  const pipeline = await prisma.pipeline.create({
    data: { workspaceId, clientId, brandId, title, briefText, status: "active", currentStage: firstStage },
  });

  const taskMap: Record<string, string> = {};

  for (const stage of stages) {
    const task = await prisma.pipelineTask.create({
      data: {
        pipelineId: pipeline.id,
        agentType: stage.agentType,
        stage: stage.stage,
        title: stage.title,
        status: stage.dependsOn.length === 0 ? "pending" : "blocked",
        dependencies: JSON.stringify(stage.dependsOn.map((d: string) => taskMap[d]).filter(Boolean)),
        inputContext: JSON.stringify({ brief: briefText, stage: stage.stage }),
      },
    });
    taskMap[stage.stage] = task.id;
  }

  return pipeline;
}

async function decomposeBrief(client: OpenAI, briefText: string): Promise<{ stage: string; agentType: string; title: string; dependsOn: string[] }[]> {
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a project manager decomposing a creative brief into a task pipeline. Analyze the brief and determine which stages are actually needed.

Available agents: strategist, creative_director, copywriter, designer, brand_guardian
Available stages: research, strategy, concepting, copy, art_direction, visual_production, quality_review, assembly, naming, identity_design, print_production, video_scripting

Rules:
- Every pipeline MUST end with quality_review then assembly
- If the brief mentions strategy/positioning, include research + strategy
- If it's just content creation (social posts, ads), skip research/strategy, start with concepting
- If it mentions video, add video_scripting after concepting
- If it mentions print/newspaper/OOH, add print_production after visual_production
- If it mentions brand identity/naming, add naming + identity_design early
- Each stage must specify its dependencies (which stages must complete before it can start)

Return JSON: { "stages": [{ "stage": string, "agentType": string, "title": string, "dependsOn": string[] }] }`,
      },
      { role: "user", content: briefText },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  return parsed.stages ?? [];
}

export async function executeNextTask(pipelineId: string) {
  const client = getClient();
  if (!client) throw new Error("OPENAI_API_KEY required.");

  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });
  if (!pipeline || pipeline.status !== "active") return null;

  // Find tasks ready to run (pending, all deps completed)
  const completedTaskIds = new Set(pipeline.tasks.filter((t) => t.status === "completed" || t.status === "approved").map((t) => t.id));

  const readyTask = pipeline.tasks.find((t) => {
    if (t.status !== "pending") return false;
    const deps: string[] = JSON.parse(t.dependencies ?? "[]");
    return deps.every((d) => completedTaskIds.has(d));
  });

  if (!readyTask) {
    // Check if there are blocked tasks whose deps are now met
    for (const task of pipeline.tasks) {
      if (task.status === "blocked") {
        const deps: string[] = JSON.parse(task.dependencies ?? "[]");
        if (deps.every((d) => completedTaskIds.has(d))) {
          await prisma.pipelineTask.update({ where: { id: task.id }, data: { status: "pending" } });
        }
      }
    }
    return null;
  }

  // Execute the task
  await prisma.pipelineTask.update({ where: { id: readyTask.id }, data: { status: "running", startedAt: new Date() } });

  // Gather context from completed upstream tasks
  const upstreamOutputs: Record<string, string> = {};
  for (const t of pipeline.tasks) {
    if ((t.status === "completed" || t.status === "approved") && t.outputArtifact) {
      upstreamOutputs[t.stage] = t.outputArtifact;
    }
  }

  // Special handling for Brand Guardian quality review
  if (readyTask.agentType === "brand_guardian") {
    try {
      const scoreCard = await runBrandGuardian(pipeline.brandId, upstreamOutputs);
      const newStatus = scoreCard.autoAction === "reject" ? "pending" : "awaiting_review";
      await prisma.pipelineTask.update({
        where: { id: readyTask.id },
        data: {
          status: newStatus,
          outputArtifact: JSON.stringify({
            summary: `Quality Score: ${scoreCard.overallScore}/10 — ${scoreCard.autoAction}`,
            deliverable: scoreCard,
            notes: scoreCard.recommendations.join(". "),
            confidence: scoreCard.overallScore,
            requiresReview: true,
          }),
          completedAt: undefined,
        },
      });
      await prisma.pipeline.update({ where: { id: pipelineId }, data: { currentStage: readyTask.stage } });
      return { taskId: readyTask.id, stage: readyTask.stage, status: newStatus, output: scoreCard };
    } catch (err) {
      await prisma.pipelineTask.update({ where: { id: readyTask.id }, data: { status: "pending" } });
      throw err;
    }
  }

  // Inject Brand Bible context if available
  let bibleContext = "";
  if (pipeline.brandId) {
    const bible = await prisma.brandBible.findUnique({ where: { brandId: pipeline.brandId } });
    if (bible) {
      const tov = bible.toneOfVoice ? `Tone of Voice: ${bible.toneOfVoice}` : "";
      const msg = bible.messaging ? `Messaging: ${bible.messaging}` : "";
      const vis = bible.visualIdentity ? `Visual Identity: ${bible.visualIdentity}` : "";
      bibleContext = `\n\nBRAND BIBLE CONTEXT (follow these rules strictly):\n${tov}\n${msg}\n${vis}`;
    }
    const strategy = await prisma.brandStrategy.findUnique({ where: { brandId: pipeline.brandId } });
    if (strategy?.lockedTerritory) {
      bibleContext += `\nLOCKED STRATEGY: ${strategy.positioning ?? ""}. Territory: ${strategy.lockedTerritory}. Tone: ${strategy.toneOfVoice ?? ""}.`;
    }
  }

  const agentPrompts: Record<string, string> = {
    strategist: `You are a senior brand strategist at a top agency. Analyze the brief and produce strategic output. Be specific, actionable, and grounded in market reality.${bibleContext}`,
    creative_director: `You are an award-winning creative director. Develop bold, distinctive creative directions that are strategically grounded. Think like the best campaigns in advertising history.${bibleContext}`,
    copywriter: `You are a world-class copywriter. Write compelling, on-brand copy that drives action. Every word earns its place.${bibleContext}`,
    designer: `You are a senior designer. Produce detailed visual specifications and art direction briefs that any production team could execute.${bibleContext}`,
    brand_guardian: `You are a brand consistency expert. Evaluate all work against brand guidelines. Score rigorously. Flag any inconsistencies.`,
  };

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${agentPrompts[readyTask.agentType] ?? agentPrompts.strategist}\n\nYour task: ${readyTask.title}\nStage: ${readyTask.stage}\n\nReturn JSON with:\n- summary: brief summary of what you produced\n- deliverable: the main output (strategy doc, creative concepts, copy, etc.)\n- notes: any notes for the next stage\n- confidence: your confidence level 1-10\n- requiresReview: boolean (true if founder should review before proceeding)`,
        },
        {
          role: "user",
          content: JSON.stringify({
            brief: pipeline.briefText,
            upstreamWork: upstreamOutputs,
            taskTitle: readyTask.title,
          }),
        },
      ],
    });

    const output = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(output);

    const newStatus = parsed.requiresReview ? "awaiting_review" : "completed";

    await prisma.pipelineTask.update({
      where: { id: readyTask.id },
      data: {
        status: newStatus,
        outputArtifact: output,
        completedAt: newStatus === "completed" ? new Date() : undefined,
      },
    });

    // Update pipeline stage
    await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { currentStage: readyTask.stage },
    });

    // Unblock downstream tasks if completed
    if (newStatus === "completed") {
      await unblockDownstream(pipelineId, readyTask.id);
    }

    return { taskId: readyTask.id, stage: readyTask.stage, status: newStatus, output: parsed };
  } catch (err) {
    await prisma.pipelineTask.update({
      where: { id: readyTask.id },
      data: { status: "pending", outputArtifact: JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }) },
    });
    throw err;
  }
}

async function unblockDownstream(pipelineId: string, completedTaskId: string) {
  const tasks = await prisma.pipelineTask.findMany({ where: { pipelineId } });
  const completedIds = new Set(tasks.filter((t) => t.status === "completed" || t.status === "approved").map((t) => t.id));
  completedIds.add(completedTaskId);

  for (const task of tasks) {
    if (task.status === "blocked") {
      const deps: string[] = JSON.parse(task.dependencies ?? "[]");
      if (deps.every((d) => completedIds.has(d))) {
        await prisma.pipelineTask.update({ where: { id: task.id }, data: { status: "pending" } });
      }
    }
  }
}

export async function reviewTask(taskId: string, action: "approve" | "reject", note?: string) {
  const task = await prisma.pipelineTask.findUnique({ where: { id: taskId }, include: { pipeline: true } });
  if (!task) throw new Error("Task not found.");

  if (action === "approve") {
    await prisma.pipelineTask.update({
      where: { id: taskId },
      data: { status: "approved", reviewNote: note, completedAt: new Date() },
    });
    await unblockDownstream(task.pipelineId, taskId);
  } else {
    await prisma.pipelineTask.update({
      where: { id: taskId },
      data: { status: "pending", reviewNote: note, outputArtifact: null },
    });
  }

  return { taskId, action, stage: task.stage };
}
