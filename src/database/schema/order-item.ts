import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-typebox";
import type { Static } from "elysia";
import { orders } from "@/database/schema/order";
import { orderCarts } from "@/database/schema/order-cart";
import { products } from "@/database/schema/product";

export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id").notNull(),
    productId: integer("product_id").notNull(),
    availableQuantity: integer("available_quantity"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.productId] }),
  }),
);

export const orderItemRelation = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  cart: many(orderCarts),
}));

export type OrderItem = typeof orderItems.$inferSelect;

export const createOrderItemSchema = createInsertSchema(orderItems);

export type CreateOrderItemSchema = Static<typeof createOrderItemSchema>;
