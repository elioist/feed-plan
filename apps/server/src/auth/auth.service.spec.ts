import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import type { UserRow } from '@feed-plan/db';
import { AuthService } from './auth.service.js';
import type { UsersService } from './users.service.js';

function makeService(opts: { user: UserRow | null; passwordOk: boolean }) {
  const users = {
    findByUsername: vi.fn().mockResolvedValue(opts.user),
    verifyPassword: vi.fn().mockResolvedValue(opts.passwordOk),
    getAuthUser: vi.fn().mockResolvedValue(
      opts.user
        ? {
            id: opts.user.id,
            username: opts.user.username,
            avatar: opts.user.avatar,
            roles: [
              {
                id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                key: 'chef',
                name: '主厨',
                description: null,
              },
            ],
            permissions: [],
            actions: [],
            menuKeys: [],
            buttonKeys: [],
          }
        : null,
    ),
  } as unknown as UsersService;
  const jwt = {
    signAsync: vi.fn().mockResolvedValue('signed.jwt.token'),
  } as unknown as JwtService;
  const config = {
    getOrThrow: vi.fn().mockReturnValue('test-secret-0123456789'),
    get: vi.fn().mockReturnValue('30d'),
  } as unknown as ConfigService;
  return { service: new AuthService(users, jwt, config), users, jwt };
}

const chefRow: UserRow = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  passwordHash: '$2b$10$hashhashhashhashhashhash',
  avatar: null,
  createdAt: new Date(),
};

describe('AuthService.login', () => {
  it('凭据正确时返回 token 与用户信息', async () => {
    const { service } = makeService({ user: chefRow, passwordOk: true });
    const res = await service.login({ username: 'chef', password: 'good' });
    expect(res.accessToken).toBe('signed.jwt.token');
    expect(res.user).toMatchObject({ id: chefRow.id, username: 'chef', roles: expect.any(Array) });
  });

  it('密码错误时抛 401', async () => {
    const { service } = makeService({ user: chefRow, passwordOk: false });
    await expect(service.login({ username: 'chef', password: 'bad' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('用户不存在时抛 401（与密码错误同样的异常）', async () => {
    const { service } = makeService({ user: null, passwordOk: false });
    await expect(service.login({ username: 'ghost', password: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('JWT 负载包含 sub、username、roles、permissions', async () => {
    const { service, jwt } = makeService({ user: chefRow, passwordOk: true });
    await service.login({ username: 'chef', password: 'good' });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: chefRow.id,
        username: 'chef',
        roles: expect.any(Array),
        permissions: expect.any(Array),
      }),
      expect.objectContaining({ secret: expect.any(String) }),
    );
  });
});
