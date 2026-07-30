// app/modules/payment-settings/server/payment-settings.service.ts

import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { paymentGatewaySettings } from "@/app/db/schema/payment-settings";
import { decryptSecret } from "@/lib/crypto/secret-box";

export const TRIPAY_PROVIDER = "tripay";

export async function getPaymentGatewaySettings(provider: string) {
  const [row] = await db
    .select()
    .from(paymentGatewaySettings)
    .where(eq(paymentGatewaySettings.provider, provider))
    .limit(1);

  return row ?? null;
}

/** Active gateway settings, with secrets decrypted — server-side use only. */
export async function getActiveGatewayCredentials(provider: string) {
  const row = await getPaymentGatewaySettings(provider);

  if (!row || !row.isActive) return null;

  if (!row.merchantCode || !row.apiKey || !row.privateKey) return null;

  return {
    provider: row.provider,
    merchantCode: row.merchantCode,
    apiKey: decryptSecret(row.apiKey),
    privateKey: decryptSecret(row.privateKey),
    mode: row.mode,
    callbackUrl: row.callbackUrl,
    returnUrl: row.returnUrl,
  };
}
