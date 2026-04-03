import { getAuthContext } from "@/lib/auth";
import { errorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  pipelineId: z.string(),
});

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Provide pipelineId.", 400);

  const pipeline = await prisma.pipeline.findFirst({
    where: { id: parsed.data.pipelineId, workspaceId: auth.workspace.id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!pipeline) return errorResponse("Pipeline not found.", 404);

  // Build a structured document from all task outputs
  const sections: string[] = [];
  sections.push(`# ${pipeline.title}`);
  sections.push(`**Status:** ${pipeline.status}`);
  sections.push(`**Created:** ${pipeline.createdAt.toLocaleDateString()}`);
  sections.push(``);
  sections.push(`## Brief`);
  sections.push(pipeline.briefText);
  sections.push(``);

  for (const task of pipeline.tasks) {
    if (task.outputArtifact && (task.status === "completed" || task.status === "approved")) {
      try {
        const output = JSON.parse(task.outputArtifact);
        sections.push(`## ${task.title} (${task.agentType})`);
        sections.push(`**Status:** ${task.status}`);
        if (output.summary) sections.push(`\n### Summary\n${output.summary}`);
        if (output.deliverable) {
          sections.push(`\n### Deliverable`);
          if (typeof output.deliverable === "string") {
            sections.push(output.deliverable);
          } else {
            sections.push("```json\n" + JSON.stringify(output.deliverable, null, 2) + "\n```");
          }
        }
        if (output.notes) sections.push(`\n### Notes\n${output.notes}`);
        sections.push(``);
      } catch { /* skip */ }
    }
  }

  const markdown = sections.join("\n");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="${pipeline.title.replace(/[^a-z0-9]/gi, "_")}_brief.md"`,
    },
  });
}
