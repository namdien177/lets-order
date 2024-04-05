import { OrderProducts } from "./order-products";
import { OrderEvents } from "./order-events";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { createDbTable } from "./_core";
import { relations, sql } from "drizzle-orm";

export const OrderEventProducts = createDbTable(
  "order_event_products",
  {
    clerkId: text("clerk_id", { length: 256 }).notNull(),
    orderEventId: integer("order_event_id", { mode: "number" }).notNull(),
    orderProductId: integer("order_product_id", { mode: "number" }).notNull(),
    amount: integer("amount", { mode: "number" }).notNull(),
    productReceivedAt: integer("product_received_at", { mode: "timestamp_ms" }),
    paymentReceivedAt: integer("payment_received_at", { mode: "timestamp_ms" }),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    primaryKey: primaryKey({
      columns: [table.clerkId, table.orderEventId, table.orderProductId],
    }),
  }),
);

export const OrderEventProductRelations = relations(
  OrderEventProducts,
  ({ one }) => ({
    fromEvent: one(OrderEvents, {
      fields: [OrderEventProducts.orderEventId],
      references: [OrderEvents.id],
    }),
    orderProduct: one(OrderProducts, {
      fields: [OrderEventProducts.orderProductId],
      references: [OrderProducts.id],
    }),
  }),
);

export type OrderEventProduct = typeof OrderEventProducts.$inferSelect;
