import { createDbTable } from "@/server/db/schema/_core";
import { integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { EventProductTable } from "@/server/db/schema/event-product";

export const ProductTable = createDbTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price", { mode: "number" }).notNull(),
  clerkId: text("clerk_id").notNull(),
  previousVersionId: integer("previous_version_id", { mode: "number" }),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const ProductTableRelations = relations(
  ProductTable,
  ({ one, many }) => ({
    previousVersion: one(ProductTable, {
      fields: [ProductTable.previousVersionId],
      references: [ProductTable.id],
    }),
    events: many(EventProductTable),
  }),
);

export type Product = typeof ProductTable.$inferSelect;
