CREATE TABLE "permission_action_bindings" (
	"permission_id" uuid NOT NULL,
	"action" varchar(96) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permission_action_bindings_permission_id_action_pk" PRIMARY KEY("permission_id","action")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "permission_action_bindings" ADD CONSTRAINT "permission_action_bindings_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_unique" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_key_unique" ON "roles" USING btree ("key");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";--> statement-breakpoint
INSERT INTO "roles" ("key", "name", "description", "is_system")
VALUES
	('super_admin', '超级管理员', '默认最高权限角色，可管理用户、角色、权限点和全部业务数据。', true),
	('chef', '主厨', '默认主厨角色，可管理菜谱、上传资源并完成点餐场次。', true),
	('diner', '食客', '默认点菜角色，可浏览菜谱并参与点菜。', true)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "permissions" ("key", "name", "description", "is_system")
VALUES
	('users.manage', '用户管理', '新增、搜索、删除用户，维护用户角色和重置他人密码。', true),
	('roles.manage', '角色管理', '新增、搜索、编辑、删除角色，并维护角色权限点。', true),
	('permissions.manage', '权限点管理', '新增、搜索、编辑、删除权限点。', true),
	('recipes.manage', '菜谱管理', '新增、编辑、删除、停用菜谱和分类。', true),
	('uploads.manage', '上传管理', '上传菜谱图片等服务端资源。', true),
	('meals.complete', '结单管理', '完成本次点餐并锁定场次。', true)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."key" = 'super_admin'
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
JOIN "permissions" p ON p."key" IN ('recipes.manage', 'uploads.manage', 'meals.complete')
WHERE r."key" = 'chef'
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "permission_action_bindings" ("permission_id", "action")
SELECT p."id", bindings.action
FROM "permissions" p
JOIN (
	VALUES
		('users.manage', 'users.manage'),
		('roles.manage', 'roles.manage'),
		('permissions.manage', 'permissions.manage'),
		('recipes.manage', 'recipes.manage'),
		('uploads.manage', 'uploads.manage'),
		('meals.complete', 'meals.complete')
) AS bindings(permission_key, action) ON bindings.permission_key = p."key"
ON CONFLICT DO NOTHING;
