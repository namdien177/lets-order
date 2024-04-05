import { createDbTable } from "./_core";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { OrderProducts } from "./order-products";
import { OrderEvents } from "./order-events";
import { OrderGroupMembers } from "@/server/db/schema/order-group-member";

export const OrderGroups = createDbTable(
  "order_groups",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }).notNull(),
    description: text("description", { length: 256 }),
    ownerClerkId: text("owner_clerk_id", { length: 256 }).notNull(),
    inviteCode: text("invite_code", { length: 100 }).notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updatedAt"),
  },
  (example) => ({
    nameIndex: index("group_name_idx").on(example.name),
  }),
);

export const OrderGroupRelations = relations(OrderGroups, ({ many }) => ({
  products: many(OrderProducts),
  events: many(OrderEvents),
  members: many(OrderGroupMembers),
}));

export type OrderGroup = typeof OrderGroups.$inferSelect;
