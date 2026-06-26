## ADDED Requirements

### Requirement: 菜谱列表页

系统 SHALL 提供菜谱列表页，按分类展示所有启用状态的菜谱。列表 SHALL 显示菜谱封面图、名称、难度标签和分类名称。

#### Scenario: 查看菜谱列表
- **WHEN** 用户进入菜谱列表页
- **THEN** 系统调用 `GET /dishes` 获取启用状态的菜谱列表，按分类分组展示

#### Scenario: 按分类筛选
- **WHEN** 用户点击某个分类标签
- **THEN** 系统只显示该分类下的菜谱

#### Scenario: 搜索菜谱
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统过滤显示名称或描述包含关键词的菜谱

### Requirement: 菜谱详情页

系统 SHALL 提供菜谱详情页，展示菜谱完整信息，包括封面图、名称、描述、难度、食材列表、做法步骤和参考链接。

#### Scenario: 查看菜谱详情
- **WHEN** 用户点击某个菜谱卡片
- **THEN** 系统调用 `GET /dishes/:id` 获取详情，展示封面图、名称、描述、难度、食材、做法步骤

#### Scenario: 查看 B 站视频
- **WHEN** 菜谱有 `biliVideo` 字段且用户点击"查看视频"
- **THEN** 系统打开浏览器或内嵌 WebView 展示 B 站视频链接

### Requirement: 菜谱内容展示

系统 SHALL 将 `recipe_content` 字段作为富文本内容展示，支持换行和段落格式。

#### Scenario: 查看菜谱内容
- **WHEN** 菜谱有 `recipe_content` 字段
- **THEN** 系统以富文本格式展示菜谱内容，保留换行和段落
