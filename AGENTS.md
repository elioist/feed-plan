# Feed Plan · 点菜服务

> 本文件是项目的单一真相源（single source of truth）指令文档。
> `CLAUDE.md` 通过 `@AGENTS.md` import 引用本文件；`.claude/skills` 软链接至 `.agents/skills`。
> 各 AI 工具读取的配置同源于此，避免重复维护。

## 项目简介

一个家庭点菜服务应用，供主厨（本人）与食客（女友）使用，未来可分享给朋友临时点餐。

- **移动端 App**（Expo / React Native）：主厨与食客登录使用，浏览菜谱、点餐/加菜、查看今日菜单、看做法与视频。
- **PC 管理后台**（React + Vite）：主厨录入与管理菜谱、分类、做法、视频关联。
- **访客点菜页**（H5，未来实现）：朋友通过分享链接免下载、免注册，留名即可点餐。
- **后端**（NestJS + Drizzle + PostgreSQL）：RESTful API。

## 技术栈

| 层      | 选型                                        |
| ------- | ------------------------------------------- |
| 移动端  | React Native + Expo                         |
| PC 后台 | React + Vite（组件库 Ant Design）           |
| 访客页  | React + Vite（H5，未来）                    |
| 后端    | NestJS + Drizzle ORM                        |
| 数据库  | PostgreSQL                                  |
| 仓库    | pnpm workspace + Turborepo（Monorepo）      |
| 认证    | 账号密码 + JWT，预留免登录访客通道          |
| 视频    | B 站外链（存 BV 号 / 链接）                 |
| 图片    | 服务器本地目录 + nginx 托管                 |
| 部署    | Docker + docker-compose + nginx，阿里云 ECS |
| 流程    | OpenSpec（SDD 规约驱动开发）                |

## 角色模型

两种角色：**主厨 chef** 与 **食客 diner**。

| 能力                              | 主厨 chef（本人） | 食客 diner（女友 / 朋友） |
| --------------------------------- | :---------------: | :-----------------------: |
| 浏览菜谱、看做法 / 视频           |         ✅         |             ✅             |
| 点餐 / 加菜（结单前无限加）       |         ✅         |             ✅             |
| 完成本次点餐（结单锁定）          |         ✅         |             ❌             |
| 管理菜谱 / 分类 / 做法（PC 后台） |         ✅         |             ❌             |

> 朋友为免登录的临时食客，以 `guest_name` 记名点餐（未来分享功能）。

## 点餐模型（餐厅会话模式）

一次点餐 = 一个 `meal`（场次），带状态机：

```
开一单 (ordering) ──[任何人无限加菜]──▶ 主厨「完成本次点餐」──▶ 锁定 (completed)
```

- **加菜**：向 `status=ordering` 的当前场次追加 `orders`，同一道菜以 `quantity` 累加份数。
- **结单权归主厨**：仅主厨可将 `meal.status` 置为 `completed`。结单后锁定。
- 餐次区分早餐 / 午餐 / 晚餐（`meal_type`）。

## 数据模型（冻结版）

```
users        ── id, username, password_hash, role(chef|diner), created_at
categories   ── id, name, sort_order
dishes       ── id, name, category_id, cover_image(本地路径), description,
                bili_video, difficulty, is_active
recipe_steps ── id, dish_id, step_no, content, image
ingredients  ── id, dish_id, name, amount
meals        ── id, title, meal_date, meal_type(breakfast|lunch|dinner),
                type(daily|gathering), status(ordering|completed),
                created_by, created_at, completed_at
orders       ── id, meal_id, dish_id, user_id(可空), guest_name(可空),
                quantity, note, created_at
# 未来分享功能再建，已预留：
share_links  ── id, meal_id, token, expires_at, is_active
```

## 开发流程（SDD / OpenSpec）

严格 **spec-first**，每个功能遵循：

1. 写 change proposal（`proposal.md` 为什么/做什么 + `tasks.md` 拆解 + `specs/` 增量）
2. 交由主厨 review 并批准
3. 批准后才落代码，按 tasks 分批推进
4. 验证通过后 `openspec archive` 归档

UI 不出专门设计稿，靠组件库默认样式快速成型、边做边调；但规约仍需把关键流程（开单→加菜→主厨结单）描述清楚。

## 工程约定

- 全程 TypeScript；前后端共享类型与 Zod 校验置于 `packages/shared`。
- 不可变数据风格，避免直接 mutation。
- 多个小文件优于少数大文件（单文件 200–400 行为宜）。
- Secrets（JWT secret、DB 密码）走 `.env`，绝不进 git。
- 提交信息遵循 conventional commits；不在 commit / PR 中添加 AI 署名。
- 涉及修改超过 3 个文件的任务，先拆解再执行。
