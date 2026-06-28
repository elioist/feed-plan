import { InputNumber, Select, Switch } from 'antd';
import type { BasicSettingConfig } from '../../hooks/use-settings-config';
import styles from '../../styles.module.scss';

interface SettingItemProps {
  config: BasicSettingConfig;
  onChange: (key: BasicSettingConfig['key'], value: boolean | number | string) => void;
  value: boolean | number | string;
}

export function SettingItem({ config, onChange, value }: SettingItemProps) {
  return (
    <div className={styles.settingItem}>
      <span>{config.label}</span>
      {config.type === 'switch' ? (
        <Switch checked={Boolean(value)} onChange={(checked) => onChange(config.key, checked)} />
      ) : null}
      {config.type === 'number' ? (
        <InputNumber
          value={Number(value)}
          min={config.min}
          max={config.max}
          step={config.step}
          controls
          onChange={(nextValue) => {
            if (typeof nextValue === 'number') onChange(config.key, nextValue);
          }}
        />
      ) : null}
      {config.type === 'select' ? (
        <Select
          value={value}
          className={styles.settingSelect}
          options={config.options}
          onChange={(nextValue) => onChange(config.key, nextValue)}
        />
      ) : null}
    </div>
  );
}
