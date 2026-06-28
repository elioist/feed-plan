import {
  AppstoreOutlined,
  BgColorsOutlined,
  BorderOutlined,
  FormatPainterOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { Radio, Slider, Space, Switch, Typography } from 'antd';
import { AppConfig } from '~/config';
import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { cn } from '@feed-plan/shared';
import './styles.css';

const tabStyleOptions = [
  { label: '灵动', value: 'tab-google' },
  { label: '卡片', value: 'tab-card' },
  { label: '简约', value: 'tab-simple' },
];

/** 系统外观设置控件，供顶栏抽屉与系统设置页复用 */
export function SettingsControls() {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const menuType = useSettingStore((state) => state.menuType);
  const menuThemeType = useSettingStore((state) => state.menuThemeType);
  const tabStyle = useSettingStore((state) => state.tabStyle);
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const customRadius = useSettingStore((state) => state.customRadius);
  const showWorkTab = useSettingStore((state) => state.showWorkTab);
  const showMenuButton = useSettingStore((state) => state.showMenuButton);
  const showRefreshButton = useSettingStore((state) => state.showRefreshButton);
  const showFastEnter = useSettingStore((state) => state.showFastEnter);
  const showCrumbs = useSettingStore((state) => state.showCrumbs);
  const showLanguage = useSettingStore((state) => state.showLanguage);
  const setSystemThemeType = useSettingStore((state) => state.setSystemThemeType);
  const setSystemThemeColor = useSettingStore((state) => state.setSystemThemeColor);
  const setMenuType = useSettingStore((state) => state.setMenuType);
  const setMenuThemeType = useSettingStore((state) => state.setMenuThemeType);
  const setTabStyle = useSettingStore((state) => state.setTabStyle);
  const setBoxBorderMode = useSettingStore((state) => state.setBoxBorderMode);
  const setContainerWidth = useSettingStore((state) => state.setContainerWidth);
  const setCustomRadius = useSettingStore((state) => state.setCustomRadius);
  const setShowWorkTab = useSettingStore((state) => state.setShowWorkTab);
  const setShowMenuButton = useSettingStore((state) => state.setShowMenuButton);
  const setShowRefreshButton = useSettingStore((state) => state.setShowRefreshButton);
  const setShowFastEnter = useSettingStore((state) => state.setShowFastEnter);
  const setShowCrumbs = useSettingStore((state) => state.setShowCrumbs);
  const setShowLanguage = useSettingStore((state) => state.setShowLanguage);

  return (
    <>
      <section className="setting-section">
        <Typography.Title level={5}>
          <FormatPainterOutlined /> 主题模式
        </Typography.Title>
        <Radio.Group
          value={systemThemeType}
          buttonStyle="solid"
          onChange={(event) => setSystemThemeType(event.target.value as SystemThemeEnum)}
        >
          <Radio.Button value={SystemThemeEnum.LIGHT}>Light</Radio.Button>
          <Radio.Button value={SystemThemeEnum.DARK}>Dark</Radio.Button>
        </Radio.Group>
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <AppstoreOutlined /> 菜单布局
        </Typography.Title>
        <Radio.Group
          value={menuType}
          optionType="button"
          buttonStyle="solid"
          onChange={(event) => setMenuType(event.target.value as MenuTypeEnum)}
          options={AppConfig.menuLayoutList.map((item) => ({
            label: item.name,
            value: item.value,
          }))}
        />
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <BgColorsOutlined /> 菜单风格
        </Typography.Title>
        <Radio.Group
          value={menuThemeType === MenuThemeEnum.DARK ? MenuThemeEnum.DARK : MenuThemeEnum.DESIGN}
          buttonStyle="solid"
          onChange={(event) => setMenuThemeType(event.target.value as MenuThemeEnum)}
        >
          <Radio.Button value={MenuThemeEnum.DESIGN}>浅色</Radio.Button>
          <Radio.Button value={MenuThemeEnum.DARK}>深色</Radio.Button>
        </Radio.Group>
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <BgColorsOutlined /> 系统主色
        </Typography.Title>
        <Space wrap>
          {AppConfig.systemMainColor.map((color) => (
            <button
              key={color}
              aria-label={'选择主题色 ' + color}
              className={cn('theme-color-dot', color === systemThemeColor && 'active')}
              style={{ backgroundColor: color }}
              type="button"
              onClick={() => setSystemThemeColor(color)}
            />
          ))}
        </Space>
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <ProfileOutlined /> 标签页风格
        </Typography.Title>
        <Radio.Group
          value={tabStyle}
          optionType="button"
          buttonStyle="solid"
          onChange={(event) => setTabStyle(event.target.value as string)}
          options={tabStyleOptions}
        />
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <BorderOutlined /> 界面显示
        </Typography.Title>
        <div className="setting-row">
          <span>盒子边框模式</span>
          <Switch checked={boxBorderMode} onChange={setBoxBorderMode} />
        </div>
        <div className="setting-row">
          <span>内容固定宽度</span>
          <Switch
            checked={containerWidth === ContainerWidthEnum.BOXED}
            onChange={(checked) =>
              setContainerWidth(checked ? ContainerWidthEnum.BOXED : ContainerWidthEnum.FULL)
            }
          />
        </div>
        <div className="setting-row">
          <span>显示多标签页</span>
          <Switch checked={showWorkTab} onChange={setShowWorkTab} />
        </div>
        <div className="setting-row">
          <span>折叠菜单按钮</span>
          <Switch checked={showMenuButton} onChange={setShowMenuButton} />
        </div>
        <div className="setting-row">
          <span>刷新按钮</span>
          <Switch checked={showRefreshButton} onChange={setShowRefreshButton} />
        </div>
        <div className="setting-row">
          <span>快速入口</span>
          <Switch checked={showFastEnter} onChange={setShowFastEnter} />
        </div>
        <div className="setting-row">
          <span>面包屑</span>
          <Switch checked={showCrumbs} onChange={setShowCrumbs} />
        </div>
        <div className="setting-row">
          <span>语言切换</span>
          <Switch checked={showLanguage} onChange={setShowLanguage} />
        </div>
      </section>

      <section className="setting-section">
        <Typography.Title level={5}>
          <BorderOutlined /> 圆角
        </Typography.Title>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={customRadius}
          tooltip={{ formatter: (value) => `${value}rem` }}
          onChange={setCustomRadius}
        />
      </section>
    </>
  );
}
