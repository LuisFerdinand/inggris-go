// app/db/reset/index.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "@/app/db/db";

async function main() {
  console.log("🧹 Resetting database...");

  /**
   * Neon does not allow:
   * SET session_replication_role = 'replica';
   *
   * So the cleanest reset is to drop and recreate the public schema.
   */
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);

  /**
   * Restore default permissions for public schema.
   * This helps avoid permission weirdness after recreating the schema.
   */
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

  console.log("✅ Database reset complete.");
}

main()
  .catch((error) => {
    console.error("❌ Database reset failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });