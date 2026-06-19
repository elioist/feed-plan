# admin-web Specification

## Purpose
TBD - created by archiving change admin-web. Update Purpose after archive.
## Requirements
### Requirement: 管理后台应用骨架

系统 SHALL 提供 PC 管理后台应用 `apps/admin-web`。应用 MUST 使用已确认的 React + Vite + TypeScript + Ant Design + TanStack Router + TanStack Query + ofetch + Zustand 技术栈，并接入 pnpm workspace、Turborepo、共享 TypeScript、ESLint 与 Prettier 配置。应用 MUST 按设计文档中的目录结构搭建，实施前不得改用未经用户确认的前端框架、路由库、请求库或后台模板。

#### Scenario: 管理后台本地启动
- **WHEN** 开发者运行 admin-web 的 dev 脚本
- **THEN** 系统启动 Vite 开发服务器并渲染管理后台入口

#### Scenario: 目录结构符合设计
- **WHEN** 开发者检查 `apps/admin-web/src`
- **THEN** 系统包含 app、layouts、pages、features、shared、styles 等设计文档声明的主要目录

#### Scenario: 技术栈保持用户确认结果
- **WHEN** 开发者检查 admin-web 依赖和配置
- **THEN** 系统使用 React、Vite、TypeScript、Ant Design、TanStack Router、TanStack Query、ofetch、Zustand 和统一 API client

#### Scenario: TanStack Router 与 Query 集成
- **WHEN** 开发者检查 admin-web 路由与数据加载配置
- **THEN** 系统通过 router context 注入 QueryClient，并在 route loader 中使用 ensureQueryData 预取关键页面数据

#### Scenario: Vite 与 Vitest 配置类型正确
- **WHEN** 开发者运行 admin-web TypeScript 检查
- **THEN** `vite.config.ts` 中的 Vite、React、Tailwind 与 Vitest 配置通过类型检查

#### Scenario: 依赖版本集中管理
- **WHEN** 开发者检查 workspace package 依赖
- **THEN** TypeScript、Vitest、Vite、Tailwind、Ant Design、ProComponents 和常用类型依赖通过 pnpm catalogs 管理直接依赖版本

### Requirement: 管理后台认证会话

系统 SHALL 提供登录、退出、会话恢复和受保护路由能力。登录 MUST 调用现有 `POST /auth/login`，登录成功后保存 JWT 并获取当前用户信息；受保护页面 MUST 携带 JWT 访问后端；缺失或失效 JWT MUST 跳转登录页。

#### Scenario: 登录成功进入后台
- **WHEN** 用户在登录页提交正确用户名和密码
- **THEN** 系统保存 accessToken，获取当前用户信息，并进入后台首页

#### Scenario: 登录失败显示错误
- **WHEN** 用户提交错误用户名或密码
- **THEN** 系统停留在登录页并展示登录失败反馈

#### Scenario: 未登录访问受保护页面
- **WHEN** 用户未登录并访问后台受保护路径
- **THEN** 系统跳转登录页

#### Scenario: API 返回 401
- **WHEN** 受保护请求返回 401
- **THEN** 系统清理本地会话并跳转登录页

#### Scenario: 刷新页面恢复当前用户
- **WHEN** 已登录用户刷新后台页面
- **THEN** 系统使用本地 accessToken 调用当前用户接口，恢复右上角当前用户信息

### Requirement: 后台布局与导航

系统 SHALL 提供 PC 后台布局，包含侧边导航、顶部当前用户信息、退出入口和内容区域。导航 MUST 至少包含首页、分类管理、菜谱管理、点菜菜单。管理类入口 MUST 面向 `chef` 使用。侧边导航与顶部栏 MUST 在页面滚动时保持固定，只有主内容区滚动。

#### Scenario: 登录后显示后台布局
- **WHEN** 已登录用户进入后台
- **THEN** 系统显示侧边导航、顶部用户信息和当前页面内容

#### Scenario: 用户退出登录
- **WHEN** 用户点击退出
- **THEN** 系统清理 accessToken 并跳转登录页

#### Scenario: 导航切换页面
- **WHEN** 用户点击分类管理、菜谱管理或点菜菜单导航项
- **THEN** 系统切换到对应页面且不刷新整个浏览器页面

#### Scenario: 内容滚动不带动导航
- **WHEN** 当前页面内容高度超过视口并滚动
- **THEN** 系统保持侧边导航和顶部栏固定，仅滚动内容区域

#### Scenario: 页面具备 Pro 风格导航上下文
- **WHEN** 用户进入后台管理页面
- **THEN** 系统显示图标菜单、面包屑、页面卡片容器、可选页签和回到顶部入口

#### Scenario: 主题切换
- **WHEN** 用户切换浅色或深色主题
- **THEN** 系统更新 Ant Design token 与页面主题状态，并在刷新后保持用户选择

### Requirement: 分类管理页面

系统 SHALL 提供分类管理页面。页面 MUST 展示分类列表，并允许 `chef` 创建、编辑、删除分类；操作成功后 MUST 刷新分类列表。后端返回校验错误、权限错误或冲突错误时 MUST 给出可见反馈。

#### Scenario: 查看分类列表
- **WHEN** 主厨进入分类管理页面
- **THEN** 系统展示按后端顺序返回的分类列表

#### Scenario: 创建分类
- **WHEN** 主厨提交合法分类名称与排序值
- **THEN** 系统创建分类并刷新列表

#### Scenario: 删除被引用分类失败
- **WHEN** 主厨删除仍被菜谱引用的分类
- **THEN** 系统展示冲突错误且列表数据保持可刷新

### Requirement: 菜谱与做法管理页面

系统 SHALL 提供菜谱管理页面。页面 MUST 支持菜谱列表、按分类筛选、关键词搜索、创建、编辑、启用/停用菜谱。创建与编辑 SHOULD 在菜谱列表页通过抽屉完成，不应默认跳转到独立页面。菜谱表单 MUST 支持基础信息、封面上传、参考链接和单一“菜谱内容”富文本字段；参考链接 UI 文案 MUST 不限定为 B 站视频，允许填写 B 站、抖音或其他参考 URL。菜谱内容 SHOULD 使用富文本编辑器承载食材、做法和备注，避免要求主厨逐项填写克数或逐步拆分。难度 MUST 在 UI 中以中文展示。

#### Scenario: 查看与筛选菜谱
- **WHEN** 主厨进入菜谱管理页面并选择分类或输入关键词
- **THEN** 系统展示匹配条件的菜谱列表

#### Scenario: 创建菜谱含富文本内容
- **WHEN** 主厨在菜谱列表打开创建抽屉并提交合法菜谱基础信息和菜谱内容
- **THEN** 系统创建菜谱，关闭抽屉，并刷新菜谱列表

#### Scenario: 编辑菜谱做法步骤
- **WHEN** 主厨在菜谱列表打开编辑抽屉，修改菜谱内容并保存
- **THEN** 系统调用后端更新菜谱，关闭抽屉，并刷新菜谱列表

#### Scenario: 参考链接不限平台
- **WHEN** 主厨填写菜谱参考链接
- **THEN** 系统使用“参考链接”文案展示该字段，且不要求链接来自 B 站

#### Scenario: 菜谱内容使用单一富文本录入
- **WHEN** 主厨编辑菜谱内容
- **THEN** 系统提供单一富文本编辑体验，允许在同一字段中输入食材、做法和备注，而不是强制逐项填写克数或逐步拆分

#### Scenario: 上传封面图
- **WHEN** 主厨在菜谱抽屉中上传合法封面图片
- **THEN** 系统将图片上传到后端，使用返回的可访问路径填充 coverImage，并在表单中展示预览

#### Scenario: 拖动上传封面图
- **WHEN** 主厨将合法图片拖入封面上传区域
- **THEN** 系统上传图片、展示上传状态和图片预览，并允许移除或重新上传

#### Scenario: 难度中文展示
- **WHEN** 系统在菜谱表格或表单展示 difficulty
- **THEN** 系统将 easy、medium、hard 分别展示为简单、中等、困难

#### Scenario: 停用菜谱
- **WHEN** 主厨在菜谱列表停用某个菜谱
- **THEN** 系统更新该菜谱状态并刷新列表

#### Scenario: 菜谱标签与忌口
- **WHEN** 主厨创建或编辑菜谱
- **THEN** 系统允许维护菜谱标签和常见忌口项，包括香菜、折耳根、葱等

#### Scenario: 查询与重置
- **WHEN** 主厨在菜谱列表输入筛选条件
- **THEN** 系统提供查询和重置按钮，查询结果与 URL search 同步

#### Scenario: 完整分页
- **WHEN** 菜谱、分类或菜单列表超过一页
- **THEN** 系统提供页码、每页条数切换、总数展示和快速跳转能力

### Requirement: 用户与系统管理页面

系统 SHALL 提供用户管理、角色管理、系统设置和主题设置入口。仅 chef 可以访问管理能力。用户管理 MUST 支持查看用户列表和维护用户角色；角色管理 MUST 展示系统支持的 chef 与 diner 角色及其能力边界；系统设置 MUST 至少包含主题切换。

#### Scenario: 查看用户管理
- **WHEN** chef 进入用户管理页面
- **THEN** 系统展示用户列表、角色信息和可用操作

#### Scenario: 食客不能管理用户
- **WHEN** diner 访问用户或角色管理页面
- **THEN** 系统拒绝访问或隐藏管理入口

#### Scenario: 查看角色能力
- **WHEN** chef 进入角色管理页面
- **THEN** 系统展示 chef 与 diner 的权限说明

### Requirement: 点菜菜单查看页面

系统 SHALL 提供点菜菜单查看页面。页面 MUST 支持查看今日菜单、按日期/餐型/状态筛选 meal、查看 meal 详情、订单明细和按菜品聚合的菜单项。首版后台 MAY 提供主厨结单入口，但 MUST 使用现有 `PATCH /meals/:id/complete` API 并展示 completed 锁定状态。

#### Scenario: 查看今日菜单
- **WHEN** 主厨进入点菜菜单页面
- **THEN** 系统默认展示今日相关 meals 与菜单摘要

#### Scenario: 按条件筛选菜单
- **WHEN** 主厨选择日期、餐型或状态筛选条件
- **THEN** 系统展示匹配条件的 meals

#### Scenario: 查看菜单详情
- **WHEN** 主厨打开某个 meal 详情
- **THEN** 系统展示 meal 信息、订单明细、按菜品聚合的 totalQuantity 和点单人拆分数量

#### Scenario: 完成本次点餐
- **WHEN** 主厨在 ordering meal 上触发完成点餐并确认
- **THEN** 系统调用完成 meal API，成功后展示 completed 状态并禁止重复完成

### Requirement: 管理后台验证与文档

系统 SHALL 为 admin-web 提供基础测试和本地开发说明。应用 MUST 能通过格式检查、ESLint、TypeScript 检查、测试和构建；README MUST 说明后台启动方式、API base URL 配置和登录验证路径。

#### Scenario: 管理后台质量检查
- **WHEN** 开发者运行仓库级 format、lint、typecheck、test 和 build 脚本
- **THEN** admin-web 参与检查并全部通过

#### Scenario: 阅读本地开发说明
- **WHEN** 开发者阅读 README
- **THEN** 文档包含 admin-web 的启动命令、环境变量和登录后台的基本步骤

