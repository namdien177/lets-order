import { Pool } from "@neondatabase/serverless";

import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema/_output";
import { env } from "@/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });

const db = drizzle(pool, {
  schema,
});

export default db;
