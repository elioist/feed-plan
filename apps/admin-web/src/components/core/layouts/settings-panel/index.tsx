import { SettingDrawer } from './widget/setting-drawer';
import { SettingHeader } from './widget/setting-header';
import { SettingsPanelContent } from './widget/settings-panel-content';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  return (
    <SettingDrawer open={open} onClose={onClose}>
      <SettingHeader onClose={onClose} />
      <SettingsPanelContent />
    </SettingDrawer>
  );
}

export { SettingsPanelContent } from './widget/settings-panel-content';
