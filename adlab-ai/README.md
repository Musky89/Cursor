# AdLab AI

Revenue-focused generative advertising platform that can:

- generate structured ad concepts from product + audience context
- launch channel-specific experiments
- simulate daily campaign outcomes (for local/demo operation)
- optimize budget allocation automatically using ROAS, CPA, CTR, and margin-aware rules
- track performance through a unified dashboard

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma ORM + SQLite
- Cookie/JWT auth (`jose`) + password hashing (`bcryptjs`)
- OpenAI integration (optional). If no API key is present, the generator uses deterministic fallback logic.

## Product features

1. **Authentication**
   - Register/login/logout
   - Auto-creates a workspace per user

2. **Data model**
   - Workspaces, Products, Audiences
   - AI Ad Concepts
   - Experiments + concept allocation
   - Daily metric snapshots
   - Optimization logs

3. **Creative generation**
   - Generates concepts with:
     - Hook
     - Pain/Desire
     - Promise
     - Proof
     - Offer
     - CTA
   - Plus ad text, script, image prompt, and quality score

4. **Experiment operations**
   - Launch experiments by channel
   - Select concept variants
   - Set daily budget

5. **Simulation + optimizer**
   - Simulate campaign day metrics for each concept
   - Optimizer decisions:
     - `SCALE`
     - `HOLD`
     - `PAUSE`
   - Normalizes allocations to 100% for active concepts

6. **Dashboard analytics**
   - Revenue, spend, ROAS, CPA, CTR, conversions
   - Top concepts by performance
   - Recent optimizer actions

## API surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `POST /api/bootstrap`
- `GET|POST /api/products`
- `GET|POST /api/audiences`
- `GET /api/concepts`
- `POST /api/concepts/generate`
- `GET|POST /api/experiments`
- `POST /api/experiments/:id/simulate`
- `POST /api/optimizer/run`
- `GET /api/dashboard`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and edit values:

```bash
cp .env.example .env
```

3. Run database migration + generate Prisma client:

```bash
npm run db:migrate -- --name init
```

4. Start development server:

```bash
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000).

## Notes

- Without `OPENAI_API_KEY`, concept generation still works via fallback generator.
- For production, use a managed SQL database and strong secrets.
- The simulator is intentionally synthetic; replace with real ad network connectors for live traffic operations.
