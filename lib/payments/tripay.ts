// lib/payments/tripay.ts
//
// Tripay closed-payment integration. Credentials are pulled from the
// `payment_gateway_settings` DB row (managed by super_admin at
// /dashboard/settings/payment-gateway) — never from env vars, so this
// throws instead of silently using stale/missing config.

import { createHmac, timingSafeEqual } from "crypto";

import {
  getActiveGatewayCredentials,
  TRIPAY_PROVIDER,
} from "@/app/modules/payment-settings/server/payment-settings.service";

const SANDBOX_BASE_URL = "https://tripay.co.id/api-sandbox";
const PRODUCTION_BASE_URL = "https://tripay.co.id/api";

const DEFAULT_METHOD = "QRIS";
const EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

export type CreateTripayTransactionInput = {
  /** Your own invoice/order number (unique) — used as Tripay's merchant_ref. */
  invoiceNumber: string;
  /** Amount in IDR (integer rupiah). */
  amount: number;
  /** Tripay payment channel code, e.g. "QRIS", "BRIVA". Defaults to QRIS. */
  method?: string;
  itemName: string;
  customer: {
    name: string;
    email?: string | null;
    phone: string;
  };
};

export type CreateTripayTransactionResult = {
  reference: string;
  paymentUrl: string;
  payCode: string | null;
  qrUrl: string | null;
  status: string;
};

async function getRequiredCredentials() {
  const credentials = await getActiveGatewayCredentials(TRIPAY_PROVIDER);

  if (!credentials) {
    throw new Error(
      "Tripay belum dikonfigurasi atau belum diaktifkan. Silakan lengkapi di Dashboard > Bisnis > Payment Gateway.",
    );
  }

  return credentials;
}

function getBaseUrl(mode: "sandbox" | "production") {
  return mode === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

/**
 * Tripay just redirects the browser to whatever `return_url` we send with
 * the transaction — it doesn't append its own status/reference params. So
 * we tag on our own invoice number here, per-transaction, letting the
 * return page look up the real payment status instead of assuming success.
 */
function buildReturnUrl(baseReturnUrl: string, invoiceNumber: string) {
  try {
    const url = new URL(baseReturnUrl);
    url.searchParams.set("invoice", invoiceNumber);
    return url.toString();
  } catch {
    const separator = baseReturnUrl.includes("?") ? "&" : "?";
    return `${baseReturnUrl}${separator}invoice=${encodeURIComponent(invoiceNumber)}`;
  }
}

export async function createTripayTransaction(
  input: CreateTripayTransactionInput,
): Promise<CreateTripayTransactionResult> {
  const credentials = await getRequiredCredentials();
  const baseUrl = getBaseUrl(credentials.mode);
  const method = input.method?.trim() || DEFAULT_METHOD;

  const signature = createHmac("sha256", credentials.privateKey)
    .update(`${credentials.merchantCode}${input.invoiceNumber}${input.amount}`)
    .digest("hex");

  const payload = {
    method,
    merchant_ref: input.invoiceNumber,
    amount: input.amount,
    customer_name: input.customer.name,
    customer_email: input.customer.email || "no-email@inggrisgo.com",
    customer_phone: input.customer.phone,
    order_items: [
      {
        sku: input.invoiceNumber,
        name: input.itemName,
        price: input.amount,
        quantity: 1,
      },
    ],
    callback_url: credentials.callbackUrl || undefined,
    return_url: credentials.returnUrl
      ? buildReturnUrl(credentials.returnUrl, input.invoiceNumber)
      : undefined,
    expired_time: Math.floor(Date.now() / 1000) + EXPIRY_SECONDS,
    signature,
  };

  const res = await fetch(`${baseUrl}/transaction/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Gagal membuat transaksi Tripay.");
  }

  const data = json.data;

  return {
    reference: data.reference,
    paymentUrl: data.checkout_url,
    payCode: data.pay_code ?? null,
    qrUrl: data.qr_url ?? null,
    status: data.status,
  };
}

export type TripayTransactionDetail = {
  reference: string;
  merchantRef: string;
  status: string;
  raw: unknown;
};

/**
 * Live status lookup, keyed by Tripay's own `reference`. Use this as a
 * fallback when a payment is still `pending` in our DB — the webhook can
 * fail to arrive (tunnel down, signature mismatch, network blip) and this
 * lets the return page self-heal instead of trusting the webhook blindly.
 */
export async function getTripayTransactionDetail(
  reference: string,
): Promise<TripayTransactionDetail> {
  const credentials = await getRequiredCredentials();
  const baseUrl = getBaseUrl(credentials.mode);

  const res = await fetch(
    `${baseUrl}/transaction/detail?reference=${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${credentials.apiKey}` },
    },
  );

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Gagal mengambil status transaksi Tripay.");
  }

  const data = json.data;

  return {
    reference: data.reference,
    merchantRef: data.merchant_ref,
    status: data.status,
    raw: data,
  };
}

/**
 * Verifies Tripay's `X-Callback-Signature` header against the raw request
 * body (must be the untouched request text — signature covers exact bytes).
 */
export async function verifyTripayCallbackSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!signatureHeader) return false;

  const credentials = await getActiveGatewayCredentials(TRIPAY_PROVIDER);
  if (!credentials) return false;

  const expected = createHmac("sha256", credentials.privateKey)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}

/** Maps Tripay's transaction status to our internal payment_status enum. */
export function mapTripayStatus(
  tripayStatus: string,
): "pending" | "paid" | "failed" | "expired" | "refunded" {
  switch (tripayStatus.toUpperCase()) {
    case "PAID":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "FAILED":
      return "failed";
    case "REFUND":
      return "refunded";
    default:
      return "pending";
  }
}
