-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "brandId" TEXT,
    "title" TEXT NOT NULL,
    "briefText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentStage" TEXT NOT NULL DEFAULT 'brief_intake',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pipeline_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipelineTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inputContext" TEXT,
    "outputArtifact" TEXT,
    "dependencies" TEXT,
    "reviewNote" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PipelineTask_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandBible" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "visualIdentity" TEXT,
    "toneOfVoice" TEXT,
    "messaging" TEXT,
    "channelGuidelines" TEXT,
    "competitiveContext" TEXT,
    "promptTemplates" TEXT,
    "performanceData" TEXT,
    "clientPreferences" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrandBible_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Pipeline_workspaceId_status_idx" ON "Pipeline"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "PipelineTask_pipelineId_status_idx" ON "PipelineTask"("pipelineId", "status");

-- CreateIndex
CREATE INDEX "PipelineTask_status_idx" ON "PipelineTask"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBible_brandId_key" ON "BrandBible"("brandId");
