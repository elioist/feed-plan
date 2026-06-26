# Feed Plan Mobile

本目录继承仓库根目录 `AGENTS.md` 的全部约定；这里仅记录 Expo / React Native 端的补充规则。

## 技术边界

- 使用 Expo + React Native + TypeScript，UI 样式优先沿用现有 NativeWind / Tailwind 写法。
- 路由、入口和 Provider 按 Expo Router 约定维护，入口布局在 `src/app/_layout.tsx`。
- 需要 JSX 的文件使用 `.tsx`，不要把组件写进 `.ts` 文件。
- 新增三方库前先确认 `apps/mobile/package.json` 是否已有依赖；Expo 能力优先使用 Expo 官方包。

## 目录分层

- `src/app`：路由入口、页面布局和页面级组织。
- `src/providers`：全局 Provider，如 QueryClient、认证恢复、错误边界。
- `src/hooks`：端侧可复用 hooks。
- `src/models`：移动端视图模型、表单模型、类型适配；没有对应目录时先确认是否确有必要新增。
- `src/stores`：客户端状态，服务端状态优先交给 TanStack Query。
- `src/constants`：移动端常量；跨端常量放到 workspace 公共包。
- `src/lib`：端侧基础设施适配，如 storage、平台能力、导航工具；不放业务请求 resource。
- `src/utils`：纯函数工具；没有对应目录时先确认是否应放入 `src/lib` 或公共包。
- `src/components`：可复用展示组件，避免承载接口调用细节。
- `src/screens`：页面级移动端界面，保持路由和业务流程清晰。

## API 与数据

- 不在 mobile 内新增 `api` 目录或本地 HTTP client。
- 所有后端请求统一从 `@feed-plan/api-client` 引入，新增接口也先落到该包。
- DTO、请求参数、响应类型优先从 `@feed-plan/api-client` 或 `@feed-plan/shared` 引入，不在页面里重复声明。
- 移动端只做端侧适配：认证 token 存储、Query hooks、页面模型转换。

## 组件放置

- 新组件先查 `src/components` 是否已有可复用实现。
- 只服务单个页面的组件优先放在对应 screen 附近；被多个页面复用后再提升到 `src/components`。
- 真正跨端复用的协议和类型放公共包；React Native 组件不直接抽到 web 侧公共组件。

## 状态与缓存

- 服务器状态使用 `@tanstack/react-query`，query key 与封装函数保持稳定命名。
- 登录 token 使用 Expo SecureStore；普通非敏感偏好才可使用 AsyncStorage。
- 离线持久化缓存只有在明确需要离线浏览或冷启动复用数据时再启用，不默认引入 query persist。

## 验证

- 涉及 mobile 改动后至少运行 `corepack pnpm --filter @feed-plan/mobile typecheck`。
- 修改共享 API 或 DTO 时，同时运行对应 package 的 typecheck。
