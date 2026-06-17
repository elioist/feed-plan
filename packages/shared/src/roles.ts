/**
 * 用户角色定义 —— 前后端、数据库共享的单一真相源。
 */
export const ROLES = ['chef', 'diner'] as const;
export type Role = (typeof ROLES)[number];
