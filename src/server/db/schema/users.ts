import { index, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { createDbTable } from "@/server/db/schema/_core";

export const Users = createDbTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id", { length: 256 }),
    displayName: text("display_name", { length: 256 }),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updatedAt"),
  },
  (example) => ({
    displayNameIndex: index("display_name_idx").on(example.displayName),
  }),
);
