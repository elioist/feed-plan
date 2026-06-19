import { Card, Table, Tag, Typography } from 'antd';

const { Paragraph } = Typography;

interface RoleCapability {
  capability: string;
  chef: boolean;
  diner: boolean;
}

const capabilities: RoleCapability[] = [
  { capability: '浏览菜谱、看做法 / 视频', chef: true, diner: true },
  { capability: '点餐 / 加菜（结单前无限加）', chef: true, diner: true },
  { capability: '完成本次点餐（结单锁定）', chef: true, diner: false },
  { capability: '管理菜谱 / 分类 / 做法', chef: true, diner: false },
  { capability: '管理用户与角色', chef: true, diner: false },
];

const yes = <Tag color="green">✓</Tag>;
const no = <Tag>—</Tag>;

export function RoleListPage() {
  return (
    <Card className="art-table-card" title="角色与能力边界">
      <Paragraph type="secondary">
        系统内置 <Tag color="gold">主厨 chef</Tag> 与 <Tag color="blue">食客 diner</Tag>{' '}
        两种角色，角色固定不可新增。如需调整某个用户的角色，请前往「用户管理」修改。
      </Paragraph>
      <Table<RoleCapability>
        rowKey="capability"
        dataSource={capabilities}
        pagination={false}
        columns={[
          { title: '能力', dataIndex: 'capability' },
          {
            title: '主厨 chef',
            width: 140,
            align: 'center',
            render: (_, row) => (row.chef ? yes : no),
          },
          {
            title: '食客 diner',
            width: 140,
            align: 'center',
            render: (_, row) => (row.diner ? yes : no),
          },
        ]}
      />
    </Card>
  );
}
