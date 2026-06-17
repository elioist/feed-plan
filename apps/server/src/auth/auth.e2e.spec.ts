import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { Controller, Get, Module, INestApplication, UseGuards } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { UserRow } from '@feed-plan/db';
import { validateEnv } from '../config/env.schema.js';
import { AuthModule } from './auth.module.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { Roles } from './roles.decorator.js';

// 仅供测试的受保护路由，验证 RolesGuard 的 403 路径
@Controller('test')
class TestProtectedController {
  @Get('chef-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('chef')
  chefOnly() {
    return { ok: true };
  }
}

@Module({ imports: [AuthModule], controllers: [TestProtectedController] })
class TestProtectedModule {}

const chefRow: UserRow = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  passwordHash: 'x',
  role: 'chef',
  createdAt: new Date(),
};
const dinerRow: UserRow = {
  ...chefRow,
  id: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  role: 'diner',
};

const fakeUsers = {
  findByUsername: (username: string): Promise<UserRow | null> =>
    Promise.resolve(username === 'chef' ? chefRow : username === 'diner' ? dinerRow : null),
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
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
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
    expect(res.body.user).toEqual({ id: chefRow.id, username: 'chef', role: 'chef' });
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
    expect(res.body).toEqual({ id: chefRow.id, username: 'chef', role: 'chef' });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('GET /auth/me 无 token → 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /test/chef-only 主厨 → 200', async () => {
    const token = await loginToken('chef', 'good');
    const res = await request(app.getHttpServer())
      .get('/test/chef-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /test/chef-only 食客 → 403', async () => {
    const token = await loginToken('diner', 'good');
    const res = await request(app.getHttpServer())
      .get('/test/chef-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
