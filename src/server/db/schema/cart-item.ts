import { createDbTable } from "@/server/db/schema/_core";
import { integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { EventProductTable } from "@/server/db/schema/event-product";
import { CartTable } from "@/server/db/schema/cart";

export const CartItemTable = createDbTable(
  "cart_items",
  {
    cartId: integer("cart_id", { mode: "number" }).notNull(),
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
      columns: [table.cartId, table.orderEventProductId],
    }),
  }),
);

export const CartItemRelations = relations(CartItemTable, ({ one }) => ({
  registeredProduct: one(EventProductTable, {
    fields: [CartItemTable.orderEventProductId],
    references: [EventProductTable.id],
  }),
  cart: one(CartTable, {
    fields: [CartItemTable.cartId],
    references: [CartTable.id],
  }),
}));

export type CartItem = typeof CartItemTable.$inferSelect;
