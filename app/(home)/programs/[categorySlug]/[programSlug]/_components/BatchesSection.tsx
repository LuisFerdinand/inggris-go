// app/(home)/programs/[categorySlug]/[programSlug]/_components/BatchesSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// BatchBanner.tsx — Enhanced sticky announcement banner
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

// ─── Type ────────────────────────────────────────────────────────────────────

import type { ProgramBatch } from "../../data";
import type { Theme } from "@/lib/utils";

// ─── BatchBanner ─────────────────────────────────────────────────────────────

export function BatchBanner({
  batches,
  theme,
}: {
  batches: ProgramBatch[];
  theme: Theme;
}) {
  const open = batches.filter((b) => b.isOpen);
  if (open.length === 0) return null;

  // If multiple open batches, cycle through them
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (open.length <= 1) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % open.length);
    }, 4000);
    return () => clearInterval(t);
  }, [open.length]);

  const batch = open[activeIdx];
  const pct =
    batch.capacity && batch.enrolled
      ? Math.round((batch.enrolled / batch.capacity) * 100)
      : null;
  const spotsLeft =
    batch.capacity && batch.enrolled ? batch.capacity - batch.enrolled : null;

  const ctaHref = batch.primaryCtaHref ?? "#pricing";
  const ctaLabel = batch.primaryCtaLabel ?? "Daftar Sekarang";

  return (
    <motion.div
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="fixed left-0 right-0 z-50 w-full"
      style={{
        top: "var(--navbar-height, 56px)",
        background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong ?? theme.primary} 100%)`,
        height: "var(--batch-banner-height, 48px)",
      }}
    >
      {/* subtle shimmer line */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ mixBlendMode: "screen" }}
      >
        <motion.div
          className="absolute top-0 bottom-0 w-32"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          }}
          animate={{ x: ["-200%", "800%"] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2,
          }}
        />
      </div>

      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-8">
        {/* LEFT: pulse + cycling batch info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* live dot */}
          <div className="relative flex-shrink-0">
            <motion.span
              className="w-2 h-2 rounded-full block"
              style={{ background: "#4ade80" }}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "#4ade80" }}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>

          {/* cycling content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 min-w-0"
            >
              <span
                className="font-display font-bold text-white truncate"
                style={{ fontSize: "0.8125rem" }}
              >
                {batch.label}
              </span>

              {batch.schedule && (
                <span
                  className="hidden sm:block text-white/65 flex-shrink-0"
                  style={{ fontSize: "0.75rem" }}
                >
                  · {batch.schedule}
                </span>
              )}

              {/* urgency pill: spots left */}
              {spotsLeft !== null && spotsLeft <= 10 && (
                <motion.span
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 flex-shrink-0"
                  style={{
                    fontSize: "0.6875rem",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  <span>⚡</span>
                  <span>{spotsLeft} kursi tersisa</span>
                </motion.span>
              )}

              {/* capacity bar (md+) */}
              {pct !== null && spotsLeft === null && (
                <span
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 flex-shrink-0"
                  style={{ fontSize: "0.625rem", color: "white" }}
                >
                  <span>
                    {batch.enrolled}/{batch.capacity} terisi
                  </span>
                  <div className="w-14 h-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* batch indicator dots (if multiple) */}
          {open.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0 ml-1">
              {open.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? "14px" : "5px",
                    height: "5px",
                    background:
                      i === activeIdx ? "white" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CTA(s) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Brochure icon button */}
          {batch.brochure && (
            <motion.a
              href={batch.brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              title={batch.brochure.label ?? "Lihat Brosur"}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path
                  d="M3 2h7l3 3v9H3V2z"
                  stroke="white"
                  strokeWidth={1.3}
                  strokeLinejoin="round"
                />
                <path
                  d="M10 2v3h3M6 8h4M6 11h3"
                  stroke="white"
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
              </svg>
            </motion.a>
          )}

          {/* Primary CTA */}
          <motion.a
            href={ctaHref}
            className="font-display font-bold px-4 py-1.5 rounded-lg bg-white flex-shrink-0 flex items-center gap-1.5"
            style={{
              fontSize: "0.75rem",
              color: theme.primary,
              textDecoration: "none",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{ctaLabel}</span>
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
              <path
                d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                stroke={theme.primary}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BatchesSection ───────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUS_CONFIG = {
  open: {
    label: "Buka",
    dot: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.3)",
    text: "#16a34a",
  },
  coming_soon: {
    label: "Segera",
    dot: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    text: "#d97706",
  },
  full: {
    label: "Penuh",
    dot: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    text: "#dc2626",
  },
  closed: {
    label: "Ditutup",
    dot: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.25)",
    text: "#64748b",
  },
};

// Icon map for primaryCtaIcon / secondaryCtaIcon strings
function CtaIcon({
  name,
  className,
  color,
}: {
  name?: string;
  className?: string;
  color?: string;
}) {
  if (!name) return null;
  const stroke = color ?? "currentColor";
  const props = {
    viewBox: "0 0 16 16",
    className: className ?? "w-3.5 h-3.5",
    fill: "none",
  };

  switch (name) {
    case "arrow-right":
      return (
        <svg {...props}>
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke={stroke}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "message-circle":
      return (
        <svg {...props}>
          <path
            d="M14 7.5A6 6 0 0 1 2.5 11L2 14l3.5-.5A6 6 0 1 1 14 7.5z"
            stroke={stroke}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "external-link":
      return (
        <svg {...props}>
          <path
            d="M7 3H3v10h10V9M10 2h4v4M8 8l5.5-5.5"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

// PDF/brochure icon button with tooltip
function BrochureButton({
  brochure,
  theme,
}: {
  brochure: NonNullable<ProgramBatch["brochure"]>;
  theme: Theme;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div className="relative">
      <motion.a
        href={brochure.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        onFocus={() => setTip(true)}
        onBlur={() => setTip(false)}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
        style={{
          background: "var(--bg-soft, rgba(0,0,0,0.04))",
          border: "1.5px solid var(--border-soft, rgba(0,0,0,0.08))",
          color: theme.primary,
        }}
        whileHover={{ scale: 1.08, backgroundColor: `${theme.primary}18` }}
        whileTap={{ scale: 0.95 }}
        aria-label={brochure.label ?? "Lihat Brosur (PDF)"}
      >
        <svg viewBox="0 0 18 18" className="w-4 h-4" fill="none">
          <rect
            x="2.5"
            y="1.5"
            width="10"
            height="15"
            rx="1.5"
            stroke={theme.primary}
            strokeWidth={1.4}
          />
          <path
            d="M12.5 1.5l3 3v12H15"
            stroke={theme.primary}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <path
            d="M5.5 7h5M5.5 10h5M5.5 13h3"
            stroke={theme.primary}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
          <path
            d="M9.5 1.5v3h3"
            stroke={theme.primary}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
        </svg>
      </motion.a>

      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20"
          >
            <div
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap font-display font-semibold shadow-lg"
              style={{
                fontSize: "0.6875rem",
                background: "var(--blue-navy, #0f172a)",
                color: "white",
              }}
            >
              {brochure.label ?? "Lihat Brosur"}
            </div>
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid var(--blue-navy, #0f172a)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BatchesSection({
  batches,
  theme,
  ctaHref: fallbackCtaHref,
}: {
  batches: ProgramBatch[];
  theme: Theme;
  ctaHref: string;
}) {
  return (
    <section
      id="batches"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      {/* radial top glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, ${theme.soft ?? `${theme.primary}18`} 0%, transparent 70%)`,
        }}
      />

      {/* subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center mb-14">
          {/* pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{
              background: theme.soft ?? `${theme.primary}15`,
              border: `1px solid ${theme.border ?? `${theme.primary}30`}`,
            }}
          >
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
              <rect
                x="1"
                y="3"
                width="12"
                height="10"
                rx="1.5"
                stroke={theme.primary}
                strokeWidth={1.4}
              />
              <path
                d="M4 1v3M10 1v3M1 7h12"
                stroke={theme.primary}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.75rem",
                color: theme.primary,
                letterSpacing: "0.04em",
              }}
            >
              Jadwal Batch
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="font-display font-extrabold mb-4"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--blue-navy)",
              lineHeight: 1.15,
            }}
          >
            Pilih Batch yang{" "}
            <span style={{ color: theme.primary }}>Sesuai Jadwalmu</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.13 }}
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-muted)",
              maxWidth: "460px",
              lineHeight: "1.75",
            }}
          >
            Batch buka secara rutin. Pilih sesi yang paling cocok, lalu
            daftarkan dirimu sebelum kuota habis.
          </motion.p>
        </div>

        {/* ── Cards grid ── */}
        <div
          className={`grid gap-6 ${
            batches.length === 1
              ? "max-w-sm mx-auto"
              : batches.length === 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {batches.map((batch, i) => {
            const cfg = STATUS_CONFIG[batch.status];
            const pct =
              batch.capacity && batch.enrolled
                ? Math.round((batch.enrolled / batch.capacity) * 100)
                : null;
            const spotsLeft =
              batch.capacity && batch.enrolled
                ? batch.capacity - batch.enrolled
                : null;

            const hasPrimary = Boolean(
              batch.primaryCtaLabel && batch.primaryCtaHref,
            );
            const hasSecondary = Boolean(
              batch.secondaryCtaLabel && batch.secondaryCtaHref,
            );
            const primaryHref = batch.primaryCtaHref ?? fallbackCtaHref;
            const isUrgent = spotsLeft !== null && spotsLeft <= 10;

            // Compute duration in days for the visual duration chip
            const durationDays =
              batch.startDate && batch.endDate
                ? Math.round(
                    (new Date(batch.endDate).getTime() -
                      new Date(batch.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ) + 1
                : null;

            return (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
                whileHover={batch.isOpen ? { y: -8 } : undefined}
                className="relative flex flex-col rounded-[28px] overflow-hidden h-full group/card"
                style={{
                  background: "var(--surface)",
                  border: `1.5px solid ${batch.isOpen ? (theme.border ?? `${theme.primary}35`) : "var(--border-soft)"}`,
                  boxShadow: batch.isOpen
                    ? `0 2px 0 0 ${theme.primary}22, 0 8px 40px -8px ${theme.primary}28, 0 1px 3px rgba(0,0,0,0.05)`
                    : "0 1px 8px rgba(0,0,0,0.04)",
                  opacity: batch.status === "closed" ? 0.55 : 1,
                  transition:
                    "box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease",
                }}
              >
                {/* ── Hero header band ── */}
                <div
                  className="relative px-6 pt-6 pb-5 overflow-hidden"
                  style={{
                    background: batch.isOpen
                      ? `linear-gradient(135deg, ${theme.primary}18 0%, ${theme.primary}08 60%, transparent 100%)`
                      : "var(--bg-soft, rgba(0,0,0,0.02))",
                    borderBottom: `1px solid ${batch.isOpen ? `${theme.primary}14` : "var(--border-soft)"}`,
                  }}
                >
                  {/* decorative circle */}
                  {batch.isOpen && (
                    <div
                      className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${theme.primary}22 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Top row: status badge + duration chip */}
                  <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                    {/* Status badge */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-display font-bold"
                      style={{
                        fontSize: "0.5625rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.text,
                      }}
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: cfg.dot }}
                        animate={
                          batch.isOpen
                            ? { opacity: [1, 0.2, 1] }
                            : { opacity: 1 }
                        }
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                      {cfg.label}
                    </span>

                    {/* Duration chip */}
                    {durationDays !== null && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-display font-bold"
                        style={{
                          fontSize: "0.5625rem",
                          letterSpacing: "0.04em",
                          background: "var(--bg-soft, rgba(0,0,0,0.05))",
                          color: "var(--text-faint)",
                          border: "1px solid var(--border-soft)",
                        }}
                      >
                        <svg
                          viewBox="0 0 10 10"
                          className="w-2.5 h-2.5"
                          fill="none"
                        >
                          <circle
                            cx="5"
                            cy="5"
                            r="4"
                            stroke="currentColor"
                            strokeWidth={1.3}
                          />
                          <path
                            d="M5 3v2.5l1.5 1"
                            stroke="currentColor"
                            strokeWidth={1.2}
                            strokeLinecap="round"
                          />
                        </svg>
                        {durationDays} hari
                      </span>
                    )}
                  </div>

                  {/* Batch name */}
                  <p
                    className="font-display font-extrabold leading-tight relative z-10"
                    style={{
                      fontSize: "1.1875rem",
                      color: "var(--blue-navy)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {batch.label}
                  </p>

                  {batch.schedule && (
                    <p
                      className="mt-1 relative z-10"
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-faint)",
                      }}
                    >
                      {batch.schedule}
                    </p>
                  )}

                  {batch.note && (
                    <p
                      className="mt-2 inline-flex items-center gap-1 font-display font-semibold relative z-10"
                      style={{ fontSize: "0.6875rem", color: theme.primary }}
                    >
                      <svg
                        viewBox="0 0 10 10"
                        className="w-2.5 h-2.5"
                        fill="none"
                      >
                        <path
                          d="M5 1l1.1 2.7L9 4.2l-2 2 .5 2.8L5 7.7 2.5 9l.5-2.8-2-2 2.9-.5z"
                          fill={theme.primary}
                        />
                      </svg>
                      {batch.note}
                    </p>
                  )}
                </div>

                {/* ── Card body ── */}
                <div className="px-6 pt-5 pb-6 flex flex-col flex-1 gap-4">
                  {/* Date range — full-width pill */}
                  {(batch.startDate || batch.endDate) && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background: batch.isOpen
                          ? `${theme.primary}0c`
                          : "var(--bg-soft, rgba(0,0,0,0.03))",
                        border: `1px dashed ${batch.isOpen ? `${theme.primary}30` : "var(--border-soft)"}`,
                      }}
                    >
                      {/* Calendar icon with filled dates */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: batch.isOpen
                            ? `${theme.primary}18`
                            : "var(--border-soft)",
                        }}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className="w-4 h-4"
                          fill="none"
                        >
                          <rect
                            x="1.5"
                            y="3"
                            width="13"
                            height="11"
                            rx="2"
                            stroke={
                              batch.isOpen ? theme.primary : "var(--text-faint)"
                            }
                            strokeWidth={1.4}
                          />
                          <path
                            d="M5 1.5v3M11 1.5v3M1.5 7.5h13"
                            stroke={
                              batch.isOpen ? theme.primary : "var(--text-faint)"
                            }
                            strokeWidth={1.4}
                            strokeLinecap="round"
                          />
                          <rect
                            x="3.5"
                            y="9"
                            width="2.5"
                            height="2.5"
                            rx="0.5"
                            fill={
                              batch.isOpen ? theme.primary : "var(--text-faint)"
                            }
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-display font-bold leading-tight"
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--blue-navy)",
                          }}
                        >
                          {batch.startDate && batch.endDate
                            ? `${formatDate(batch.startDate)} – ${formatDate(batch.endDate)}`
                            : batch.startDate
                              ? `Mulai ${formatDate(batch.startDate)}`
                              : ""}
                        </p>
                        {durationDays && (
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--text-faint)",
                              marginTop: "1px",
                            }}
                          >
                            Program {durationDays} hari penuh
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Capacity bar */}
                  {pct !== null && batch.capacity && batch.enrolled && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <svg
                            viewBox="0 0 12 12"
                            className="w-3 h-3"
                            fill="none"
                          >
                            <circle
                              cx="6"
                              cy="4"
                              r="2.5"
                              stroke="var(--text-faint)"
                              strokeWidth={1.2}
                            />
                            <path
                              d="M1.5 10.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
                              stroke="var(--text-faint)"
                              strokeWidth={1.2}
                              strokeLinecap="round"
                            />
                          </svg>
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--text-faint)",
                            }}
                          >
                            Kursi terisi
                          </p>
                        </div>
                        <p
                          className="font-display font-bold"
                          style={{
                            fontSize: "0.6875rem",
                            color: pct >= 80 ? "#dc2626" : "var(--text-faint)",
                          }}
                        >
                          {batch.enrolled}/{batch.capacity}
                          <span className="font-normal opacity-60 ml-0.5">
                            ({pct}%)
                          </span>
                        </p>
                      </div>
                      {/* segmented bar */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, seg) => {
                          const filled = seg < Math.round(pct / 10);
                          return (
                            <motion.div
                              key={seg}
                              className="flex-1 h-1.5 rounded-sm"
                              initial={{ opacity: 0, scaleX: 0 }}
                              whileInView={{ opacity: 1, scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.4,
                                delay: 0.2 + seg * 0.04,
                                ease: EASE,
                              }}
                              style={{
                                background: filled
                                  ? pct >= 80
                                    ? seg >= 8
                                      ? "#ef4444"
                                      : "#f59e0b"
                                    : theme.primary
                                  : "var(--border-soft)",
                                transformOrigin: "left",
                              }}
                            />
                          );
                        })}
                      </div>
                      {isUrgent && (
                        <motion.p
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mt-2 font-display font-bold flex items-center gap-1"
                          style={{ fontSize: "0.6875rem", color: "#dc2626" }}
                        >
                          <span>⚡</span>
                          <span>Hanya {spotsLeft} kursi tersisa!</span>
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* ── Single-row CTA zone ── */}
                  {batch.isOpen ? (
                    <div className="flex items-center gap-2 mt-2">
                      {/* Primary CTA — grows to fill */}
                      <motion.a
                        href={primaryHref}
                        className="relative flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-display font-bold text-white overflow-hidden group/btn"
                        style={{
                          fontSize: "0.875rem",
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.strong ?? theme.primary} 100%)`,
                          boxShadow: `0 4px 20px ${theme.primary}40`,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                        whileHover={{ scale: 1.025 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <motion.span
                          className="absolute inset-0 opacity-0 group-hover/btn:opacity-100"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                          }}
                          animate={{
                            backgroundPosition: ["200% 0", "-200% 0"],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span className="relative z-10 truncate">
                          {hasPrimary ? batch.primaryCtaLabel : "Daftar"}
                        </span>
                        <span className="relative z-10 flex-shrink-0">
                          <CtaIcon
                            name={batch.primaryCtaIcon ?? "arrow-right"}
                            className="w-3.5 h-3.5"
                            color="white"
                          />
                        </span>
                      </motion.a>

                      {/* Secondary CTA — fixed width, text + icon */}
                      {hasSecondary && (
                        <motion.a
                          href={batch.secondaryCtaHref}
                          target={
                            batch.secondaryCtaHref?.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-display font-semibold"
                          style={{
                            fontSize: "0.8125rem",
                            color: theme.primary,
                            background: `${theme.primary}10`,
                            border: `1.5px solid ${theme.primary}28`,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                          whileHover={{
                            scale: 1.04,
                            backgroundColor: `${theme.primary}1c`,
                          }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <CtaIcon
                            name={batch.secondaryCtaIcon}
                            className="w-3.5 h-3.5"
                            color={theme.primary}
                          />
                          <span className="hidden md:inline">
                            {batch.secondaryCtaLabel}
                          </span>
                        </motion.a>
                      )}

                      {/* Brochure icon — smallest, rightmost */}
                      {batch.brochure && (
                        <BrochureButton
                          brochure={batch.brochure}
                          theme={theme}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-display font-semibold"
                      style={{
                        fontSize: "0.875rem",
                        background: "var(--border-soft)",
                        color: "var(--text-faint)",
                      }}
                    >
                      {batch.status === "coming_soon"
                        ? "⏳ Segera Dibuka"
                        : batch.status === "full"
                          ? "Kursi Penuh"
                          : "Ditutup"}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex items-center justify-center gap-2.5"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: theme.soft ?? `${theme.primary}15` }}
          >
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
              <path
                d="M5 2v4M5 7.5v.5"
                stroke={theme.primary}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-faint)" }}>
            Batch dibuka secara berkala — pendaftaran bisa ditutup sewaktu-waktu
            jika kuota penuh.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
