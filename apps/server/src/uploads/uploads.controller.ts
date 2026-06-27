import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import { ensureUploadDir, PUBLIC_UPLOAD_PREFIX } from './upload-paths.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

function normalizeImageExt(file: { mimetype: string; originalname: string }): string {
  const expectedExt = allowedImageTypes.get(file.mimetype);
  const originalExt = extname(file.originalname).toLowerCase();
  if (!expectedExt || !['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)) {
    throw new BadRequestException('仅支持 jpg、png、webp 图片');
  }
  return expectedExt;
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, AccessGuard)
export class UploadsController {
  @Post('images')
  @RequireAccess(ACCESS_ACTIONS.uploadsManage)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        try {
          normalizeImageExt(file);
          callback(null, true);
        } catch (error) {
          callback(error as Error, false);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file?: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }

    const filename = randomUUID() + normalizeImageExt(file);
    writeFileSync(join(ensureUploadDir(), filename), file.buffer);

    return {
      path: PUBLIC_UPLOAD_PREFIX + '/' + filename,
    };
  }
}
