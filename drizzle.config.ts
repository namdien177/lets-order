import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/schema",
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
  tablesFilter: ["lets_order_*"],
  out: "./migrations",
} satisfies Config;
