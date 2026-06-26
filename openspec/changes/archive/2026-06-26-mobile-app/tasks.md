## 1. 项目初始化

- [x] 1.1 创建 `apps/mobile` 目录，使用 `npx create-expo-app` 初始化 Expo 项目
- [x] 1.2 配置 `pnpm-workspace.yaml` 添加 `apps/mobile` 工作区
- [x] 1.3 安装核心依赖：expo-router、zustand、@tanstack/react-query、react-native-paper
- [x] 1.4 安装安全存储：expo-secure-store
- [x] 1.5 配置 TypeScript，复用 `packages/typescript-config`
- [x] 1.6 配置 ESLint，复用 `packages/eslint-config`
- [x] 1.7 配置 Expo Router 文件式路由
- [x] 1.8 创建基础目录结构：app/、components/、stores/、hooks/、lib/

## 2. 共享类型与 API Client

- [x] 2.1 配置 `@feed-plan/shared` 依赖，复用共享类型
- [x] 2.2 实现 API client（ofetch），统一处理 JSON、Authorization header、错误转换和 401
- [x] 2.3 实现 auth API：登录、获取当前用户
- [x] 2.4 实现 dishes API：列表、详情
- [x] 2.5 实现 categories API：列表
- [x] 2.6 实现 meals API：今日菜单、详情、创建、完成
- [x] 2.7 实现 orders API：创建订单

## 3. 认证模块（mobile-auth）

- [x] 3.1 实现 auth store（Zustand）：保存 accessToken、当前用户、退出
- [x] 3.2 实现 SecureStore 工具函数：存储/读取/清除 token
- [x] 3.3 实现登录页面：用户名密码输入框、登录按钮、错误提示
- [x] 3.4 实现会话恢复：应用启动时检查 token，有效则自动登录
- [x] 3.5 实现退出登录：清除 token 和用户状态，跳转登录页
- [x] 3.6 实现 ProtectedRoute 组件，未登录跳转登录页

## 4. 菜谱浏览模块（mobile-recipe-browse）

- [x] 4.1 实现菜谱列表页：展示菜谱卡片（封面图、名称、难度、分类）
- [x] 4.2 实现分类筛选：顶部分类标签，点击筛选
- [x] 4.3 实现搜索功能：搜索框，实时过滤菜谱
- [x] 4.4 实现菜谱详情页：封面图、名称、描述、难度、食材、做法步骤
- [x] 4.5 实现 recipe_content 富文本展示
- [x] 4.6 实现 B 站视频链接跳转

## 5. 点餐模块（mobile-meal-ordering）

- [x] 5.1 实现今日菜单页：展示今日活跃场次列表
- [x] 5.2 实现历史菜单切换：查看已完成的场次
- [x] 5.3 实现菜单详情页：场次信息、订单列表、菜品聚合
- [x] 5.4 实现主厨创建场次：选择餐次类型，创建 ordering 状态的场次
- [x] 5.5 实现加菜功能：选择菜品、设置份数、提交订单
- [x] 5.6 实现主厨完成点餐：标记场次为 completed
- [x] 5.7 实现权限控制：创建场次和完成点餐仅主厨可见

## 6. 导航与布局

- [x] 6.1 配置底部 Tab 导航：菜谱、菜单、我的
- [x] 6.2 实现菜谱模块的 Stack 导航：列表 → 详情
- [x] 6.3 实现菜单模块的 Stack 导航：列表 → 详情 → 加菜
- [x] 6.4 实现个人中心页面：显示用户名、角色、退出按钮

## 7. 测试与验证

- [x] 7.1 编写 auth store 测试：登录、退出、会话恢复
- [x] 7.2 编写登录页面测试：表单交互、错误提示
- [x] 7.3 编写菜谱列表测试：加载、筛选、搜索
- [x] 7.4 编写菜单详情测试：订单展示、加菜
- [x] 7.5 运行 typecheck 确保类型安全
- [x] 7.6 运行 lint 确保代码规范
- [x] 7.7 运行 test 确保测试通过
