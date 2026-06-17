import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { createDb, users, type Database } from '@feed-plan/db';
import type { Role } from '@feed-plan/shared';

/** 幂等创建单个用户：已存在（按用户名）则跳过，不覆盖 */
async function seedUser(
  db: Database,
  username: string,
  password: string,
  role: Role,
): Promise<void> {
  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing[0]) {
    process.stdout.write(`· 用户 ${username}（${role}）已存在，跳过\n`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, passwordHash, role });
  process.stdout.write(`✓ 已创建 ${role}：${username}\n`);
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('缺少环境变量 DATABASE_URL');

  const chefPassword = process.env.SEED_CHEF_PASSWORD;
  const dinerPassword = process.env.SEED_DINER_PASSWORD;
  if (!chefPassword || !dinerPassword) {
    throw new Error('缺少环境变量 SEED_CHEF_PASSWORD / SEED_DINER_PASSWORD（初始密码不可硬编码）');
  }
  const chefName = process.env.SEED_CHEF_USERNAME ?? 'chef';
  const dinerName = process.env.SEED_DINER_USERNAME ?? 'diner';

  const db = createDb(url);
  await seedUser(db, chefName, chefPassword, 'chef');
  await seedUser(db, dinerName, dinerPassword, 'diner');
  process.stdout.write('种子数据完成\n');
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`种子失败：${String(err)}\n`);
  process.exit(1);
});
