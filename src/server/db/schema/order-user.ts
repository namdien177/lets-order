import { createDbTable } from "@/server/db/schema/_core";
import { integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { OrderEventProductTable } from "@/server/db/schema/order-event-product";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";

export const OrderUserTable = createDbTable("order_users", {
  clerkId: text("clerk_id", { length: 256 }).notNull(),
  orderEventProductId: integer("order_event_product_id", {
    mode: "number",
  }).notNull(),
  amount: integer("amount", { mode: "number" }).notNull(),
  paymentStatus: text("payment_status", {
    length: 20,
    enum: [ORDER_PAYMENT_STATUS.PENDING, ORDER_PAYMENT_STATUS.PAID],
  })
    .notNull()
    .default(ORDER_PAYMENT_STATUS.PENDING),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});

export const OrderUserRelations = relations(OrderUserTable, ({ one }) => ({
  item: one(OrderEventProductTable, {
    fields: [OrderUserTable.orderEventProductId],
    references: [OrderEventProductTable.id],
  }),
}));

export type OrderUser = typeof OrderUserTable.$inferSelect;
