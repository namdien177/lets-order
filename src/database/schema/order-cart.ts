import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import type { Static } from "elysia";
import { orders } from "@/database/schema/order";
import { users } from "@/database/schema/user";
import { timestampColumns } from "./_common";

export const orderCarts = pgTable(
  "order_carts",
  {
    orderId: integer("order_id").notNull(),
    userId: integer("user_id").notNull(),
    itemId: integer("item_id").notNull(),
    quantity: integer("quantity").notNull().default(1),
    ...timestampColumns,
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.orderId, table.userId, table.itemId],
    }),
  }),
);

export const orderCartRelations = relations(orderCarts, ({ one }) => ({
  order: one(orders, {
    fields: [orderCarts.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [orderCarts.userId],
    references: [users.id],
  }),
  item: one(orders, {
    fields: [orderCarts.itemId],
    references: [orders.id],
  }),
}));

export type OrderCart = typeof orderCarts.$inferSelect;

export const orderCartInsertSchema = createInsertSchema(orderCarts);

export type OrderCartInsertSchema = Static<typeof orderCartInsertSchema>;
