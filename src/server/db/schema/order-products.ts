import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createDbTable } from "./_core";
import { relations, sql } from "drizzle-orm";
import { OrderGroups } from ".";
import { OrderEventProducts } from "./order-event-products";

export const OrderProducts = createDbTable(
  "order_products",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    orderGroupId: integer("order_group_id", { mode: "number" }).notNull(),
    name: text("name", { length: 256 }).notNull(),
    description: text("description", { length: 256 }),
    price: integer("price", { mode: "number" }).notNull(),
    originalId: integer("original_id", { mode: "number" }),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updatedAt"),
    deletedAt: text("deleted_at"),
  },
  (example) => ({
    nameIndex: index("product_name_idx").on(example.name),
  }),
);

export const OrderProductRelations = relations(
  OrderProducts,
  ({ one, many }) => ({
    orderGroup: one(OrderGroups, {
      fields: [OrderProducts.orderGroupId],
      references: [OrderGroups.id],
    }),
    originalProduct: one(OrderProducts, {
      fields: [OrderProducts.originalId],
      references: [OrderProducts.id],
    }),
    oldProduct: one(OrderProducts, {
      fields: [OrderProducts.originalId],
      references: [OrderProducts.id],
    }),
    orderEvents: many(OrderEventProducts),
  }),
);

export type OrderProduct = typeof OrderProducts.$inferSelect;
