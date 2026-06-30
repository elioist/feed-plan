import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';

type DataTableParams = Record<string, unknown>;

export type DataTableColumn<RecordType extends Record<string, unknown>> = ProColumns<RecordType>;

export type DataTableProps<RecordType extends Record<string, unknown>> = Omit<
  ProTableProps<RecordType, DataTableParams>,
  'cardProps' | 'options' | 'search' | 'tableAlertRender'
>;

export function DataTable<RecordType extends Record<string, unknown>>({
  rowKey,
  pagination,
  ...props
}: DataTableProps<RecordType>) {
  return (
    <ProTable<RecordType, DataTableParams>
      rowKey={rowKey}
      cardProps={false}
      search={false}
      options={false}
      tableAlertRender={false}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        ...pagination,
      }}
      {...props}
    />
  );
}
