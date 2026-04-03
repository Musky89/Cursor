-- CreateTable
CREATE TABLE "ServiceBlueprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL DEFAULT 'full-service',
    "activeServices" TEXT,
    "recurringBriefs" TEXT,
    "qualityThresholds" TEXT,
    "specialPipelines" TEXT,
    "agentsAssigned" TEXT,
    "monthlyAssetTarget" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceBlueprint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBlueprint_clientId_key" ON "ServiceBlueprint"("clientId");
