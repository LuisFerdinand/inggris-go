"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  Fragment,
} from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Theme } from "@/lib/utils";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ─── Reveal ─────────────────────────────────────────────────── */
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
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── SectionPill ────────────────────────────────────────────── */
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

/* ─── SectionHeading ─────────────────────────────────────────── */
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

export type BenefitConclusion = {
  tagline: string;
  taglineAccent?: string;
};

export type BenefitsSectionContent = {
  title: string;
  subtitle?: string;
  icon?: string;
  tagline: string;
  taglineAccent?: string;
  conclusion?: BenefitConclusion;
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

/* ─── ImgOverlay ─────────────────────────────────────────────── */
function ImgOverlay({ caption, tag }: { caption?: string; tag?: string }) {
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/[.15] transition-colors duration-300">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
          <Icon
            name="zoom-in"
            className="w-5 h-5"
            style={{ color: "#0a1628" }}
          />
        </div>
      </div>
      {(caption || tag) && (
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t from-black/65 to-transparent opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
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

/* ─── CollageRow (mobile) ────────────────────────────────────── */
function CollageRow({
  images,
  theme,
  onOpen,
}: {
  images: BenefitImage[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const n = images.length;
  const slotCount = n <= 3 ? n : 4;
  const remaining = n > 4 ? n - 4 : 0;
  const slots = images.slice(0, slotCount);
  const isOverflowSlot = (i: number) => remaining > 0 && i === slotCount - 1;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
        gap: 8,
        width: "100%",
      }}
    >
      {slots.map((photo, i) => {
        const showOverlay = isOverflowSlot(i);
        return (
          <Reveal key={i} delay={i * 0.07}>
            <motion.div
              className="relative group rounded-2xl overflow-hidden cursor-pointer"
              style={{
                aspectRatio: "3 / 4",
                border: `1.5px solid ${theme.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.28, ease: EASE }}
              onClick={() => onOpen(showOverlay ? slotCount - 1 : i)}
            >
              <img
                src={photo.src}
                alt={photo.caption ?? `Foto ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.45s cubic-bezier(.25,.1,.25,1)",
                }}
                loading="lazy"
                className="group-hover:scale-[1.06]"
              />
              {showOverlay ? (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: "rgba(10,22,40,0.62)" }}
                >
                  <span
                    className="font-extrabold text-white leading-none"
                    style={{
                      fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    +{remaining + 1}
                  </span>
                  <span
                    className="font-semibold uppercase tracking-widest mt-1"
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
          </Reveal>
        );
      })}
    </div>
  );
}

/* ─── CollageDesktop ─────────────────────────────────────────── */
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
    const showOverflow = slot === "D" && remaining > 0;
    return (
      <Reveal delay={delay} className={`relative ${className}`} style={style}>
        <motion.div
          className="relative group w-full h-full rounded-2xl overflow-hidden cursor-pointer"
          style={{
            border: `1.5px solid ${theme.border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
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

  if (n === 1)
    return (
      <div style={{ height: "100%", minHeight: 380 }}>
        <SlotImg slot="A" delay={0} className="h-full" />
      </div>
    );
  if (n === 2)
    return (
      <div
        className="grid grid-cols-2 gap-3"
        style={{ height: "100%", minHeight: 380 }}
      >
        <SlotImg slot="A" delay={0} className="h-full" />
        <SlotImg slot="B" delay={0.08} className="h-full" />
      </div>
    );
  if (n === 3)
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
        <SlotImg slot="A" delay={0} style={{ gridRow: "1 / 3" }} />
        <SlotImg slot="B" delay={0.08} />
        <SlotImg slot="C" delay={0.14} />
      </div>
    );
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
      <SlotImg slot="A" delay={0} style={{ gridRow: "1 / 4" }} />
      <SlotImg slot="B" delay={0.07} />
      <SlotImg slot="C" delay={0.13} />
      <SlotImg slot="D" delay={0.19} />
    </div>
  );
}

/* ─── PhotoCountBadge ────────────────────────────────────────── */
function PhotoCountBadge({ count, theme }: { count: number; theme: Theme }) {
  return (
    <div
      className="absolute -bottom-3 -right-3 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2"
      style={{
        background: "white",
        border: `1.5px solid ${theme.border}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
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

/* ─── BenefitCard — border-left style ───────────────────────── */
function BenefitCard({
  item,
  theme,
  delay,
  index,
}: {
  item: BenefitItem;
  theme: Theme;
  delay: number;
  index: number;
}) {
  return (
    <Reveal delay={delay} y={14} className="h-full">
      <motion.div
        className="relative flex items-start gap-4 h-full"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{
          background: "var(--surface, #ffffff)",
          borderLeft: `3px solid ${theme.primary}`,
          borderTop: `1px solid ${theme.border}`,
          borderRight: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderRadius: "14px",
          padding: "16px 18px 16px 20px",
          boxShadow: `0 2px 12px rgba(0,0,0,0.04)`,
          overflow: "hidden",
        }}
      >
        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full pointer-events-none"
          style={{ background: theme.soft, opacity: 0.7 }}
        />

        {/* Icon */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 relative z-10"
          style={{
            background: theme.soft,
            border: `1.5px solid ${theme.border}`,
          }}
        >
          <Icon
            name={item.icon}
            className="w-5 h-5"
            style={{ color: theme.primary }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 relative z-10">
          <p
            className="font-display font-extrabold leading-snug mb-1"
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

        {/* Step number */}
        <div
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center relative z-10"
          style={{
            background: theme.soft,
            fontSize: "0.625rem",
            fontWeight: 700,
            color: theme.primary,
            opacity: 0.6,
            letterSpacing: "0.03em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── ConclusionCard — wide block ────────────────────────────── */
function ConclusionCard({
  conclusion,
  theme,
  delay = 0,
}: {
  conclusion: BenefitConclusion;
  theme: Theme;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} y={12}>
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="relative w-full"
        style={{
          borderLeft: `3px solid ${theme.primary}`,
          borderTop: `1px solid ${theme.border}`,
          borderRight: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderRadius: "16px",
          padding: "22px 28px",
          background: theme.soft,
          overflow: "hidden",
        }}
      >
        {/* Ambient shape */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: theme.border, opacity: 0.4 }}
        />

        {/* Accent bar */}
        <div
          className="w-8 h-0.5 rounded-full mb-3 relative z-10"
          style={{ background: theme.primary, opacity: 0.55 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:gap-6 gap-2">
          {conclusion.taglineAccent && (
            <p
              className="font-display font-extrabold shrink-0"
              style={{
                fontSize: "0.9375rem",
                color: "var(--blue-navy, #0a1628)",
                minWidth: "fit-content",
              }}
            >
              {conclusion.taglineAccent}
            </p>
          )}
          {conclusion.taglineAccent && (
            <div
              className="hidden sm:block w-px self-stretch"
              style={{ background: theme.border }}
            />
          )}
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted, #64748b)",
              lineHeight: "1.75",
            }}
          >
            {conclusion.tagline}
          </p>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function BenefitsSection({
  content,
  theme,
  id,
}: {
  content: BenefitsSectionContent;
  theme: Theme;
  id: string;
}) {
  const hasImages = (content.images?.length ?? 0) > 0;
  const images = content.images ?? [];
  const hasConclusion = !!content.conclusion;

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  const colCount =
    content.items.length <= 2 ? 2 : content.items.length === 3 ? 3 : 4;

  /* ── Mode A: no images — card grid ── */
  if (!hasImages) {
    return (
      <>
        <section
          id={id}
          className="relative py-20 lg:py-28 overflow-hidden"
          style={{ background: "var(--bg-soft, #f8fafc)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 55% 45% at 100% 40%, ${theme.soft} 0%, transparent 55%)`,
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-12">
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

            {/* Cards grid */}
            <div
              className={`grid gap-3 mb-4 ${colCount <= 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : colCount === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}
            >
              {content.items.map((item, i) => (
                <BenefitCard
                  key={item.title}
                  item={item}
                  index={i}
                  theme={theme}
                  delay={i * 0.07}
                />
              ))}
            </div>

            {/* Conclusion — full width below cards */}
            {hasConclusion && (
              <div className={colCount <= 2 ? "max-w-2xl mx-auto" : ""}>
                <ConclusionCard
                  conclusion={content.conclusion!}
                  theme={theme}
                  delay={content.items.length * 0.07 + 0.06}
                />
              </div>
            )}
          </div>
        </section>
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

  /* ── Mode B: with images ── */
  return (
    <>
      <section
        id={id}
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background: "var(--bg-soft, #f8fafc)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 50% 55% at 5% 50%, ${theme.soft} 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* ── MOBILE ── */}
          <div className="lg:hidden flex flex-col gap-8">
            {/* Header */}
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

            {/* Image row */}
            <Reveal delay={0.08}>
              <CollageRow images={images} theme={theme} onOpen={openLb} />
            </Reveal>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {content.items.map((item, i) => (
                <BenefitCard
                  key={item.title}
                  item={item}
                  index={i}
                  theme={theme}
                  delay={i * 0.07}
                />
              ))}
            </div>

            {/* Conclusion */}
            {hasConclusion && (
              <ConclusionCard
                conclusion={content.conclusion!}
                theme={theme}
                delay={content.items.length * 0.06}
              />
            )}
          </div>

          {/* ── DESKTOP: 2-column ── */}
          <div className="hidden lg:flex lg:flex-col gap-8">
            {/* Top row: image collage | text + benefit cards */}
            <div className="grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_0.9fr] gap-14 xl:gap-20 items-center">
              {/* LEFT — collage */}
              <div className="relative" style={{ minHeight: 460 }}>
                <div
                  className="absolute -inset-6 rounded-3xl"
                  style={{ background: theme.soft, opacity: 0.45 }}
                />
                <div
                  className="relative"
                  style={{ height: "100%", minHeight: 460 }}
                >
                  <CollageDesktop
                    images={images}
                    theme={theme}
                    onOpen={openLb}
                  />
                  {images.length > 1 && (
                    <PhotoCountBadge count={images.length} theme={theme} />
                  )}
                </div>
              </div>

              {/* RIGHT — header + benefit cards */}
              <div className="flex flex-col justify-center">
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
                <Reveal delay={0.07} className="mt-5 mb-3">
                  <SectionHeading
                    tagline={content.tagline}
                    taglineAccent={content.taglineAccent}
                    theme={theme}
                    align="left"
                  />
                </Reveal>
                {content.subtitle && (
                  <Reveal delay={0.11}>
                    <p
                      className="mb-6"
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

                {/* Divider */}
                <Reveal delay={0.13}>
                  <div
                    className="mb-5 w-10 h-0.5 rounded-full"
                    style={{ background: theme.primary, opacity: 0.35 }}
                  />
                </Reveal>

                {/* Benefit cards stacked */}
                <div className="flex flex-col gap-3">
                  {content.items.map((item, i) => (
                    <BenefitCard
                      key={item.title}
                      item={item}
                      index={i}
                      theme={theme}
                      delay={0.14 + i * 0.08}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Conclusion — full width below the 2-column grid */}
            {hasConclusion && (
              <ConclusionCard
                conclusion={content.conclusion!}
                theme={theme}
                delay={0.14 + content.items.length * 0.08 + 0.1}
              />
            )}
          </div>
        </div>
      </section>

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

export default BenefitsSection;
