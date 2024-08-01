import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { orderCarts } from "@/database/schema/order-cart";
import { orderItems } from "@/database/schema/order-item";
import { orderPayments } from "@/database/schema/order-payment";
import { users } from "@/database/schema/user";

import { createInsertSchema } from "drizzle-typebox";
import type { Static } from "elysia";
import { timestampColumns } from "@/database/schema/_common";
import { type ObjectType } from "@/lib/types/helper";

export const ORDER_STATUS = {
  ABORTED: -1,
  OPEN: 0,
  CLOSED: 1,
  COMPLETED: 2,
} as const;

export type OrderStatus = ObjectType<typeof ORDER_STATUS>;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: varchar("name", { length: 60 }).notNull(),
  description: varchar("description", { length: 255 }),
  status: integer("status")
    .notNull()
    .default(ORDER_STATUS.OPEN)
    .$type<OrderStatus>(),
  ...timestampColumns,
});

export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  carts: many(orderCarts),
  payments: many(orderPayments),
  owner: one(users, {
    fields: [orders.ownerId],
    references: [users.id],
  }),
}));

export type Order = typeof orders.$inferSelect;

export const createOrderSchema = createInsertSchema(orders);

export type CreateOrderSchema = Static<typeof createOrderSchema>;
