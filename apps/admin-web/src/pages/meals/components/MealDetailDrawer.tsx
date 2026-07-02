import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { formatDateTime, type MenuDetail, type MealType } from '@feed-plan/shared';
import { Badge, Button, Descriptions, Drawer, Image, Popconfirm, Statistic, Tag, Typography } from 'antd';
import { api } from '~/lib/api-client';

const { Text, Title } = Typography;

const mealTypeMap: Record<MealType, { label: string; color: string }> = {
  breakfast: { label: '早餐', color: 'gold' },
  lunch: { label: '午餐', color: 'orange' },
  dinner: { label: '晚餐', color: 'purple' },
};

const getRequesterName = (quantity: MenuDetail['items'][number]['quantities'][number]) =>
  quantity.username ?? quantity.guestName ?? '未知食客';

const getStatusView = (status: MenuDetail['meal']['status']) =>
  status === 'ordering' ? (
    <Badge status="processing" text="点菜中" />
  ) : (
    <Badge status="success" text="已完成" />
  );

const getTotalQuantity = (meal: MenuDetail) =>
  meal.items.reduce((total, item) => total + item.totalQuantity, 0);

const getParticipantCount = (meal: MenuDetail) => {
  const names = new Set<string>();
  meal.items.forEach((item) => {
    item.quantities.forEach((quantity) => {
      names.add(getRequesterName(quantity));
    });
  });
  return names.size;
};

const getMealTitle = (meal: MenuDetail) => {
  const type = mealTypeMap[meal.meal.mealType].label;
  return `${formatDateTime(meal.meal.createdAt) ?? '-'} · ${type}`;
};

const DishCover = ({ dish }: { dish: MenuDetail['items'][number]['dish'] }) => {
  const imageUrl = api.getImageUrl(dish.coverImage);

  return (
    <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--card-border) bg-[var(--hover-color)]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={dish.name}
          width={72}
          height={72}
          preview={false}
          className="object-cover"
        />
      ) : (
        <span className="text-xl font-semibold text-[var(--gray-500)]">
          {dish.name.slice(0, 1)}
        </span>
      )}
    </div>
  );
};

interface MealDetailDrawerProps {
  canComplete: boolean;
  completeLoading: boolean;
  meal: MenuDetail | null;
  onClose: () => void;
  onComplete: (mealId: string) => void;
}

export function MealDetailDrawer({
  canComplete,
  completeLoading,
  meal,
  onClose,
  onComplete,
}: MealDetailDrawerProps) {
  const open = Boolean(meal);

  return (
    <Drawer
      open={open}
      size="720px"
      destroyOnHidden
      title={
        <div className="min-w-0 pr-4">
          <div className="mb-1.5 flex items-center gap-2">
            {meal ? getStatusView(meal.meal.status) : null}
            {meal ? (
              <Tag color={mealTypeMap[meal.meal.mealType].color} className="m-0">
                {mealTypeMap[meal.meal.mealType].label}
              </Tag>
            ) : null}
          </div>
          <Title level={4} className="!m-0 truncate">
            {meal ? getMealTitle(meal) : '点餐详情'}
          </Title>
          <Text type="secondary" className="mt-1 block text-xs">
            {meal?.meal.title ?? '检查菜品、份数和点单人，不离开列表完成结单'}
          </Text>
        </div>
      }
      extra={
        meal && canComplete ? (
          <Popconfirm
            title="完成点餐"
            description="完成后本场点餐会锁定，确认继续？"
            disabled={meal.meal.status === 'completed'}
            okText="完成"
            cancelText="取消"
            onConfirm={() => onComplete(meal.meal.id)}
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={meal.meal.status === 'completed'}
              loading={completeLoading}
            >
              完成本次点餐
            </Button>
          </Popconfirm>
        ) : null
      }
      styles={{
        body: { padding: 0, background: 'var(--main-bg-color)' },
        header: { borderBottom: '1px solid var(--card-border)', paddingTop: 20, paddingBottom: 18 },
      }}
      onClose={onClose}
    >
      {meal ? (
        <div className="flex h-full flex-col">
          <section className="border-b border-(--card-border) bg-(--default-box-color) px-6 py-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-(--card-border) bg-(--main-bg-color) px-4 py-4">
                <Statistic title="菜品数量" value={meal.items.length} suffix="道" />
              </div>
              <div className="rounded-lg border border-(--card-border) bg-(--main-bg-color) px-4 py-4">
                <Statistic title="总份数" value={getTotalQuantity(meal)} suffix="份" />
              </div>
              <div className="rounded-lg border border-(--card-border) bg-(--main-bg-color) px-4 py-4">
                <Statistic title="点单人" value={getParticipantCount(meal)} suffix="位" />
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-(--card-border) bg-(--main-bg-color) px-4 py-3.5">
              <Descriptions
                column={2}
                size="small"
                items={[
                  { key: 'created', label: '开单时间', children: formatDateTime(meal.meal.createdAt) ?? '-' },
                  {
                    key: 'type',
                    label: '餐型',
                    children: mealTypeMap[meal.meal.mealType].label,
                  },
                  {
                    key: 'kind',
                    label: '类型',
                    children: meal.meal.type === 'daily' ? '日常点餐' : '聚餐点餐',
                  },
                  {
                    key: 'completed',
                    label: '完成时间',
                    children: meal.meal.completedAt ? (
                      formatDateTime(meal.meal.completedAt) ?? '-'
                    ) : (
                      <Text type="secondary">尚未完成</Text>
                    ),
                  },
                ]}
              />
            </div>
          </section>

          <section className="flex-1 overflow-auto px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Title level={5} className="!m-0">
                  菜品明细
                </Title>
                <Text type="secondary" className="text-xs">
                  按菜品汇总份数，并展示每位食客的点单数量
                </Text>
              </div>
              {meal.meal.status === 'ordering' ? (
                <Tag icon={<ClockCircleOutlined />} color="processing">
                  等待结单
                </Tag>
              ) : null}
            </div>

            <div className="space-y-3">
              {meal.items.length > 0 ? (
                meal.items.map((item) => (
                  <article
                    key={item.dish.id}
                    className="rounded-lg border border-(--card-border) bg-(--default-box-color) p-4"
                  >
                    <div className="flex gap-4">
                      <DishCover dish={item.dish} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Text strong className="block text-base">
                              {item.dish.name}
                            </Text>
                            <Text type="secondary" className="mt-0.5 block truncate text-xs">
                              {item.dish.description || '暂无菜品描述'}
                            </Text>
                          </div>
                          <div className="shrink-0 rounded-md bg-[var(--active-color)] px-3 py-1 text-sm font-medium text-[var(--theme-color)]">
                            {item.totalQuantity} 份
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.quantities.length > 0 ? (
                            item.quantities.map((quantity, index) => (
                              <span
                                key={`${item.dish.id}-${quantity.userId ?? quantity.guestName ?? quantity.username ?? index}`}
                                className="rounded-full bg-[var(--hover-color)] px-2.5 py-1 text-xs text-[var(--gray-800)]"
                              >
                                {getRequesterName(quantity)} × {quantity.quantity}
                              </span>
                            ))
                          ) : (
                            <Text type="secondary" className="text-xs">
                              暂无点单人明细
                            </Text>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-(--default-border-dashed) bg-(--default-box-color) p-8 text-center text-[var(--gray-500)]">
                  这一单还没有菜品
                </div>
              )}
            </div>

            {meal.orders.some((order) => order.note) ? (
              <div className="mt-2 rounded-lg border border-dashed border-(--default-border-dashed) bg-(--default-box-color) p-4">
                <Text strong>备注</Text>
                <div className="mt-2 space-y-2">
                  {meal.orders
                    .filter((order) => order.note)
                    .map((order) => (
                      <div key={order.id} className="text-sm text-[var(--gray-700)]">
                        <span className="font-medium">
                          {order.username ?? order.guestName ?? '未知食客'}
                        </span>
                        <span className="ml-2 text-xs text-[var(--gray-500)]">
                          {formatDateTime(order.createdAt) ?? '-'}
                        </span>
                        <div className="mt-1">{order.note}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
