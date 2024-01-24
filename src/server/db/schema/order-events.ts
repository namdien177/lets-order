import { relations, sql } from "drizzle-orm";
import { bigint, timestamp, varchar } from "drizzle-orm/mysql-core";
import { mysqlTable } from "./_core";
import { OrderEventProducts } from "./order-event-products";
import { OrderGroups } from "@/server/db/schema/order-groups";

export const ORDER_EVENT_STATUS = [
  "CANCELLED",
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
] as const;

export type OrderEventStatus = (typeof ORDER_EVENT_STATUS)[number];

export const OrderEvents = mysqlTable("order_events", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  orderGroupId: bigint("order_group_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  status: varchar("status", { length: 20, enum: ORDER_EVENT_STATUS }),
  endingAt: timestamp("ending_at"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const OrderEventRelations = relations(OrderEvents, ({ one, many }) => ({
  orderGroup: one(OrderGroups, {
    fields: [OrderEvents.orderGroupId],
    references: [OrderGroups.id],
  }),
  receivedOrders: many(OrderEventProducts),
}));

export type OrderEvent = typeof OrderEvents.$inferSelect;
