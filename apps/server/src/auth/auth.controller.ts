import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  loginInputSchema,
  type AuthUser,
  type JwtPayload,
  type LoginInput,
  type LoginResponse,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 账号密码登录，返回 JWT 与用户信息 */
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginInputSchema)) body: LoginInput): Promise<LoginResponse> {
    return this.auth.login(body);
  }

  /** 获取当前登录用户信息（不含密码哈希） */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload): AuthUser {
    return { id: user.sub, username: user.username, role: user.role };
  }
}
