# AGENTS.md

## Cursor Cloud specific instructions

Scoped to **adlab-ai** — an ad-campaign management platform (Next.js 16, Prisma 7, SQLite via `better-sqlite3`).

### Environment baseline

| Requirement | Detail |
|---|---|
| Node.js | 22 (provided by the VM image) |
| Native toolchain | `build-essential`, `g++`, `make`, `python3` — needed by `better-sqlite3` when prebuilt binaries are unavailable |
| Package manager | npm (`package-lock.json`) |

The **update script** runs `npm ci` and `npm run db:generate` on every VM boot, so dependencies and the Prisma client are always current.

### .env setup

`.env` is **not** managed by the update script or committed to git.
Before first run, copy the checked-in template:

```bash
cp adlab-ai/.env.example adlab-ai/.env
```

The example ships sensible development defaults (`DATABASE_URL=file:./dev.db`).
`JWT_SECRET` auto-defaults in non-production mode. `OPENAI_API_KEY` is optional — the app falls back to a deterministic concept generator.

### Database

SQLite is file-based (no external server). After creating `.env`, apply migrations once:

```bash
cd adlab-ai && npx prisma migrate deploy
```

The dev database file (`dev.db`) is gitignored and survives VM snapshots.

### Running

```bash
cd adlab-ai && npm run dev          # default port 3000
```

### Lint / Build

```bash
cd adlab-ai && npm run lint         # ESLint 9 + eslint-config-next
cd adlab-ai && npm run build        # Next.js production build
```

No automated test suite exists in this project.

### Image generation service (optional)

A local Stable Diffusion (SDXL-Turbo) service generates ad creative images with no API keys. It runs on CPU (~30-60s per image).

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install diffusers==0.30.3 transformers==4.44.2 accelerate safetensors fastapi uvicorn pillow
cd adlab-ai/image-service && python3 -m uvicorn server:app --host 0.0.0.0 --port 8100
```

The Next.js app calls `http://localhost:8100/generate` when users click "Generate Ad Image" on concept cards. The model (~5GB) downloads on first request. Generated images are cached in `image-service/generated/`.

### Key gotchas

- `better-sqlite3` compiles a native addon. If `npm ci` fails on it, verify `build-essential` and `python3` are installed.
- Prisma client is generated into `src/generated/prisma/` (gitignored). The update script regenerates it, but after any schema change you should also re-run `npm run db:generate`.
- `prisma.config.ts` imports `dotenv/config` — this resolves through Prisma's transitive dependency; no explicit `dotenv` install is needed.
- The NexusAI app (`nexus-ai/`) is a separate, stateless Next.js 15 project in the same repo. It has no database or native deps and only needs `npm install && npm run dev -- -p 3001` if you need to run it alongside AdLab AI.
- `nexus-ai` has no ESLint config — `npm run lint` will prompt interactively and hang. Lint is only available for adlab-ai.
- `adlab-ai` has a pre-existing TypeScript error in `src/app/api/concepts/[id]/image/route.ts` (`response.data` possibly undefined) that blocks `npm run build`. The dev server is unaffected.
