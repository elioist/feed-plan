import { BgColorsOutlined, BorderOutlined, FormatPainterOutlined } from '@ant-design/icons';
import { Radio, Space, Switch, Typography } from 'antd';
import { AppConfig } from '~/config';
import { ContainerWidthEnum, SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';

/** 系统外观设置控件，供顶栏抽屉与系统设置页复用 */
export function SettingsControls() {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const setSystemThemeType = useSettingStore((state) => state.setSystemThemeType);
  const setSystemThemeColor = useSettingStore((state) => state.setSystemThemeColor);
  const setBoxBorderMode = useSettingStore((state) => state.setBoxBorderMode);
  const setContainerWidth = useSettingStore((state) => state.setContainerWidth);

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
          <BgColorsOutlined /> 系统主色
        </Typography.Title>
        <Space wrap>
          {AppConfig.systemMainColor.map((color) => (
            <button
              key={color}
              aria-label={'选择主题色 ' + color}
              className={color === systemThemeColor ? 'theme-color-dot active' : 'theme-color-dot'}
              style={{ backgroundColor: color }}
              type="button"
              onClick={() => setSystemThemeColor(color)}
            />
          ))}
        </Space>
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
      </section>
    </>
  );
}
