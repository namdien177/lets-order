import { createDbTable } from "@/server/db/schema/_core";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { OrderEventTable } from "@/server/db/schema/order-event";

export const OrderCartTable = createDbTable(
  "order_carts",
  {
    clerkId: text("clerk_id", { length: 256 }).notNull(),
    eventId: integer("event_id", { mode: "number" }).notNull(),
    note: text("note", { length: 256 }),
    paymentStatus: text("payment_status", {
      length: 20,
      enum: [ORDER_PAYMENT_STATUS.PENDING, ORDER_PAYMENT_STATUS.PAID],
    })
      .notNull()
      .default(ORDER_PAYMENT_STATUS.PENDING),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clerkId, table.eventId] }),
  }),
);

export const OrderCartRelations = relations(OrderCartTable, ({ one }) => ({
  fromEvent: one(OrderEventTable, {
    fields: [OrderCartTable.eventId],
    references: [OrderEventTable.id],
  }),
}));

export type OrderCart = typeof OrderCartTable.$inferSelect;
