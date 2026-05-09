import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";

import { createPortal } from "react-dom";
import { TimelineDay, TimelineWeek } from "../../data";
import { Theme } from "@/lib/utils";

type MetaLightboxProps = {
  photos: LightboxPhoto[];
  initialIdx: number;
  onClose: () => void;
  theme: Theme;
};

function MetaLightboxPortal(props: MetaLightboxProps) {
  if (typeof window === "undefined") return null;

  return createPortal(<MetaLightbox {...props} />, document.body);
}

export type TimelineMetaItem = {
  /** For icon-type meta: lucide-style icon name */
  icon?: string;
  title: string;
  description?: string;
  /** For image-type meta: URL to image */
  image?: string;
  /** Tag label shown on image card (top-left badge) */
  tag?: string;
};

export type TimelineContent = {
  icon?: string;
  tagline: string;
  taglineAccent?: string;
  title: string;
  subtitle?: string;
  meta?: TimelineMetaItem[];
  weeks: {
    icon: string;
    week: string;
    title: string;
    points?: string[];
    days?: {
      startTime: string;
      endTime?: string;
      title: string;
      highlight?: boolean;
    }[];
  }[];
};

const EASE = [0.25, 0.1, 0.25, 1] as const;

function ClockIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      style={{ width: size, height: size, flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <polyline points="8 5 8 8 10.2 9.2" />
    </svg>
  );
}

function formatTime(day: TimelineDay): string {
  return day.endTime ? `${day.startTime} – ${day.endTime}` : day.startTime;
}

function ScheduleCard({ week, theme }: { week: TimelineWeek; theme: Theme }) {
  return (
    <Reveal>
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 8px 40px ${theme.border}`,
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-3.5 px-7 py-5"
          style={{
            background: theme.soft,
            borderBottom: `1.5px solid ${theme.border}`,
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: theme.primary,
              boxShadow: `0 4px 16px ${theme.border}`,
            }}
          >
            <Icon
              name={week.icon as any}
              className="w-5 h-5"
              style={{ color: "white" }}
            />
          </div>
          <div>
            <p
              className="font-display font-bold uppercase"
              style={{
                fontSize: "0.625rem",
                letterSpacing: "0.14em",
                color: theme.primary,
                marginBottom: 2,
              }}
            >
              {week.week}
            </p>
            <p
              className="font-display font-extrabold"
              style={{ fontSize: "1.125rem", color: "var(--blue-navy)" }}
            >
              {week.title}
            </p>
          </div>
        </div>

        {/* Points (optional) — shown above days if present */}
        {week.points && week.points.length > 0 && (
          <div
            className="px-7 py-5 grid sm:grid-cols-2 gap-3"
            style={{ borderBottom: `1px solid var(--border-soft)` }}
          >
            {week.points.map((pt) => (
              <div key={pt} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke={theme.primary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                  }}
                >
                  {pt}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Days — horizontal grid */}
        {week.days && week.days.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            }}
          >
            {week.days.map((day, i) => {
              const isHighlight = !!day.highlight;
              return (
                <Reveal key={`${day.startTime}-${i}`} delay={i * 0.05}>
                  <motion.div
                    whileHover={{
                      backgroundColor: isHighlight ? "#fff2e0" : "#f8fafc",
                    }}
                    transition={{ duration: 0.18 }}
                    className="relative flex flex-col items-center text-center"
                    style={{
                      padding: "18px 14px 16px",
                      background: isHighlight ? "#fff7ed" : "transparent",
                      // right-border divider (CSS, not JS)
                      borderRight:
                        i < week.days!.length - 1
                          ? "1px solid var(--border-soft)"
                          : "none",
                      // on mobile wrap: bottom borders via Tailwind won't work cleanly
                      // we handle with the wrapper's divide utility below
                    }}
                  >
                    {/* Time badge */}
                    <div
                      className="inline-flex items-center gap-1 rounded-full mb-2.5"
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                        background: isHighlight ? "#fff7ed" : theme.soft,
                        color: isHighlight ? "#c2410c" : theme.primary,
                        border: `1px solid ${isHighlight ? "#fed7aa" : theme.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ClockIcon size={11} />
                      {formatTime(day)}
                    </div>

                    {/* Dot accent */}
                    <div
                      className="rounded-full mb-2"
                      style={{
                        width: 6,
                        height: 6,
                        background: isHighlight ? "#f97316" : theme.primary,
                        opacity: isHighlight ? 0.7 : 0.45,
                      }}
                    />

                    {/* Title */}
                    <p
                      className="font-display font-semibold leading-snug"
                      style={{
                        fontSize: "0.8125rem",
                        color: isHighlight ? "#c2410c" : "var(--blue-navy)",
                        lineHeight: 1.35,
                      }}
                    >
                      {day.title}
                    </p>

                    {/* "Final" badge for highlighted */}
                    {isHighlight && (
                      <span
                        className="mt-2 px-2 py-0.5 rounded-full font-display font-bold"
                        style={{
                          fontSize: "0.5rem",
                          background: "#f97316",
                          color: "white",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Final
                      </span>
                    )}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </Reveal>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.52, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── Lightbox (reused from GallerySection pattern) ────────────────────────────

type LightboxPhoto = {
  src: string;
  caption?: string;
  tag?: string;
};

function MetaLightbox({
  photos,
  initialIdx,
  onClose,
  theme,
}: {
  photos: LightboxPhoto[];
  initialIdx: number;
  onClose: () => void;
  theme: Theme;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const touchStartX = useRef(0);

  const nav = useCallback(
    (dir: number) =>
      setIdx((i) => Math.max(0, Math.min(photos.length - 1, i + dir))),
    [photos.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === "ArrowRight") nav(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = photos[idx];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: "rgba(4,10,28,0.95)" }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
      }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex flex-col items-center max-w-[94vw] w-full">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
          style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
          >
            <img
              src={current.src}
              alt={current.caption ?? `Foto ${idx + 1}`}
              className="block max-w-[88vw] max-h-[68vh] object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        <div className="text-center mt-4 min-h-10 px-4">
          {current.tag && (
            <p
              className="font-display font-semibold uppercase mb-1"
              style={{
                fontSize: "0.5625rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.14em",
              }}
            >
              {current.tag}
            </p>
          )}
          {current.caption && (
            <p
              className="font-medium"
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.55",
                maxWidth: "520px",
              }}
            >
              {current.caption}
            </p>
          )}
        </div>

        {/* Nav arrows + counter */}
        <div className="flex items-center gap-5 mt-4">
          {(
            [
              [-1, "←", "Sebelumnya"],
              [1, "→", "Berikutnya"],
            ] as const
          ).map(([dir, arrow, label], ki) => {
            const disabled = ki === 0 ? idx === 0 : idx === photos.length - 1;
            return ki === 0 ? (
              <React.Fragment key={ki}>
                <button
                  onClick={() => nav(dir)}
                  disabled={!!disabled}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    opacity: disabled ? 0.2 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label={label}
                >
                  {arrow}
                </button>
                <span
                  className="font-display font-semibold"
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.4)",
                    minWidth: 56,
                    textAlign: "center",
                  }}
                >
                  {idx + 1} / {photos.length}
                </span>
              </React.Fragment>
            ) : (
              <button
                key={ki}
                onClick={() => nav(dir)}
                disabled={!!disabled}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  opacity: disabled ? 0.2 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
                aria-label={label}
              >
                {arrow}
              </button>
            );
          })}
        </div>

        {/* Dot scrubber */}
        <div className="flex items-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full border-none cursor-pointer"
              animate={{ width: i === idx ? 18 : 5 }}
              style={{
                background:
                  i === idx ? theme.primary : "rgba(255,255,255,0.22)",
              }}
              transition={{ duration: 0.25, ease: EASE }}
              aria-label={`Item ${i + 1}`}
            />
          ))}
        </div>

        <p
          className="sm:hidden mt-3 font-display"
          style={{
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.04em",
          }}
        >
          Geser kiri/kanan untuk navigasi
        </p>
      </div>
    </motion.div>
  );
}

// ─── Image Meta Card ──────────────────────────────────────────────────────────

function ImageMetaCard({
  item,
  index,
  onClick,
  theme,
}: {
  item: TimelineMetaItem;
  index: number;
  onClick: (idx: number) => void;
  theme: Theme;
}) {
  return (
    <Reveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative group cursor-pointer rounded-2xl overflow-hidden flex flex-col"
        style={{
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 6px 28px ${theme.border}`,
          background: "var(--surface)",
        }}
        onClick={() => onClick(index)}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "4/3" }}
        >
          <img
            src={item.image!}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            loading="lazy"
          />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Tag badge */}
          {item.tag && (
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg z-10"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(6px)",
              }}
            >
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="#f59e0b">
                <path d="M6 1l1.2 2.1 2.4.3-1.75 1.7.4 2.4L6 6.3 3.75 7.5l.4-2.4L2.4 3.4l2.4-.3z" />
              </svg>
              <span
                className="font-display font-bold"
                style={{
                  fontSize: "0.5rem",
                  color: "#0a1628",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {item.tag}
              </span>
            </div>
          )}

          {/* Hover zoom hint */}
          <div
            className="absolute inset-0 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div
              className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center
                         scale-75 group-hover:scale-100 transition-transform duration-300"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                <circle
                  cx="9"
                  cy="9"
                  r="5.5"
                  stroke="#0a1628"
                  strokeWidth="1.7"
                />
                <path
                  d="M13.5 13.5l3 3"
                  stroke="#0a1628"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M9 7v4M7 9h4"
                  stroke="#0a1628"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="px-4 py-3.5 flex-1 flex flex-col justify-center">
          <p
            className="font-display font-bold leading-snug mb-1"
            style={{
              fontSize: "0.875rem",
              color: "var(--blue-navy)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </p>
          {item.description && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: "1.65",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </p>
          )}
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── Image Meta Section ───────────────────────────────────────────────────────

function ImageMetaSection({
  items,
  theme,
  onOpen,
}: {
  items: TimelineMetaItem[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const n = items.length;

  // Max cards to show before overflow overlay kicks in
  const MAX_VISIBLE = 4;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const remaining = n > MAX_VISIBLE ? n - MAX_VISIBLE : 0;
  // Last visible card becomes the overflow card when there are extras
  const overflowIdx = MAX_VISIBLE - 1;
  const displayItems =
    remaining > 0 ? visibleItems.slice(0, overflowIdx) : visibleItems;

  // Responsive column count: 1 item → max 1 col, 2 → 2, 3 → 3, 4+ → 4
  const colClass =
    n === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : n === 2
        ? "grid-cols-2 max-w-xl mx-auto"
        : n === 3
          ? "grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <Reveal>
      <div className={`grid gap-4 ${colClass}`}>
        {/* Visible cards */}
        {displayItems.map((item, i) => (
          <ImageMetaCard
            key={i}
            item={item}
            index={i}
            onClick={onOpen}
            theme={theme}
          />
        ))}

        {/* Overflow card — shows last photo dimmed + "+N more" */}
        {remaining > 0 && (
          <Reveal delay={overflowIdx * 0.08}>
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative group cursor-pointer rounded-2xl overflow-hidden flex flex-col"
              style={{
                border: `1.5px solid ${theme.border}`,
                boxShadow: `0 6px 28px ${theme.border}`,
                background: "var(--surface)",
              }}
              onClick={() => onOpen(overflowIdx)}
            >
              {/* Image with overlay */}
              <div
                className="relative overflow-hidden flex-shrink-0"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={items[overflowIdx].image!}
                  alt={items[overflowIdx].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  loading="lazy"
                />
                {/* Dark overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: "rgba(10,22,40,0.65)" }}
                >
                  <span
                    className="font-display font-extrabold text-white leading-none"
                    style={{
                      fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    +{remaining + 1}
                  </span>
                  <span
                    className="font-display font-semibold uppercase mt-1"
                    style={{
                      fontSize: "0.5rem",
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    foto lagi
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="px-4 py-3.5 flex-1 flex flex-col justify-center">
                <p
                  className="font-display font-bold leading-snug"
                  style={{
                    fontSize: "0.875rem",
                    color: theme.primary,
                  }}
                >
                  Lihat semua foto
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-faint)",
                    lineHeight: "1.5",
                    marginTop: "2px",
                  }}
                >
                  {n} foto tersedia
                </p>
              </div>
            </motion.div>
          </Reveal>
        )}
      </div>
    </Reveal>
  );
}

// ─── Icon Meta Section ────────────────────────────────────────────────────────

function IconMetaSection({
  items,
  theme,
}: {
  items: TimelineMetaItem[];
  theme: Theme;
}) {
  const isMany = items.length > 6;

  return (
    <Reveal delay={0.1}>
      <div
        className={`flex flex-wrap justify-center ${isMany ? "gap-2" : "gap-3"}`}
      >
        {items.map((m) => (
          <div
            key={m.title}
            className="inline-flex items-center gap-2.5 rounded-2xl"
            style={{
              padding: isMany ? "0.5rem 0.875rem" : "0.625rem 1rem",
              background: "var(--surface)",
              border: `1.5px solid ${theme.border}`,
              boxShadow: "var(--shadow-badge)",
              maxWidth: "220px",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: theme.soft }}
            >
              <Icon
                name={m.icon as any}
                className="w-4 h-4"
                style={{ color: theme.primary }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="font-display font-bold truncate"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--blue-navy)",
                }}
              >
                {m.title}
              </p>
              {m.description && (
                <p
                  className="truncate"
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--text-faint)",
                  }}
                >
                  {m.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

// ─── Meta Area (orchestrator) ─────────────────────────────────────────────────

function MetaArea({ meta, theme }: { meta: TimelineMetaItem[]; theme: Theme }) {
  const imageItems = meta.filter((m) => !!m.image);
  const iconItems = meta.filter((m) => !m.image && !!m.icon);

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  const lbPhotos: LightboxPhoto[] = imageItems.map((m) => ({
    src: m.image!,
    caption: m.description,
    tag: m.tag,
  }));

  const hasImages = imageItems.length > 0;
  const hasIcons = iconItems.length > 0;

  return (
    <>
      <div className="mb-12 space-y-8">
        {/* ── Image meta (primary layer) ── */}
        {hasImages && (
          <Reveal>
            <ImageMetaSection
              items={imageItems}
              theme={theme}
              onOpen={openLb}
            />
          </Reveal>
        )}

        {/* ── Divider between sections when both exist ── */}
        {hasImages && hasIcons && (
          <div className="flex items-center gap-4" style={{ opacity: 0.35 }}>
            <div className="flex-1 h-px" style={{ background: theme.border }} />
            <span
              className="font-display font-semibold uppercase"
              style={{
                fontSize: "0.5625rem",
                letterSpacing: "0.12em",
                color: "var(--text-faint)",
              }}
            >
              Info tambahan
            </span>
            <div className="flex-1 h-px" style={{ background: theme.border }} />
          </div>
        )}

        {/* ── Icon meta (secondary layer) ── */}
        {hasIcons && <IconMetaSection items={iconItems} theme={theme} />}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lbOpen && lbPhotos.length > 0 && (
          <MetaLightboxPortal
            photos={lbPhotos}
            initialIdx={lbIdx}
            onClose={closeLb}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function WeekCard({
  week,
  index,
  theme,
}: {
  week: TimelineWeek;
  index: number;
  theme: Theme;
}) {
  return (
    <Reveal delay={index * 0.1}>
      <div
        className="rounded-3xl overflow-hidden h-full"
        style={{
          background: "var(--surface)",
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 8px 36px ${theme.border}`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{
            background: index === 0 ? theme.soft : theme.softStrong,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: theme.primary,
              boxShadow: `0 4px 16px ${theme.border}`,
            }}
          >
            <Icon
              name={week.icon as any}
              className="w-5 h-5"
              style={{ color: "white" }}
            />
          </div>
          <div>
            <p
              className="font-display font-bold uppercase"
              style={{
                fontSize: "0.625rem",
                letterSpacing: "0.14em",
                color: theme.primary,
              }}
            >
              {week.week}
            </p>
            <p
              className="font-display font-extrabold"
              style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
            >
              {week.title}
            </p>
          </div>
        </div>

        {/* Points */}
        {week.points && (
          <div className="px-6 py-4 space-y-2.5">
            {week.points.map((pt) => (
              <div key={pt} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke={theme.primary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                  }}
                >
                  {pt}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Days — vertical list for multi-week layout */}
        {week.days && (
          <div className="divide-y" style={{ borderColor: theme.border }}>
            {week.days.map((day, i) => (
              <div
                key={`${day.startTime}-${i}`}
                className="flex items-center gap-4 px-6 py-3.5"
                style={{
                  background: day.highlight ? theme.soft : undefined,
                }}
              >
                {/* Time range */}
                <span
                  className="font-display font-bold flex-shrink-0 inline-flex items-center gap-1"
                  style={{
                    fontSize: "0.75rem",
                    color: theme.primary,
                    minWidth: "80px",
                  }}
                >
                  <ClockIcon size={11} />
                  {formatTime(day)}
                </span>

                {/* Title */}
                <p
                  className="font-display"
                  style={{
                    fontSize: "0.875rem",
                    color: day.highlight ? theme.primary : "var(--text-muted)",
                    fontWeight: day.highlight ? 700 : 500,
                  }}
                >
                  {day.title}
                </p>

                {/* Highlight badge */}
                {day.highlight && (
                  <span
                    className="ml-auto px-2 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                    style={{
                      fontSize: "0.5625rem",
                      background: theme.primary,
                      color: "white",
                    }}
                  >
                    Final
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}
export function TimelineSection({
  content,
  theme,
}: {
  content: TimelineContent;
  theme: Theme;
}) {
  const hasMeta = content.meta && content.meta.length > 0;
  const isSingleWeek = content.weeks.length === 1;

  return (
    <section
      id="timeline"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      {/* Background radial */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 50% 60% at 100% 50%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center mb-12">
          <Reveal>
            <SectionPill theme={theme}>
              {content.icon && (
                <Icon
                  name={content.icon as any}
                  className="w-3.5 h-3.5"
                  style={{ color: theme.primary }}
                />
              )}
              {content.title}
            </SectionPill>
          </Reveal>
          <Reveal delay={0.07} className="mt-5 mb-4">
            <SectionHeading
              tagline={content.tagline}
              taglineAccent={content.taglineAccent}
              theme={theme}
            />
          </Reveal>
          {content.subtitle && (
            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "420px",
                  lineHeight: "1.72",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        {/* ── Meta Area ── */}
        {hasMeta && <MetaArea meta={content.meta!} theme={theme} />}

        {/* ── Week layout: branch on count ── */}
        {isSingleWeek ? (
          // Single week → full-width horizontal schedule card
          <ScheduleCard week={content.weeks[0]} theme={theme} />
        ) : (
          // Multiple weeks → 2-col grid (original behavior)
          <div
            className={`grid gap-6 ${
              content.weeks.length === 1
                ? "max-w-2xl mx-auto"
                : "lg:grid-cols-2"
            }`}
          >
            {content.weeks.map((week, i) => (
              <WeekCard key={week.week} week={week} index={i} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SectionPill({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-display font-semibold"
      style={{
        fontSize: "0.8125rem",
        background: theme.soft,
        border: `1.5px solid ${theme.border}`,
        color: theme.primary,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  tagline,
  taglineAccent,
  theme,
}: {
  tagline: string;
  taglineAccent?: string;
  theme: Theme;
}) {
  return (
    <h2
      className="font-display font-extrabold leading-[1.07]"
      style={{
        fontSize: "clamp(1.75rem, 3.2vw, 2.625rem)",
        letterSpacing: "-0.026em",
        color: "var(--blue-navy)",
      }}
    >
      {tagline}
      {taglineAccent && (
        <span style={{ color: theme.primary }}> {taglineAccent}</span>
      )}
    </h2>
  );
}
