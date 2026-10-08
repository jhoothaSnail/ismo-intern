# ---- builder ----------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable

# Copy workspace manifests first — layer-cached until any package.json changes
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api

# Build
RUN pnpm --filter @pms/contracts build
RUN pnpm --filter @pms/api build
RUN pnpm --filter @pms/api exec prisma generate

# ---- runner -----------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

# Prisma schema (needed for postinstall generation and migrate deploy)
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --frozen-lockfile --prod

# Built artifacts from builder
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN addgroup -S nodejs -g 1001 && adduser -S apiuser -u 1001 -G nodejs && \
    chown -R apiuser:nodejs /app

USER apiuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
