import "dotenv/config"; // ✅ MUST be first, before ANY import

import {
  seedAllPrograms,
  seedCategories,
  seedProgramBatches,
  seedProgramPackages,
  seedPrograms,
  syncProgramStartingPrices,
} from "./programs.seed";
import { seedRoles, seedUserRoles, seedUsers } from "./users.seed";

async function main() {
  console.log("🌱 Seeding...");
  try {
    await seedRoles();

    await seedUsers();

    await seedUserRoles();
    await seedCategories();
    await seedAllPrograms();
    console.log("\n✅  Seed complete.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌  Seed failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
