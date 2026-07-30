// app/db/seed/payment-settings.seed.ts
//
// Seeds the Tripay row from env vars (never hardcoded here) so real
// credentials never end up committed to git. Set these in .env.local:
//   TRIPAY_MERCHANT_CODE=...
//   TRIPAY_API_KEY=...
//   TRIPAY_PRIVATE_KEY=...
//   TRIPAY_MODE=sandbox | production   (default: sandbox)
//   TRIPAY_IS_ACTIVE=true | false      (default: true)
//   TRIPAY_CALLBACK_URL=...            (optional)
//   TRIPAY_RETURN_URL=...              (optional)

import { sql } from "drizzle-orm";

import { db } from "@/app/db/db";
import { paymentGatewaySettings } from "../schema/payment-settings";
import { encryptSecret } from "@/lib/crypto/secret-box";
import { generateId } from "@/lib/utils";

export async function seedTripayPaymentSettings() {
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  const apiKey = process.env.TRIPAY_API_KEY;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;

  if (!merchantCode || !apiKey || !privateKey) {
    console.log(
      "Skipping Tripay seed — TRIPAY_MERCHANT_CODE / TRIPAY_API_KEY / TRIPAY_PRIVATE_KEY not set in .env.local.",
    );
    return;
  }

  console.log("Seeding Tripay Payment Gateway Settings...");

  const mode = process.env.TRIPAY_MODE === "production" ? "production" : "sandbox";
  const isActive = process.env.TRIPAY_IS_ACTIVE !== "false";

  const values = {
    id: generateId("pgw"),
    provider: "tripay",
    merchantCode,
    apiKey: encryptSecret(apiKey),
    privateKey: encryptSecret(privateKey),
    mode: mode as "sandbox" | "production",
    callbackUrl: process.env.TRIPAY_CALLBACK_URL ?? null,
    returnUrl: process.env.TRIPAY_RETURN_URL ?? null,
    isActive,
  };

  await db
    .insert(paymentGatewaySettings)
    .values(values)
    .onConflictDoUpdate({
      target: paymentGatewaySettings.provider,
      set: {
        merchantCode: sql`excluded.merchant_code`,
        apiKey: sql`excluded.api_key`,
        privateKey: sql`excluded.private_key`,
        mode: sql`excluded.mode`,
        callbackUrl: sql`excluded.callback_url`,
        returnUrl: sql`excluded.return_url`,
        isActive: sql`excluded.is_active`,
        updatedAt: new Date(),
      },
    });
}
