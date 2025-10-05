FROM oven/bun:1 AS base
WORKDIR /workspace

# Copy root manifests for workspace install
COPY bun.lock package.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json

RUN bun install --ignore-scripts

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api
RUN bun run build

FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /workspace/apps/api/dist ./dist
COPY --from=base /workspace/apps/api/package.json ./package.json
COPY --from=base /workspace/bun.lock ./bun.lock
EXPOSE 4000
CMD ["bun", "run", "start"]