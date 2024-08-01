import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/database/schema/_output.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  out: "./migrations",
  strict: true,
} satisfies Config;
