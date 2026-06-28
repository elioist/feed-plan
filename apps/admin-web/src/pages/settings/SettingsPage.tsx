import { Button, Card } from 'antd';
import { SettingsControls } from '~/components/core/layouts/settings-panel/settings-controls';
import { useSettingStore } from '~/store/modules/setting';

export function SettingsPage() {
  const resetSettings = useSettingStore((state) => state.resetSettings);

  return (
    <Card
      className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)] settings-panel"
      title="系统设置"
      extra={<Button onClick={resetSettings}>重置</Button>}
    >
      <SettingsControls />
    </Card>
  );
}
