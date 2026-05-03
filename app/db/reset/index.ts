import "dotenv/config";

import { db } from "@/app/db/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🧹 Resetting database...");

  // Disable FK temporarily (Postgres)
  await db.execute(sql`SET session_replication_role = 'replica';`);

  await db.execute(sql`
    TRUNCATE TABLE
      programs,
      program_categories,
      program_content,
      batch,
      post,
      post_category,
      tag,
      post_tag,
      post_like,
      post_save,
      post_view
    RESTART IDENTITY CASCADE;
  `);

  // Enable FK back
  await db.execute(sql`SET session_replication_role = 'origin';`);

  console.log("✅ Database cleaned");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
