// app/(home)/programs/[categorySlug]/[programSlug]/_components/OnlineRegistrationForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import type { Theme } from "@/lib/utils";
import { buildWhatsappLink } from "@/lib/whatsapp";
import {
  formatStudySchedule,
  STUDY_DAYS,
  STUDY_TIME_SLOTS,
  type StudyDay,
  type StudyTimeSlot,
} from "@/app/modules/order/study-schedule";

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
/** The logged-in parent's account. Only the parent's own data is pre-filled. */
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
const STEPS_WHATSAPP = ["Pilih Program", "Isi Data", "Kirim WhatsApp"];

function StepIndicator({
  current,
  theme,
  steps = STEPS,
}: {
  current: 0 | 1 | 2;
  theme: Theme;
  steps?: string[];
}) {
  return (
    <div className="flex items-start justify-center gap-0 mb-6 sm:mb-8 select-none">
      {steps.map((label, i) => {
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
                      fontSize: "0.75rem",
                      color: active ? "white" : "var(--text-muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              <span
                className="font-display font-semibold whitespace-nowrap"
                style={{
                  fontSize: "0.75rem",
                  color: active
                    ? theme.primary
                    : "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="mx-2 mt-4 transition-all duration-500"
                style={{
                  height: "2px",
                  width: "clamp(20px, 6vw, 56px)",
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
        style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
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
            fontSize: "0.75rem",
            color: "var(--text-muted)",
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
  // 16px on phones (anything smaller makes iOS zoom in on focus), 14px from sm up.
  "w-full min-h-12 rounded-xl border px-4 py-3 text-base sm:text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2";

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
          style={{ fontSize: "0.875rem", color: theme.primary }}
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
                fontSize: "0.75rem",
                color: "var(--text-muted)",
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
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Belum dipilih
              </p>
            )}
          </div>
        )}

        <div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
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
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
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
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Harga normal
                  </p>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
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
                        fontSize: "0.75rem",
                        background: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      HEMAT
                    </span>

                    <p style={{ fontSize: "0.875rem", color: "#15803d" }}>
                      Diskon
                    </p>
                  </div>

                  <p
                    className="font-display font-bold"
                    style={{ fontSize: "0.875rem", color: "#15803d" }}
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
  // "whatsapp" = short form that opens WhatsApp instead of creating an order.
  const isWhatsapp = data?.program.registrationMethod === "whatsapp";

  const [batchId, setBatchId] = useState<string>(initialBatchId ?? "");
  const [packageId, setPackageId] = useState<string>(initialPackageId ?? "");

  // The child (the student).
  const [childName, setChildName] = useState("");
  const [childAgeOrGrade, setChildAgeOrGrade] = useState("");

  // The parent (Ayah/Bunda) — the account owner. Only these two are
  // pre-filled from the logged-in account; the child's data never is.
  const [parentName, setParentName] = useState(initialUser?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(initialUser?.phone ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [note, setNote] = useState("");
  const [waOpened, setWaOpened] = useState(false);

  // Private classes only: preferred study days + time of day.
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);
  const [timeSlot, setTimeSlot] = useState<StudyTimeSlot | "">("");

  // Pre-fill the parent's own data from the account.
  useEffect(() => {
    if (!initialUser) return;

    setParentName((c) => c || initialUser.name || "");
    setEmail((c) => c || initialUser.email || "");
    setWhatsapp((c) => c || initialUser.phone || "");
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

  const hasValidSelection =
    (packages.length === 0 || !!packageId) && (!isScheduled || !!batchId);

  const needsSchedule = !!data?.program.requiresStudySchedule;
  const scheduleValid = !needsSchedule || (studyDays.length > 0 && !!timeSlot);

  const participantValid =
    childName.trim().length >= 2 &&
    childAgeOrGrade.trim().length >= 1 &&
    parentName.trim().length >= 2 &&
    whatsapp.trim().length >= 6 &&
    scheduleValid;

  const canSubmit = isWhatsapp
    ? !!data && hasValidSelection && participantValid
    : !!data &&
      !!packageId &&
      (!isScheduled || !!batchId) &&
      participantValid &&
      /\S+@\S+\.\S+/.test(email) &&
      passwordValid &&
      !register.isPending;

  const studySchedule =
    needsSchedule && studyDays.length > 0 && timeSlot
      ? { days: studyDays, timeSlot }
      : undefined;

  function toggleStudyDay(day: StudyDay) {
    setStudyDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : // keep Monday → Sunday order regardless of click order
          STUDY_DAYS.map((d) => d.value).filter(
            (d) => d === day || current.includes(d),
          ),
    );
  }

  const step: 0 | 1 | 2 = isWhatsapp
    ? waOpened
      ? 2
      : hasValidSelection
        ? 1
        : 0
    : register.isPending || register.isSuccess
      ? 2
      : !!packageId && (!isScheduled || !!batchId)
        ? 1
        : 0;

  function buildWhatsappMessage() {
    if (!data) return "";

    const lines = [
      "Halo! 👋",
      "",
      `Saya ingin mendaftar program *${data.program.title}*.`,
      "",
    ];

    if (selectedBatch) {
      const when = formatDateID(selectedBatch.startDate);
      lines.push(`*Batch:* ${selectedBatch.title}${when ? ` (${when})` : ""}`);
    }
    if (selectedPackage) {
      lines.push(
        `*Paket:* ${selectedPackage.title} — ${formatIDR(selectedPackage.price)}`,
      );
    }
    lines.push(`*Nama anak:* ${childName.trim()}`);
    lines.push(`*Usia / kelas anak:* ${childAgeOrGrade.trim()}`);
    lines.push(`*Nama Ayah/Bunda:* ${parentName.trim()}`);
    lines.push(`*No. WhatsApp orang tua:* ${whatsapp.trim()}`);
    if (studySchedule) {
      lines.push(`*Hari & jam belajar:* ${formatStudySchedule(studySchedule)}`);
    }
    if (note.trim()) lines.push("", `*Catatan:* ${note.trim()}`);
    lines.push("", "Mohon info langkah pendaftaran selanjutnya. Terima kasih 🙏");

    return lines.join(String.fromCharCode(10));
  }

  function whatsappHref() {
    return data
      ? buildWhatsappLink(data.program.whatsappNumber, buildWhatsappMessage())
      : "#";
  }

  function handleSubmit() {
    if (!canSubmit || !data) {
      toast.error("Lengkapi semua field yang diperlukan.");
      return;
    }

    if (isWhatsapp) {
      window.open(whatsappHref(), "_blank", "noopener,noreferrer");
      setWaOpened(true);
      toast.success("Membuka WhatsApp…");
      return;
    }

    register.mutate({
      programId: data.program.id,
      packageId,
      batchId: isScheduled ? batchId : undefined,
      childName: childName.trim(),
      childAgeOrGrade: childAgeOrGrade.trim(),
      parentName: parentName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      studySchedule,
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
      <StepIndicator
        current={step}
        theme={theme}
        steps={isWhatsapp ? STEPS_WHATSAPP : STEPS}
      />

      <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        <div className="space-y-4 sm:space-y-6">
          {isScheduled && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border p-4 sm:p-6"
              style={{
                borderColor: theme.border,
                background: "var(--surface)",
              }}
            >
              <SectionHeader number={1} title="Pilih Batch" theme={theme} />

              {data.batches.length === 0 && (
                <div
                  className="rounded-xl border px-4 py-5 text-center"
                  style={{
                    borderColor: "var(--border-soft)",
                    background: "var(--bg-soft)",
                  }}
                >
                  <p
                    className="font-display font-bold"
                    style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
                  >
                    Belum ada batch yang dibuka
                  </p>
                  <p
                    className="mt-1"
                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                  >
                    Pendaftaran untuk program ini sedang ditutup. Hubungi admin
                    untuk info jadwal batch berikutnya.
                  </p>
                </div>
              )}

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
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
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
            className="rounded-2xl border p-4 sm:p-6"
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
                      className="relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                                fontSize: "0.75rem",
                                background: theme.soft,
                                color: theme.primary,
                              }}
                            >
                              Populer
                            </span>
                          )}
                        </div>

                        {p.description && (
                          <p
                            className="mt-1"
                            style={{
                              fontSize: "0.75rem",
                              lineHeight: 1.5,
                              color: "var(--text-muted)",
                            }}
                          >
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 flex-shrink-0">
                        {p.originalPrice != null && p.originalPrice > p.price && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
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

          {/* ── Data anak ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border p-4 sm:p-6"
            style={{ borderColor: theme.border, background: "var(--surface)" }}
          >
            <SectionHeader
              number={isScheduled ? 3 : 2}
              title="Data Anak"
              theme={theme}
            />

            <div className="grid gap-4">
              <Field label="Nama Anak" required>
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Nama lengkap anak"
                  autoComplete="off"
                />
              </Field>

              <Field
                label="Usia / Kelas Anak"
                required
                hint="Boleh usia atau kelas, mis. 8 tahun atau Kelas 3 SD."
              >
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={childAgeOrGrade}
                  onChange={(e) => setChildAgeOrGrade(e.target.value)}
                  placeholder="Mis. 8 tahun / Kelas 3 SD"
                  autoComplete="off"
                />
              </Field>
            </div>
          </motion.div>

          {/* ── Data Ayah/Bunda ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="rounded-2xl border p-4 sm:p-6"
            style={{ borderColor: theme.border, background: "var(--surface)" }}
          >
            <SectionHeader
              number={isScheduled ? 4 : 3}
              title="Data Ayah/Bunda"
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
                  style={{ fontSize: "0.875rem", color: theme.primary }}
                >
                  Ayah/Bunda sudah login
                </p>

                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  Nama dan nomor WhatsApp diisi otomatis dari akun Ayah/Bunda
                  dan bisa diubah. Data anak perlu diisi di atas.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              <Field label="Nama Ayah/Bunda" required>
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nama lengkap Ayah/Bunda"
                  autoComplete="name"
                />
              </Field>

              <Field
                label="Nomor WhatsApp Orang Tua"
                required
                hint="Admin menghubungi Ayah/Bunda lewat nomor ini."
              >
                <input
                  className={inputCls}
                  style={inputStyle(theme)}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>

              {!isWhatsapp && (
                <Field
                  label="Email"
                  required
                  hint={
                    isLoggedIn
                      ? "Email mengikuti akun yang sedang login."
                      : "Akun untuk Ayah/Bunda akan dibuat memakai email ini."
                  }
                >
                  <input
                    className={inputCls}
                    style={inputStyle(theme, isLoggedIn)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoggedIn}
                  />
                </Field>
              )}

              {!isWhatsapp && !isLoggedIn && (
                <Field
                  label="Password"
                  required
                  hint="Minimal 6 karakter. Dipakai Ayah/Bunda untuk masuk ke akun."
                >
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-16`}
                      style={inputStyle(theme)}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-1 top-1/2 flex h-10 min-w-12 -translate-y-1/2 items-center justify-center px-3 text-sm font-display font-bold"
                      style={{ color: theme.primary }}
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </Field>
              )}

              {isWhatsapp && (
                <Field
                  label="Catatan / Pertanyaan"
                  hint="Opsional. Akan ikut dikirim ke admin lewat WhatsApp."
                >
                  <textarea
                    className={inputCls}
                    style={inputStyle(theme)}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Mis. Anak saya kelas 3 SD, bisa ikut batch ini?"
                  />
                </Field>
              )}
            </div>
          </motion.div>

          {/* ── Hari & jam belajar (Private) ──────────────────────── */}
          {needsSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="rounded-2xl border p-4 sm:p-6"
              style={{
                borderColor: theme.border,
                background: "var(--surface)",
              }}
            >
              <SectionHeader
                number={isScheduled ? 5 : 4}
                title="Hari & Jam Belajar"
                theme={theme}
              />

              <p
                className="mb-4"
                style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
              >
                Kelas private jadwalnya mengikuti keluarga. Pilih hari dan jam
                yang paling nyaman — admin akan mengonfirmasi jadwal akhirnya.
              </p>

              <div className="space-y-5">
                <div role="group" aria-labelledby="study-days-label">
                  <p
                    id="study-days-label"
                    className="font-display font-semibold mb-2"
                    style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
                  >
                    Hari belajar{" "}
                    <span style={{ color: "var(--color-error, #e53e3e)" }}>
                      *
                    </span>
                    <span
                      className="ml-2 font-normal"
                      style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                    >
                      Boleh pilih lebih dari satu
                    </span>
                  </p>

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {STUDY_DAYS.map((d) => {
                      const active = studyDays.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          aria-pressed={active}
                          aria-label={d.label}
                          onClick={() => toggleStudyDay(d.value)}
                          className="min-h-11 rounded-xl border px-2 text-sm font-display font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: active
                              ? theme.primary
                              : "var(--border-soft)",
                            background: active
                              ? theme.primary
                              : "var(--surface)",
                            color: active ? "white" : "var(--blue-navy)",
                            ["--tw-ring-color" as string]: `${theme.primary}40`,
                          }}
                        >
                          <span className="sm:hidden">{d.short}</span>
                          <span className="hidden sm:inline">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div role="group" aria-labelledby="study-time-label">
                  <p
                    id="study-time-label"
                    className="font-display font-semibold mb-2"
                    style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
                  >
                    Jam belajar{" "}
                    <span style={{ color: "var(--color-error, #e53e3e)" }}>
                      *
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STUDY_TIME_SLOTS.map((t) => {
                      const active = timeSlot === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setTimeSlot(t.value)}
                          className="flex min-h-14 flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2"
                          style={{
                            borderColor: active
                              ? theme.primary
                              : "var(--border-soft)",
                            background: active
                              ? `${theme.primary}10`
                              : "var(--surface)",
                            boxShadow: active
                              ? `0 0 0 1.5px ${theme.primary}`
                              : "none",
                            ["--tw-ring-color" as string]: `${theme.primary}40`,
                          }}
                        >
                          <span
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--blue-navy)",
                            }}
                          >
                            {t.label}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {t.hours}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full min-h-14 py-4 rounded-2xl font-display font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: theme.primary,
              boxShadow: `0 8px 28px ${theme.primary}35`,
            }}
            whileHover={canSubmit ? { scale: 1.01 } : undefined}
            whileTap={canSubmit ? { scale: 0.98 } : undefined}
          >
            {isWhatsapp
              ? waOpened
                ? "Kirim Lagi via WhatsApp"
                : "Kirim via WhatsApp"
              : register.isPending
                ? "Memproses…"
                : "Daftar & Lanjut ke Pembayaran"}
          </motion.button>

          {isWhatsapp && (
            <p
              className="text-center"
              style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
            >
              {waOpened ? (
                <>
                  WhatsApp tidak terbuka?{" "}
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                    style={{ color: theme.primary }}
                  >
                    Klik di sini
                  </a>
                  . Admin akan membalas pesan Ayah/Bunda untuk langkah selanjutnya.
                </>
              ) : (
                "Data Ayah/Bunda dikirim sebagai pesan WhatsApp ke admin program ini. Belum ada pembayaran di langkah ini."
              )}
            </p>
          )}
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