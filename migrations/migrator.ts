import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createClient } from "@libsql/client";
import { env } from "@/env";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_TOKEN,
});

const db = drizzle(client);
migrate(db, { migrationsFolder: "./migrations" });

client.close();
