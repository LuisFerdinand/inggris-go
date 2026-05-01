import "dotenv/config"; // ✅ MUST be first, before ANY import

import { db } from "@/app/db/db";
import { seedCategories } from "./categories";

async function main() {
  console.log("🌱 Seeding...");
  console.log(process.env.DATABASE_URL);

  await seedCategories();

  console.log("✅ Done seeding");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
