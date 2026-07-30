// app/(home)/registrasi/sukses/page.tsx
//
// Return page after checkout. Reached two ways:
//  - Real gateway (Tripay): the user's browser is redirected here after
//    they finish (or abandon) the hosted checkout page. This does NOT mean
//    payment succeeded — Tripay just dumps the browser back here. The
//    authoritative status normally comes from the webhook
//    (app/api/payments/tripay/callback), but that can fail to arrive
//    (tunnel down, network blip, signature mismatch) — so if our DB still
//    says "pending" here, we actively ask Tripay for the live status
//    instead of trusting the webhook to have landed in time.
//  - DOKU scaffold fallback: redirects here with ?invoice=...&placeholder=1
//    when no payment gateway is configured — no real payment exists yet.

import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { payments, enrollments } from "@/app/db/schema/orders";
import { getTripayTransactionDetail } from "@/lib/payments/tripay";
import { applyTripayPaymentStatus } from "@/lib/payments/tripay-sync";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ invoice?: string; placeholder?: string }>;
};

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="1.6" />
      <path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="#16a34a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  pending: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#d97706" strokeWidth="1.6" />
      <path
        d="M12 7v5l3.2 2"
        stroke="#d97706"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth="1.6" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="#dc2626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const STATUS_CONTENT: Record<
  "paid" | "pending" | "failed" | "expired" | "cancelled" | "refunded",
  {
    icon: keyof typeof ICONS;
    iconBg: string;
    title: string;
    description: string;
  }
> = {
  paid: {
    icon: "success",
    iconBg: "rgba(22,163,74,0.1)",
    title: "Pembayaran Berhasil",
    description:
      "Terima kasih! Pembayaran kamu sudah kami terima dan akun siswa sudah aktif.",
  },
  pending: {
    icon: "pending",
    iconBg: "rgba(217,119,6,0.1)",
    title: "Menunggu Pembayaran",
    description:
      "Kami belum menerima konfirmasi pembayaran kamu. Jika kamu sudah membayar, halaman ini akan otomatis terupdate — coba cek status ulang dalam beberapa saat.",
  },
  failed: {
    icon: "error",
    iconBg: "rgba(220,38,38,0.1)",
    title: "Pembayaran Gagal",
    description:
      "Transaksi pembayaran kamu tidak berhasil diproses. Silakan coba daftar ulang atau hubungi admin untuk bantuan.",
  },
  expired: {
    icon: "error",
    iconBg: "rgba(220,38,38,0.1)",
    title: "Link Pembayaran Kedaluwarsa",
    description:
      "Waktu pembayaran untuk pendaftaran ini sudah habis. Silakan daftar ulang untuk mendapatkan link pembayaran baru.",
  },
  cancelled: {
    icon: "error",
    iconBg: "rgba(220,38,38,0.1)",
    title: "Pembayaran Dibatalkan",
    description: "Transaksi pembayaran ini telah dibatalkan.",
  },
  refunded: {
    icon: "pending",
    iconBg: "rgba(217,119,6,0.1)",
    title: "Pembayaran Direfund",
    description: "Dana untuk transaksi ini telah dikembalikan.",
  },
};

export default async function RegistrasiSuksesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const invoice = sp.invoice;
  const isPlaceholder = sp.placeholder === "1";

  let payment = invoice
    ? await db.query.payments.findFirst({
        where: eq(payments.invoiceNumber, invoice),
      })
    : null;

  if (
    payment &&
    payment.status === "pending" &&
    payment.provider === "tripay" &&
    payment.gatewayReference
  ) {
    try {
      const detail = await getTripayTransactionDetail(payment.gatewayReference);
      payment = await applyTripayPaymentStatus(
        payment,
        detail.status,
        detail.raw,
        detail.reference,
      );
    } catch {
      // Tripay API unreachable — fall back to whatever's in our DB.
    }
  }

  const enrollment = payment
    ? await db.query.enrollments.findFirst({
        where: eq(enrollments.id, payment.enrollmentId),
        columns: { programSnapshot: true },
      })
    : null;

  const content = payment ? STATUS_CONTENT[payment.status] : null;
  const programTitle = enrollment?.programSnapshot?.title;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: content?.iconBg ?? "rgba(22,163,74,0.1)" }}
        >
          {ICONS[content?.icon ?? "success"]}
        </div>

        <h1
          className="font-display font-extrabold"
          style={{ fontSize: "1.5rem", color: "var(--blue-navy)" }}
        >
          {content?.title ?? "Pendaftaran Berhasil"}
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.7 }}
        >
          {content?.description ??
            "Terima kasih sudah mendaftar. Akun siswa kamu sudah dibuat — kamu bisa login kapan saja dengan email & password yang tadi diisi."}
        </p>

        {(invoice || programTitle) && (
          <div
            className="mt-6 rounded-2xl border px-4 py-3 text-left"
            style={{ borderColor: "var(--border-soft)", background: "var(--bg-soft)" }}
          >
            {programTitle && (
              <>
                <p style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
                  Program
                </p>
                <p
                  className="font-display font-semibold"
                  style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
                >
                  {programTitle}
                </p>
              </>
            )}
            {invoice && (
              <>
                <p
                  className="mt-2"
                  style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}
                >
                  Nomor Invoice
                </p>
                <p
                  className="font-display font-bold"
                  style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
                >
                  {invoice}
                </p>
              </>
            )}
          </div>
        )}

        {payment?.status === "pending" && payment.paymentUrl && (
          <div className="mt-6">
            <a
              href={payment.paymentUrl}
              className="inline-block rounded-xl px-5 py-3 font-display font-bold text-white"
              style={{ background: "#d97706", textDecoration: "none" }}
            >
              Lanjutkan Pembayaran
            </a>
          </div>
        )}

        {!payment && isPlaceholder && (
          <p
            className="mt-4 rounded-xl px-3 py-2"
            style={{
              fontSize: "0.75rem",
              color: "#b45309",
              background: "rgba(217,119,6,0.1)",
            }}
          >
            Pembayaran online belum aktif. Admin akan menghubungi kamu untuk
            konfirmasi pembayaran.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {payment?.status === "pending" && invoice && (
            <a
              href={`/registrasi/sukses?invoice=${encodeURIComponent(invoice)}`}
              className="rounded-xl border px-5 py-3 font-display font-semibold"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--blue-navy)",
                textDecoration: "none",
              }}
            >
              Cek Status Ulang
            </a>
          )}
          <Link
            href="/dashboard"
            className="rounded-xl px-5 py-3 font-display font-bold text-white"
            style={{ background: "var(--blue-navy)", textDecoration: "none" }}
          >
            Masuk ke Akun
          </Link>
          <Link
            href="/programs"
            className="rounded-xl border px-5 py-3 font-display font-semibold"
            style={{
              borderColor: "var(--border-soft)",
              color: "var(--blue-navy)",
              textDecoration: "none",
            }}
          >
            Lihat Program Lain
          </Link>
        </div>
      </div>
    </main>
  );
}
