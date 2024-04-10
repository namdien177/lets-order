import { createDbTable } from "@/server/db/schema/_core";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { OrderEventProductTable } from "@/server/db/schema/order-event-product";
import { ORDER_EVENT_STATUS, ORDER_PAYMENT_STATUS } from "@/server/db/constant";

export const OrderEventTable = createDbTable(
  "order_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    code: text("code", { length: 12 }).notNull(),
    clerkId: text("clerk_id", { length: 256 }).notNull(),
    name: text("name", { length: 256 }).notNull(),
    eventStatus: text("eventStatus", {
      length: 20,
      enum: [
        ORDER_EVENT_STATUS.CANCELLED,
        ORDER_EVENT_STATUS.DRAFT,
        ORDER_EVENT_STATUS.ACTIVE,
        ORDER_EVENT_STATUS.COMPLETED,
      ],
    })
      .notNull()
      .default(ORDER_EVENT_STATUS.DRAFT),
    paymentStatus: text("paymentStatus", {
      length: 20,
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
}));

export type OrderEvent = typeof OrderEventTable.$inferSelect;
