import { createDbTable } from "@/server/db/schema/_core";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { OrderEventProductTable } from "@/server/db/schema/order-event-product";

export const OrderItemTable = createDbTable(
  "order_items",
  {
    clerkId: text("clerk_id", { length: 256 }).notNull(),
    orderEventProductId: integer("order_event_product_id", {
      mode: "number",
    }).notNull(),
    amount: integer("amount", { mode: "number" }).notNull(),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.clerkId, table.orderEventProductId],
    }),
  }),
);

export const OrderItemRelations = relations(OrderItemTable, ({ one }) => ({
  product: one(OrderEventProductTable, {
    fields: [OrderItemTable.orderEventProductId],
    references: [OrderEventProductTable.id],
  }),
}));

export type OrderItem = typeof OrderItemTable.$inferSelect;