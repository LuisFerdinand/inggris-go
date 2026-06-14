// app/db/seed/index.ts

import "dotenv/config"; // ✅ MUST be first, before ANY import

import {
  seedAllPrograms,
  seedCategories,
} from "./programs.seed";

import { seedRoles, seedUserRoles, seedUsers } from "./users.seed";

import { seedAllBlog } from "./blog.seed";

import { seedSiteHeaderSettings } from "./site-header.seed";

async function main() {
  console.log("🌱 Seeding...\n");

  try {
    // ── Auth / users ───────────────────────────────────────────────────────────
    await seedRoles();
    await seedUsers();
    await seedUserRoles();

    // ── Site Header / Layout CMS ───────────────────────────────────────────────
    await seedSiteHeaderSettings();

    // ── Programs ───────────────────────────────────────────────────────────────
    await seedCategories();
    await seedAllPrograms();

    // ── Blog ───────────────────────────────────────────────────────────────────
    // Note: seedPosts() looks up authors by email, so users must be seeded first.
    await seedAllBlog();

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