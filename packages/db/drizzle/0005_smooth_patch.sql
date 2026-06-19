ALTER TABLE "dishes" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "dishes" ADD COLUMN "dietary" text[] DEFAULT '{}' NOT NULL;