import { createDbTable } from "@/server/db/schema/_core";
import { integer, text, unique } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { ProductTable } from "@/server/db/schema/products";
import { OrderEventTable } from "@/server/db/schema/order-event";
import { OrderItemTable } from "@/server/db/schema/order-item";

export const OrderEventProductTable = createDbTable(
  "order_event_products",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    productId: integer("product_id", { mode: "number" }).notNull(),
    eventId: integer("event_id", { mode: "number" }).notNull(),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => ({
    menu_unique: unique("menu_unique").on(table.productId, table.eventId),
  }),
);

export const OrderEventProductRelations = relations(
  OrderEventProductTable,
  ({ one, many }) => ({
    product: one(ProductTable, {
      fields: [OrderEventProductTable.productId],
      references: [ProductTable.id],
    }),
    event: one(OrderEventTable, {
      fields: [OrderEventProductTable.eventId],
      references: [OrderEventTable.id],
    }),
    inCarts: many(OrderItemTable),
  }),
);

export type OrderEventProduct = typeof OrderEventProductTable.$inferSelect;
