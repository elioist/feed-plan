import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { dishes, dishCategories } from './schema/recipes.js';

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:9529/feed_plan',
  });

  const db = drizzle(pool);

  console.log('Starting migration: copying dishes.category_id to dish_categories...');

  // Get all dishes with categoryId
  const dishRows = await db.select({
    id: dishes.id,
    categoryId: dishes.categoryId,
  }).from(dishes);

  let migrated = 0;
  for (const dish of dishRows) {
    if (dish.categoryId) {
      try {
        await db.insert(dishCategories).values({
          dishId: dish.id,
          categoryId: dish.categoryId,
        }).onConflictDoNothing();
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate dish ${dish.id}:`, error);
      }
    }
  }

  console.log(`Migration complete. Migrated ${migrated} dish-category associations.`);
  await pool.end();
}

migrate().catch(console.error);
