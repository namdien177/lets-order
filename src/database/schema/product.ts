import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import type { Static } from "elysia";
import { orders } from "@/database/schema/order";
import { timestampColumns } from "./_common";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", {
    length: 256,
  }).notNull(),
  price: integer("price").notNull(),
  description: varchar("description", {
    length: 200,
  }).notNull(),
  ...timestampColumns,
});

export const productRelations = relations(products, ({ many }) => ({
  inOrders: many(orders),
}));

export type Product = typeof products.$inferSelect;

export const createProduct = createInsertSchema(products);

export type CreateProduct = Static<typeof createProduct>;
