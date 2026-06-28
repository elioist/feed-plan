import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  changePasswordSchema,
  loginInputSchema,
  type AuthUser,
  type AuthMenu,
  type ChangePasswordInput,
  type JwtPayload,
  type LoginInput,
  type LoginResponse,
  type UpdateUserInput,
  updateUserSchema,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import { UsersService } from './users.service.js';
import { AccessService } from './access.service.js';
import {
  imageUploadInterceptorOptions,
  saveUploadedImage,
  type UploadedImageFile,
} from '../uploads/image-upload.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly access: AccessService,
  ) {}

  /** 账号密码登录，返回 JWT 与用户信息 */
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginInputSchema)) body: LoginInput): Promise<LoginResponse> {
    return this.auth.login(body);
  }

  /** 获取当前登录用户信息（不含密码哈希） */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<AuthUser> {
    const current = await this.users.getAuthUser(user.sub);
    if (!current) {
      throw new NotFoundException('用户不存在');
    }
    return current;
  }

  /** 获取当前用户可访问的后台菜单/路由清单 */
  @Get('menus')
  @UseGuards(JwtAuthGuard)
  menus(@CurrentUser() user: JwtPayload): Promise<AuthMenu[]> {
    return this.access.getUserMenus(user.sub);
  }

  /** 当前用户修改自己的密码 */
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.users.changePassword(user.sub, body);
    return { ok: true };
  }

  /** 当前用户修改自己的资料 */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<AuthUser> {
    await this.users.update(user.sub, body);
    const current = await this.users.getAuthUser(user.sub);
    if (!current) {
      throw new NotFoundException('用户不存在');
    }
    return current;
  }

  /** 当前用户上传自己的头像图片 */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', imageUploadInterceptorOptions))
  uploadAvatar(@UploadedFile() file?: UploadedImageFile) {
    return saveUploadedImage(file);
  }
}
