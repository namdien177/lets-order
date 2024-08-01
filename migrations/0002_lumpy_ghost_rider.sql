CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"description" varchar(255),
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_carts" (
	"order_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "order_carts_order_id_user_id_item_id_pk" PRIMARY KEY("order_id","user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"available_quantity" integer,
	CONSTRAINT "order_items_order_id_product_id_pk" PRIMARY KEY("order_id","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_payments" (
	"order_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"buyer_confirmation" integer DEFAULT 0 NOT NULL,
	"owner_confirmation" integer DEFAULT 0 NOT NULL,
	"note" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "order_payments_order_id_buyer_id_pk" PRIMARY KEY("order_id","buyer_id")
);
