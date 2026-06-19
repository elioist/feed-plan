import { Button, Drawer } from 'antd';
import { useSettingStore } from '~/store/modules/setting';
import { SettingsControls } from './SettingsControls';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const resetSettings = useSettingStore((state) => state.resetSettings);

  return (
    <Drawer
      title="系统设置"
      open={open}
      size={330}
      onClose={onClose}
      destroyOnHidden
      className="settings-panel"
      extra={<Button onClick={resetSettings}>重置</Button>}
    >
      <SettingsControls />
    </Drawer>
  );
}
