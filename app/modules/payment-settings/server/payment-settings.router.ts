// app/modules/payment-settings/server/payment-settings.router.ts

import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { paymentGatewaySettings } from "@/app/db/schema/payment-settings";
import { requireDbRole } from "@/lib/auth/roles";
import { encryptSecret } from "@/lib/crypto/secret-box";
import { generateId } from "@/lib/utils";
import { getPaymentGatewaySettings, TRIPAY_PROVIDER } from "./payment-settings.service";

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/* =========================================================
   INPUT
========================================================= */

const updateTripaySettingsInput = z.object({
  merchantCode: z.string().trim().min(1, "Merchant code wajib diisi").max(80),

  // Optional on update: leave blank to keep the currently stored secret.
  apiKey: z.string().trim().max(200).optional(),
  privateKey: z.string().trim().max(200).optional(),

  mode: z.enum(["sandbox", "production"]),

  callbackUrl: z.string().trim().max(500).nullable().optional(),
  returnUrl: z.string().trim().max(500).nullable().optional(),

  isActive: z.boolean().default(false),
});

/* =========================================================
   ROUTER
========================================================= */

export const paymentSettingsRouter = createTRPCRouter({
  getTripaySettings: protectedProcedure.query(async ({ ctx }) => {
    await requireDbRole(ctx.auth?.userId, ["super_admin"]);

    const row = await getPaymentGatewaySettings(TRIPAY_PROVIDER);

    if (!row) {
      return {
        provider: TRIPAY_PROVIDER,
        merchantCode: "",
        apiKeyMasked: "",
        privateKeyMasked: "",
        hasApiKey: false,
        hasPrivateKey: false,
        mode: "sandbox" as const,
        callbackUrl: "",
        returnUrl: "",
        isActive: false,
      };
    }

    return {
      provider: row.provider,
      merchantCode: row.merchantCode ?? "",
      apiKeyMasked: row.apiKey ? "••••••••••••" : "",
      privateKeyMasked: row.privateKey ? "••••••••••••" : "",
      hasApiKey: !!row.apiKey,
      hasPrivateKey: !!row.privateKey,
      mode: row.mode,
      callbackUrl: row.callbackUrl ?? "",
      returnUrl: row.returnUrl ?? "",
      isActive: row.isActive,
    };
  }),

  updateTripaySettings: protectedProcedure
    .input(updateTripaySettingsInput)
    .mutation(async ({ input, ctx }) => {
      await requireDbRole(ctx.auth?.userId, ["super_admin"]);

      const existing = await getPaymentGatewaySettings(TRIPAY_PROVIDER);

      // Secrets are only re-encrypted when a new value was actually typed —
      // otherwise we keep whatever's already stored.
      const apiKey = input.apiKey
        ? encryptSecret(input.apiKey)
        : (existing?.apiKey ?? null);

      const privateKey = input.privateKey
        ? encryptSecret(input.privateKey)
        : (existing?.privateKey ?? null);

      const values = {
        id: existing?.id ?? generateId("pgw"),
        provider: TRIPAY_PROVIDER,
        merchantCode: cleanText(input.merchantCode),
        apiKey,
        privateKey,
        mode: input.mode,
        callbackUrl: cleanText(input.callbackUrl),
        returnUrl: cleanText(input.returnUrl),
        isActive: input.isActive,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(paymentGatewaySettings)
        .values(values)
        .onConflictDoUpdate({
          target: paymentGatewaySettings.provider,
          set: values,
        })
        .returning();

      return {
        provider: row.provider,
        mode: row.mode,
        isActive: row.isActive,
      };
    }),
});
