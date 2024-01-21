import { bigint, index, timestamp, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

import { mysqlTable } from "@/server/db/schema/_core";

export const Users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    clerkId: varchar("clerk_id", { length: 256 }),
    displayName: varchar("display_name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    displayNameIndex: index("display_name_idx").on(example.displayName),
  }),
);
