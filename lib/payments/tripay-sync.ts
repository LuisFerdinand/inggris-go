// lib/payments/tripay-sync.ts
//
// Shared DB-update logic for applying a Tripay status to our own
// `payments`/`enrollments` rows. Used by both the webhook handler
// (app/api/payments/tripay/callback/route.ts) and the return page's
// self-heal check (app/(home)/registrasi/sukses/page.tsx) so the two
// paths can never drift out of sync with each other.

import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { enrollments, payments } from "@/app/db/schema/orders";
import {
  getAdminUserIds,
  notifyUsers,
} from "@/app/modules/notifications/server/create-notification";
import { mapTripayStatus } from "./tripay";

export async function applyTripayPaymentStatus(
  payment: typeof payments.$inferSelect,
  tripayStatus: string,
  rawPayload: unknown,
  gatewayReference?: string | null,
) {
  const status = mapTripayStatus(tripayStatus);

  if (status === payment.status) {
    return payment;
  }

  const [updated] = await db
    .update(payments)
    .set({
      status,
      gatewayReference: gatewayReference ?? payment.gatewayReference,
      callbackPayload: rawPayload,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id))
    .returning();

  if (status === "paid") {
    const [enrollment] = await db
      .update(enrollments)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(enrollments.id, payment.enrollmentId))
      .returning();

    const adminIds = await getAdminUserIds();
    await notifyUsers(adminIds, {
      category: "order",
      type: "order_paid",
      title: "Pembayaran berhasil",
      body: enrollment
        ? `Pembayaran dari ${enrollment.customerName} telah dikonfirmasi — ${payment.invoiceNumber}`
        : `Pembayaran ${payment.invoiceNumber} telah dikonfirmasi`,
      link: "/dashboard/orders",
    });
  } else if (status === "expired" || status === "failed") {
    await db
      .update(enrollments)
      .set({
        status: status === "expired" ? "expired" : "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, payment.enrollmentId));
  }

  return updated ?? payment;
}
