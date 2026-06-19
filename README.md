# Feed Plan · 点菜服务

家庭点菜服务应用。详见 [AGENTS.md](./AGENTS.md) 了解架构、角色模型与开发流程。

## 仓库结构

```
apps/
  server/        # NestJS 后端（认证、API）
  admin-web/     # PC 管理后台（React + Vite + Ant Design）
packages/
  shared/        # 前后端共享类型与 Zod 校验
  db/            # Drizzle schema 与 migration
openspec/        # SDD 规约（变更提案与已确立规约）
```

## 本地开发

### 前置

- Node ≥ 22、pnpm 10、Docker

### 启动步骤

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 准备环境变量：

   ```bash
   cp .env.example .env
   # 编辑 .env，至少设置 JWT_SECRET 与 SEED_*_PASSWORD
   ```

3. 启动数据库与后端（容器）：

   ```bash
   docker compose up -d --build
   ```

   - postgres 暴露在宿主 `localhost:55432`（避开本机常用的 5432）。
   - server 暴露在 `localhost:3000`。

4. 执行数据库迁移（包含用户、分类、菜谱、食材、做法步骤表）：

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:55432/feed_plan \
     pnpm --filter @feed-plan/db db:migrate
   ```

5. 创建初始账号（chef、diner）：

   ```bash
   set -a; source .env; set +a
   DATABASE_URL=postgres://postgres:postgres@localhost:55432/feed_plan \
     pnpm --filter @feed-plan/server seed
   ```

6. 验证：

   ```bash
   curl http://localhost:3000/health
   curl -X POST http://localhost:3000/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"chef","password":"<你的 SEED_CHEF_PASSWORD>"}'
   ```

   使用返回的 `accessToken` 继续验证菜谱 API：

   ```bash
   TOKEN='<上一步返回的 accessToken>'

   curl -X POST http://localhost:3000/categories \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{"name":"家常菜","sortOrder":1}'

   CATEGORY_ID='<上一步返回的分类 id>'

   curl -X POST http://localhost:3000/dishes \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d "{
       \"name\":\"番茄炒蛋\",
       \"categoryId\":\"$CATEGORY_ID\",
       \"difficulty\":\"easy\",
       \"description\":\"快手下饭菜\",
       \"ingredients\":[{\"name\":\"鸡蛋\",\"amount\":\"2 个\"}],
       \"steps\":[{\"stepNo\":1,\"content\":\"先炒鸡蛋，再炒番茄，最后合炒调味\"}]
     }"

   DISH_ID='<上一步返回的菜谱 id>'

   curl -X POST http://localhost:3000/meals/current \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{"mealDate":"2026-06-17","mealType":"dinner","title":"今天晚餐"}'

   MEAL_ID='<上一步返回的 meal.id>'

   curl -X POST "http://localhost:3000/meals/$MEAL_ID/orders" \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d "{\"dishId\":\"$DISH_ID\",\"quantity\":1,\"note\":\"少油\"}"

   curl http://localhost:3000/meals/today \
     -H "Authorization: Bearer $TOKEN"

   curl -X PATCH "http://localhost:3000/meals/$MEAL_ID/complete" \
     -H "Authorization: Bearer $TOKEN"
   ```

7. 启动 PC 管理后台：

   ```bash
   VITE_API_BASE_URL=http://localhost:3000 pnpm --filter @feed-plan/admin-web dev
   ```

   打开 Vite 输出的本地地址，使用 seed 创建的 chef 账号登录。后台首版包含首页、分类管理、菜谱管理和点菜菜单。

### 常用脚本

```bash
pnpm build        # 构建全部包
pnpm lint         # ESLint
pnpm format       # Prettier 格式化
pnpm format:check # 检查格式
pnpm typecheck    # 全仓类型检查
pnpm test         # 运行测试
```

## 开发流程

本项目采用 SDD（OpenSpec）spec-first 流程，每个功能先写规约、评审、再实现。详见 AGENTS.md。
