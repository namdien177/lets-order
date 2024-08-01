ALTER TABLE "orders" ADD COLUMN "status" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp with time zone;