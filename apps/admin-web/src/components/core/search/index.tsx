import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { FormInstance } from 'antd';
import styles from './styles.module.scss';

export interface SearchFormItem {
  /** 表单项字段名 */
  name: string;
  /** 表单项标签 */
  label?: string;
  /** 表单项类型 */
  type: 'input' | 'search' | 'select' | 'date' | 'dateRange';
  /** 占位符 */
  placeholder?: string | [string, string];
  /** 输入框最大长度 */
  maxLength?: number;
  /** 下拉选项（select 类型） */
  options?: Array<{ label: string; value: string | number | boolean }>;
  /** 样式宽度 */
  width?: number | string;
  /** 是否允许清除 */
  allowClear?: boolean;
  /** 栅格占据列数 */
  span?: number;
}

export interface SearchBarProps {
  /** 表单实例 */
  form: FormInstance;
  /** 表单项配置 */
  items: SearchFormItem[];
  /** 查询回调 */
  onSearch: (values: Record<string, unknown>) => void;
  /** 重置回调 */
  onReset: () => void;
  /** 查询按钮文本 */
  searchButtonText?: string;
  /** 重置按钮文本 */
  resetButtonText?: string;
  /** 初始值 */
  initialValues?: Record<string, unknown>;
  /** 每行显示的表单项数量 */
  itemsPerRow?: number;
  /** 是否显示展开/收起 */
  showExpand?: boolean;
  /** 默认展开 */
  defaultExpanded?: boolean;
}

export function SearchBar({
  form,
  items,
  onSearch,
  onReset,
  searchButtonText = '查询',
  resetButtonText = '重置',
  initialValues,
  itemsPerRow = 3,
  showExpand = true,
  defaultExpanded = false,
}: SearchBarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const getTextPlaceholder = (placeholder: SearchFormItem['placeholder']) =>
    typeof placeholder === 'string' ? placeholder : undefined;
  const labelCol = {
    flex: '72px',
    style: { paddingBottom: 0, textAlign: 'right' as const },
  };
  const wrapperCol = { flex: '1 1 0' };

  // 计算每列宽度
  const colSpan = Math.floor(24 / (itemsPerRow + 1));

  // 按钮列占固定宽度
  const actionSpan = colSpan;

  // 搜索项每列宽度（去掉按钮列）
  const itemSpan = Math.floor(24 / (itemsPerRow + 1));

  const handleSearch = () => {
    form.validateFields().then(onSearch);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 分成第一行和第二行
  const firstRowItems = showExpand && !expanded ? items.slice(0, itemsPerRow) : items.slice(0, itemsPerRow);
  const secondRowItems = showExpand && !expanded ? [] : items.slice(itemsPerRow);

  const shouldShowExpand = showExpand && items.length > itemsPerRow;

  return (
    <Card size="small" className={styles.searchBar}>
      <Form form={form} initialValues={initialValues}>
        {/* 第一行：搜索项 + 按钮列 */}
        <Row gutter={12}>
          {firstRowItems.map((item) => (
            <Col
              key={item.name}
              xs={24}
              sm={12}
              md={item.span ?? itemSpan}
              lg={item.span ?? itemSpan}
            >
              <Form.Item
                name={item.name}
                label={item.label}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
              >
                {item.type === 'input' && (
                  <Input
                    placeholder={getTextPlaceholder(item.placeholder)}
                    allowClear={item.allowClear ?? true}
                    maxLength={item.maxLength}
                    style={{ width: item.width }}
                  />
                )}
                {item.type === 'search' && (
                  <Input.Search
                    placeholder={getTextPlaceholder(item.placeholder)}
                    allowClear={item.allowClear ?? true}
                    maxLength={item.maxLength}
                    style={{ width: item.width }}
                    onSearch={handleSearch}
                  />
                )}
                {item.type === 'select' && (
                  <Select
                    placeholder={getTextPlaceholder(item.placeholder)}
                    allowClear={item.allowClear ?? true}
                    style={{ width: item.width }}
                    options={item.options}
                  />
                )}
                {item.type === 'date' && (
                  <DatePicker
                    placeholder={typeof item.placeholder === 'string' ? item.placeholder : undefined}
                    format="YYYY-MM-DD"
                    style={{ width: item.width }}
                  />
                )}
                {item.type === 'dateRange' && (
                  <DatePicker.RangePicker
                    placeholder={
                      Array.isArray(item.placeholder)
                        ? item.placeholder
                        : item.placeholder
                          ? [item.placeholder, item.placeholder]
                          : undefined
                    }
                    format="YYYY-MM-DD"
                    style={{ width: item.width }}
                  />
                )}
              </Form.Item>
            </Col>
          ))}
          {/* 按钮列始终在第一行最右侧 */}
          <Col className={styles.actionCol} xs={24} sm={24} md={actionSpan} lg={actionSpan}>
            <div className={styles.actions}>
              <div className={styles.buttons}>
                <Button onClick={handleReset}>{resetButtonText}</Button>
                <Button type="primary" onClick={handleSearch}>
                  {searchButtonText}
                </Button>
              </div>
              {shouldShowExpand && (
                <div className={styles.filterToggle} onClick={toggleExpand}>
                  <span>{expanded ? '收起' : '展开'}</span>
                  <div className={styles.filterIcon}>{expanded ? <UpOutlined /> : <DownOutlined />}</div>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* 第二行：展开后的搜索项 */}
        {secondRowItems.length > 0 && (
          <Row gutter={12}>
            {secondRowItems.map((item) => (
              <Col
                key={item.name}
                xs={24}
                sm={12}
                md={item.span ?? itemSpan}
                lg={item.span ?? itemSpan}
              >
                <Form.Item
                  name={item.name}
                  label={item.label}
                  labelCol={labelCol}
                  wrapperCol={wrapperCol}
                >
                  {item.type === 'input' && (
                    <Input
                      placeholder={getTextPlaceholder(item.placeholder)}
                      allowClear={item.allowClear ?? true}
                      maxLength={item.maxLength}
                      style={{ width: item.width }}
                    />
                  )}
                  {item.type === 'search' && (
                    <Input.Search
                      placeholder={getTextPlaceholder(item.placeholder)}
                      allowClear={item.allowClear ?? true}
                      maxLength={item.maxLength}
                      style={{ width: item.width }}
                      onSearch={handleSearch}
                    />
                  )}
                  {item.type === 'select' && (
                    <Select
                      placeholder={getTextPlaceholder(item.placeholder)}
                      allowClear={item.allowClear ?? true}
                      style={{ width: item.width }}
                      options={item.options}
                    />
                  )}
                  {item.type === 'date' && (
                    <DatePicker
                      placeholder={typeof item.placeholder === 'string' ? item.placeholder : undefined}
                      format="YYYY-MM-DD"
                      style={{ width: item.width }}
                    />
                  )}
                  {item.type === 'dateRange' && (
                    <DatePicker.RangePicker
                      placeholder={
                        Array.isArray(item.placeholder)
                          ? item.placeholder
                          : item.placeholder
                            ? [item.placeholder, item.placeholder]
                            : undefined
                      }
                      format="YYYY-MM-DD"
                      style={{ width: item.width }}
                    />
                  )}
                </Form.Item>
              </Col>
            ))}
          </Row>
        )}
      </Form>
    </Card>
  );
}
