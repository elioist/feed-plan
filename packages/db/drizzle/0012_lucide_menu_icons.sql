UPDATE "admin_menus"
SET "icon" = CASE "key"
  WHEN 'dashboard' THEN 'lucide:layout-dashboard'
  WHEN 'recipes' THEN 'lucide:book-open'
  WHEN 'recipes.categories' THEN 'lucide:layout-grid'
  WHEN 'recipes.dishes' THEN 'lucide:cooking-pot'
  WHEN 'recipes.tags' THEN 'lucide:tags'
  WHEN 'meals' THEN 'lucide:utensils'
  WHEN 'system' THEN 'lucide:settings'
  WHEN 'system.users' THEN 'lucide:users'
  WHEN 'system.roles' THEN 'lucide:shield-check'
  WHEN 'system.menus' THEN 'lucide:menu'
  WHEN 'system.settings' THEN 'lucide:settings'
  ELSE "icon"
END
WHERE "key" IN (
  'dashboard',
  'recipes',
  'recipes.categories',
  'recipes.dishes',
  'recipes.tags',
  'meals',
  'system',
  'system.users',
  'system.roles',
  'system.menus',
  'system.settings'
);
