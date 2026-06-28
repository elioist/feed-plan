import { useState, useEffect } from 'react';
import { Input, Popover, Empty, Checkbox } from 'antd';
import { Icon } from '@iconify/react';

interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const LUCIDE_PREFIX = 'lucide';

const COLLECTIONS = [
  { prefix: LUCIDE_PREFIX, label: 'Lucide' },
  { prefix: 'mdi', label: 'Material Design' },
  { prefix: 'heroicons', label: 'Heroicons' },
  { prefix: 'tabler', label: 'Tabler' },
  { prefix: 'solar', label: 'Solar' },
  { prefix: 'ph', label: 'Phosphor' },
  { prefix: 'iconamoon', label: 'Iconamoon' },
  { prefix: 'mingcute', label: 'Mingcute' },
  { prefix: 'fluent', label: 'Fluent UI' },
  { prefix: 'ep', label: 'Element Plus' },
  { prefix: 'ant-design', label: 'Ant Design' },
  { prefix: 'bi', label: 'Bootstrap' },
  { prefix: 'ri', label: 'Remix Icon' },
];

const QUICK_ICONS = [
  'lucide:layout-dashboard',
  'lucide:book-open',
  'lucide:layout-grid',
  'lucide:cooking-pot',
  'lucide:tags',
  'lucide:utensils',
  'lucide:settings',
  'lucide:users',
  'lucide:shield-check',
  'lucide:menu',
  'lucide:home',
  'lucide:user',
  'lucide:bell',
  'lucide:search',
  'lucide:heart',
  'lucide:star',
  'lucide:shopping-cart',
  'lucide:mail',
  'lucide:phone',
  'lucide:calendar',
  'lucide:clock',
  'lucide:camera',
  'lucide:image',
  'lucide:file',
  'lucide:folder',
  'lucide:download',
  'lucide:upload',
  'lucide:trash',
  'lucide:pencil',
  'lucide:plus',
  'lucide:minus',
  'lucide:check',
  'lucide:x',
  'lucide:chevron-left',
  'lucide:chevron-right',
  'lucide:chevron-down',
  'lucide:filter',
  'lucide:refresh-cw',
];

const memoryCache = new Map<string, string[]>();

async function fetchCollectionIcons(prefix: string): Promise<string[]> {
  const cached = memoryCache.get(prefix);
  if (cached) return cached;
  try {
    const resp = await fetch(`https://api.iconify.design/collection?prefix=${prefix}`);
    const data = await resp.json();
    const icons: string[] = [];
    if (data.uncategorized && Array.isArray(data.uncategorized)) {
      for (const name of data.uncategorized) icons.push(`${prefix}:${name}`);
    }
    if (data.categories && typeof data.categories === 'object') {
      for (const v of Object.values(data.categories)) {
        if (Array.isArray(v)) for (const name of v) icons.push(`${prefix}:${name}`);
      }
    }
    if (icons.length > 0) memoryCache.set(prefix, icons);
    return icons;
  } catch { return []; }
}

async function searchAllIcons(query: string): Promise<string[]> {
  const cacheKey = `_s_${query}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;
  try {
    const resp = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=80`);
    const data = await resp.json();
    const icons = (data.icons ?? []) as string[];
    if (icons.length > 0) memoryCache.set(cacheKey, icons);
    return icons;
  } catch {
    return [];
  }
}

export function IconSelect({ value, onChange, disabled }: IconSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCol, setActiveCol] = useState(LUCIDE_PREFIX);
  const [loading, setLoading] = useState(false);
  const [icons, setIcons] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [searchInCol, setSearchInCol] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      if (search && !searchInCol) {
        setLoading(true);
        const result = await searchAllIcons(search);
        if (!cancelled) {
          setIcons(result);
          setLoading(false);
        }
        return;
      }

      let all = memoryCache.get(activeCol);
      if (!all) {
        setLoading(true);
        all = await fetchCollectionIcons(activeCol);
      }

      const keyword = search.trim().toLowerCase();
      const filtered = keyword ? all.filter((name) => name.toLowerCase().includes(keyword)) : all;
      if (!cancelled) {
        setIcons(filtered);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, search, activeCol, searchInCol]);

  const select = (name: string) => { onChange?.(name); setOpen(false); setTimeout(() => setSearch(''), 150); };

  const dropdownContent = (
    <div style={{ width: 400 }}>
      <div style={{ padding: '0 0 8px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Input placeholder="搜索图标" value={search} onChange={(e) => setSearch(e.target.value)} allowClear size="small" style={{ flex: 1 }} />
          <Checkbox checked={searchInCol} onChange={(e) => setSearchInCol(e.target.checked)} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            仅当前集
          </Checkbox>
        </div>
      </div>

      {!search && (
        <div style={{ padding: '4px 0 6px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>常用</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {QUICK_ICONS.map((icon) => (
              <div key={icon} onClick={() => select(icon)} title={icon}
                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, cursor: 'pointer', border: value === icon ? '2px solid #1677ff' : '1px solid #f0f0f0', background: value === icon ? '#e6f4ff' : '#fafafa' }}>
                <Icon icon={icon} width={14} height={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: 280 }}>
        {!search && (
          <div style={{ width: 110, borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
            {COLLECTIONS.map((col) => (
              <div key={col.prefix} onClick={() => setActiveCol(col.prefix)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', cursor: 'pointer', fontSize: 11, background: activeCol === col.prefix ? '#e6f4ff' : 'transparent', color: activeCol === col.prefix ? '#1677ff' : '#666' }}>
                <Icon icon={`${col.prefix}:home`} width={12} height={12} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 4px 8px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 6, background: '#f5f5f5' }} />
              ))}
            </div>
          ) : icons.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
              {icons.map((name) => (
                <div key={name} onClick={() => select(name)}
                  onMouseEnter={() => setPreview(name)} onMouseLeave={() => setPreview(null)}
                  title={name}
                  style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', border: value === name ? '2px solid #1677ff' : '1px solid #f0f0f0', background: value === name ? '#e6f4ff' : '#fff' }}>
                  <Icon icon={name} width={16} height={16} />
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无图标" style={{ padding: 20 }} />
          )}
        </div>
      </div>

      {(preview || value) && (
        <div style={{ padding: '6px 0', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Icon icon={preview || value!} width={20} height={20} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 500 }}>{preview || value}</div>
            <div style={{ fontSize: 10, color: '#999' }}>Iconify</div>
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
      onOpenChange={(v) => { if (!disabled) setOpen(v); if (!v) setTimeout(() => setSearch(''), 150); }}
      placement="bottomLeft"
      arrow={false}
      overlayInnerStyle={{ padding: 12, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}
      destroyTooltipOnHide={false}
    >
      <Input
        value={value}
        readOnly
        disabled={disabled}
        placeholder="点击选择图标"
        prefix={value ? <Icon icon={value} width={16} height={16} /> : null}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={(e) => e.preventDefault()}
      />
    </Popover>
  );
}
