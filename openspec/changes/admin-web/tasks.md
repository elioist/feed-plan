## 1. 实施前确认

- [x] 1.1 向用户展示并确认 `apps/admin-web` 目录结构，不改用未经确认的目录组织
- [x] 1.2 确认技术栈固定为 React + Vite + TypeScript + Ant Design + TanStack Router + TanStack Query + ofetch + Zustand
- [x] 1.3 记录开源参考项目 `condorheroblog/react-antd-admin` 的参考范围：layout、routes、request、auth、pages 边界，不复制代码

## 2. 应用骨架与工程配置

- [x] 2.1 新增 `apps/admin-web` 目录、`package.json`、`index.html`、`vite.config.ts`、`tsconfig.json`
- [x] 2.2 接入 workspace 依赖、共享 TypeScript 配置、ESLint 配置、Prettier 配置
- [x] 2.3 接入 Turbo dev/build/lint/typecheck/test 任务
- [x] 2.4 创建 `src/app`、`src/routes`、`src/layouts`、`src/pages`、`src/features`、`src/shared`、`src/styles` 目录
- [x] 2.5 实现应用入口、QueryClient、RouterProvider、全局样式和基础 Ant Design 主题配置

## 3. API Client 与认证会话

- [x] 3.1 实现 `shared/config/env.ts`，读取 admin-web API base URL
- [x] 3.2 使用 ofetch 实现 `shared/api/client.ts`，统一处理 JSON、Authorization header、错误转换和 401
- [x] 3.3 实现 auth API：登录、获取当前用户
- [x] 3.4 实现 auth store：保存 accessToken、当前用户、退出和会话恢复
- [x] 3.5 实现 `ProtectedRoute`，未登录跳转登录页
- [x] 3.6 编写认证相关测试，覆盖登录成功、登录失败、401 清理会话

## 4. 布局与路由

- [x] 4.1 实现 `AuthLayout` 与登录页
- [x] 4.2 实现 `AdminLayout`，包含侧边导航、顶部用户信息、退出入口和内容区
- [x] 4.3 配置 TanStack Router 文件式路由：登录、首页、分类、菜谱列表、菜谱创建、菜谱编辑、菜单列表、菜单详情
- [x] 4.4 配置 router context 注入 QueryClient 与 auth 状态，并注册 router 类型
- [x] 4.5 在列表/详情 route loader 中使用 `queryClient.ensureQueryData` 预取关键数据
- [x] 4.6 实现 dashboard 首页，提供今日菜单摘要和常用入口
- [x] 4.7 验证导航切换不刷新页面，退出后回到登录页

## 5. 分类管理

- [x] 5.1 实现 categories API：列表、创建、更新、删除
- [x] 5.2 实现分类列表页，展示名称、排序值和操作
- [x] 5.3 实现创建/编辑分类表单
- [x] 5.4 实现删除确认与后端 409 冲突反馈
- [x] 5.5 编写分类页面或组件测试，覆盖列表渲染和创建/删除反馈

## 6. 菜谱与做法管理

- [x] 6.1 实现 dishes API：列表、详情、创建、更新、启用/停用
- [x] 6.2 实现菜谱列表页，支持分类筛选、关键词搜索和启用状态展示
- [x] 6.3 实现菜谱创建页，包含基础信息、食材 `Form.List`、做法步骤 `Form.List`
- [x] 6.4 实现菜谱编辑页，加载详情并保存基础信息、食材和做法步骤
- [x] 6.5 实现启用/停用操作与列表刷新
- [x] 6.6 编写菜谱表单测试，覆盖必填校验、步骤编辑和提交 payload

## 7. 点菜菜单查看

- [x] 7.1 实现 meals API：今日菜单、条件查询、详情、完成点餐
- [x] 7.2 实现点菜菜单列表页，默认展示今日菜单并支持日期/餐型/状态筛选
- [x] 7.3 实现菜单详情页，展示 meal 信息、订单明细、菜品聚合 totalQuantity 与点单人拆分
- [x] 7.4 实现主厨完成点餐入口，completed 状态禁用重复完成
- [x] 7.5 编写菜单页面测试，覆盖今日菜单、筛选和完成点餐状态刷新

## 8. 验证与文档

- [x] 8.1 更新 README，补充 admin-web 启动命令、环境变量和登录验证步骤
- [x] 8.2 运行 `pnpm run format:check`
- [x] 8.3 运行 `pnpm run lint`
- [x] 8.4 运行 `pnpm run typecheck`
- [x] 8.5 运行 `pnpm run test`
- [x] 8.6 运行 `pnpm run build`
- [x] 8.7 运行 `openspec validate admin-web --strict`

## 9. 菜谱管理体验修正

- [x] 9.1 将菜谱创建入口从独立新页面调整为菜谱列表页抽屉，保存成功后关闭抽屉并刷新列表
- [x] 9.2 将菜谱编辑入口调整为列表页抽屉，支持从列表直接打开并回填详情
- [x] 9.3 将 `biliVideo` 的前端文案改为“参考链接”，不在 UI 上限定为 B 站视频
- [x] 9.4 将难度字段在表格、详情和表单中统一展示为中文：简单 / 中等 / 困难
- [x] 9.5 将侧边导航和顶部栏改为固定布局，仅内容区滚动
- [x] 9.6 将食材和做法合并为单一“菜谱内容”富文本编辑器，允许主厨按自然语言写食材、步骤、备注
- [x] 9.7 新增后端 `recipe_content` 与 `reference_url` 字段、共享类型和数据库迁移，并让创建/更新菜谱支持这些字段
- [x] 9.8 新增图片上传接口：仅 chef 可上传，限制图片类型与大小，生成服务端文件名，返回可访问路径
- [x] 9.9 将封面路径输入改为上传组件，上传成功后写入 `coverImage`
- [x] 9.10 删除后台和共享类型中的结构化 ingredients / steps 主流程，避免新项目保留兼容分支
- [x] 9.11 补充菜谱抽屉表单、富文本内容和封面上传的基础验证，确保提交 payload 与后端契约一致

## 10. 后台二期基础修复

- [x] 10.1 将零散直接依赖补入 pnpm catalogs，并让 TypeScript、Vitest、Vite、Tailwind、Ant Design 相关依赖统一使用 catalog 引用
- [x] 10.2 按 Vite/Vitest 推荐方式修复 `vite.config.ts` 类型错误，接入 React 插件和 Tailwind v4 Vite 插件
- [x] 10.3 修复 TanStack Router 类型注册/生成链路，确保 route、Link、navigate、loader context 通过 TypeScript 检查
- [x] 10.4 在应用启动或受保护布局挂载时调用 `restoreSession`，刷新页面后恢复右上角当前用户信息
- [x] 10.5 为 admin-web 接入 Tailwind v4，避免 Preflight 与 Ant Design 冲突，并保留 Ant Design token 作为组件主题主来源
- [x] 10.6 逐步将 admin-web 本地导入改为 `~` alias，移除非必要本地 `.js` 导入后缀

## 11. Pro 风格布局与组件基座

- [x] 11.1 接入 `@ant-design/icons`，为侧边菜单、用户菜单、设置、主题等入口配置图标
- [x] 11.2 接入 `@ant-design/pro-components`，建立 PageContainer/ProCard/ProTable 使用边界
- [x] 11.3 将内容区域调整为 Card/PageContainer 布局，增加面包屑和页面页签能力
- [x] 11.4 增加全局回到顶部按钮，并确保只作用于主内容滚动容器
- [x] 11.5 增加系统设置和主题切换入口，持久化主题选择

## 12. 查询表格与删除能力

- [x] 12.1 将菜谱、分类、菜单查询页迁移到 ProTable 或统一表格封装，提供加载、空状态、错误反馈和操作区
- [x] 12.2 为查询表单补齐“查询”和“重置”按钮，并保持 URL search 与表单状态一致
- [x] 12.3 为列表页补齐完整分页功能：当前页、每页条数、总数、快速跳转
- [x] 12.4 为菜谱、菜单等资源补齐删除或停用操作的 UI、API、权限校验和确认反馈
- [x] 12.5 确认菜谱搜索覆盖菜名、描述和菜谱内容，并补充前后端测试

## 13. 菜品标签、忌口与系统管理

- [ ] 13.1 扩展菜品数据模型、共享 schema 和迁移，支持标签与常见忌口项
- [ ] 13.2 在菜谱表单和列表筛选中支持标签与忌口维护/查询
- [ ] 13.3 新增用户管理后端 API、共享 schema、admin 页面和权限校验
- [ ] 13.4 新增角色管理页面，展示 chef/diner 能力边界并支持必要的角色维护
- [ ] 13.5 新增系统设置页面，承载主题切换和后续后台配置项
