// app/db/seed/site-header.single.ts

import "dotenv/config";

import { seedSiteHeaderSettings } from "./site-header.seed";

async function main() {
  console.log("🌱 Seeding Site Header Settings...\n");

  try {
    await seedSiteHeaderSettings();

    console.log("\n✅ Site Header seed complete.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Site Header seed failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});