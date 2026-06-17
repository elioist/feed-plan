import { SetMetadata } from '@nestjs/common';
import type { Role } from '@feed-plan/shared';

export const ROLES_KEY = 'roles';

/** 声明接口所需角色，配合 RolesGuard 使用。例：@Roles('chef') */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
