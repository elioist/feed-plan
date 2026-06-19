DROP TABLE "ingredients" CASCADE;--> statement-breakpoint
DROP TABLE "recipe_steps" CASCADE;--> statement-breakpoint
ALTER TABLE "dishes" ADD COLUMN "reference_url" varchar(255);--> statement-breakpoint
ALTER TABLE "dishes" ADD COLUMN "recipe_content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "dishes" DROP COLUMN "bili_video";