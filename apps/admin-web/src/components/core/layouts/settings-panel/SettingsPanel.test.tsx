import { App as AntdApp } from 'antd';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsPanelContent } from '~/components/core/layouts/settings-panel';

describe('SettingsPanelContent', () => {
  it('renders settings sections without recursive store updates', () => {
    render(
      <AntdApp>
        <SettingsPanelContent />
      </AntdApp>,
    );

    expect(screen.getByText('主题风格')).toBeInTheDocument();
    expect(screen.getByText('基础配置')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制配置' })).toBeInTheDocument();
  });
});
