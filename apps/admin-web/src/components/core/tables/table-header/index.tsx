import { Button, Space, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface TableHeaderProps {
  /** 加载状态 */
  loading?: boolean;
  /** 左侧内容 */
  left?: ReactNode;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 右侧内容 */
  right?: ReactNode;
}

export function TableHeader({
  loading = false,
  left,
  showRefresh = true,
  onRefresh,
  right,
}: TableHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between py-3">
      <div className="flex items-center">
        <Space>{left}</Space>
      </div>
      <div className="flex items-center">
        <Space>
          {showRefresh && (
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
          )}
          {right}
        </Space>
      </div>
    </div>
  );
}
