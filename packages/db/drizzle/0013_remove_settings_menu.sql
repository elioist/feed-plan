DELETE FROM "role_menu_buttons"
WHERE "button_id" IN (
  SELECT "admin_menu_buttons"."id"
  FROM "admin_menu_buttons"
  INNER JOIN "admin_menus" ON "admin_menu_buttons"."menu_id" = "admin_menus"."id"
  WHERE "admin_menus"."key" = 'system.settings'
);

DELETE FROM "admin_menu_buttons"
WHERE "menu_id" IN (
  SELECT "id" FROM "admin_menus" WHERE "key" = 'system.settings'
);

DELETE FROM "role_menus"
WHERE "menu_id" IN (
  SELECT "id" FROM "admin_menus" WHERE "key" = 'system.settings'
);

DELETE FROM "admin_menus" WHERE "key" = 'system.settings';
