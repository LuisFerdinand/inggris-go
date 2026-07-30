// app/api/payments/tripay/callback/route.ts
//
// Tripay closed-payment webhook. Configure this URL as the "Callback URL"
// on the Payment Gateway settings page (and in the Tripay merchant
// dashboard) — Tripay POSTs here whenever a transaction's status changes.

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { payments, paymentWebhooks } from "@/app/db/schema/orders";
import { verifyTripayCallbackSignature } from "@/lib/payments/tripay";
import { applyTripayPaymentStatus } from "@/lib/payments/tripay-sync";
import { generateId } from "@/lib/utils";

type TripayCallbackPayload = {
  reference?: string;
  merchant_ref?: string;
  status?: string;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-callback-signature");

  const isVerified = await verifyTripayCallbackSignature(rawBody, signatureHeader);

  let payload: TripayCallbackPayload | null = null;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  const webhookId = generateId("webhook");

  await db.insert(paymentWebhooks).values({
    id: webhookId,
    provider: "tripay",
    eventType: payload?.status ?? null,
    signature: signatureHeader,
    payload: payload ?? { raw: rawBody },
    isVerified,
    processed: false,
  });

  if (!isVerified || !payload) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 },
    );
  }

  const merchantRef = payload.merchant_ref;

  if (!merchantRef) {
    return NextResponse.json(
      { success: false, message: "Missing merchant_ref" },
      { status: 400 },
    );
  }

  const payment = await db.query.payments.findFirst({
    where: eq(payments.invoiceNumber, merchantRef),
  });

  if (!payment) {
    return NextResponse.json(
      { success: false, message: "Payment not found" },
      { status: 404 },
    );
  }

  await applyTripayPaymentStatus(payment, payload.status ?? "", payload, payload.reference);

  await db
    .update(paymentWebhooks)
    .set({ processed: true })
    .where(eq(paymentWebhooks.id, webhookId));

  return NextResponse.json({ success: true });
}
