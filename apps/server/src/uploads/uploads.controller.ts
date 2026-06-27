import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import {
  imageUploadInterceptorOptions,
  saveUploadedImage,
  type UploadedImageFile,
} from './image-upload.js';

@Controller('uploads')
@UseGuards(JwtAuthGuard, AccessGuard)
export class UploadsController {
  @Post('images')
  @RequireAccess(ACCESS_ACTIONS.uploadsManage)
  @UseInterceptors(FileInterceptor('file', imageUploadInterceptorOptions))
  uploadImage(@UploadedFile() file?: UploadedImageFile) {
    return saveUploadedImage(file);
  }
}
