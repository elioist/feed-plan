# Feed Plan 后端镜像（monorepo 多阶段构建）
# 构建上下文为仓库根目录：docker build -f apps/server/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate
WORKDIR /app

# ── 依赖与构建 ──
FROM base AS build
# bcrypt 等原生模块在 alpine 上可能需要编译工具
RUN apk add --no-cache python3 make g++
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile
COPY packages ./packages
COPY apps/server ./apps/server
RUN pnpm --filter @feed-plan/shared build \
  && pnpm --filter @feed-plan/db build \
  && pnpm --filter @feed-plan/server build
# 导出仅含生产依赖的精简部署包（--legacy：pnpm v10 非注入式 workspace 部署）
RUN pnpm --filter @feed-plan/server --legacy --prod deploy /app/deploy

# ── 运行时 ──
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/deploy ./
EXPOSE 9527
CMD ["node", "dist/main.js"]
