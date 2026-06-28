import { SetMetadata } from '@nestjs/common';
import type { AccessAction } from './access-actions.js';

export const ACCESS_ACTIONS_KEY = 'access_actions';
export const ACCESS_MENUS_KEY = 'access_menus';

export const RequireAccess = (...actions: AccessAction[]) => SetMetadata(ACCESS_ACTIONS_KEY, actions);
export const RequireMenu = (...menuKeys: string[]) => SetMetadata(ACCESS_MENUS_KEY, menuKeys);
