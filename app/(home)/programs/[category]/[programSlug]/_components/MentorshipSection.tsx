"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";
import { createPortal } from "react-dom";
import { Theme } from "@/lib/utils";

export type MentorshipItem = {
  title: string;
  description: string;
  icon: string;
};

export type MentorshipVisual = {
  type: "icon" | "image";
  icon?: string;
  src?: string;
  alt?: string;
  caption?: string;
  tag?: string;
};

export type MentorshipSectionContent = {
  tagline?: string;
  taglineAccent?: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  items: MentorshipItem[];
  visuals: MentorshipVisual[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

// ─── Reveal ───────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.52, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionPill({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full font-display font-bold uppercase"
      style={{
        padding: "5px 16px",
        fontSize: "0.625rem",
        letterSpacing: "0.16em",
        background: theme.soft,
        border: `1.5px solid ${theme.border}`,
        color: theme.primary,
        boxShadow: `0 2px 16px ${theme.border}`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

type LightboxPhoto = { src: string; caption?: string; tag?: string };

function MentorshipLightbox({
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

function MentorshipLightboxPortal(
  props: React.ComponentProps<typeof MentorshipLightbox>,
) {
  if (typeof window === "undefined") return null;
  return createPortal(<MentorshipLightbox {...props} />, document.body);
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function MentorshipItemCard({
  item,
  index,
  theme,
}: {
  item: MentorshipItem;
  index: number;
  theme: Theme;
}) {
  return (
    <Reveal delay={0.18 + index * 0.07} y={14}>
      <motion.div
        className="flex items-start gap-3.5 rounded-xl"
        style={{
          padding: "14px 16px",
          background: "var(--surface, white)",
          border: `0.5px solid var(--border-soft, #e2e8f0)`,
          borderLeft: `3.5px solid ${theme.primary}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
        whileHover={{
          x: 4,
          boxShadow: `0 4px 20px ${theme.border}`,
          borderLeftColor: theme.primary,
        }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 rounded-[10px] flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            background: theme.soft,
          }}
        >
          <Icon
            name={item.icon as any}
            className="w-[18px] h-[18px]"
            style={{ color: theme.primary }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className="font-display font-bold leading-snug mb-1"
            style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
          >
            {item.title}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              lineHeight: "1.65",
            }}
          >
            {item.description}
          </p>
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── Visual Collage (right column) ───────────────────────────────────────────
//
// Maps up to 4 visuals into a fixed magazine layout:
//   Slot A — large, spans full height on the left column
//   Slot B, C, D — stacked on the right column
//
// If there are more than 4 image visuals, slot D shows the "+N remaining" overlay.

function MentorshipCollage({
  visuals,
  theme,
  onImageClick,
}: {
  visuals: MentorshipVisual[];
  theme: Theme;
  onImageClick: (idx: number) => void;
}) {
  const imageVisuals = visuals.filter((v) => v.type === "image");
  const n = imageVisuals.length;

  // max 4 slots; slot D is overflow trigger when n > 4
  const MAX_SLOTS = 4;
  const slotsToRender = Math.min(n, MAX_SLOTS);
  const remaining = n > MAX_SLOTS ? n - MAX_SLOTS : 0;

  // Running image index for lightbox mapping
  let imgIdx = -1;

  const slots = Array.from({ length: slotsToRender }, (_, i) => {
    imgIdx++;
    return { visual: imageVisuals[i], lbIdx: imgIdx };
  });

  const gridStyle: React.CSSProperties =
    slotsToRender === 1
      ? { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }
      : slotsToRender === 2
        ? { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" }
        : slotsToRender === 3
          ? {
              gridTemplateColumns: "1.3fr 1fr",
              gridTemplateRows: "1fr 1fr",
            }
          : {
              gridTemplateColumns: "1.3fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
            };

  // Helper — grid-area for each slot
  function slotGridArea(i: number, total: number): React.CSSProperties {
    if (total <= 2) return {};
    if (total === 3) {
      // A spans 2 rows; B and C are stacked on right
      if (i === 0) return { gridRow: "1 / 3" };
      return {};
    }
    // 4 slots: A spans all 3 rows on left; B C D on right
    if (i === 0) return { gridRow: "1 / 4" };
    return {};
  }

  const ZoomIcon = () => (
    <svg viewBox="0 0 20 20" style={{ width: 20, height: 20 }} fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="#0a1628" strokeWidth="1.7" />
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
  );

  return (
    <div className="relative" style={{ minHeight: 440 }}>
      {/* Tinted halo */}
      <div
        className="absolute pointer-events-none rounded-3xl"
        style={{
          inset: -20,
          background: theme.soft,
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      <div
        className="relative"
        style={{
          display: "grid",
          gap: 10,
          minHeight: 440,
          zIndex: 1,
          ...gridStyle,
        }}
      >
        {slots.map(({ visual, lbIdx }, i) => {
          const isOverflowSlot = remaining > 0 && i === slotsToRender - 1;
          const area = slotGridArea(i, slotsToRender);

          return (
            <Reveal key={i} delay={0.08 + i * 0.07} style={area}>
              <motion.div
                className="relative group cursor-pointer rounded-2xl overflow-hidden w-full h-full"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                  minHeight: slotsToRender <= 2 ? 320 : undefined,
                }}
                whileHover={{ scale: 1.025, y: -3 }}
                transition={{ duration: 0.3, ease: EASE }}
                onClick={() => onImageClick(isOverflowSlot ? i : lbIdx)}
              >
                {visual.src && (
                  <img
                    src={visual.src}
                    alt={visual.alt ?? `Foto ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                    loading="lazy"
                    style={{ display: "block" }}
                  />
                )}

                {/* Bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)",
                  }}
                />

                {/* Tag badge */}
                {!isOverflowSlot && visual.tag && (
                  <div
                    className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg"
                    style={{
                      padding: "4px 10px",
                      background: "rgba(255,255,255,0.92)",
                    }}
                  >
                    <span
                      className="font-display font-bold uppercase"
                      style={{
                        fontSize: "0.5rem",
                        color: "#0a1628",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {visual.tag}
                    </span>
                  </div>
                )}

                {/* Overflow overlay */}
                {isOverflowSlot ? (
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
                      +{remaining + 1}
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
                  <>
                    {/* Hover zoom */}
                    <div
                      className="absolute inset-0 flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(0,0,0,0)" }}
                    >
                      <div
                        className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center
                                   scale-75 group-hover:scale-100 transition-transform duration-300"
                      >
                        <ZoomIcon />
                      </div>
                    </div>
                    {/* Caption */}
                    {visual.caption && (
                      <div
                        className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8
                                   opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                                   transition-all duration-300"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        }}
                      >
                        <p
                          className="text-white font-display font-medium leading-snug"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {visual.caption}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </Reveal>
          );
        })}
      </div>

      {/* Photo count badge */}
      {n > 1 && (
        <div
          className="absolute z-20 flex items-center gap-1.5 rounded-xl"
          style={{
            bottom: -12,
            right: -12,
            padding: "7px 12px",
            background: "var(--surface, white)",
            border: `1.5px solid ${theme.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <svg
            viewBox="0 0 16 16"
            style={{ width: 14, height: 14 }}
            fill="none"
          >
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
            {n} foto
          </span>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//   MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export function MentorshipSection({
  content,
  theme,
  id = "mentorship",
}: {
  content: MentorshipSectionContent;
  theme: Theme;
  id?: string;
}) {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const lbPhotos: LightboxPhoto[] = content.visuals
    .filter((v) => v.type === "image" && v.src)
    .map((v) => ({ src: v.src!, caption: v.caption ?? v.alt, tag: v.tag }));

  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  return (
    <>
      <section
        id={id}
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background: "var(--bg-soft, #f8fafc)" }}
      >
        {/* Ambient radial — right side since images are on the right */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 55% 50% at 100% 50%, ${theme.soft} 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* ── MOBILE layout ── */}
          <div className="lg:hidden flex flex-col gap-10">
            {/* Header */}
            <div>
              {content.tagline && (
                <Reveal>
                  <SectionPill theme={theme}>✦ {content.tagline}</SectionPill>
                </Reveal>
              )}
              <Reveal delay={0.06} className="mt-5 mb-3">
                <h2
                  className="font-display font-extrabold leading-[1.08]"
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
              {content.highlight && (
                <Reveal delay={0.14}>
                  <div
                    className="inline-flex items-center gap-2 rounded-2xl mt-4"
                    style={{
                      padding: "10px 16px",
                      background: theme.soft,
                      border: `1.5px solid ${theme.border}`,
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: theme.primary,
                    }}
                  >
                    <Icon
                      name="star"
                      className="w-4 h-4"
                      style={{ color: theme.primary }}
                    />
                    {content.highlight}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Collage */}
            <Reveal delay={0.08}>
              <MentorshipCollage
                visuals={content.visuals}
                theme={theme}
                onImageClick={openLb}
              />
            </Reveal>

            {/* Item cards */}
            <div className="flex flex-col gap-3">
              {content.items.map((item, i) => (
                <MentorshipItemCard
                  key={item.title}
                  item={item}
                  index={i}
                  theme={theme}
                />
              ))}
            </div>
          </div>

          {/* ── DESKTOP layout: LEFT text | RIGHT collage ── */}
          <div className="hidden lg:grid lg:grid-cols-[5fr_7fr] xl:grid-cols-[1fr_1.3fr] gap-14 xl:gap-20 items-center">
            {/* LEFT — text + item cards */}
            <div className="flex flex-col justify-center">
              {content.tagline && (
                <Reveal>
                  <SectionPill theme={theme}>✦ {content.tagline}</SectionPill>
                </Reveal>
              )}

              <Reveal delay={0.07} className="mt-5 mb-3">
                <h2
                  className="font-display font-extrabold leading-[1.08]"
                  style={{
                    fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
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

              {content.subtitle && (
                <Reveal delay={0.11}>
                  <p
                    className="mb-5"
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.78",
                      maxWidth: 400,
                    }}
                  >
                    {content.subtitle}
                  </p>
                </Reveal>
              )}

              {/* Highlight callout */}
              {content.highlight && (
                <Reveal delay={0.14}>
                  <div
                    className="inline-flex items-center gap-2 rounded-2xl mb-6"
                    style={{
                      padding: "10px 16px",
                      background: theme.soft,
                      border: `1.5px solid ${theme.border}`,
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: theme.primary,
                    }}
                  >
                    <Icon
                      name="star"
                      className="w-4 h-4"
                      style={{ color: theme.primary }}
                    />
                    {content.highlight}
                  </div>
                </Reveal>
              )}

              {/* Thin divider */}
              <Reveal delay={0.16}>
                <div
                  className="rounded-full mb-6"
                  style={{
                    width: 40,
                    height: 3,
                    background: theme.primary,
                    opacity: 0.35,
                  }}
                />
              </Reveal>

              {/* Item cards list */}
              <div className="flex flex-col gap-3">
                {content.items.map((item, i) => (
                  <MentorshipItemCard
                    key={item.title}
                    item={item}
                    index={i}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — image collage */}
            <MentorshipCollage
              visuals={content.visuals}
              theme={theme}
              onImageClick={openLb}
            />
          </div>
        </div>
      </section>

      {/* Lightbox portal */}
      <AnimatePresence>
        {lbOpen && lbPhotos.length > 0 && (
          <MentorshipLightboxPortal
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

export default MentorshipSection;
