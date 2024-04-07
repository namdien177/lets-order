import { createDbTable } from "@/server/db/schema/_core";
import { integer, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { ProductTable } from "@/server/db/schema/products";
import { OrderEventTable } from "@/server/db/schema/order-event";
import { OrderUserTable } from "@/server/db/schema/order-user";

export const OrderEventProductTable = createDbTable(
  "order_event_products",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    productId: integer("product_id", { mode: "number" }).notNull(),
    eventId: integer("event_id", { mode: "number" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
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
    orderedBy: many(OrderUserTable),
  }),
);

export type OrderEventProduct = typeof OrderEventProductTable.$inferSelect;
