## Why

后端已经具备认证、菜谱管理和点菜闭环，但主厨目前只能通过 curl 或测试调用 API。需要一个 PC 管理后台，让主厨能在浏览器里完成登录、维护分类/菜谱/做法，并查看点菜菜单。

## What Changes

- 新增 `apps/admin-web` PC 管理后台应用，采用已确认的轻量自建方案：React + Vite + TypeScript + Ant Design + TanStack Router + TanStack Query + ofetch + Zustand。
- 参考开源项目 `condorheroblog/react-antd-admin` 的中后台边界划分，但不照搬代码；只借鉴 layout、route、request、auth、pages 的组织方式。
- 提供登录页、受保护后台布局、分类管理、菜谱管理、点菜菜单查看等首版页面。
- 调整菜谱管理体验：创建/编辑菜谱改为列表页抽屉表单；食材与做法合并为单一富文本“菜谱内容”；封面图支持上传；参考链接字段不再绑定 B 站语义；表格枚举值使用中文展示；后台侧栏与顶部栏固定，不随内容滚动。
- 追加后台二期整改：修复 Vite/Vitest 与 TanStack Router 类型问题；统一 pnpm catalogs；引入 Tailwind CSS v4、Ant Design icons 与 ProComponents；将管理页面升级为 Card/PageContainer/ProTable 风格，补齐面包屑、页签、查询/重置、完整分页、回到顶部、删除操作、主题切换和系统设置入口。
- 扩展后台管理能力：新增菜品标签与忌口字段，支持常见忌口（香菜、折耳根、葱等）；新增用户管理与角色管理页面，后端 API 与共享 schema 随之补齐。
- 复用 `@feed-plan/shared` 类型与 schema，统一 API client 处理 base URL、JWT、401 跳转登录。
- 首版仅实现 PC 管理后台；不实现移动端 App、访客 H5 和复杂可视化设计稿。

## Capabilities

### New Capabilities

- `admin-web`: PC 管理后台的前端应用结构、认证会话、路由布局、分类/菜谱/点菜页面与后端 API 对接。

### Modified Capabilities

<!-- 无需修改既有 user-auth、recipe-management、meal-ordering 需求；本变更复用现有后端 API 契约。 -->

## Impact

- **前端应用**：新增 `apps/admin-web`，接入 monorepo、Turbo、共享 ESLint/Prettier/TypeScript 配置。
- **依赖**：新增 React、Vite、Ant Design、TanStack Router、TanStack Query、ofetch、Zustand，以及 Vitest/Testing Library 等前端测试依赖。
- **后台体验依赖**：新增 Tailwind CSS v4、`@tailwindcss/vite`、`@vitejs/plugin-react`、`@ant-design/icons`、`@ant-design/pro-components`，并通过 catalogs 管理共享版本。
- **配置**：更新 pnpm workspace/Turbo 任务，增加 admin-web 的 dev/build/lint/typecheck/test 脚本。
- **运行方式**：README 增加 PC 管理后台本地启动与 API base URL 配置说明。
- **后端能力**：新增菜谱富文本内容字段与本地图片上传接口；上传图片保存到服务器本地目录并返回可访问路径。
- **风险**：本变更会触及 recipe-management 后端契约和数据库迁移；实施前必须同步更新共享类型、后端校验、迁移和前端表单。
