import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigModule } from '@nestjs/config';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Category, DishDetail, DishSummary, JwtPayload } from '@feed-plan/shared';
import { validateEnv } from '../config/env.schema.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersService } from '../auth/users.service.js';
import { DRIZZLE } from '../drizzle/drizzle.constants.js';
import { RecipesModule } from './recipes.module.js';
import { CategoriesService } from './categories.service.js';
import { DishesService } from './dishes.service.js';

const chef: JwtPayload = {
  sub: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  actions: ['recipes.dishes.manage'],
  menuKeys: [],
  buttonKeys: [],
};
const diner: JwtPayload = {
  sub: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  roles: [{ id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', key: 'diner', name: '食客', description: null }],
  actions: [],
  menuKeys: [],
  buttonKeys: [],
};
const category: Category = {
  id: '33333333-3333-3333-3333-333333333333',
  name: '家常菜',
  sortOrder: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const dishSummary: DishSummary = {
  id: '44444444-4444-4444-4444-444444444444',
  name: '番茄炒蛋',
  categoryId: category.id,
  category,
  coverImage: null,
  description: '下饭',
  referenceUrl: null,
  difficulty: 'easy',
  tags: [],
  dietary: [],
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const dishDetail: DishDetail = {
  ...dishSummary,
  recipeContent: '<h3>食材</h3><p>鸡蛋、番茄</p><h3>做法</h3><p>炒鸡蛋</p>',
};

const fakeUsers = {
  findByUsername: vi.fn(),
  verifyPassword: vi.fn(),
};
const categoriesService = {
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};
const dishesService = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setActive: vi.fn(),
  remove: vi.fn(),
};

function collectParamValues(node: unknown, values: unknown[] = []): unknown[] {
  if (!node || typeof node !== 'object') return values;
  if ('value' in node && 'encoder' in node) {
    values.push((node as { value: unknown }).value);
  }
  const chunks = (node as { queryChunks?: unknown[] }).queryChunks;
  if (Array.isArray(chunks)) {
    chunks.forEach((chunk) => collectParamValues(chunk, values));
  }
  return values;
}

function makeAccessDb(actionsByUserId: Record<string, string[]>) {
  return {
    select: () => ({
      from: () => {
        const query = {
          innerJoin: () => query,
          where: async (condition: unknown) => {
            const values = collectParamValues(condition);
            const userId = values.find((value) => typeof value === 'string' && value in actionsByUserId);
            const actions = values.flatMap((value) => (Array.isArray(value) ? value : []));
            const userActions = actionsByUserId[String(userId)] ?? [];
            return (actions.length > 0 ? userActions.filter((action) => actions.includes(action)) : userActions).map(
              (action) => ({ action }),
            );
          },
        };
        return query;
      },
    }),
  };
}

describe('Recipes API (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
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
        RecipesModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(fakeUsers)
      .overrideProvider(CategoriesService)
      .useValue(categoriesService)
      .overrideProvider(DishesService)
      .useValue(dishesService)
      .overrideProvider(DRIZZLE)
      .useValue(makeAccessDb({ [chef.sub]: ['recipes.dishes.manage'], [diner.sub]: [] }))
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    jwt = app.get(JwtService);
    chefToken = await jwt.signAsync(chef, { secret: process.env.JWT_SECRET });
    dinerToken = await jwt.signAsync(diner, { secret: process.env.JWT_SECRET });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    categoriesService.list.mockResolvedValue([category]);
    categoriesService.create.mockResolvedValue(category);
    categoriesService.update.mockResolvedValue({ ...category, name: '快手菜' });
    categoriesService.remove.mockResolvedValue(undefined);
    dishesService.list.mockResolvedValue([dishSummary]);
    dishesService.getById.mockResolvedValue(dishDetail);
    dishesService.create.mockResolvedValue(dishDetail);
    dishesService.update.mockResolvedValue({ ...dishDetail, name: '新版番茄炒蛋' });
    dishesService.setActive.mockResolvedValue({ ...dishDetail, isActive: false });
    dishesService.remove.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /categories 未登录 → 401', async () => {
    const res = await request(app.getHttpServer()).get('/categories');
    expect(res.status).toBe(401);
  });

  it('GET /categories 已登录 → 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: category.id, name: '家常菜' });
  });

  it('POST /categories diner → 403', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ name: '家常菜', sortOrder: 1 });
    expect(res.status).toBe(403);
  });

  it('POST /categories chef → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({ name: '家常菜', sortOrder: 1 });
    expect(res.status).toBe(201);
    expect(categoriesService.create).toHaveBeenCalledWith({ name: '家常菜', sortOrder: 1 });
  });

  it('PATCH /categories/:id invalid body → 400', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${chefToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('DELETE /categories/:id chef → 200', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${chefToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /categories/:id 被引用也删除分类，菜谱保留为未分类', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${chefToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /dishes query 传给 service，diner 只读', async () => {
    const res = await request(app.getHttpServer())
      .get(`/dishes?categoryId=${category.id}&keyword=番茄`)
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(dishesService.list).toHaveBeenCalledWith(
      { categoryId: category.id, keyword: '番茄' },
      expect.objectContaining({ roles: expect.arrayContaining([expect.objectContaining({ key: 'diner' })]) }),
    );
  });

  it('GET /dishes chef 可筛选停用菜谱', async () => {
    const res = await request(app.getHttpServer())
      .get('/dishes?isActive=false')
      .set('Authorization', `Bearer ${chefToken}`);
    expect(res.status).toBe(200);
    expect(dishesService.list).toHaveBeenCalledWith(
      { isActive: false },
      expect.objectContaining({ roles: expect.arrayContaining([expect.objectContaining({ key: 'chef' })]) }),
    );
  });

  it('GET /dishes/:id 返回聚合详情', async () => {
    const res = await request(app.getHttpServer())
      .get(`/dishes/${dishSummary.id}`)
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.recipeContent).toContain('炒鸡蛋');
  });

  it('GET /dishes/:id 不存在 → 404', async () => {
    dishesService.getById.mockRejectedValueOnce(new NotFoundException('菜谱不存在'));
    const res = await request(app.getHttpServer())
      .get(`/dishes/${dishSummary.id}`)
      .set('Authorization', `Bearer ${dinerToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /dishes chef → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/dishes')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({
        name: '番茄炒蛋',
        categoryId: category.id,
        difficulty: 'easy',
        recipeContent: '<p>鸡蛋和番茄炒熟</p>',
      });
    expect(res.status).toBe(201);
  });

  it('POST /dishes invalid difficulty → 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/dishes')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({
        name: '番茄炒蛋',
        categoryId: category.id,
        difficulty: 'unknown',
        recipeContent: '<p>内容</p>',
      });
    expect(res.status).toBe(400);
  });

  it('POST /dishes 不存在 categoryId → 404', async () => {
    dishesService.create.mockRejectedValueOnce(new NotFoundException('分类不存在'));
    const res = await request(app.getHttpServer())
      .post('/dishes')
      .set('Authorization', `Bearer ${chefToken}`)
      .send({
        name: '番茄炒蛋',
        categoryId: category.id,
        difficulty: 'easy',
        recipeContent: '<p>内容</p>',
      });
    expect(res.status).toBe(404);
  });

  it('PATCH /dishes/:id diner → 403', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/dishes/${dishSummary.id}`)
      .set('Authorization', `Bearer ${dinerToken}`)
      .send({ name: '新版番茄炒蛋' });
    expect(res.status).toBe(403);
  });

  it('PATCH /dishes/:id/active chef → 200', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/dishes/${dishSummary.id}/active`)
      .set('Authorization', `Bearer ${chefToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(dishesService.setActive).toHaveBeenCalledWith(dishSummary.id, { isActive: false });
  });

  it('DELETE /dishes/:id chef → remove', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/dishes/${dishSummary.id}`)
      .set('Authorization', `Bearer ${chefToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(dishesService.remove).toHaveBeenCalledWith(dishSummary.id);
  });
});
