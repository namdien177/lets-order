import { createDbTable } from "@/server/db/schema/_core";
import { integer, text, unique } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { ProductTable } from "@/server/db/schema/product";
import { EventTable } from "@/server/db/schema/event";
import { CartItemTable } from "@/server/db/schema/cart-item";

export const EventProductTable = createDbTable(
  "event_products",
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

export const EventProductRelations = relations(
  EventProductTable,
  ({ one, many }) => ({
    product: one(ProductTable, {
      fields: [EventProductTable.productId],
      references: [ProductTable.id],
    }),
    event: one(EventTable, {
      fields: [EventProductTable.eventId],
      references: [EventTable.id],
    }),
    inCarts: many(CartItemTable),
  }),
);

export type EventProduct = typeof EventProductTable.$inferSelect;
