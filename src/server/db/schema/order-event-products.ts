import { OrderProducts } from "./order-products";
import { OrderEvents } from "./order-events";
import {
  bigint,
  boolean,
  int,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { mysqlTable } from "./_core";
import { relations, sql } from "drizzle-orm";

export const OrderEventProducts = mysqlTable("order_event_products", {
  clerkId: varchar("clerk_id", { length: 256 }).notNull(),
  orderEventId: bigint("order_event_id", { mode: "number" }).notNull(),
  orderProductId: bigint("order_product_id", { mode: "number" }).notNull(),
  amount: int("amount", { unsigned: true }).notNull(),
  isRecieved: boolean("is_recieved")
    .notNull()
    .default(sql`false`),
  paymentReceivedAt: timestamp("payment_received_at"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

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
