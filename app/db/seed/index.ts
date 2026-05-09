import "dotenv/config"; // ✅ MUST be first, before ANY import

import {
  seedCategories,
  seedProgramBatches,
  seedPrograms,
} from "./programs.seed";
import { seedRoles, seedUserRoles, seedUsers } from "./users.seed";

async function main() {
  console.log("🌱 Seeding...");

  await seedRoles();

  await seedUsers();

  await seedUserRoles();

  await seedCategories();
  await seedPrograms();
  await seedProgramBatches();

  console.log("✅ Done seeding");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
