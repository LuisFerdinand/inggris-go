// app/(home)/programs/[categorySlug]/[programSlug]/_components/OnlineRegistrationForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import type { Theme } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 * HELPERS
 * ───────────────────────────────────────────────────────────── */
function formatIDR(v: number | null | undefined) {
  if (v == null) return "Gratis";
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function isBatchFull(batch: {
  capacity?: number | null;
  enrolledCount: number;
}) {
  return batch.capacity != null && batch.enrolledCount >= batch.capacity;
}

/* ─────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────── */
type InitialUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
};

type Props = {
  programSlug: string;
  theme: Theme;
  initialBatchId?: string;
  initialPackageId?: string;
  initialUser?: InitialUser;
};

/* ─────────────────────────────────────────────────────────────
 * STEP INDICATOR
 * ───────────────────────────────────────────────────────────── */
const STEPS = ["Pilih Program", "Isi Data", "Bayar"];

function StepIndicator({
  current,
  theme,
}: {
  current: 0 | 1 | 2;
  theme: Theme;
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 select-none">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done || active ? theme.primary : "var(--surface)",
                  border: `2px solid ${
                    done || active ? theme.primary : "var(--border-soft)"
                  }`,
                  boxShadow: active ? `0 0 0 4px ${theme.primary}20` : "none",
                }}
              >
                {done ? (
                  <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none">
                    <path
                      d="M2.5 6l2.5 2.5 4.5-5"
                      stroke="white"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.6875rem",
                      color: active ? "white" : "var(--text-faint)",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              <span
                className="font-display font-semibold whitespace-nowrap"
                style={{
                  fontSize: "0.625rem",
                  color: active
                    ? theme.primary
                    : done
                      ? "var(--text-muted)"
                      : "var(--text-faint)",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className="mx-2 mb-5 transition-all duration-500"
                style={{
                  height: "2px",
                  width: "clamp(24px, 6vw, 56px)",
                  background: done ? theme.primary : "var(--border-soft)",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * FIELD WRAPPER
 * ───────────────────────────────────────────────────────────── */
function Field({
  label,
  hint,
  required,
  children,
  span2,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label
        className="block font-display font-semibold mb-1.5"
        style={{ fontSize: "0.8125rem", color: "var(--blue-navy)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-error, #e53e3e)", marginLeft: 2 }}>
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p
          className="mt-1.5"
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-faint)",
            lineHeight: "1.5",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * INPUT STYLE
 * ───────────────────────────────────────────────────────────── */
const inputCls =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2";

function inputStyle(theme: Theme, disabled?: boolean) {
  return {
    borderColor: "var(--border-soft)",
    background: disabled ? "var(--bg-soft, #f8f9fb)" : "var(--surface)",
    color: "var(--blue-navy)",
    "--tw-ring-color": `${theme.primary}30`,
  } as React.CSSProperties;
}

function formatDateID(value?: string | Date | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────────────────────
 * ORDER SUMMARY
 * ───────────────────────────────────────────────────────────── */
function OrderSummary({
  theme,
  programTitle,
  selectedBatch,
  selectedPackage,
  isScheduled,
}: {
  theme: Theme;
  programTitle?: string;
  selectedBatch?: {
    title: string;
    startDate?: string | Date | null;
  };
  selectedPackage?: {
    title: string;
    price: number;
    originalPrice?: number | null;
  };
  isScheduled: boolean;
}) {
  const hasSelection = selectedPackage != null;

  const discount =
    selectedPackage?.originalPrice &&
    selectedPackage.originalPrice > selectedPackage.price
      ? selectedPackage.originalPrice - selectedPackage.price
      : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${theme.border}`,
        background: "var(--surface)",
      }}
    >
      <div
        className="px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}10, transparent)`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <p
          className="font-display font-bold"
          style={{ fontSize: "0.8125rem", color: theme.primary }}
        >
          Ringkasan Pendaftaran
        </p>

        {programTitle && (
          <p
            className="font-display font-extrabold mt-0.5"
            style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
          >
            {programTitle}
          </p>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        {isScheduled && (
          <div>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-faint)",
                marginBottom: 4,
              }}
              className="uppercase tracking-widest font-display font-semibold"
            >
              Batch
            </p>

            {selectedBatch ? (
              <div className="flex items-start gap-2.5">
                <div
                  className="mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: theme.soft }}
                >
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                    <rect
                      x="1.5"
                      y="1.5"
                      width="9"
                      height="9"
                      rx="1.5"
                      stroke={theme.primary}
                      strokeWidth="1.3"
                    />
                    <path
                      d="M4 1.5v-1M8 1.5v-1M1.5 4h9"
                      stroke={theme.primary}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <p
                    className="font-display font-bold"
                    style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
                  >
                    {selectedBatch.title}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-faint)" }}>
                Belum dipilih
              </p>
            )}
          </div>
        )}

        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-faint)",
              marginBottom: 4,
            }}
            className="uppercase tracking-widest font-display font-semibold"
          >
            Paket
          </p>

          {selectedPackage ? (
            <p
              className="font-display font-bold"
              style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
            >
              {selectedPackage.title}
            </p>
          ) : (
            <p style={{ fontSize: "0.8125rem", color: "var(--text-faint)" }}>
              Belum dipilih
            </p>
          )}
        </div>

        {hasSelection && (
          <div style={{ borderTop: `1px dashed ${theme.border}` }} />
        )}

        {selectedPackage && (
          <div className="space-y-2">
            {discount > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Harga normal
                  </p>

                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-faint)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatIDR(selectedPackage.originalPrice)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full font-display font-bold"
                      style={{
                        fontSize: "0.5625rem",
                        background: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      HEMAT
                    </span>

                    <p style={{ fontSize: "0.8125rem", color: "#15803d" }}>
                      Diskon
                    </p>
                  </div>

                  <p
                    className="font-display font-bold"
                    style={{ fontSize: "0.8125rem", color: "#15803d" }}
                  >
                    − {formatIDR(discount)}
                  </p>
                </div>
              </>
            )}

            <div
              className="flex justify-between items-center pt-2"
              style={{ borderTop: `1.5px solid ${theme.border}` }}
            >
              <p
                className="font-display font-bold"
                style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
              >
                Total
              </p>

              <p
                className="font-display font-extrabold"
                style={{ fontSize: "1.25rem", color: theme.primary }}
              >
                {formatIDR(selectedPackage.price)}
              </p>
            </div>
          </div>
        )}

        <div
          className="rounded-xl px-4 py-3 space-y-2"
          style={{
            background: `${theme.primary}08`,
            border: `1px solid ${theme.border}`,
          }}
        >
          {[
            { icon: "🔒", text: "Pembayaran aman & terenkripsi" },
            { icon: "💬", text: "Admin siap bantu 7 hari seminggu" },
            { icon: "📋", text: "Konfirmasi dikirim via WhatsApp" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span style={{ fontSize: "0.875rem" }}>{icon}</span>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION HEADER
 * ───────────────────────────────────────────────────────────── */
function SectionHeader({
  number,
  title,
  theme,
}: {
  number: number;
  title: string;
  theme: Theme;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-black"
        style={{
          background: theme.primary,
          color: "white",
          fontSize: "0.75rem",
        }}
      >
        {number}
      </div>

      <h2
        className="font-display font-extrabold"
        style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * MAIN FORM
 * ───────────────────────────────────────────────────────────── */
export function OnlineRegistrationForm({
  programSlug,
  theme,
  initialBatchId,
  initialPackageId,
  initialUser,
}: Props) {
  const router = useRouter();
  const isLoggedIn = !!initialUser?.id;

  const optionsQuery = trpc.publicPrograms.registrationOptions.useQuery({
    programSlug,
  });

  const register = trpc.orders.registerOnline.useMutation({
    onSuccess: (res) => {
      toast.success("Pendaftaran berhasil! Mengarahkan ke pembayaran…");
      router.push(res.paymentUrl);
    },
    onError: (err) => toast.error(err.message ?? "Gagal mendaftar, coba lagi."),
  });

  const data = optionsQuery.data;
  const isScheduled = data?.program.scheduleType === "scheduled";

  const [batchId, setBatchId] = useState<string>(initialBatchId ?? "");
  const [packageId, setPackageId] = useState<string>(initialPackageId ?? "");

  const [fullName, setFullName] = useState(initialUser?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(initialUser?.phone ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [age, setAge] = useState(
    initialUser?.age != null ? String(initialUser.age) : "",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill from user session, including saved phone and age.
  useEffect(() => {
    if (!initialUser) return;

    setFullName((c) => c || initialUser.name || "");
    setEmail((c) => c || initialUser.email || "");
    setWhatsapp((c) => c || initialUser.phone || "");
    setAge((c) =>
      c || (initialUser.age != null ? String(initialUser.age) : ""),
    );
  }, [initialUser]);

  useEffect(() => {
    if (!data || !isScheduled || batchId) return;

    const openBatches = data.batches.filter(
      (b) => b.status === "open" && !isBatchFull(b),
    );

    const preferred = initialBatchId
      ? openBatches.find((b) => b.id === initialBatchId)
      : undefined;

    const fallback = openBatches.length === 1 ? openBatches[0] : undefined;
    const next = preferred ?? fallback;

    if (next) setBatchId(next.id);
  }, [data, isScheduled, batchId, initialBatchId]);

  const packages = useMemo(() => {
    if (!data) return [];

    if (isScheduled) {
      const batch = data.batches.find((b) => b.id === batchId);
      return batch?.packages ?? [];
    }

    return data.directPackages;
  }, [data, isScheduled, batchId]);

  useEffect(() => {
    if (!data) return;

    if (packages.length === 0) {
      if (packageId) setPackageId("");
      return;
    }

    const stillValid = packages.some((p) => p.id === packageId);
    if (stillValid) return;

    const preferred = initialPackageId
      ? packages.find((p) => p.id === initialPackageId)
      : undefined;

    const defaultPkg =
      preferred ??
      packages.find((p) => p.isDefault) ??
      [...packages].sort((a, b) => a.price - b.price)[0];

    if (defaultPkg) setPackageId(defaultPkg.id);
  }, [data, packages, packageId, initialPackageId]);

  const selectedBatch = isScheduled
    ? data?.batches.find((b) => b.id === batchId)
    : undefined;

  const selectedPackage = packages.find((p) => p.id === packageId);

  const passwordValid = isLoggedIn || password.length >= 6;

  const canSubmit =
    !!data &&
    !!packageId &&
    (!isScheduled || !!batchId) &&
    fullName.trim().length >= 2 &&
    whatsapp.trim().length >= 6 &&
    /\S+@\S+\.\S+/.test(email) &&
    passwordValid &&
    !register.isPending;

  const step: 0 | 1 | 2 =
    register.isPending || register.isSuccess
      ? 2
      : !!packageId && (!isScheduled || !!batchId)
        ? 1
        : 0;

  function handleSubmit() {
    if (!canSubmit || !data) {
      toast.error("Lengkapi semua field yang diperlukan.");
      return;
    }

    register.mutate({
      programId: data.program.id,
      packageId,
      batchId: isScheduled ? batchId : undefined,
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      age: age ? Number(age) : undefined,
      password: isLoggedIn ? undefined : password,
    });
  }

  if (optionsQuery.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: theme.soft }}
          >
            <motion.div
              className="w-5 h-5 rounded-full border-2"
              style={{
                borderColor: `${theme.primary} transparent transparent transparent`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <p
            className="font-display font-semibold"
            style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
          >
            Memuat pilihan pendaftaran…
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="rounded-3xl border p-10 text-center"
        style={{ borderColor: theme.border, background: "var(--surface)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: theme.soft }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke={theme.primary}
              strokeWidth="1.5"
            />
            <path
              d="M12 8v4M12 16h.01"
              stroke={theme.primary}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p
          className="font-display font-bold mb-1"
          style={{ fontSize: "1.0625rem", color: "var(--blue-navy)" }}
        >
          Pendaftaran Belum Tersedia
        </p>

        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Program ini belum membuka pendaftaran online. Hubungi admin untuk info
          lebih lanjut.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <StepIndicator current={step} theme={theme} />

      <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        <div className="space-y-6">
          {isScheduled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border p-6"
              style={{
                borderColor: theme.border,
                background: "var(--surface)",
              }}
            >
              <SectionHeader number={1} title="Pilih Batch" theme={theme} />

              <div className="grid sm:grid-cols-2 gap-3">
                {data.batches.map((b) => {
                  const active = batchId === b.id;
                  const full = isBatchFull(b);
                  const closed = b.status !== "open";
                  const disabled = full || closed;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setBatchId(b.id);
                        setPackageId("");
                      }}
                      className="relative text-left rounded-xl border p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2"
                      style={{
                        borderColor: active
                          ? theme.primary
                          : "var(--border-soft)",
                        background: active
                          ? `${theme.primary}08`
                          : "var(--surface)",
                        boxShadow: active
                          ? `0 0 0 1.5px ${theme.primary}`
                          : "none",
                        ["--tw-ring-color" as string]: `${theme.primary}40`,
                      }}
                    >
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: theme.primary }}
                          >
                            <svg
                              viewBox="0 0 10 10"
                              className="w-3 h-3"
                              fill="none"
                            >
                              <path
                                d="M2 5l2 2 4-3.5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <p
                        className="font-display font-bold pr-6"
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--blue-navy)",
                        }}
                      >
                        {b.title}
                      </p>

                      {b.startDate && (
                        <p
                          className="mt-1"
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Mulai:{" "}
                          {new Date(b.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: full || closed ? "#f87171" : "#4ade80",
                          }}
                        />

                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          {full
                            ? "Kuota penuh"
                            : closed
                              ? "Ditutup"
                              : b.capacity
                                ? `${b.capacity - b.enrolledCount} kursi tersisa`
                                : "Terbuka"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl border p-6"
            style={{ borderColor: theme.border, background: "var(--surface)" }}
          >
            <SectionHeader
              number={isScheduled ? 2 : 1}
              title="Pilih Paket"
              theme={theme}
            />

            {packages.length === 0 ? (
              <div
                className="rounded-xl border px-4 py-5 text-center"
                style={{
                  borderColor: "var(--border-soft)",
                  background: "var(--bg-soft)",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {isScheduled
                    ? "Pilih batch dulu untuk melihat paket."
                    : "Belum ada paket tersedia."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {packages.map((p) => {
                  const active = packageId === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPackageId(p.id)}
                      className="relative flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2"
                      style={{
                        borderColor: active
                          ? theme.primary
                          : "var(--border-soft)",
                        background: active
                          ? `${theme.primary}08`
                          : "var(--surface)",
                        boxShadow: active
                          ? `0 0 0 1.5px ${theme.primary}`
                          : "none",
                        ["--tw-ring-color" as string]: `${theme.primary}40`,
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.9375rem",
                              color: "var(--blue-navy)",
                            }}
                          >
                            {p.title}
                          </p>

                          {p.isDefault && (
                            <span
                              className="rounded-full px-2 py-0.5 font-display font-bold"
                              style={{
                                fontSize: "0.625rem",
                                background: theme.soft,
                                color: theme.primary,
                              }}
                            >
                              Populer
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 flex-shrink-0">
                        {p.originalPrice != null && p.originalPrice > p.price && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-faint)",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatIDR(p.originalPrice)}
                          </span>
                        )}

                        <span
                          className="font-display font-extrabold"
                          style={{ fontSize: "1rem", color: theme.primary }}
                        >
                          {formatIDR(p.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border p-6"
            style={{ borderColor: theme.border, background: "var(--surface)" }}
          >
            <SectionHeader
              number={isScheduled ? 3 : 2}
              title="Data Peserta"
              theme={theme}
            />

            {isLoggedIn && (
              <div
                className="mb-5 rounded-xl px-4 py-3"
                style={{
                  background: theme.soft,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p
                  className="font-display font-bold"
                  style={{ fontSize: "0.8125rem", color: theme.primary }}
                >
                  Kamu sudah login
                </p>

                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Data akun kamu otomatis dipakai. Nomor WhatsApp dan usia yang
                  kamu isi akan disimpan untuk pendaftaran berikutnya.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nama Lengkap" required span2>
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai identitas"
                />
              </Field>

              <Field label="Nomor WhatsApp" required>
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                />
              </Field>

              <Field label="Usia" hint="Opsional, tapi akan disimpan jika diisi.">
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                  placeholder="Mis. 21"
                  inputMode="numeric"
                />
              </Field>

              <Field
                label="Email"
                required
                span2
                hint={
                  isLoggedIn
                    ? "Email mengikuti akun yang sedang login."
                    : "Akun user akan dibuat memakai email ini."
                }
              >
                <input
                  className={inputCls}
                  style={inputStyle(theme, isLoggedIn)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  type="email"
                  disabled={isLoggedIn}
                />
              </Field>

              {!isLoggedIn && (
                <Field
                  label="Password"
                  required
                  span2
                  hint="Minimal 6 karakter. Password ini dipakai untuk login ke akun user."
                >
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-12`}
                      style={inputStyle(theme)}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      type={showPassword ? "text" : "password"}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-display font-bold"
                      style={{ color: theme.primary }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </Field>
              )}
            </div>
          </motion.div>

          <motion.button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl font-display font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: theme.primary,
              boxShadow: `0 8px 28px ${theme.primary}35`,
            }}
            whileHover={canSubmit ? { scale: 1.01 } : undefined}
            whileTap={canSubmit ? { scale: 0.98 } : undefined}
          >
            {register.isPending
              ? "Memproses…"
              : "Daftar & Lanjut ke Pembayaran"}
          </motion.button>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--navbar-height,72px)+1.5rem)]">
          <OrderSummary
            theme={theme}
            programTitle={data.program.title}
            selectedBatch={selectedBatch}
            selectedPackage={selectedPackage}
            isScheduled={!!isScheduled}
          />
        </aside>
      </div>
    </div>
  );
}