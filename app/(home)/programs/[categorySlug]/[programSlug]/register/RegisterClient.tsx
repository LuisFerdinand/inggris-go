// app/(home)/programs/[categorySlug]/[programSlug]/register/RegisterClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Package,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function formatIDR(value: number | null | undefined) {
  if (value == null) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const inputCls =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-neutral-400";

type Customer = {
  name: string;
  email: string;
  phone: string;
  age: string;
  note: string;
};

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */

export default function RegisterClient({
  categorySlug,
  programSlug,
}: {
  categorySlug: string;
  programSlug: string;
}) {
  const optionsQuery = trpc.publicPrograms.registrationOptions.useQuery(
    { programSlug },
    { retry: false },
  );

  // Public order write — orders.registerProgram (baseProcedure, guest order).
  const createOrder = trpc.orders.registerProgram.useMutation();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    age: "",
    note: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const data = optionsQuery.data;
  const isScheduled = data?.program.scheduleType === "scheduled";

  // Available packages depend on schedule type.
  const availablePackages = useMemo(() => {
    if (!data) return [];
    if (!isScheduled) return data.directPackages;
    const batch = data.batches.find((b) => b.id === batchId);
    return batch?.packages ?? [];
  }, [data, isScheduled, batchId]);

  function validate() {
    const e: Record<string, string> = {};
    if (!customer.name.trim()) e.name = "Nama wajib diisi";
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) e.email = "Email tidak valid";
    if (!customer.phone.trim()) e.phone = "Nomor WhatsApp wajib diisi";
    if (isScheduled && !batchId) e.batch = "Pilih batch";
    if (!packageId) e.package = "Pilih paket";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!data || !validate()) return;

    try {
      const created = await createOrder.mutateAsync({
        type: "online",
        programId: data.program.id,
        batchId: isScheduled ? (batchId ?? undefined) : undefined,
        packageId: packageId!,
        fullName: customer.name.trim(),
        whatsapp: customer.phone.trim(),
        email: customer.email.trim() || "",
        age: customer.age.trim() ? Number(customer.age) : undefined,
      });

      setDone({ ref: created.orderId });
    } catch {
      // Mutation error surfaces below via createOrder.error
    }
  }

  /* ── Loading / not found ── */
  if (optionsQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-400">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (optionsQuery.isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-neutral-800">
          Program belum tersedia
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Pendaftaran hanya tersedia untuk program yang sudah dipublikasikan.
        </p>
        <Link
          href={`/programs/${categorySlug}/${programSlug}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" /> Kembali ke detail program
        </Link>
      </div>
    );
  }

  /* ── Success ── */
  if (done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Pendaftaran diterima 🎉
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Pesanan kamu sudah kami catat dengan nomor referensi{" "}
          <span className="font-mono font-semibold text-neutral-700">
            {done.ref}
          </span>
          . Tim kami akan menghubungi kamu untuk langkah pembayaran berikutnya.
        </p>
        <Link
          href={`/programs/${categorySlug}/${programSlug}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-4" /> Kembali ke detail program
        </Link>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/programs/${categorySlug}/${programSlug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-600"
      >
        <ArrowLeft className="size-3.5" /> {data.program.title}
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
        Daftar Program
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Isi data berikut untuk mendaftar. Pembayaran akan diproses di langkah
        berikutnya.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-7">
        {/* Batch selection (scheduled only) */}
        {isScheduled && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-800">
              Pilih Batch
            </h2>
            {data.batches.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
                Belum ada batch yang dibuka.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {data.batches.map((b) => {
                  const active = batchId === b.id;
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => {
                        setBatchId(b.id);
                        setPackageId(null);
                      }}
                      className={`flex flex-col gap-1 rounded-xl border-2 p-3.5 text-left transition ${
                        active
                          ? "border-blue-500 bg-blue-50/60"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                        <CalendarClock className="size-3.5 text-neutral-400" />
                        {b.title}
                      </span>
                      <span className="text-xs capitalize text-neutral-400">
                        {b.status} · {b.packages.length} paket
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.batch && (
              <p className="mt-1 text-xs text-red-500">{errors.batch}</p>
            )}
          </section>
        )}

        {/* Package selection */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-neutral-800">
            Pilih Paket
          </h2>
          {availablePackages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
              {isScheduled
                ? "Pilih batch terlebih dahulu untuk melihat paket."
                : "Belum ada paket tersedia."}
            </p>
          ) : (
            <div className="grid gap-2">
              {availablePackages.map((p) => {
                const active = packageId === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPackageId(p.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3.5 text-left transition ${
                      active
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <Package className="size-3.5 text-neutral-400" />
                      {p.title}
                      {p.isDefault && (
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          Populer
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="text-sm font-bold text-neutral-900">
                        {formatIDR(p.price)}
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[11px] text-neutral-300 line-through">
                          {formatIDR(p.originalPrice)}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {errors.package && (
            <p className="mt-1 text-xs text-red-500">{errors.package}</p>
          )}
        </section>

        {/* Customer details */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-neutral-800">Data Diri</h2>

          <div>
            <input
              className={inputCls}
              placeholder="Nama lengkap"
              value={customer.name}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, name: e.target.value }))
              }
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <input
                className={inputCls}
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, email: e.target.value }))
                }
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                className={inputCls}
                placeholder="Nomor WhatsApp"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, phone: e.target.value }))
                }
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="sm:w-40">
            <input
              className={inputCls}
              type="number"
              min={1}
              max={120}
              placeholder="Usia (opsional)"
              value={customer.age}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, age: e.target.value }))
              }
            />
          </div>
        </section>

        {createOrder.isError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {createOrder.error.message || "Gagal membuat pesanan."}
          </p>
        )}

        <button
          type="submit"
          disabled={createOrder.isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {createOrder.isPending && <Loader2 className="size-4 animate-spin" />}
          Lanjut ke Pembayaran
        </button>

        <p className="text-center text-xs text-neutral-400">
          Dengan mendaftar, kamu menyetujui syarat & ketentuan program.
        </p>
      </form>
    </div>
  );
}