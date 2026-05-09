"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = {
  primary: string;
  soft: string;
  softStrong: string;
  border: string;
};

export type FacilityItem = {
  title: string;
  description?: string;
  icon: string;
};

export type FacilitiesSectionContent = {
  title: string;
  subtitle?: string;
  tagline?: string;
  taglineAccent?: string;
  visuals: {
    type: "image" | "icon";
    src?: string;
    icon?: string;
    alt?: string;
    caption?: string;
    tag?: string;
  }[];
  items: FacilityItem[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

// ─── Reveal ───────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.52, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── Lightbox (reused MetaLightbox pattern) ───────────────────────────────────

type LightboxPhoto = {
  src: string;
  caption?: string;
  tag?: string;
};

function FacilityLightbox({
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
              aria-label={`Foto ${i + 1}`}
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

function FacilityLightboxPortal(props: {
  photos: LightboxPhoto[];
  initialIdx: number;
  onClose: () => void;
  theme: Theme;
}) {
  if (typeof window === "undefined") return null;
  return createPortal(<FacilityLightbox {...props} />, document.body);
}

// ─── Visual Grid Cell ─────────────────────────────────────────────────────────

/**
 * A single cell in the 2×2 visual grid on the left column.
 * Renders differently based on type:
 *   "image" → photo with zoom-on-hover overlay, opens lightbox
 *   "icon"  → tinted card with centered icon, NOT stretched like an image
 */
function VisualCell({
  visual,
  index,
  theme,
  onImageClick,
  imageIdx,
  isLast,
  remainingCount,
}: {
  visual: FacilitiesSectionContent["visuals"][number];
  index: number;
  theme: Theme;
  onImageClick?: (imageIdx: number) => void;
  imageIdx?: number; // index within images-only array, for lightbox
  isLast?: boolean;
  remainingCount?: number;
}) {
  const isImage = visual.type === "image";

  // ── Icon cell ──────────────────────────────────────────────────────────────
  if (!isImage) {
    return (
      <Reveal delay={index * 0.07}>
        <motion.div
          className="rounded-2xl flex flex-col items-center justify-center gap-3 p-5"
          style={{
            aspectRatio: "1 / 1",
            background: theme.soft,
            border: `1.5px solid ${theme.border}`,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {/* Icon container — doubles its tint on hover via group */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--surface)",
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 4px 18px ${theme.border}`,
            }}
          >
            <Icon
              name={visual.icon as any}
              className="w-7 h-7"
              style={{ color: theme.primary }}
            />
          </div>
          {visual.alt && (
            <p
              className="font-display font-bold text-center leading-snug"
              style={{
                fontSize: "0.8125rem",
                color: "var(--blue-navy)",
                maxWidth: "9rem",
              }}
            >
              {visual.alt}
            </p>
          )}
        </motion.div>
      </Reveal>
    );
  }

  // ── Image cell ─────────────────────────────────────────────────────────────
  const showOverflow = isLast && remainingCount && remainingCount > 0;

  return (
    <Reveal delay={index * 0.07}>
      <motion.div
        className="relative group cursor-pointer rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "1 / 1",
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.07)`,
        }}
        whileHover={{ scale: 1.025, y: -2 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={() =>
          !showOverflow && onImageClick && imageIdx !== undefined
            ? onImageClick(imageIdx)
            : onImageClick && imageIdx !== undefined
              ? onImageClick(imageIdx)
              : undefined
        }
      >
        <img
          src={visual.src!}
          alt={visual.alt ?? `Fasilitas ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

        {/* Overflow overlay */}
        {showOverflow ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(10,22,40,0.65)" }}
          >
            <span
              className="font-display font-extrabold text-white leading-none"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              +{remainingCount}
            </span>
            <span
              className="font-display font-semibold uppercase mt-1"
              style={{
                fontSize: "0.5rem",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.14em",
              }}
            >
              foto lagi
            </span>
          </div>
        ) : (
          /* Zoom hint on hover */
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
        )}

        {/* Caption tag badge */}
        {!showOverflow && visual.tag && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg z-10"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
            }}
          >
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.5rem",
                color: "#0a1628",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {visual.tag}
            </span>
          </div>
        )}
      </motion.div>
    </Reveal>
  );
}

// ─── Visual Grid (left column) ────────────────────────────────────────────────

/**
 * Renders the 2×2 grid on the left.
 * Max 4 slots. If there are more images than 4 items total,
 * the last image cell shows the "+N remaining" overlay.
 */
function VisualGrid({
  visuals,
  theme,
  onImageClick,
}: {
  visuals: FacilitiesSectionContent["visuals"];
  theme: Theme;
  onImageClick: (imageIdx: number) => void;
}) {
  const MAX_SLOTS = 4;
  const items = visuals.slice(0, MAX_SLOTS);
  const totalImages = visuals.filter((v) => v.type === "image").length;

  // Build a per-item running image index for lightbox
  let imageCounter = -1;

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {items.map((visual, i) => {
        const isImage = visual.type === "image";

        // track which position in images-only array this is
        if (isImage) imageCounter++;
        const currentImageIdx = isImage ? imageCounter : undefined;

        // Last slot overflow: only applies if it's an image cell AND there are
        // more images beyond the 4 shown
        const isLastSlot = i === items.length - 1;
        const hiddenImages =
          isLastSlot && isImage ? totalImages - MAX_SLOTS : 0;
        const showOverflow = hiddenImages > 0;

        return (
          <VisualCell
            key={i}
            visual={visual}
            index={i}
            theme={theme}
            onImageClick={isImage ? onImageClick : undefined}
            imageIdx={currentImageIdx}
            isLast={showOverflow}
            remainingCount={showOverflow ? hiddenImages : undefined}
          />
        );
      })}
    </div>
  );
}

// ─── Facility List Item (right column) ───────────────────────────────────────

function FacilityListItem({
  item,
  index,
  theme,
}: {
  item: FacilityItem;
  index: number;
  theme: Theme;
}) {
  return (
    <Reveal delay={0.15 + index * 0.07} y={12}>
      <motion.div
        className="flex items-start gap-4 group"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {/* Icon container — subtly brightens on hover */}
        <motion.div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            background: theme.soft,
            border: `1.5px solid ${theme.border}`,
            transition: "background 0.25s ease, box-shadow 0.25s ease",
          }}
          whileHover={{
            boxShadow: `0 0 0 3px ${theme.border}`,
          }}
        >
          <Icon
            name={item.icon as any}
            className="w-5 h-5"
            style={{ color: theme.primary }}
          />
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Accent bar */}
          <div
            className="w-5 h-0.5 rounded-full mb-1.5"
            style={{ background: theme.primary, opacity: 0.35 }}
          />
          <p
            className="font-display font-extrabold leading-snug"
            style={{
              fontSize: "0.9375rem",
              color: "var(--blue-navy)",
            }}
          >
            {item.title}
          </p>
          {item.description && (
            <p
              className="mt-0.5"
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                lineHeight: "1.65",
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

// ─── Section Pill ─────────────────────────────────────────────────────────────

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

// ─── Decorative image count badge ────────────────────────────────────────────

function ImageCountBadge({ count, theme }: { count: number; theme: Theme }) {
  if (count <= 1) return null;
  return (
    <div
      className="absolute -bottom-3 -right-3 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2"
      style={{
        background: "var(--surface, white)",
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.09)`,
      }}
    >
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
        <rect
          x="1.5"
          y="3.5"
          width="13"
          height="10"
          rx="2"
          stroke={theme.primary}
          strokeWidth="1.4"
        />
        <circle
          cx="8"
          cy="8.5"
          r="1.8"
          stroke={theme.primary}
          strokeWidth="1.2"
        />
      </svg>
      <span
        className="font-display font-semibold"
        style={{ fontSize: "0.75rem", color: "var(--blue-navy)" }}
      >
        {count} foto
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//   MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export function FacilitiesSection({
  content,
  theme,
  id = "facilities",
}: {
  content: FacilitiesSectionContent;
  theme: Theme;
  id?: string;
}) {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  // Build lightbox photos from image-type items only
  const lbPhotos: LightboxPhoto[] = content.visuals
    .filter((v) => v.type === "image")
    .map((v) => ({
      src: v.src!,
      caption: v.alt,
      tag: v.tag,
    }));

  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  const imageCount = lbPhotos.length;

  return (
    <>
      <section
        id={id}
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background: "var(--surface, #ffffff)" }}
      >
        {/* Ambient background radial */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 55% 50% at 0% 55%, ${theme.soft} 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* ── MOBILE layout ── */}
          <div className="lg:hidden flex flex-col gap-10">
            {/* Header */}
            <div>
              {content.tagline && (
                <Reveal>
                  <SectionPill theme={theme}>{content.tagline}</SectionPill>
                </Reveal>
              )}
              <Reveal delay={0.06} className="mt-4">
                <h2
                  className="font-display font-extrabold leading-[1.07]"
                  style={{
                    fontSize: "clamp(1.6rem, 5vw, 2.25rem)",
                    letterSpacing: "-0.025em",
                    color: "var(--blue-navy)",
                  }}
                >
                  {content.title}
                  {content.taglineAccent && (
                    <span style={{ color: theme.primary }}>
                      {" "}
                      {content.taglineAccent}
                    </span>
                  )}
                </h2>
              </Reveal>
              {content.subtitle && (
                <Reveal delay={0.1}>
                  <p
                    className="mt-3"
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.75",
                    }}
                  >
                    {content.subtitle}
                  </p>
                </Reveal>
              )}
            </div>

            {/* Visual grid */}
            <Reveal delay={0.08}>
              <div className="relative">
                <VisualGrid
                  visuals={content.visuals}
                  theme={theme}
                  onImageClick={openLb}
                />
                {imageCount > 1 && (
                  <ImageCountBadge count={imageCount} theme={theme} />
                )}
              </div>
            </Reveal>

            {/* Facility list */}
            <div className="flex flex-col gap-5">
              {content.items.map((item, i) => (
                <FacilityListItem
                  key={item.title}
                  item={item}
                  index={i}
                  theme={theme}
                />
              ))}
            </div>
          </div>

          {/* ── DESKTOP layout: 2-column ── */}
          <div className="hidden lg:grid lg:grid-cols-[2fr_3fr] xl:grid-cols-[5fr_7fr] gap-14 xl:gap-20 items-center">
            {/* LEFT — visual grid */}
            <div className="relative" style={{ minHeight: 440 }}>
              {/* Decorative tinted halo behind grid */}
              <div
                className="absolute -inset-5 rounded-3xl pointer-events-none"
                style={{ background: theme.soft, opacity: 0.5 }}
              />
              <div className="relative">
                <VisualGrid
                  visuals={content.visuals}
                  theme={theme}
                  onImageClick={openLb}
                />
                {imageCount > 1 && (
                  <ImageCountBadge count={imageCount} theme={theme} />
                )}
              </div>
            </div>

            {/* RIGHT — content */}
            <div className="flex flex-col justify-center">
              {/* Pill */}
              {content.tagline && (
                <Reveal>
                  <SectionPill theme={theme}>{content.tagline}</SectionPill>
                </Reveal>
              )}

              {/* Title */}
              <Reveal delay={0.07} className="mt-5 mb-3">
                <h2
                  className="font-display font-extrabold leading-[1.07]"
                  style={{
                    fontSize: "clamp(1.75rem, 3.2vw, 2.625rem)",
                    letterSpacing: "-0.026em",
                    color: "var(--blue-navy)",
                  }}
                >
                  {content.title}
                  {content.taglineAccent && (
                    <span style={{ color: theme.primary }}>
                      {" "}
                      {content.taglineAccent}
                    </span>
                  )}
                </h2>
              </Reveal>

              {/* Subtitle */}
              {content.subtitle && (
                <Reveal delay={0.11}>
                  <p
                    className="mb-8"
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.78",
                      maxWidth: 440,
                    }}
                  >
                    {content.subtitle}
                  </p>
                </Reveal>
              )}

              {/* Divider */}
              <Reveal delay={0.13}>
                <div
                  className="mb-7 w-10 h-0.5 rounded-full"
                  style={{ background: theme.primary, opacity: 0.35 }}
                />
              </Reveal>

              {/* Facility rows */}
              <div className="flex flex-col gap-6">
                {content.items.map((item, i) => (
                  <FacilityListItem
                    key={item.title}
                    item={item}
                    index={i}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox portal */}
      <AnimatePresence>
        {lbOpen && lbPhotos.length > 0 && (
          <FacilityLightboxPortal
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

export default FacilitiesSection;
