import { createDbTable } from "@/server/db/schema/_core";
import { index, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { dateToDB } from "@/server/db/helper";

export const UserTable = createDbTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    clerkAvatar: text("clerk_avatar"),
    displayEmail: text("display_email"),
    displayName: text("display_name").notNull(),
    primaryEmail: text("primary_email"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").$onUpdateFn(() => dateToDB(new Date())),
  },
  (table) => ({
    clerkIdIndex: uniqueIndex("clerk_id_index").on(table.clerkId),
    searchIndex: index("search_index").on(
      table.displayName,
      table.displayEmail,
      table.primaryEmail,
      table.firstName,
      table.lastName,
    ),
  }),
);

export const UserRelations = relations(UserTable, () => ({}));

export type User = typeof UserTable.$inferSelect;
export type UserInsert = typeof UserTable.$inferInsert;
