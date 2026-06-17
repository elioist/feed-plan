import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, LoginInput, LoginResponse } from '@feed-plan/shared';
import { UsersService } from './users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.users.findByUsername(input.username);
    // 用户名不存在与密码错误返回一致信息，避免泄露用户名是否存在
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const ok = await this.users.verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const signOptions: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ??
        '30d') as JwtSignOptions['expiresIn'],
    };
    const accessToken = await this.jwt.signAsync(payload, signOptions);

    return {
      accessToken,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }
}
