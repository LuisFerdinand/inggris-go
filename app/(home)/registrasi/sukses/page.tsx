// app/(home)/registrasi/sukses/page.tsx
//
// Thank-you / confirmation page after a successful registration.
// The DOKU scaffold currently redirects here with ?invoice=...&placeholder=1.
// When real DOKU is wired, point the gateway's return URL here too.

import Link from "next/link";

export default function RegistrasiSuksesPage({
  searchParams,
}: {
  searchParams: { invoice?: string; placeholder?: string };
}) {
  const invoice = searchParams.invoice;
  const isPlaceholder = searchParams.placeholder === "1";

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
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
        </div>

        <h1
          className="font-display font-extrabold"
          style={{ fontSize: "1.5rem", color: "var(--blue-navy)" }}
        >
          Pendaftaran Berhasil
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.7 }}
        >
          Terima kasih sudah mendaftar. Akun siswa kamu sudah dibuat — kamu bisa
          login kapan saja dengan email & password yang tadi diisi.
        </p>

        {invoice && (
          <div
            className="mt-6 rounded-2xl border px-4 py-3 text-left"
            style={{ borderColor: "var(--border-soft)", background: "var(--bg-soft)" }}
          >
            <p style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
              Nomor Invoice
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
            >
              {invoice}
            </p>
          </div>
        )}

        {isPlaceholder && (
          <p
            className="mt-4 rounded-xl px-3 py-2"
            style={{
              fontSize: "0.75rem",
              color: "#b45309",
              background: "rgba(217,119,6,0.1)",
            }}
          >
            Pembayaran online (DOKU) belum aktif. Admin akan menghubungi kamu
            untuk konfirmasi pembayaran.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
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