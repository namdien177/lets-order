import { relations, sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { createDbTable } from "./_core";
import { OrderEventProducts } from "./order-event-products";
import { OrderGroups } from "@/server/db/schema/order-groups";
import { type ObjectType } from "@/lib/types/helper";

export const ORDER_EVENT_STATUS = {
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export type OrderEventStatus = ObjectType<typeof ORDER_EVENT_STATUS>;

export const ORDER_EVENT_VALUES = [
  ORDER_EVENT_STATUS.CANCELLED,
  ORDER_EVENT_STATUS.DRAFT,
  ORDER_EVENT_STATUS.ACTIVE,
  ORDER_EVENT_STATUS.COMPLETED,
] as const;

export const OrderEvents = createDbTable("order_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderGroupId: integer("order_group_id", { mode: "number" }).notNull(),
  name: text("name", { length: 256 }).notNull(),
  status: text("status", {
    length: 20,
    enum: ORDER_EVENT_VALUES,
  })
    .notNull()
    .default(ORDER_EVENT_STATUS.DRAFT),
  endingAt: integer("ending_at", { mode: "timestamp_ms" }),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt"),
});

export const OrderEventRelations = relations(OrderEvents, ({ one, many }) => ({
  orderGroup: one(OrderGroups, {
    fields: [OrderEvents.orderGroupId],
    references: [OrderGroups.id],
  }),
  receivedOrders: many(OrderEventProducts),
}));

export type OrderEventInsert = typeof OrderEvents.$inferInsert;
export type OrderEvent = typeof OrderEvents.$inferSelect;
