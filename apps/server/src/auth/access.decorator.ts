import { SetMetadata } from '@nestjs/common';
import type { AccessAction } from './access-actions.js';

export const ACCESS_ACTIONS_KEY = 'access_actions';

export const RequireAccess = (...actions: AccessAction[]) => SetMetadata(ACCESS_ACTIONS_KEY, actions);
