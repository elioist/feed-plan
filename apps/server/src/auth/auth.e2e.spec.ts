import { afterAll, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Controller, Get, Module, INestApplication, UseGuards } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { UserRow } from '@feed-plan/db';
import { DRIZZLE } from '../drizzle/drizzle.constants.js';
import { validateEnv } from '../config/env.schema.js';
import { AuthModule } from './auth.module.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { RequireAccess } from './access.decorator.js';

// 仅供测试的受保护路由，验证 AccessGuard 的 403 路径
@Controller('test')
class TestProtectedController {
  @Get('users-manage')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.usersManage)
  usersManage() {
    return { ok: true };
  }
}

@Module({ imports: [AuthModule], controllers: [TestProtectedController] })
class TestProtectedModule {}

const chefRow: UserRow = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  passwordHash: 'x',
  avatar: null,
  createdAt: new Date(),
};
const dinerRow: UserRow = {
  ...chefRow,
  id: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
};

const fakeUsers = {
  changePassword: vi.fn(),
  findByUsername: (username: string): Promise<UserRow | null> =>
    Promise.resolve(username === 'chef' ? chefRow : username === 'diner' ? dinerRow : null),
  getAuthUser: (id: string) =>
    Promise.resolve({
      id,
      username: id === chefRow.id ? 'chef' : 'diner',
      avatar: null,
      roles: [
        id === chefRow.id
          ? { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }
          : { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', key: 'diner', name: '食客', description: null },
      ],
      permissions:
        id === chefRow.id
          ? [
              {
                id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                key: 'users.manage',
                name: '用户管理',
                description: null,
              },
            ]
          : [],
      actions: id === chefRow.id ? [ACCESS_ACTIONS.usersManage] : [],
      menuKeys: [],
      buttonKeys: [],
    }),
  resetPassword: vi.fn(),
  update: vi.fn(),
  verifyPassword: (plain: string): Promise<boolean> => Promise.resolve(plain === 'good'),
};

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgres://u:p@localhost:5432/db';
    process.env.JWT_SECRET = 'test-secret-0123456789abcd';
    process.env.JWT_EXPIRES_IN = '30d';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        AuthModule,
        TestProtectedModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(fakeUsers)
      .overrideProvider(DRIZZLE)
      .useValue({
        select: () => ({
          from: () => ({
            where: async () => [{ action: ACCESS_ACTIONS.usersManage }],
          }),
        }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    fakeUsers.changePassword.mockClear();
    fakeUsers.resetPassword.mockClear();
    fakeUsers.update.mockClear();
    fakeUsers.changePassword.mockResolvedValue(undefined);
    fakeUsers.resetPassword.mockResolvedValue(undefined);
    fakeUsers.update.mockResolvedValue({ ...dinerRow, avatar: '/uploads/avatar.webp' });
  });

  afterAll(async () => {
    await app.close();
  });

  async function loginToken(username: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ username, password });
    return res.body.accessToken as string;
  }

  it('POST /auth/login 正确凭据 → 200 + token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'chef', password: 'good' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user).toMatchObject({ id: chefRow.id, username: 'chef', roles: expect.any(Array) });
  });

  it('POST /auth/login 密码错误 → 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'chef', password: 'bad' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login 用户不存在 → 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ghost', password: 'good' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login 缺字段 → 400', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ username: 'chef' });
    expect(res.status).toBe(400);
  });

  it('GET /auth/me 带 token → 200，不含 password_hash', async () => {
    const token = await loginToken('chef', 'good');
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: chefRow.id, username: 'chef', roles: expect.any(Array) });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('GET /auth/me 无 token → 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('PATCH /auth/password 当前用户修改密码 → 200', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'good', newPassword: 'new-secret' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fakeUsers.changePassword).toHaveBeenCalledWith(dinerRow.id, {
      currentPassword: 'good',
      newPassword: 'new-secret',
    });
  });

  it('PATCH /auth/password 新密码太短 → 400', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'good', newPassword: 'short' });

    expect(res.status).toBe(400);
    expect(fakeUsers.changePassword).not.toHaveBeenCalled();
  });

  it('PATCH /auth/profile 当前用户修改资料 → 200 + 当前用户信息', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'diner-new', avatar: '/uploads/avatar.webp' });

    expect(res.status).toBe(200);
    expect(fakeUsers.update).toHaveBeenCalledWith(dinerRow.id, {
      username: 'diner-new',
      avatar: '/uploads/avatar.webp',
    });
    expect(res.body).toMatchObject({ id: dinerRow.id, username: 'diner', avatar: null });
  });

  it('PATCH /auth/profile 拒绝非上传接口产生的头像路径', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'https://example.com/avatar.webp' });

    expect(res.status).toBe(400);
    expect(fakeUsers.update).not.toHaveBeenCalled();
  });

  it('PATCH /users/:id/password 主厨重置他人密码 → 200', async () => {
    const token = await loginToken('chef', 'good');
    const res = await request(app.getHttpServer())
      .patch(`/users/${dinerRow.id}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'new-secret' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fakeUsers.resetPassword).toHaveBeenCalledWith(dinerRow.id, 'new-secret', chefRow.id);
  });

  it('PATCH /users/:id/password 食客 → 403', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .patch(`/users/${chefRow.id}/password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'new-secret' });

    expect(res.status).toBe(403);
  });

  it('GET /test/users-manage 有权限用户 → 200', async () => {
    const token = await loginToken('chef', 'good');
    const res = await request(app.getHttpServer())
      .get('/test/users-manage')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /test/users-manage 无权限用户 → 403', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .get('/test/users-manage')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
