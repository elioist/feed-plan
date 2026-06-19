import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

/**
 * 认证模块。JwtModule 以空配置注册，secret 与有效期在签发/校验时
 * 从 ConfigService 显式传入，便于按需控制。
 */
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
