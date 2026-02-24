# AGENTS.md

## Cursor Cloud specific instructions

This repo contains two independent Next.js applications on separate feature branches. The current dev branch merges both into a single workspace.

### Projects

| App | Directory | Framework | Port | Notes |
|-----|-----------|-----------|------|-------|
| **AdLab AI** | `adlab-ai/` | Next.js 16 + Prisma 7 + SQLite | 3000 | Auth, ad campaign management, AI concept generation |
| **NexusAI** | `nexus-ai/` | Next.js 15 | 3001 | Stateless revenue intelligence tools, no database |

### Running the apps

```bash
# AdLab AI (requires .env with DATABASE_URL and Prisma setup)
cd adlab-ai && npm run dev -- -p 3000

# NexusAI (no setup needed beyond npm install)
cd nexus-ai && npm run dev -- -p 3001
```

### AdLab AI setup caveats

- Requires `DATABASE_URL=file:./dev.db` in `adlab-ai/.env` before running.
- Run `npx prisma generate` then `npx prisma migrate deploy` before first dev server start.
- `JWT_SECRET` defaults to `dev-insecure-secret-change-this` in development mode — no env var needed for dev.
- `OPENAI_API_KEY` is optional; the app uses a deterministic fallback generator when absent.

### Lint / Build / Test

- **AdLab AI**: `npm run lint` (ESLint), `npm run build` (Next.js build). No automated tests.
- **NexusAI**: `npm run lint` triggers interactive ESLint setup (no `eslint.config` exists). `npm run build` works. No automated tests.

### Gotchas

- The two projects originate from different branches (`origin/cursor/global-revenue-ai-app-bc90` for adlab-ai, `origin/cursor/global-revenue-ai-app-f7bf` for nexus-ai). They share no code.
- AdLab AI uses Prisma with `@prisma/adapter-better-sqlite3` — the generated client outputs to `src/generated/prisma/`. If the schema changes, re-run `npx prisma generate`.
- When running both apps simultaneously, use different ports (e.g., 3000 and 3001).
