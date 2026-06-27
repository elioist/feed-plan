declare module 'antd-img-crop' {
  import { type FC, type ReactNode } from 'react';

  interface ImgCropProps {
    aspect?: number;
    shape?: 'rect' | 'circle';
    grid?: boolean;
    quality?: number;
    fillColor?: string;
    zoomSlider?: boolean;
    rotationSlider?: boolean;
    aspectSlider?: boolean;
    minZoom?: number;
    maxZoom?: number;
    cropShape?: 'rect' | 'circle';
    cropArea?: [number, number, number, number];
    onCropComplete?: (croppedArea: unknown, croppedAreaPixels: unknown) => void;
    onCropChange?: (cropArea: unknown) => void;
    onZoomChange?: (zoom: number) => void;
    onRotationChange?: (rotation: number) => void;
    beforeCrop?: (file: File) => boolean | Promise<boolean>;
    children?: ReactNode;
  }

  const ImgCrop: FC<ImgCropProps>;
  export default ImgCrop;
}
