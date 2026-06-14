// lib/payments/doku.ts
//
// SCAFFOLD ONLY. This does not call DOKU yet — it returns a deterministic
// placeholder so the registration → payment flow compiles and runs end-to-end.
// Drop real credentials + the HTTP call into `createDokuInvoice` later; the
// return shape ({ dokuInvoiceId, paymentUrl }) is what the order router expects,
// so the rest of the app won't need to change.

export type CreateDokuInvoiceInput = {
  /** Your own invoice/order number (unique). */
  invoiceNumber: string;
  /** Amount in IDR (integer rupiah, e.g. 249000). */
  amount: number;
  customer: {
    name: string;
    email?: string | null;
    phone: string;
  };
  /** Optional: where DOKU should send the user back after payment. */
  redirectUrl?: string;
};

export type CreateDokuInvoiceResult = {
  /** DOKU's invoice/payment reference. Placeholder for now. */
  dokuInvoiceId: string;
  /** Hosted payment page URL. Placeholder for now. */
  paymentUrl: string;
};

// TODO(doku): real integration.
//   const res = await fetch(`${process.env.DOKU_BASE_URL}/checkout/v1/payment`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Client-Id": process.env.DOKU_CLIENT_ID!,
//       "Request-Id": crypto.randomUUID(),
//       "Request-Timestamp": new Date().toISOString(),
//       Signature: buildDokuSignature(...),
//     },
//     body: JSON.stringify({
//       order: { invoice_number: input.invoiceNumber, amount: input.amount },
//       payment: { payment_due_date: 60 },
//       customer: { name: input.customer.name, email: input.customer.email, phone: input.customer.phone },
//     }),
//   });
//   const json = await res.json();
//   return { dokuInvoiceId: json.response.order.invoice_number, paymentUrl: json.response.payment.url };

export async function createDokuInvoice(
  input: CreateDokuInvoiceInput,
): Promise<CreateDokuInvoiceResult> {
  // Placeholder: pretend DOKU accepted the invoice and gave us a hosted URL.
  const dokuInvoiceId = `DOKU-PLACEHOLDER-${input.invoiceNumber}`;
  const paymentUrl = `/registrasi/sukses?invoice=${encodeURIComponent(
    input.invoiceNumber,
  )}&placeholder=1`;

  return { dokuInvoiceId, paymentUrl };
}