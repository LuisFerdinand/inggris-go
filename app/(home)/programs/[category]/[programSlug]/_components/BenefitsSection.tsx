"use client";

/**
 * WhyBenefitsSection — Enhanced with image collage + lightbox
 *
 * Layout modes:
 *  A) No images → centered header + card grid (original behaviour, unchanged)
 *  B) With images → left collage | right text+benefits (desktop)
 *                    title → h-scroll images → benefits list (mobile)
 *
 * Collage maps any number of images into 4 named slots: A B C D
 * Slot D shows "+N" overlay when total > 4.
 * Clicking any slot opens the existing GallerySection lightbox.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  Fragment,
} from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { Icon } from "@/components/Icon";

/* ─── Assumed shared primitives (re-export from your project) ── */
// Replace these with your real imports:
// import { Reveal, SectionPill, SectionHeading, Icon, EASE } from "@/components/shared";
// import type { Theme } from "@/types";

/* ── Stub types / helpers for standalone usage ── */
type Theme = {
  primary: string;
  soft: string;
  softStrong: string;
  border: string;
};

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* Reveal wrapper — scroll-triggered fade+slide */

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & HTMLMotionProps<"div">;

function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      {...props} // ✅ now style, onClick, etc. all work
    >
      {children}
    </motion.div>
  );
}

function SectionPill({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold"
      style={{
        fontSize: "0.6875rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: theme.soft,
        color: theme.primary,
        border: `1px solid ${theme.border}`,
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
  align = "center",
}: {
  tagline: string;
  taglineAccent?: string;
  theme: Theme;
  align?: "center" | "left";
}) {
  const parts = taglineAccent ? tagline.split(taglineAccent) : [tagline];

  return (
    <h2
      className="font-display font-extrabold leading-[1.07]"
      style={{
        fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
        letterSpacing: "-0.025em",
        color: "var(--blue-navy, #0a1628)",
        textAlign: align,
      }}
    >
      {taglineAccent ? (
        <>
          {parts[0]}
          <span style={{ color: theme.primary }}> {taglineAccent}</span>
          {parts[1]}
        </>
      ) : (
        tagline
      )}
    </h2>
  );
}

/* ─── Types ──────────────────────────────────────────────────── */
export type BenefitImage = {
  src: string;
  caption?: string;
  tag?: string;
  highlight?: boolean;
};

export type BenefitItem = {
  title: string;
  description?: string;
  icon: string;
};

export type BenefitsSectionContent = {
  title: string; // pill label
  subtitle?: string;
  icon?: string;
  tagline: string;
  taglineAccent?: string;
  images?: BenefitImage[];
  items: BenefitItem[];
};

/* ─── Lightbox ───────────────────────────────────────────────── */
export function Lightbox({
  photos,
  initialIdx,
  onClose,
  theme,
}: {
  photos: BenefitImage[];
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
          className="absolute -top-11 right-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.8)",
          }}
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
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
        <div className="text-center mt-4 min-h-8 px-4">
          {current.tag && (
            <p
              className="font-semibold uppercase mb-1"
              style={{
                fontSize: "0.5rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.14em",
              }}
            >
              {current.tag}
            </p>
          )}
          {current.caption && (
            <p
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.5",
              }}
            >
              {current.caption}
            </p>
          )}
        </div>

        {/* Nav */}
        <div className="flex items-center gap-5 mt-4">
          {([-1, 1] as const).map((dir, ki) => {
            const disabled = dir === -1 ? idx === 0 : idx === photos.length - 1;
            return (
              <Fragment key={ki}>
                <button
                  onClick={() => nav(dir)}
                  disabled={disabled}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    opacity: disabled ? 0.2 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label={
                    dir === -1 ? "Foto sebelumnya" : "Foto berikutnya"
                  }
                >
                  {dir === -1 ? "←" : "→"}
                </button>
                {dir === -1 && (
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(255,255,255,0.4)",
                      minWidth: 56,
                      textAlign: "center",
                    }}
                  >
                    {idx + 1} / {photos.length}
                  </span>
                )}
              </Fragment>
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
          className="sm:hidden mt-3"
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

/* ─── Image hover overlay ────────────────────────────────────── */
function ImgOverlay({ caption, tag }: { caption?: string; tag?: string }) {
  return (
    <>
      {/* Zoom icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/[.15] transition-colors duration-300">
        <div
          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center
                     opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                     transition-all duration-300"
        >
          <Icon
            name="zoom-in"
            className="w-5 h-5"
            style={{ color: "#0a1628" }}
          />
        </div>
      </div>
      {/* Caption gradient */}
      {(caption || tag) && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8
                     bg-gradient-to-t from-black/65 to-transparent
                     opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-300"
        >
          {tag && (
            <p
              className="mb-0.5 font-semibold uppercase"
              style={{
                fontSize: "0.5rem",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.12em",
              }}
            >
              {tag}
            </p>
          )}
          {caption && (
            <p
              className="text-white font-medium leading-snug"
              style={{ fontSize: "0.75rem" }}
            >
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Collage — desktop ──────────────────────────────────────── */
function CollageDesktop({
  images,
  theme,
  onOpen,
}: {
  images: BenefitImage[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const n = images.length;
  const remaining = n > 4 ? n - 4 : 0;

  // slot indices into the images array
  const slotIndex = (slot: "A" | "B" | "C" | "D") =>
    ({ A: 0, B: 1, C: 2, D: 3 })[slot];

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s cubic-bezier(.25,.1,.25,1)",
  };

  function SlotImg({
    slot,
    delay = 0,
    className = "",
    style = {},
  }: {
    slot: "A" | "B" | "C" | "D";
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
  }) {
    const i = slotIndex(slot);
    const photo = images[i];
    const isD = slot === "D";
    const showOverflow = isD && remaining > 0;

    return (
      <Reveal delay={delay} className={`relative ${className}`} style={style}>
        <motion.div
          className="relative group w-full h-full rounded-2xl overflow-hidden cursor-pointer"
          style={{
            border: `1.5px solid ${theme.border}`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.09)`,
          }}
          whileHover={{ scale: 1.025, y: -3 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={() => onOpen(showOverflow ? 3 : i)}
        >
          <img
            src={photo.src}
            alt={photo.caption ?? `Foto ${i + 1}`}
            style={imgStyle}
            loading="lazy"
          />
          {showOverflow ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(10,22,40,0.62)" }}
            >
              <span
                className="font-extrabold text-white leading-none"
                style={{
                  fontSize: "clamp(1.5rem,2.5vw,2rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                +{remaining + 1}
              </span>
              <span
                className="font-semibold uppercase tracking-widest mt-0.5"
                style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.55)" }}
              >
                foto lagi
              </span>
            </div>
          ) : (
            <ImgOverlay caption={photo.caption} tag={photo.tag} />
          )}
        </motion.div>
      </Reveal>
    );
  }

  /* ── 1 image ── */
  if (n === 1) {
    return (
      <div style={{ height: "100%", minHeight: 380 }}>
        <SlotImg slot="A" delay={0} className="h-full" />
      </div>
    );
  }

  /* ── 2 images ── */
  if (n === 2) {
    return (
      <div
        className="grid grid-cols-2 gap-3"
        style={{ height: "100%", minHeight: 380 }}
      >
        <SlotImg slot="A" delay={0} className="h-full" />
        <SlotImg slot="B" delay={0.08} className="h-full" />
      </div>
    );
  }

  /* ── 3 images ── */
  if (n === 3) {
    return (
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          height: "100%",
          minHeight: 420,
        }}
      >
        {/* A spans 2 rows on the left */}
        <SlotImg slot="A" delay={0} style={{ gridRow: "1 / 3" }} />
        <SlotImg slot="B" delay={0.08} />
        <SlotImg slot="C" delay={0.14} />
      </div>
    );
  }

  /* ── 4+ images ── */
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: "1.35fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        height: "100%",
        minHeight: 460,
      }}
    >
      {/* A — large, spans all 3 rows */}
      <SlotImg slot="A" delay={0} style={{ gridRow: "1 / 4" }} />
      <SlotImg slot="B" delay={0.07} />
      <SlotImg slot="C" delay={0.13} />
      <SlotImg slot="D" delay={0.19} />
    </div>
  );
}

/* ─── Collage — mobile horizontal scroll ────────────────────── */
function CollageMobile({
  images,
  theme,
  onOpen,
}: {
  images: BenefitImage[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const n = images.length;
  const visibleCount = Math.min(n, 4);
  const remaining = n > 4 ? n - 4 : 0;

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      {images.slice(0, visibleCount).map((photo, i) => {
        const isLast = i === visibleCount - 1 && remaining > 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: i * 0.07,
              ease: EASE,
              scale: { duration: 0.28, ease: EASE }, // 👈 hover animation
            }}
            className="relative group shrink-0 rounded-2xl overflow-hidden cursor-pointer"
            style={{
              width: "72vw",
              maxWidth: 260,
              aspectRatio: "4/5",
              scrollSnapAlign: "start",
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 4px 18px rgba(0,0,0,0.08)`,
            }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onOpen(isLast ? 4 : i)}
          >
            <img
              src={photo.src}
              alt={photo.caption ?? `Foto ${i + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s",
              }}
              loading="lazy"
            />
            {isLast ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "rgba(10,22,40,0.62)" }}
              >
                <span
                  className="font-extrabold text-white leading-none"
                  style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}
                >
                  +{remaining + 1}
                </span>
                <span
                  className="font-semibold uppercase tracking-widest mt-0.5"
                  style={{
                    fontSize: "0.5rem",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  foto lagi
                </span>
              </div>
            ) : (
              <ImgOverlay caption={photo.caption} tag={photo.tag} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Benefit item ───────────────────────────────────────────── */
function BenefitRow({
  item,
  theme,
  delay,
  isProblem,
}: {
  item: BenefitItem;
  theme: Theme;
  delay: number;
  isProblem: boolean;
}) {
  const iconColor = isProblem ? "#ff6b35" : theme.primary;
  const iconBg = isProblem ? "rgba(255,107,53,0.08)" : theme.soft;
  const iconBorder = isProblem ? "rgba(255,107,53,0.18)" : theme.border;

  return (
    <Reveal delay={delay} y={14}>
      <motion.div
        className="flex items-start gap-4 group"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {/* Icon pill */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            background: iconBg,
            border: `1.5px solid ${iconBorder}`,
            transition: "box-shadow 0.3s",
          }}
        >
          <Icon
            name={item.icon}
            className="w-5 h-5"
            style={{ color: iconColor }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {/* Accent line */}
          <div
            className="w-6 h-0.5 rounded-full mb-2"
            style={{ background: iconColor, opacity: 0.4 }}
          />
          <p
            className="font-display font-extrabold mb-1 leading-snug"
            style={{
              fontSize: "0.9375rem",
              color: "var(--blue-navy, #0a1628)",
            }}
          >
            {item.title}
          </p>
          {item.description && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted, #64748b)",
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

/* ─── Decorative count badge ─────────────────────────────────── */
function PhotoCountBadge({ count, theme }: { count: number; theme: Theme }) {
  return (
    <div
      className="absolute -bottom-3 -right-3 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 shadow-lg"
      style={{
        background: "white",
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.1)`,
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
        className="font-semibold"
        style={{ fontSize: "0.75rem", color: "var(--blue-navy, #0a1628)" }}
      >
        {count} foto
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export function WhyBenefitsSection({
  content,
  theme,
  id,
  variant = "benefits",
}: {
  content: BenefitsSectionContent;
  theme: Theme;
  id: string;
  variant?: "why" | "benefits" | "fit";
}) {
  const isProblem = variant === "why";
  const hasImages = (content.images?.length ?? 0) > 0;
  const images = content.images ?? [];

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  const colCount =
    content.items.length <= 2 ? 2 : content.items.length === 3 ? 3 : 4;

  /* ── Mode A: no images — original card grid ── */
  if (!hasImages) {
    return (
      <section
        id={id}
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background: isProblem ? "var(--surface)" : "var(--bg-soft)" }}
      >
        {isProblem && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 55% 45% at 0% 60%, ${theme.soft} 0%, transparent 55%)`,
            }}
          />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-14">
            <Reveal>
              <SectionPill theme={theme}>
                {content.icon && (
                  <Icon
                    name={content.icon}
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
                    maxWidth: "460px",
                    lineHeight: "1.75",
                  }}
                >
                  {content.subtitle}
                </p>
              </Reveal>
            )}
          </div>

          {/* Cards */}
          <div
            className={`grid gap-5 ${
              colCount <= 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : colCount === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {content.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07} y={28}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="relative flex flex-col h-full rounded-2xl p-5 overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    border: `1.5px solid var(--border-soft)`,
                    boxShadow: "var(--shadow-badge)",
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-bl-full"
                    style={{ background: theme.soft, opacity: 0.6 }}
                  />
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 relative z-10"
                    style={{
                      background: isProblem
                        ? "rgba(255,107,53,0.08)"
                        : theme.soft,
                      border: `1.5px solid ${isProblem ? "rgba(255,107,53,0.18)" : theme.border}`,
                    }}
                  >
                    <Icon
                      name={item.icon}
                      className="w-5 h-5"
                      style={{ color: isProblem ? "#ff6b35" : theme.primary }}
                    />
                  </div>
                  <div
                    className="w-8 h-0.5 rounded-full mb-3 relative z-10"
                    style={{
                      background: isProblem ? "#ff6b35" : theme.primary,
                      opacity: 0.45,
                    }}
                  />
                  <p
                    className="font-display font-extrabold mb-2 relative z-10"
                    style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className="relative z-10"
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-muted)",
                        lineHeight: "1.65",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Mode B: with images ── */
  return (
    <>
      <section
        id={id}
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{
          background: isProblem ? "var(--surface)" : "var(--bg-soft, #f8fafc)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 50% 55% at 5% 50%, ${theme.soft} 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* ── MOBILE layout ── */}
          <div className="lg:hidden flex flex-col gap-8">
            {/* Header — centered */}
            <div className="flex flex-col items-center text-center">
              <Reveal>
                <SectionPill theme={theme}>
                  {content.icon && (
                    <Icon
                      name={content.icon}
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primary }}
                    />
                  )}
                  {content.title}
                </SectionPill>
              </Reveal>
              <Reveal delay={0.06} className="mt-4">
                <SectionHeading
                  tagline={content.tagline}
                  taglineAccent={content.taglineAccent}
                  theme={theme}
                  align="center"
                />
              </Reveal>
              {content.subtitle && (
                <Reveal delay={0.1}>
                  <p
                    className="mt-3"
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.75",
                      maxWidth: 380,
                    }}
                  >
                    {content.subtitle}
                  </p>
                </Reveal>
              )}
            </div>

            {/* Horizontal scroll images */}
            <Reveal delay={0.08}>
              <CollageMobile images={images} theme={theme} onOpen={openLb} />
            </Reveal>

            {/* Benefit list */}
            <div className="flex flex-col gap-5">
              {content.items.map((item, i) => (
                <BenefitRow
                  key={item.title}
                  item={item}
                  theme={theme}
                  delay={i * 0.07}
                  isProblem={isProblem}
                />
              ))}
            </div>
          </div>

          {/* ── DESKTOP layout: 2-column ── */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_0.9fr] gap-14 xl:gap-20 items-center">
            {/* LEFT — image collage */}
            <div className="relative" style={{ minHeight: 460 }}>
              {/* Decorative background shape */}
              <div
                className="absolute -inset-6 rounded-3xl"
                style={{ background: theme.soft, opacity: 0.45 }}
              />
              {/* Photo count badge */}
              <div
                className="relative"
                style={{ height: "100%", minHeight: 460 }}
              >
                <CollageDesktop images={images} theme={theme} onOpen={openLb} />
                {images.length > 1 && (
                  <PhotoCountBadge count={images.length} theme={theme} />
                )}
              </div>
            </div>

            {/* RIGHT — text + benefits */}
            <div className="flex flex-col justify-center">
              {/* Section pill */}
              <Reveal>
                <SectionPill theme={theme}>
                  {content.icon && (
                    <Icon
                      name={content.icon}
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primary }}
                    />
                  )}
                  {content.title}
                </SectionPill>
              </Reveal>

              {/* Heading */}
              <Reveal delay={0.07} className="mt-5 mb-3">
                <SectionHeading
                  tagline={content.tagline}
                  taglineAccent={content.taglineAccent}
                  theme={theme}
                  align="left"
                />
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
                      maxWidth: 420,
                    }}
                  >
                    {content.subtitle}
                  </p>
                </Reveal>
              )}

              {/* Thin divider */}
              <Reveal delay={0.13}>
                <div
                  className="mb-7 w-12 h-0.5 rounded-full"
                  style={{ background: theme.primary, opacity: 0.35 }}
                />
              </Reveal>

              {/* Benefit rows */}
              <div className="flex flex-col gap-6">
                {content.items.map((item, i) => (
                  <BenefitRow
                    key={item.title}
                    item={item}
                    theme={theme}
                    delay={0.14 + i * 0.08}
                    isProblem={isProblem}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lbOpen && (
          <Lightbox
            photos={images}
            initialIdx={lbIdx}
            onClose={closeLb}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default WhyBenefitsSection;
