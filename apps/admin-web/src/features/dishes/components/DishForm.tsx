import type { CreateDishInput, DishDetail } from '@feed-plan/shared';
import { Button, Form, Input, Select, Switch } from 'antd';
import type { Category } from '@feed-plan/shared';
import { CoverImageUpload } from './CoverImageUpload.js';
import { RichTextEditor } from './RichTextEditor.js';

interface DishFormProps {
  categories: Category[];
  initialValue?: DishDetail;
  loading?: boolean;
  onSubmit: (input: CreateDishInput) => void;
}

const defaultRecipeContent = '<h3>食材</h3><p></p><h3>做法</h3><p></p><h3>备注</h3><p></p>';

export function DishForm({ categories, initialValue, loading, onSubmit }: DishFormProps) {
  const initialValues = initialValue ?? {
    difficulty: 'easy',
    isActive: true,
    recipeContent: defaultRecipeContent,
  };

  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
      <Form.Item label="菜名" name="name" rules={[{ required: true, message: '请输入菜名' }]}>
        <Input maxLength={128} />
      </Form.Item>
      <Form.Item label="分类" name="categoryId" rules={[{ required: true, message: '请选择分类' }]}>
        <Select
          options={categories.map((category) => ({ label: category.name, value: category.id }))}
        />
      </Form.Item>
      <Form.Item label="难度" name="difficulty" rules={[{ required: true, message: '请选择难度' }]}>
        <Select
          options={[
            { label: '简单', value: 'easy' },
            { label: '中等', value: 'medium' },
            { label: '困难', value: 'hard' },
          ]}
        />
      </Form.Item>
      <Form.Item label="封面图" name="coverImage">
        <CoverImageUpload />
      </Form.Item>
      <Form.Item label="参考链接" name="referenceUrl">
        <Input maxLength={255} placeholder="B 站、抖音、小红书或其他参考链接" />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <Input.TextArea rows={3} maxLength={1000} />
      </Form.Item>
      <Form.Item label="菜谱内容" name="recipeContent" rules={[{ required: true, message: '请输入菜谱内容' }]}>
        <RichTextEditor />
      </Form.Item>
      <Form.Item label="启用" name="isActive" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading}>
        保存
      </Button>
    </Form>
  );
}
