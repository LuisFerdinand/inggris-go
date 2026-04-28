// app/db/seed/index.ts
import { db } from "@/app/db/db";
import { seedCategories } from "./categories";
import { seedPrograms } from "./programs";
// import { seedContent } from "./content";

async function main() {
  console.log("🌱 Seeding...");

  await seedCategories();
  //   await seedPrograms();
  //   await seedContent();

  console.log("✅ Done seeding");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
