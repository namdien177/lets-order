import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { timestampColumns } from "@/database/schema/_common";
import { orders } from "@/database/schema/order";
import { users } from "@/database/schema/user";
import { type ObjectType } from "@/lib/types/helper";

export const PAYMENT_STATUS = {
  WAIT_CONFIRMATION: 0,
  CONFIRMED: 1,
} as const;

export type PaymentStatus = ObjectType<typeof PAYMENT_STATUS>;

export const orderPayments = pgTable(
  "order_payments",
  {
    orderId: integer("order_id").notNull(),
    buyerId: integer("buyer_id").notNull(),
    buyerConfirmation: integer("buyer_confirmation")
      .notNull()
      .default(PAYMENT_STATUS.WAIT_CONFIRMATION)
      .$type<PaymentStatus>(),
    ownerConfirmation: integer("owner_confirmation")
      .notNull()
      .default(PAYMENT_STATUS.WAIT_CONFIRMATION)
      .$type<PaymentStatus>(),
    note: varchar("note", { length: 255 }),
    ...timestampColumns,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.buyerId] }),
  }),
);

export const orderPaymentRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, {
    fields: [orderPayments.orderId],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [orderPayments.buyerId],
    references: [users.id],
  }),
}));

export type OrderPayment = typeof orderPayments.$inferSelect;
