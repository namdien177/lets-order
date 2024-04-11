import { createDbTable } from "@/server/db/schema/_core";
import { integer, text, unique } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { OrderEventTable } from "@/server/db/schema/order-event";
import { OrderItemTable } from "@/server/db/schema/order-item";

export const OrderCartTable = createDbTable(
  "order_carts",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id", { length: 100 }).notNull(),
    eventId: integer("event_id", { mode: "number" }).notNull(),
    note: text("note", { length: 100 }),
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
    cartUnique: unique("cart_unique").on(table.clerkId, table.eventId),
  }),
);

export const OrderCartRelations = relations(
  OrderCartTable,
  ({ one, many }) => ({
    fromEvent: one(OrderEventTable, {
      fields: [OrderCartTable.eventId],
      references: [OrderEventTable.id],
    }),
    products: many(OrderItemTable),
  }),
);

export type OrderCart = typeof OrderCartTable.$inferSelect;
