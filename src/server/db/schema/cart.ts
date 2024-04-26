import { createDbTable } from "@/server/db/schema/_core";
import { integer, text, unique } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { EventTable } from "@/server/db/schema/event";
import { CartItemTable } from "@/server/db/schema/cart-item";

export const CartTable = createDbTable(
  "carts",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    eventId: integer("event_id", { mode: "number" }).notNull(),
    clerkName: text("clerk_name"),
    clerkEmail: text("clerk_email"),
    note: text("note"),
    paymentConfirmationAt: integer("payment_confirmation_at", {
      mode: "timestamp_ms",
    }),
    paymentAt: integer("payment_at", { mode: "timestamp_ms" }),
    paymentStatus: text("payment_status", {
      enum: [ORDER_PAYMENT_STATUS.PENDING, ORDER_PAYMENT_STATUS.PAID],
    })
      .notNull()
      .default(ORDER_PAYMENT_STATUS.PENDING),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    cartUnique: unique("cart_unique").on(table.clerkId, table.eventId),
  }),
);

export const CartRelations = relations(CartTable, ({ one, many }) => ({
  event: one(EventTable, {
    fields: [CartTable.eventId],
    references: [EventTable.id],
  }),
  itemsInCart: many(CartItemTable),
}));

export type Cart = typeof CartTable.$inferSelect;
