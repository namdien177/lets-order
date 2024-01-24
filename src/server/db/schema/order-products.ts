import { bigint, index, timestamp, varchar } from "drizzle-orm/mysql-core";
import { mysqlTable } from "./_core";
import { relations, sql } from "drizzle-orm";
import { OrderGroups } from ".";
import { OrderEventProducts } from "./order-event-products";

export const OrderProducts = mysqlTable(
  "order_products",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    orderGroupId: bigint("order_group_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    price: bigint("price", { mode: "number" }).notNull(),
    originalId: bigint("original_id", { mode: "number" }),
    availability: bigint("availability", { mode: "number" })
      .default(sql`0`)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
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
