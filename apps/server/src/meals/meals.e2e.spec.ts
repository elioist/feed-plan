import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { JwtPayload, MenuDetail } from '@feed-plan/shared';
import { AuthModule } from '../auth/auth.module.js';
import { UsersService } from '../auth/users.service.js';
import { validateEnv } from '../config/env.schema.js';
import { MealsModule } from './meals.module.js';
import { MealsService } from './meals.service.js';

const chef: JwtPayload = {
  sub: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  role: 'chef',
};
const diner: JwtPayload = {
  sub: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  role: 'diner',
};
const mealId = '33333333-3333-3333-3333-333333333333';
const dishId = '44444444-4444-4444-4444-444444444444';

const menuDetail: MenuDetail = {
  meal: {
    id: mealId,
    title: '2026-06-17 dinner',
    mealDate: '2026-06-17',
    mealType: 'dinner',
    type: 'daily',
    status: 'ordering',
    createdBy: chef.sub,
    createdAt: new Date('2026-06-17T10:00:00.000Z'),
    completedAt: null,
  },
  orders: [
    {
      id: '55555555-5555-5555-5555-555555555555',
      mealId,
      dishId,
      userId: diner.sub,
      guestName: null,
      quantity: 2,
      note: null,
      createdAt: new Date('2026-06-17T10:01:00.000Z'),
      username: 'diner',
    },
  ],
  items: [
    {
      dish: {
        id: dishId,
        name: '番茄炒蛋',
        categoryId: '66666666-6666-6666-6666-666666666666',
        category: null,
        coverImage: null,
        description: null,
        referenceUrl: null,
        difficulty: 'easy',
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      totalQuantity: 2,
      quantities: [{ userId: diner.sub, username: 'diner', guestName: null, quantity: 2 }],
    },
  ],
};

const fakeUsers = {
  findByUsername: vi.fn(),
  verifyPassword: vi.fn(),
};
const mealsService = {
  getOrCreateCurrent: vi.fn(),
  listToday: vi.fn(),
  list: vi.fn(),
  getDetail: vi.fn(),
  addOrder: vi.fn(),
  complete: vi.fn(),
};

describe('Meals API (e2e)', () => {
  let app: INestApplication;
  let chefToken: string;
  let dinerToken: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgres://u:p@localhost:5432/db';
    process.env.JWT_SECRET = 'test-secret-0123456789abcd';
    process.env.JWT_EXPIRES_IN = '30d';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        AuthModule,
        MealsModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(fakeUsers)
      .overrideProvider(MealsService)
      .useValue(mealsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    const jwt = app.get(JwtService);
    chefToken = await jwt.signAsync(chef, { secret: process.env.JWT_SECRET });
    dinerToken = await jwt.signAsync(diner, { secret: process.env.JWT_SECRET });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mealsService.getOrCreateCurrent.mockResolvedValue(menuDetail);
    mealsService.listToday.mockResolvedValue([menuDetail]);
    mealsService.list.mockResolvedValue([menuDetail]);
    mealsService.getDetail.mockResolvedValue(menuDetail);
    mealsService.addOrder.mockResolvedValue(menuDetail);
    mealsService.complete.mockResolvedValue({
      ...menuDetail,
      meal: { ...menuDetail.meal, status: 'completed', completedAt: new Date() },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /meals/today 未登录 → 401', async () => {
    const res = await request(app.getHttpServer()).get('/meals/today');
    expect(res.status).toBe(401);
  });

  it('POST /meals/current 已登录 → 201/200 + 菜单详情', async () => {
    const res = await request(app.getHttpServer())
      .post('/meals/current')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({ mealDate: '2026-06-17', mealType: 'dinner' });
    expect(res.status).toBe(201);
    expect(mealsService.getOrCreateCurrent).toHaveBeenCalledWith(
      { mealDate: '2026-06-17', mealType: 'dinner', type: 'daily' },
      expect.objectContaining({ role: 'chef' }),
    );
  });

  it('POST /meals/current invalid mealType → 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/meals/current')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({ mealDate: '2026-06-17', mealType: 'snack' });
    expect(res.status).toBe(400);
  });

  it('GET /meals 支持按日期餐型查询', async () => {
    const res = await request(app.getHttpServer())
      .get('/meals?mealDate=2026-06-17&mealType=dinner')
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(mealsService.list).toHaveBeenCalledWith({ mealDate: '2026-06-17', mealType: 'dinner' });
  });

  it('GET /meals 支持按日期范围查询', async () => {
    const res = await request(app.getHttpServer())
      .get('/meals?mealDateFrom=2026-06-01&mealDateTo=2026-06-19&status=ordering')
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(mealsService.list).toHaveBeenCalledWith({
      mealDateFrom: '2026-06-01',
      mealDateTo: '2026-06-19',
      status: 'ordering',
    });
  });

  it('GET /meals/today 返回今日菜单列表', async () => {
    const res = await request(app.getHttpServer())
      .get('/meals/today')
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].items[0]).toMatchObject({ totalQuantity: 2 });
  });

  it('GET /meals 空菜单返回空数组', async () => {
    mealsService.list.mockResolvedValueOnce([]);
    const res = await request(app.getHttpServer())
      .get('/meals?mealDate=2026-06-18')
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /meals/:id 返回菜单详情', async () => {
    const res = await request(app.getHttpServer())
      .get(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders[0]).toMatchObject({ username: 'diner', quantity: 2 });
  });

  it('POST /meals/:id/orders diner 可加菜', async () => {
    const res = await request(app.getHttpServer())
      .post(`/meals/${mealId}/orders`)
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ dishId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(mealsService.addOrder).toHaveBeenCalledWith(
      mealId,
      { dishId, quantity: 2 },
      expect.objectContaining({ role: 'diner' }),
    );
  });

  it('POST /meals/:id/orders quantity 小于 1 → 400', async () => {
    const res = await request(app.getHttpServer())
      .post(`/meals/${mealId}/orders`)
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ dishId, quantity: 0 });
    expect(res.status).toBe(400);
  });

  it('POST /meals/:id/orders meal 不存在 → 404', async () => {
    mealsService.addOrder.mockRejectedValueOnce(new NotFoundException('餐次不存在'));
    const res = await request(app.getHttpServer())
      .post(`/meals/${mealId}/orders`)
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ dishId, quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('POST /meals/:id/orders 停用菜谱 → 404', async () => {
    mealsService.addOrder.mockRejectedValueOnce(new NotFoundException('菜谱不存在或已停用'));
    const res = await request(app.getHttpServer())
      .post(`/meals/${mealId}/orders`)
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ dishId, quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('PATCH /meals/:id/complete diner → 403', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/meals/${mealId}/complete`)
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(403);
  });

  it('PATCH /meals/:id/complete chef → 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/meals/${mealId}/complete`)
      .set('Authorization', `Bearer ${chefToken}`);
    expect(res.status).toBe(200);
    expect(mealsService.complete).toHaveBeenCalledWith(mealId);
  });

  it('service 抛 BadRequest 时返回 400', async () => {
    mealsService.getOrCreateCurrent.mockRejectedValueOnce(new BadRequestException('餐型不合法'));
    const res = await request(app.getHttpServer())
      .post('/meals/current')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({ mealDate: '2026-06-17', mealType: 'dinner' });
    expect(res.status).toBe(400);
  });
});
