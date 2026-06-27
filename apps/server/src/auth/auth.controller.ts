import { Body, Controller, Get, HttpCode, NotFoundException, Patch, Post, UseGuards } from '@nestjs/common';
import {
  changePasswordSchema,
  loginInputSchema,
  type AuthUser,
  type ChangePasswordInput,
  type JwtPayload,
  type LoginInput,
  type LoginResponse,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import { UsersService } from './users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
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
}
