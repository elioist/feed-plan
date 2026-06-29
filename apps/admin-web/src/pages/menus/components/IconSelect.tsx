import { useMemo, useState } from 'react';
import { Empty, Input, Popover } from 'antd';
import { icons as iconSet } from '@iconify-json/lucide';
import { cn } from '@feed-plan/shared';
import { SvgIcon } from '~/components/core/base/svg-icon';

interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const ICON_PREFIX = 'lucide';

const ICON_OPTIONS = Object.keys(iconSet.icons).map((name) => `${ICON_PREFIX}:${name}`);

export function IconSelect({ value, onChange, disabled }: IconSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const icons = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword
      ? ICON_OPTIONS.filter((name) => name.toLowerCase().includes(keyword))
      : ICON_OPTIONS;
  }, [search]);

  const select = (name: string) => {
    onChange?.(name);
    setOpen(false);
    setTimeout(() => setSearch(''), 150);
  };

  const dropdownContent = (
    <div className="w-100">
      <div className="pb-2">
        <Input
          placeholder="搜索图标"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          size="small"
        />
      </div>

      <div className="h-70 overflow-auto">
        {icons.length > 0 ? (
          <div className="grid grid-cols-10 gap-1">
            {icons.map((name) => (
              <button
                key={name}
                type="button"
                className={cn(
                  'flex size-7.5 cursor-pointer items-center justify-center rounded-md border bg-[var(--default-box-color)] text-[var(--gray-700)] transition-colors hover:bg-[var(--hover-color)]',
                  value === name
                    ? 'border-2 border-[var(--theme-color)] bg-[var(--active-color)] text-[var(--theme-color)]'
                    : 'border-[var(--default-border)]',
                )}
                onClick={() => select(name)}
                onMouseEnter={() => setPreview(name)}
                onMouseLeave={() => setPreview(null)}
                title={name}
              >
                <SvgIcon icon={name} width={16} height={16} />
              </button>
            ))}
          </div>
        ) : (
          <Empty className="p-5" description="暂无图标" />
        )}
      </div>

      {(preview || value) && (
        <div className="mt-1 flex items-center gap-2 border-t border-[var(--default-border)] py-1.5">
          <SvgIcon icon={preview || value!} width={20} height={20} />
          <div>
            <div className="text-[11px] font-medium">{preview || value}</div>
            <div className="text-[10px] text-[var(--gray-500)]">Lucide</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={dropdownContent}
      trigger="click"
      open={open}
      onOpenChange={(visible) => {
        if (!disabled) setOpen(visible);
        if (!visible) setTimeout(() => setSearch(''), 150);
      }}
      placement="bottomLeft"
      arrow={false}
      classNames={{
        root: '[&_.ant-popover-inner]:max-h-[calc(100vh-120px)] [&_.ant-popover-inner]:overflow-auto [&_.ant-popover-inner]:p-3',
      }}
      destroyTooltipOnHide={false}
    >
      <Input
        value={value}
        readOnly
        disabled={disabled}
        placeholder="点击选择图标"
        className={cn(disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        prefix={value ? <SvgIcon icon={value} width={16} height={16} /> : null}
        onClick={(event) => event.preventDefault()}
      />
    </Popover>
  );
}
