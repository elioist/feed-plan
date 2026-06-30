import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createContext, useContext, useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '@feed-plan/shared';
import { IconButton } from '~/components/core/widget/icon-button';
import { DataTable, type DataTableColumn, type DataTableProps } from '../data-table';

type RowKey<RecordType extends Record<string, unknown>> = Extract<keyof RecordType, string>;

type DragHandleContextValue = Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners' | 'setActivatorNodeRef'
> & {
  disabled: boolean;
};

const DragHandleContext = createContext<DragHandleContextValue | null>(null);
const DragTableContext = createContext({ disabled: false });

interface SortableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

function SortableRow({ className, style, ...props }: SortableRowProps) {
  const rowKey = props['data-row-key'];
  const { disabled } = useContext(DragTableContext);
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowKey, disabled });

  const rowStyle: CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 1 } : null),
  };

  const handleContext = useMemo(
    () => ({ attributes, listeners, setActivatorNodeRef, disabled }),
    [attributes, disabled, listeners, setActivatorNodeRef],
  );

  return (
    <DragHandleContext.Provider value={handleContext}>
      <tr
        ref={setNodeRef}
        className={cn(isDragging && 'bg-[var(--hover-color)]', className)}
        style={rowStyle}
        {...props}
      />
    </DragHandleContext.Provider>
  );
}

function DragHandle() {
  const context = useContext(DragHandleContext);

  if (!context) {
    return null;
  }

  return (
    <IconButton
      ref={context.setActivatorNodeRef}
      type="button"
      icon="lucide:grip-vertical"
      className={cn(
        'size-7.5 rounded-md text-base',
        context.disabled
          ? 'cursor-not-allowed text-[var(--gray-400)] opacity-45 hover:bg-transparent'
          : 'cursor-grab text-[var(--gray-500)] hover:bg-[var(--hover-color)] hover:text-[var(--primary-color)] active:cursor-grabbing',
      )}
      disabled={context.disabled}
      aria-label="拖拽排序"
      title="拖拽排序"
      {...context.attributes}
      {...context.listeners}
    />
  );
}

export interface SortableDataTableProps<RecordType extends Record<string, unknown>> extends Omit<
  DataTableProps<RecordType>,
  'columns' | 'components' | 'dataSource' | 'rowKey'
> {
  columns: DataTableColumn<RecordType>[];
  dataSource: RecordType[];
  disabled?: boolean;
  onSortEnd: (items: RecordType[]) => void;
  rowKey: RowKey<RecordType>;
}

export function SortableDataTable<RecordType extends Record<string, unknown>>({
  columns,
  dataSource,
  disabled = false,
  onSortEnd,
  rowKey,
  ...props
}: SortableDataTableProps<RecordType>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemKeys = useMemo(
    () => dataSource.map((item) => String(item[rowKey])),
    [dataSource, rowKey],
  );
  const sortableColumns = useMemo<DataTableColumn<RecordType>[]>(
    () => [
      {
        title: '',
        key: '__sort',
        width: 44,
        align: 'center',
        render: () => <DragHandle />,
      },
      ...columns,
    ],
    [columns],
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (disabled || !over || active.id === over.id) {
      return;
    }

    const oldIndex = itemKeys.indexOf(String(active.id));
    const newIndex = itemKeys.indexOf(String(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onSortEnd(arrayMove(dataSource, oldIndex, newIndex));
  };

  return (
    <DragTableContext.Provider value={{ disabled }}>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemKeys} strategy={verticalListSortingStrategy}>
          <DataTable<RecordType>
            rowKey={rowKey}
            columns={sortableColumns}
            components={{ body: { row: SortableRow } }}
            dataSource={dataSource}
            {...props}
          />
        </SortableContext>
      </DndContext>
    </DragTableContext.Provider>
  );
}
