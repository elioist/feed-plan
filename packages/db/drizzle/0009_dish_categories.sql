CREATE TABLE "dish_categories" (
	"dish_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "dish_categories_dish_id_category_id_pk" PRIMARY KEY("dish_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "dish_categories" ADD CONSTRAINT "dish_categories_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_categories" ADD CONSTRAINT "dish_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
