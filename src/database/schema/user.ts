import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import type { Static } from "elysia";
import { orders } from "@/database/schema/order";
import { orderCarts } from "@/database/schema/order-cart";
import { orderPayments } from "@/database/schema/order-payment";
import { timestampColumns } from "./_common";
import { generateRandomString } from "@/lib/encryption";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	displayName: varchar("display_name", {
		length: 60,
	}).notNull(),
	email: varchar("email", {
		length: 256,
	})
		.notNull()
		.unique(),
	password: varchar("password", {
		length: 100,
	}).notNull(),
	verifiedCode: varchar("verified_code", {
		length: 60,
	})
		.notNull()
		.$default(() => generateRandomString(10)),
	verifiedAt: timestamp("verified_at", {
		withTimezone: true,
	}),
	...timestampColumns,
});

export const userRelations = relations(users, ({ many }) => ({
	carts: many(orderCarts),
	payments: many(orderPayments),
	orderOwned: many(orders),
}));

export type User = typeof users.$inferSelect;

export const createUser = createInsertSchema(users);

export type CreateUser = Static<typeof createUser>;
