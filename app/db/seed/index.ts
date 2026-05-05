import "dotenv/config"; // ✅ MUST be first, before ANY import

import { db } from "@/app/db/db";
import { seedCategories } from "./categories.seed";
import { seedPrograms } from "./programs.seed";

async function main() {
  console.log("🌱 Seeding...");

  await seedCategories();
  await seedPrograms();

  console.log("✅ Done seeding");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
