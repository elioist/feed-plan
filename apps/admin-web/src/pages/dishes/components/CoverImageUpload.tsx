import { InboxOutlined } from '@ant-design/icons';
import { Image, Upload, App as AntdApp } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { api } from '~/lib/api-client';

interface CoverImageUploadProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
}

type UploadRequest = Parameters<NonNullable<UploadProps['customRequest']>>[0];
const { Dragger } = Upload;

export function CoverImageUpload({ value, onChange }: CoverImageUploadProps) {
  const { message } = AntdApp.useApp();
  const fileList: UploadFile[] = value
    ? [
        {
          uid: value,
          name: value.split('/').pop() ?? 'cover-image',
          status: 'done',
          url: value,
        },
      ]
    : [];

  const upload = async (options: UploadRequest) => {
    try {
      const file = options.file as File;
      const result = await api.dishes.uploadImage(file);
      onChange?.(result.path);
      options.onProgress?.({ percent: 100 });
      options.onSuccess?.(result);
      message.success('封面已上传');
    } catch (error) {
      options.onError?.(error as Error);
      message.error(error instanceof Error ? error.message : '封面上传失败');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Dragger
        accept="image/jpeg,image/png,image/webp"
        customRequest={upload}
        fileList={fileList}
        listType="picture-card"
        maxCount={1}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
        }}
        onPreview={(file) => {
          if (file.url) {
            window.open(file.url, '_blank', 'noopener,noreferrer');
          }
        }}
        onRemove={() => {
          onChange?.(null);
          return true;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽图片到这里上传封面</p>
        <p className="ant-upload-hint">支持 JPG、PNG、WebP，上传后可预览或移除。</p>
      </Dragger>
      {value ? <Image width={160} src={value} alt="菜谱封面预览" /> : null}
    </div>
  );
}
