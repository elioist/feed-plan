export interface HeaderBarFeatureConfigItem {
  enabled: boolean;
  description: string;
}

export interface HeaderBarFeatureConfig {
  menuButton: HeaderBarFeatureConfigItem;
  refreshButton: HeaderBarFeatureConfigItem;
  fastEnter: HeaderBarFeatureConfigItem;
  breadcrumb: HeaderBarFeatureConfigItem;
  globalSearch: HeaderBarFeatureConfigItem;
  fullscreen: HeaderBarFeatureConfigItem;
  notification: HeaderBarFeatureConfigItem;
  chat: HeaderBarFeatureConfigItem;
  language: HeaderBarFeatureConfigItem;
  settings: HeaderBarFeatureConfigItem;
  themeToggle: HeaderBarFeatureConfigItem;
}

export const headerBarConfig: HeaderBarFeatureConfig = {
  menuButton: {
    enabled: true,
    description: '控制左侧菜单展开与收起',
  },
  refreshButton: {
    enabled: true,
    description: '刷新当前页面',
  },
  fastEnter: {
    enabled: true,
    description: '常用入口',
  },
  breadcrumb: {
    enabled: true,
    description: '展示当前页面路径',
  },
  globalSearch: {
    enabled: true,
    description: '全局搜索入口',
  },
  fullscreen: {
    enabled: true,
    description: '全屏切换',
  },
  notification: {
    enabled: true,
    description: '通知中心',
  },
  chat: {
    enabled: true,
    description: '即时沟通入口',
  },
  language: {
    enabled: true,
    description: '语言切换',
  },
  settings: {
    enabled: true,
    description: '系统设置面板',
  },
  themeToggle: {
    enabled: true,
    description: '浅色与深色主题切换',
  },
};
