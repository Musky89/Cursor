# Next Session Implementation Spec

## Context
This is the Agentic Force platform — a one-person AI creative agency operating system.
35+ commits, 27,000+ lines, 18 pages, 30+ API routes built in this session.
The orchestration engine, pipeline system, and review queue are the foundation.
Everything below builds on what exists.

## What's Built (do NOT rebuild)
- Orchestration Engine (`src/lib/orchestration/engine.ts`) — 8-stage pipeline with dependency resolution
- Review Queue (`/app/review`) — founder approval dashboard
- Brief Creator (`/app/briefs`) — structured brief → pipeline
- Brand Bible API (`/api/brand-bible/[brandId]`) — generates comprehensive brand knowledge base
- Client/Brand hierarchy (`/app/clients`, `/app/clients/[id]`, `/app/brands/[id]`)
- Brand Strategy (`/app/brands/[id]/strategy`) — 4 territories, lock one
- Quick Create (`/app/brands/[id]/quick-create`) — one prompt, one asset
- Logo Studio (`/app/brands/[id]/logo`) — iterative logo design
- 10 AI agents (all in `/api/agents/`)
- Creative Canon (`src/lib/creative-canon.ts`) — 306 knowledge items
- GPT Art Director (`src/lib/art-director.ts`)
- Image generation with reference images
- Campaign manager, calendar, brand assets, influencer profiles
- UI component library (`src/components/ui.tsx`)

## Priority 1: Brand Bible UI Page
**File:** `src/app/app/brands/[id]/bible/page.tsx`
**What:** Full-page view of the Brand Bible with sections: Visual Identity, Tone of Voice, Messaging, Channel Guidelines, Competitive Context, Prompt Templates.
**Why:** The Bible generates via API but has no page to view/edit it.
**API:** GET/POST `/api/brand-bible/[brandId]` already exists.
**Design:** Tabbed interface, each section is a card with structured data display. Edit buttons per section.

## Priority 2: Brand Guardian Agent in Pipeline
**File:** Update `src/lib/orchestration/engine.ts`
**What:** The `quality_review` stage should actually score outputs against the Brand Bible:
- Color compliance (extract colors from image prompt, compare to Brand Bible palette)
- Tone compliance (check copy against Brand Bible tone of voice)
- Strategic alignment (check against locked strategy territory)
- Output a quality score card with pass/fail per dimension
**Why:** Currently the quality_review stage is just another GPT call. It should be a structured evaluation.
**API:** Read Brand Bible from DB, score each dimension, auto-reject below threshold.

## Priority 3: Finishing System
**Files:** `src/lib/finishing.ts`, `src/app/api/concepts/[id]/finish/route.ts`
**What:**
- Text overlay engine: apply headlines, CTAs using brand typography rules from Brand Bible
- Format adaptation: one hero image → 1:1, 4:5, 9:16, 16:9 with smart cropping
- Color grading: brand-specific color grade profiles from Brand Bible
- Logo placement: add brand mark in correct position with correct clear space
**Why:** Gap between raw AI image and production-ready asset. This closes it.
**Implementation:** Use Gemini image editing (multi-turn) or Sharp library for programmatic overlays.

## Priority 4: Service Blueprint System
**Files:** New model `ServiceBlueprint`, API route, UI page
**What:** Per-client configuration:
- Which services are active (strategy, creative, social, print)
- Recurring cadence per service (weekly social, monthly campaign, quarterly strategy)
- Output specifications per deliverable
- Quality thresholds
- Which agents assigned
**Why:** Turns one-off projects into managed retainers. The platform knows what to produce and when.
**Schema:**
```
model ServiceBlueprint {
  id              String @id @default(cuid())
  clientId        String @unique
  client          Client @relation(...)
  templateType    String // social-first, performance, content-led, full-service
  activeServices  String // JSON array
  recurringBriefs String // JSON — auto-generated briefs on schedule
  qualityThresholds String // JSON — min scores per dimension
  specialPipelines String // JSON — garment, print, etc.
}
```

## Priority 5: Smart Brief Decomposition
**File:** Update `src/lib/orchestration/engine.ts`
**What:** Instead of fixed 8-stage template, GPT analyzes the brief and creates a custom task graph:
- "We need 3 social posts" → skip strategy, go straight to concepting + copy + design
- "Full brand build" → all 8 stages + identity design + naming
- "Print ad for newspaper" → add CMYK/bleed specs, skip social formatting
**Why:** Different briefs need different pipelines. One size doesn't fit all.

## Priority 6: Creative Memory Page
**File:** `src/app/app/brands/[id]/memory/page.tsx`
**What:** Visual gallery of all generated/approved/rejected work for a brand. Shows:
- Approval rate over time
- Most used angles/styles
- Performance data linked to creative attributes
- Pattern recognition: "Images with warm lighting get approved 80% more"
**API:** Aggregate data from GeneratedImage + PipelineTask tables.

## Priority 7: Export System (PDF/PPTX)
**Files:** `src/app/api/export/[type]/route.ts`
**What:** Generate client-ready deliverables:
- Campaign deck (PDF): strategy + concepts + visuals + copy, branded
- Creative brief (PDF): structured brief document
- Asset package (ZIP): all approved images in required formats
**Implementation:** Use `@react-pdf/renderer` for PDFs, `JSZip` for ZIPs.

## Priority 8: Script & Shoot Page
**File:** `src/app/app/brands/[id]/script/page.tsx`
**What:** Input a campaign brief → receive:
- Scene-by-scene video script
- Shot list with camera angles, lighting, location
- On-screen text suggestions
- Director's notes
- Music/sound direction
**Why:** Hands directly to a video production team or content creator.

## Tech Notes
- Database: SQLite via Prisma 7 (sufficient for single user)
- Image gen: Gemini 3 Pro Image (GEMINI_API_KEY needed — user's current key expired)
- Fallback: DALL-E 3 (OPENAI_API_KEY)
- All API routes use lazy client initialization to handle env vars in Turbopack
- Buffer → Uint8Array for Prisma Bytes fields (Prisma 7 requirement)
- `as const` arrays need explicit type annotations to avoid TypeScript errors with optional properties
