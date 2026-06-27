import { UserOutlined } from '@ant-design/icons';
import { Avatar, Upload, App as AntdApp } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { api } from '~/lib/api-client';

interface AvatarUploadProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  username?: string;
}

type UploadRequest = Parameters<NonNullable<UploadProps['customRequest']>>[0];

export function AvatarUpload({ value, onChange, username }: AvatarUploadProps) {
  const { message } = AntdApp.useApp();
  const fileList: UploadFile[] = value
    ? [
        {
          uid: value,
          name: value.split('/').pop() ?? 'avatar',
          status: 'done',
          url: api.getImageUrl(value) ?? value,
        },
      ]
    : [];

  const upload = async (options: UploadRequest) => {
    try {
      const file = options.file as File;
      const result = await api.auth.uploadAvatar(file);
      onChange?.(result.path);
      options.onProgress?.({ percent: 100 });
      options.onSuccess?.(result);
      message.success('头像已上传');
    } catch (error) {
      options.onError?.(error as Error);
      message.error(error instanceof Error ? error.message : '头像上传失败');
    }
  };

  const avatarContent = value ? (
    <Avatar src={api.getImageUrl(value) ?? value} size={96} shape="square" />
  ) : (
    <Avatar size={96} shape="square" icon={<UserOutlined />} style={{ backgroundColor: '#fae8df', color: '#c45a32' }}>
      {username?.charAt(0)?.toUpperCase()}
    </Avatar>
  );

  return (
    <div className="avatar-upload">
      <ImgCrop rotationSlider aspectSlider aspect={1}>
        <Upload
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
          {avatarContent}
        </Upload>
      </ImgCrop>
      <div style={{ marginTop: 8, color: '#8a7565', fontSize: 12 }}>
        支持 JPG、PNG、WebP，建议 1:1 比例
      </div>
    </div>
  );
}
