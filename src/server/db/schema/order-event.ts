import { createDbTable } from "@/server/db/schema/_core";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { OrderEventProductTable } from "@/server/db/schema/order-event-product";
import { ORDER_EVENT_STATUS, ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { OrderCartTable } from "@/server/db/schema/order-cart";

export const OrderEventTable = createDbTable(
  "order_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    clerkId: text("clerk_id").notNull(),
    name: text("name").notNull(),
    // refer ORDER_EVENT_STATUS
    status: integer("status", { mode: "number" })
      .notNull()
      .default(ORDER_EVENT_STATUS.DRAFT),
    paymentAt: integer("payment_at", { mode: "timestamp_ms" }),
    paymentStatus: text("paymentStatus", {
      enum: [ORDER_PAYMENT_STATUS.PENDING, ORDER_PAYMENT_STATUS.PAID],
    })
      .notNull()
      .default(ORDER_PAYMENT_STATUS.PENDING),
    endingAt: integer("ending_at", { mode: "timestamp_ms" }),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    code_index: index("code_index").on(table.code),
  }),
);

export const OrderEventRelations = relations(OrderEventTable, ({ many }) => ({
  menu: many(OrderEventProductTable),
  carts: many(OrderCartTable),
}));

export type OrderEvent = typeof OrderEventTable.$inferSelect;
