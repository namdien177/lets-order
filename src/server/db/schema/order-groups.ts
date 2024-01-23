import { mysqlTable } from "./_core";
import { bigint, index, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { OrderProducts } from "./order-products";
import { OrderEvents } from "./order-events";

export const OrderGroups = mysqlTable(
  "order_groups",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    ownerClerkId: varchar("owner_clerk_id", { length: 256 }).notNull(),
    inviteCode: varchar("invite_code", { length: 100 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const OrderGroupRelations = relations(OrderGroups, ({ many }) => ({
  products: many(OrderProducts),
  events: many(OrderEvents),
}));

export type OrderGroup = typeof OrderGroups.$inferSelect;
