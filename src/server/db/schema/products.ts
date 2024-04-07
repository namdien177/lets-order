import { createDbTable } from "@/server/db/schema/_core";
import { integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { OrderEventProductTable } from "@/server/db/schema/order-event-product";

export const ProductTable = createDbTable("products", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 256 }).notNull(),
  description: text("description", { length: 256 }),
  price: integer("price", { mode: "number" }).notNull(),
  clerkId: text("clerk_id", { length: 256 }).notNull(),
  previousVersionId: integer("previous_version_id", { mode: "number" }),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt"),
  deletedAt: text("deleted_at"),
});

export const ProductTableRelations = relations(
  ProductTable,
  ({ one, many }) => ({
    previousVersion: one(ProductTable, {
      fields: [ProductTable.previousVersionId],
      references: [ProductTable.id],
    }),
    events: many(OrderEventProductTable),
  }),
);

export type Product = typeof ProductTable.$inferSelect;
