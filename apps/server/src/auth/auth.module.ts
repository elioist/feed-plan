import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AccessGuard } from './access.guard.js';
import { RolesController } from './roles.controller.js';
import { PermissionsController } from './permissions.controller.js';
import { MenusController } from './menus.controller.js';
import { AccessService } from './access.service.js';
import { DrizzleModule } from '../drizzle/drizzle.module.js';

/**
 * 认证模块。JwtModule 以空配置注册，secret 与有效期在签发/校验时
 * 从 ConfigService 显式传入，便于按需控制。
 */
@Module({
  imports: [JwtModule.register({}), DrizzleModule],
  controllers: [AuthController, UsersController, RolesController, PermissionsController, MenusController],
  providers: [AuthService, UsersService, AccessService, JwtAuthGuard, AccessGuard],
  exports: [JwtAuthGuard, AccessGuard, AccessService, JwtModule],
})
export class AuthModule {}
