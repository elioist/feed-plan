import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';

type DataTableParams = Record<string, unknown>;

export type DataTableColumn<RecordType extends Record<string, unknown>> = ProColumns<RecordType>;

type DataTableProps<RecordType extends Record<string, unknown>> = Omit<
  ProTableProps<RecordType, DataTableParams>,
  'cardProps' | 'options' | 'search' | 'tableAlertRender'
>;

export function DataTable<RecordType extends Record<string, unknown>>({
  rowKey,
  ...props
}: DataTableProps<RecordType>) {
  return (
    <ProTable<RecordType, DataTableParams>
      rowKey={rowKey}
      cardProps={false}
      search={false}
      options={false}
      tableAlertRender={false}
      {...props}
    />
  );
}
