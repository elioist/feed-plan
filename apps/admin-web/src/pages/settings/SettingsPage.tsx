import { Button, Card } from 'antd';
import { SettingsControls } from '~/components/core/layouts/settings-panel/SettingsControls';
import { useSettingStore } from '~/store/modules/setting';

export function SettingsPage() {
  const resetSettings = useSettingStore((state) => state.resetSettings);

  return (
    <Card
      className="art-table-card settings-panel"
      title="系统设置"
      extra={<Button onClick={resetSettings}>重置</Button>}
    >
      <SettingsControls />
    </Card>
  );
}
