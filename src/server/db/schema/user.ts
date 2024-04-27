import { createDbTable } from "@/server/db/schema/_core";
import { integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { dateToDB } from "@/server/db/helper";

export const UserTable = createDbTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  clerkId: text("clerk_id").notNull(),
  email: text("email"),
  display_name: text("display_name").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").$onUpdateFn(() => dateToDB(new Date())),
});

export type User = typeof UserTable.$inferSelect;
export type UserInsert = typeof UserTable.$inferInsert;
