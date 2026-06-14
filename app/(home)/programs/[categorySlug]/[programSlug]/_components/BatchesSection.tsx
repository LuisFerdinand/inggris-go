// app/(home)/programs/[categorySlug]/[programSlug]/_components/BatchesSection.tsx
//
// Exports (both used by client.tsx):
//   • BatchBanner    → fixed top announcement strip (height feeds --batch-banner-height)
//   • BatchesSection → in-page section with two modes:
//        mode="scheduled" → batch cards; highlights DATE, DAY COUNT, PRICE
//        mode="permanent" → price-highlighted PACKAGE cards
//
// Data this needs (see notes at bottom of the file you were given):
//   ProgramBatch  → add optional  price?: string;  originalPrice?: string;
//   BatchesSection→ new optional prop  packages?: PricingPackage[]  (for permanent)

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import type { ProgramBatch, PricingPackage } from "../../data";
import type { Theme } from "@/lib/utils";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

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

const STATUS_CONFIG: Record<
  ProgramBatch["status"],
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  open: { label: "Pendaftaran Dibuka", dot: "#16a34a", bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.28)", text: "#15803d" },
  coming_soon: { label: "Segera Dibuka", dot: "#d97706", bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.28)", text: "#b45309" },
  full: { label: "Kuota Penuh", dot: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.22)", text: "#b91c1c" },
  closed: { label: "Ditutup", dot: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)", text: "#64748b" },
};

const DISABLED_LABEL: Record<ProgramBatch["status"], string> = {
  open: "Daftar",
  coming_soon: "Segera Dibuka",
  full: "Kuota Penuh",
  closed: "Ditutup",
};

function CalendarIcon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className ?? "w-4 h-4"} fill="none">
      <rect x="1.5" y="3" width="13" height="11" rx="2" stroke={color} strokeWidth={1.4} />
      <path d="M5 1.5v3M11 1.5v3M1.5 7.5h13" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className ?? "w-3.5 h-3.5"} fill="none">
      <path d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CtaIcon({ name, color, className }: { name?: string; color: string; className?: string }) {
  const props = { viewBox: "0 0 16 16", className: className ?? "w-3.5 h-3.5", fill: "none" };
  switch (name) {
    case "message-circle":
      return (
        <svg {...props}>
          <path d="M14 7.5A6 6 0 0 1 2.5 11L2 14l3.5-.5A6 6 0 1 1 14 7.5z" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      );
    case "external-link":
      return (
        <svg {...props}>
          <path d="M7 3H3v10h10V9M10 2h4v4M8 8l5.5-5.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "arrow-right":
    default:
      return <ArrowIcon color={color} className={props.className} />;
  }
}

function withQueryParams(
  href: string,
  params: Record<string, string | undefined>,
) {
  const [withoutHash, hash] = href.split("#");
  const [pathname, existingQuery] = withoutHash.split("?");

  const search = new URLSearchParams(existingQuery ?? "");

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  const query = search.toString();

  return `${pathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

/* ─────────────────────────────────────────────────────────────
   BatchBanner — fixed top strip (height feeds --batch-banner-height)
   Hooks run unconditionally before the early return (Rules of Hooks).
───────────────────────────────────────────────────────────── */

export function BatchBanner({
  batches,
  theme,
  registerHref,
}: {
  batches: ProgramBatch[];
  theme: Theme;
  registerHref?: string;
}) {
  const open = useMemo(() => batches.filter((b) => b.isOpen), [batches]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (open.length <= 1) return;
    const t = setInterval(
      () => setActiveIdx((i) => (i + 1) % open.length),
      4000,
    );
    return () => clearInterval(t);
  }, [open.length]);

  if (open.length === 0) return null;

  const batch = open[activeIdx] ?? open[0];
  const spotsLeft =
    batch.capacity && batch.enrolled != null
      ? batch.capacity - batch.enrolled
      : null;

  const ctaHref = registerHref
    ? withQueryParams(registerHref, { batchId: batch.id })
    : batch.primaryCtaHref ?? "#batches";

  const ctaLabel = registerHref
    ? "Daftar Online"
    : batch.primaryCtaLabel ?? "Daftar Sekarang";

  return (
    <motion.div
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed left-0 right-0 z-50 w-full"
      style={{
        top: "var(--navbar-height, 56px)",
        height: "var(--batch-banner-height, 48px)",
        background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong} 100%)`,
      }}
    >
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="relative flex-shrink-0 block w-2 h-2">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "#4ade80" }}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </span>

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

              {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
                <span
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 flex-shrink-0 text-white font-display font-bold"
                  style={{ fontSize: "0.6875rem" }}
                >
                  {spotsLeft} kursi tersisa
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {open.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0 ml-1">
              {open.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Batch ${i + 1}`}
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

        <div className="flex items-center gap-2 flex-shrink-0">
          {batch.brochure && (
            <a
              href={batch.brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              title={batch.brochure.label ?? "Lihat Brosur"}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
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
            </a>
          )}

          <motion.a
            href={ctaHref}
            target={isExternalHref(ctaHref) ? "_blank" : undefined}
            rel={isExternalHref(ctaHref) ? "noopener noreferrer" : undefined}
            className="font-display font-bold px-4 py-1.5 rounded-lg bg-white flex items-center gap-1.5"
            style={{
              fontSize: "0.75rem",
              color: theme.primary,
              textDecoration: "none",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            {ctaLabel}
            <ArrowIcon color={theme.primary} className="w-3 h-3" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHARED SECTION HEADER
───────────────────────────────────────────────────────────── */

function SectionHeader({
  theme,
  eyebrow,
  title,
  titleAccent,
  subtitle,
}: {
  theme: Theme;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
        style={{ background: theme.soft, border: `1px solid ${theme.border}` }}
      >
        <CalendarIcon color={theme.primary} className="w-3.5 h-3.5" />
        <span className="font-display font-bold" style={{ fontSize: "0.75rem", color: theme.primary, letterSpacing: "0.04em" }}>
          {eyebrow}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.07 }}
        className="font-display font-extrabold mb-4"
        style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--blue-navy)", lineHeight: 1.15 }}
      >
        {title} <span style={{ color: theme.primary }}>{titleAccent}</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.13 }}
        style={{ fontSize: "0.9375rem", color: "var(--text-muted)", maxWidth: "460px", lineHeight: "1.75" }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCHEDULED — batch card (highlights DATE · DAY COUNT · PRICE)
───────────────────────────────────────────────────────────── */

function BatchCard({
  batch,
  theme,
  fallbackCtaHref,
  registerHref,
  index,
}: {
  batch: ProgramBatch;
  theme: Theme;
  fallbackCtaHref: string;
  registerHref?: string;
  index: number;
}) {
  const cfg = STATUS_CONFIG[batch.status] ?? STATUS_CONFIG.closed;

  const hasCapacity = Boolean(batch.capacity && batch.enrolled != null);
  const spotsLeft = hasCapacity ? Math.max(batch.capacity! - batch.enrolled!, 0) : null;
  const pct = hasCapacity ? Math.min(Math.round((batch.enrolled! / batch.capacity!) * 100), 100) : null;
  const almostFull = pct !== null && pct >= 80;

  const hasDates = Boolean(batch.startDate || batch.endDate);
  const dateText = hasDates
    ? batch.startDate && batch.endDate
      ? `${formatDate(batch.startDate)} – ${formatDate(batch.endDate)}`
      : batch.startDate
        ? `Mulai ${formatDate(batch.startDate)}`
        : `Sampai ${formatDate(batch.endDate!)}`
    : (batch.schedule ?? "Jadwal menyusul");
  const scheduleSub = hasDates ? batch.schedule : undefined;

  const durationDays =
    batch.startDate && batch.endDate
      ? Math.round(
          (new Date(batch.endDate).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      : null;

  const primaryHref = registerHref
  ? withQueryParams(registerHref, { batchId: batch.id })
  : batch.primaryCtaHref ?? fallbackCtaHref;

  const primaryLabel = registerHref
    ? "Daftar Online"
    : batch.primaryCtaLabel ?? "Daftar Batch Ini";

  const primaryIcon = registerHref
    ? "arrow-right"
    : batch.primaryCtaIcon ?? "arrow-right";
    
  const hasSecondary = Boolean(batch.secondaryCtaLabel && batch.secondaryCtaHref);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      whileHover={batch.isOpen ? { y: -4 } : undefined}
      className="flex flex-col rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${batch.isOpen ? theme.border : "var(--border-soft)"}`,
        boxShadow: batch.isOpen ? `0 8px 32px -12px ${theme.primary}33` : "0 1px 6px rgba(0,0,0,0.04)",
        opacity: batch.status === "closed" ? 0.6 : 1,
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Status + name */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border-soft)" }}>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-display font-bold"
          style={{ fontSize: "0.625rem", letterSpacing: "0.04em", background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>
        <p className="mt-3 font-display font-extrabold leading-tight" style={{ fontSize: "1.1875rem", color: "var(--blue-navy)" }}>
          {batch.label}
        </p>
      </div>

      <div className="px-6 py-5 flex flex-col flex-1 gap-4">
        {/* DATE + DAY COUNT — highlighted tile */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: batch.isOpen ? `${theme.primary}0c` : "var(--bg-soft, rgba(0,0,0,0.03))",
            border: `1px solid ${batch.isOpen ? `${theme.primary}22` : "var(--border-soft)"}`,
          }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: batch.isOpen ? `${theme.primary}18` : "var(--border-soft)" }}
          >
            <CalendarIcon color={batch.isOpen ? theme.primary : "var(--text-faint)"} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold leading-tight" style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}>
              {dateText}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
              {scheduleSub ?? "Jadwal pelaksanaan"}
            </p>
          </div>
          {durationDays !== null && (
            <span
              className="flex-shrink-0 font-display font-extrabold text-center leading-none px-2.5 py-1.5 rounded-xl"
              style={{ background: batch.isOpen ? theme.primary : "var(--text-faint)", color: "white" }}
            >
              <span style={{ fontSize: "0.9375rem", display: "block" }}>{durationDays}</span>
              <span style={{ fontSize: "0.5625rem", opacity: 0.85, letterSpacing: "0.06em" }}>HARI</span>
            </span>
          )}
        </div>

        {/* PRICE — highlighted */}
        {batch.price && (
          <div className="flex items-end justify-between gap-2">
            <div>
              <p style={{ fontSize: "0.6875rem", color: "var(--text-faint)", marginBottom: "1px" }}>Biaya program</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold leading-none" style={{ fontSize: "1.5rem", color: theme.primary, letterSpacing: "-0.02em" }}>
                  {batch.price}
                </span>
                {batch.originalPrice && (
                  <span style={{ fontSize: "0.875rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
                    {batch.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Capacity — calm line */}
        {pct !== null && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                {spotsLeft === 0 ? "Kuota penuh" : `${spotsLeft} kursi tersisa`}
              </span>
              <span className="font-display font-bold" style={{ fontSize: "0.75rem", color: almostFull ? "#dc2626" : "var(--text-faint)" }}>
                {pct}% terisi
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                style={{ background: almostFull ? "#ef4444" : theme.primary }}
              />
            </div>
          </div>
        )}

        {batch.note && (
          <p className="rounded-xl px-3 py-2 font-display font-semibold" style={{ fontSize: "0.75rem", color: theme.primary, background: theme.soft }}>
            {batch.note}
          </p>
        )}

        <div className="flex-1" />

        {/* Actions */}
        {batch.isOpen ? (
          <div className="flex flex-col gap-2">
            <motion.a
              href={primaryHref}
              target={primaryHref.startsWith("http") ? "_blank" : undefined}
              rel={primaryHref.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-white"
              style={{ fontSize: "0.875rem", background: theme.primary, boxShadow: `0 4px 16px ${theme.primary}33`, textDecoration: "none" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {primaryLabel}
              <CtaIcon name={primaryIcon} color="white" />
            </motion.a>

            {hasSecondary && (
              <motion.a
                href={batch.secondaryCtaHref}
                target={batch.secondaryCtaHref!.startsWith("http") ? "_blank" : undefined}
                rel={batch.secondaryCtaHref!.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-semibold"
                style={{ fontSize: "0.8125rem", color: theme.primary, background: `${theme.primary}10`, border: `1.5px solid ${theme.primary}28`, textDecoration: "none" }}
                whileHover={{ scale: 1.02, backgroundColor: `${theme.primary}1c` }}
                whileTap={{ scale: 0.97 }}
              >
                <CtaIcon name={batch.secondaryCtaIcon} color={theme.primary} />
                {batch.secondaryCtaLabel}
              </motion.a>
            )}

            {batch.brochure && (
              <a
                href={batch.brochure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center font-display font-semibold pt-0.5"
                style={{ fontSize: "0.75rem", color: "var(--text-faint)", textDecoration: "none" }}
              >
                {batch.brochure.label ?? "Lihat brosur (PDF)"}
              </a>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-center py-3 rounded-2xl font-display font-semibold"
            style={{ fontSize: "0.875rem", background: "var(--border-soft)", color: "var(--text-faint)" }}
          >
            {DISABLED_LABEL[batch.status]}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PERMANENT — price-highlighted PACKAGE card
───────────────────────────────────────────────────────────── */

function PackageCard({
  pkg,
  theme,
  ctaHref,
  index,
  registerHref,
}: {
  pkg: PricingPackage;
  theme: Theme;
  ctaHref: string;
  index: number;
  registerHref?: string
}) {
  const featured = Boolean(pkg.highlight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      whileHover={{ y: -4 }}
      className="relative flex flex-col rounded-3xl overflow-hidden h-full"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${featured ? theme.primary : theme.border}`,
        boxShadow: featured ? `0 12px 40px -12px ${theme.primary}40` : `0 8px 28px -14px ${theme.primary}22`,
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {featured && (
        <div
          className="text-center py-1.5 font-display font-bold text-white"
          style={{ fontSize: "0.6875rem", letterSpacing: "0.06em", background: theme.primary }}
        >
          {pkg.highlight}
        </div>
      )}

      <div className="px-6 pt-6 pb-6 flex flex-col flex-1 gap-4">
        <p className="font-display font-extrabold" style={{ fontSize: "1.0625rem", color: "var(--blue-navy)" }}>
          {pkg.label}
        </p>

        {/* PRICE — highlighted */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold leading-none" style={{ fontSize: "1.75rem", color: theme.primary, letterSpacing: "-0.02em" }}>
              {pkg.price}
            </span>
            {pkg.originalPrice && (
              <span style={{ fontSize: "0.9375rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
                {pkg.originalPrice}
              </span>
            )}
          </div>
          {pkg.note && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "4px" }}>{pkg.note}</p>
          )}
        </div>

        <div className="flex-1" />

        <motion.a
          href={
            registerHref
              ? withQueryParams(registerHref, { packageId: pkg.id })
              : ctaHref
          }
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold"
          style={{
            fontSize: "0.875rem",
            textDecoration: "none",
            ...(featured
              ? { background: theme.primary, color: "white", boxShadow: `0 4px 16px ${theme.primary}33` }
              : { background: `${theme.primary}10`, color: theme.primary, border: `1.5px solid ${theme.primary}28` }),
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Pilih Paket
          <ArrowIcon color={featured ? "white" : theme.primary} />
        </motion.a>
      </div>
    </motion.div>
  );
}

/* Lightweight fallback when a permanent program has no packages supplied. */
function EvergreenCTA({ theme, ctaHref }: { theme: Theme; ctaHref: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mx-auto max-w-xl rounded-3xl text-center px-7 py-9"
      style={{ background: "var(--surface)", border: `1.5px solid ${theme.border}`, boxShadow: `0 12px 48px -16px ${theme.primary}30` }}
    >
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
        style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.28)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} />
        <span className="font-display font-bold" style={{ fontSize: "0.6875rem", color: "#15803d", letterSpacing: "0.04em" }}>
          Pendaftaran selalu terbuka
        </span>
      </div>
      <h3 className="font-display font-extrabold" style={{ fontSize: "1.375rem", color: "var(--blue-navy)" }}>
        Mulai kapan pun kamu siap
      </h3>
      <p className="mt-2 mb-6 mx-auto" style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: "360px", lineHeight: 1.7 }}>
        Program ini berjalan tanpa batch. Daftar hari ini dan langsung mulai.
      </p>
      <motion.a
        href={ctaHref}
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-white"
        style={{ fontSize: "0.9375rem", background: theme.primary, boxShadow: `0 6px 24px ${theme.primary}40`, textDecoration: "none" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        Daftar Sekarang
        <ArrowIcon color="white" />
      </motion.a>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */

export function BatchesSection({
  batches,
  theme,
  ctaHref,
  mode = "scheduled",
  packages = [],
  registerHref,          // ← NEW: e.g. `/registrasi/${slug}`
}: {
  batches: ProgramBatch[];
  theme: Theme;
  ctaHref: string;
  mode?: "scheduled" | "permanent";
  packages?: PricingPackage[];
  registerHref?: string; // when set, cards link here instead of ctaHref
}) {
  const isPermanent = mode === "permanent";

  return (
    <section id="batches" className="relative py-20 lg:py-28 overflow-hidden" style={{ background: "var(--bg-soft)" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, ${theme.soft} 0%, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {isPermanent ? (
          <>
            <SectionHeader
              theme={theme}
              eyebrow="Pilihan Paket"
              title="Pilih Paket yang"
              titleAccent="Sesuai Kebutuhanmu"
              subtitle="Program fleksibel tanpa jadwal batch. Pilih paket, daftar kapan saja, dan langsung mulai."
            />

            {packages.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  packages.length === 1
                    ? "max-w-sm mx-auto"
                    : packages.length === 2
                      ? "sm:grid-cols-2 max-w-3xl mx-auto"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {packages.map((pkg, i) => (
                  <PackageCard
                    key={`${pkg.label}-${i}`}
                    pkg={pkg}
                    theme={theme}
                    ctaHref={ctaHref}
                    registerHref={registerHref}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EvergreenCTA theme={theme} ctaHref={ctaHref} />
            )}
          </>
        ) : (
          <>
            <SectionHeader
              theme={theme}
              eyebrow="Jadwal Batch"
              title="Pilih Batch yang"
              titleAccent="Sesuai Jadwalmu"
              subtitle="Batch dibuka secara berkala. Pilih sesi yang cocok, lalu daftar sebelum kuota habis."
            />

            <div
              className={`grid gap-6 ${
                batches.length === 1
                  ? "max-w-sm mx-auto"
                  : batches.length === 2
                    ? "sm:grid-cols-2 max-w-3xl mx-auto"
                    : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {batches.map((batch, i) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  theme={theme}
                  fallbackCtaHref={ctaHref}
                  registerHref={registerHref}
                  index={i}
                />
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 text-center"
              style={{ fontSize: "0.8125rem", color: "var(--text-faint)" }}
            >
              Batch dibuka secara berkala — pendaftaran bisa ditutup sewaktu-waktu jika kuota penuh.
            </motion.p>
          </>
        )}
      </div>
    </section>
  );
}