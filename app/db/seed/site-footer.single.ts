// app/db/seed/site-footer.single.ts

import dotenv from "dotenv";

// Load env BEFORE importing anything that imports db.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  console.log("🌱 Seeding Footer Settings...\n");

  try {
    const { seedFooterSettings } = await import("./site-footer.seed");

    await seedFooterSettings();

    console.log("\n✅ Footer seed complete.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Footer seed failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});