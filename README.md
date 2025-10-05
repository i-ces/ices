# i-CES Monorepo

Infrastructure-only starter for the i-CES community platform. Focus: clean Turborepo + Bun + Next.js + Express + Mongo + Biome (no features/business logic yet).

## Tech Stack

| Area | Choice | Notes |
|------|--------|-------|
| Package manager | Bun | Fast installs & dev runner |
| Monorepo | Turborepo | Task orchestration & caching |
| Frontend | Next.js (App Router) + Tailwind CSS 4 | Minimal page: “Hello i-CES” |
| Backend | Express + MongoDB driver | Basic health endpoint + optional DB connect |
| Tooling | Biome | Formatting + lint (replaces ESLint & Prettier) |
| Testing (API) | Vitest + Supertest | Health check test scaffold |
| Shared code | `packages/shared` | Types + constants placeholder |

## Repository Structure

```c
apps/
 web/        # Next.js app
 api/        # Express API (Mongo optional)
packages/
 shared/     # Shared types & future utils
 config/     # Base tsconfig (tooling only)
biome.json    # Global lint/format config
docker-compose.yml
```

## Environment Variables

Root `.env.example`:

```bash
MONGODB_URI=mongodb://localhost:27017/ices
```

Behavior:

- If absent, API falls back to `mongodb://localhost:27017/ices`.
- Set `MONGODB_URI=disabled` to skip DB connection while keeping API running.
- Optional: `PORT=4000` (backend) / Next.js chooses available port starting at 3000.

## Install

```bash
bun install
```

## Scripts (Root)

```bash
bun dev     # Run web + api concurrently
bun build   # Build all workspaces
bun lint    # Biome check
bun format  # Biome format (writes)
bun test    # Run tests (currently API only)
```

## Frontend (apps/web)

- App Router only (Pages router removed to avoid conflicts).
- Tailwind 4 imported via `globals.css` (no custom config yet).
- `next.config.ts` sets `turbopack.root` and `output: 'standalone'` for production container builds.

## Backend (apps/api)

Features:

- Express server (`/health` endpoint): returns `{ status, mongo }`.
- Mongo connection attempted on start unless disabled.
- Dynamic port retry (default 5 retries) when a port is already in use.
- Exports `app` and `start({ port?, retries? })` for testability & flexibility.

Health response example:

```json
{ "status": "ok", "mongo": "connected" | "disconnected" | "disabled" }
```

## Shared Package (`@ices/shared`)

Currently exposes:

```ts
export interface HealthStatus { status: string; mongo: 'connected' | 'disconnected' | 'disabled'; }
export const PROJECT_NAME = 'i-CES';
```

How to use in web:

```ts
import { PROJECT_NAME } from '@ices/shared';
```

(Add a path alias later if desired.)

## Testing

Framework: Vitest + Supertest (API) + Vitest (shared).

Locations:

- API: `apps/api/src/*.test.ts` (health + port fallback tests)
- Shared: `packages/shared/src/shared.test.ts`

Run all:

```bash
bun test
```

Add more tests with `*.test.ts` naming convention inside respective `src` folders.

## Biome (Lint & Format)

Single config: `biome.json`.
Common commands:

```bash
biome check .
biome format .
```

Adjust indentation/width/rules directly in the JSON.

## Docker (Dev)

Compose file runs: Mongo, API (dev), Web (dev).

```bash
docker compose up --build
docker compose down
```

Persistent Mongo volume: `mongo_data`.

## Production Containers

### API

```bash
docker build -f apps/api/Dockerfile -t ices-api:prod .
docker run -p 4000:4000 -e MONGODB_URI=mongodb://host.docker.internal:27017/ices ices-api:prod
```

### Web (Next.js standalone)

```bash
docker build -f apps/web/Dockerfile -t ices-web:prod .
docker run -p 3000:3000 ices-web:prod
```

The web Dockerfile relies on `output: 'standalone'` to ship only the necessary server files and dependencies.

### Combined Deployment

Use orchestrator (docker compose / k8s) to run both images, inject `MONGODB_URI` into API.

## TypeScript & Module Resolution

Backend / shared use `moduleResolution: node16` + `module: Node16` (future-compatible with TS 7). Web keeps its own `bundler` resolution isolated from backend.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Port 4000 in use | Previous API process | `lsof -i:4000 && kill <pid>` |
| Next jumps to 3001/3002 | 3000 taken | Free the port or accept new port |
| API keeps increasing port | Previous port(s) busy | First free port after base within retry window |
| Mongo connection errors | Mongo not started | Start local Mongo / compose |
| Tests fail: cannot find module | Missing dev deps | `bun install` |
| Type path errors (`extends`) | Wrong relative path | Confirm `../../packages/config/tsconfig.base.json` |

## Extending Next

Add aliases via `apps/web/tsconfig.json` paths or a root tsconfig if you introduce cross-import patterns beyond `@ices/shared`.

## Continuous Integration

GitHub Actions workflow `.github/workflows/ci.yml` runs: install → lint → test → build.

## Future Ideas (Not Implemented Yet)

- Auth layer
- Shared UI component library
- CI workflow (lint + test + build) via GitHub Actions
- Production containerization for Web (standalone Next output)
- Database migration tool (Prisma / Mongo migrations)

## Minimal Contribution Guide

1. Create a feature branch.
2. Run `bun lint` & `bun test` before commit.
3. Keep changes isolated (infra vs feature vs docs).
4. Use shared types or create new ones in `@ices/shared` instead of duplicating.

## License

No licence

---
