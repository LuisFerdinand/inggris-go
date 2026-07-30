// app/db/seed/payment-settings.single.ts

import "./load-env";

import { seedTripayPaymentSettings } from "./payment-settings.seed";

async function main() {
  console.log("🌱 Seeding Tripay Payment Gateway Settings...\n");

  try {
    await seedTripayPaymentSettings();

    console.log("\n✅ Tripay Payment Gateway seed complete.\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Tripay Payment Gateway seed failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
