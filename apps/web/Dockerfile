##### Web (Next.js) Production Dockerfile
# Multi-stage build producing a minimal runtime using Next standalone output

FROM oven/bun:1 AS builder
WORKDIR /app

# Copy root manifests first (better layer caching)
COPY bun.lock package.json turbo.json biome.json ./
COPY tsconfig.json ./

# Copy workspaces
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile
RUN bun run build --filter @ices/web

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone server & static assets
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]