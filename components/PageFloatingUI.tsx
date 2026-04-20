"use client";

/**
 * Two standalone components to drop into CategoryPageClient:
 *
 *   1. SideProgressNav   — fixed right-side chapter indicator
 *   2. ScrollToTopButton — fixed bottom-right back-to-top fab
 *
 * Both accept `theme: Theme` from generateTheme() so they
 * respect per-category colors automatically.
 *
 * Usage in CategoryPageClient root export:
 *
 *   <SideProgressNav sections={navSections} theme={theme} />
 *   <ScrollToTopButton theme={theme} />
 *   <CategoryHero ... />
 *   ...rest of page...
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { generateTheme } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

type Theme = ReturnType<typeof generateTheme>;
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

const DOT_AREA = 30; // px
const DOT_SIZE = 14; // px
const CARD_PAD_Y = 10; // px

/* ── shared: detect active section & scroll % ─────────────────── */
function useScrollState(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const [scrollPct, setScrollPct] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollY(sy);
      setScrollPct(total > 0 ? (sy / total) * 100 : 0);

      // Find the last section whose top is within viewport upper quarter
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          setActiveId(id);
          return;
        }
      }
      // Nothing in range → first section
      setActiveId(sectionIds[0] ?? "");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  return { activeId, scrollPct, scrollY };
}

/* ── shared: smooth scroll to section ────────────────────────── */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navbarH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--navbar-height",
    ) || "0",
  );
  const y = el.getBoundingClientRect().top + window.scrollY - navbarH - 16;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

/* ══════════════════════════════════════════════════════════════
 * SIDE PROGRESS NAV
 *
 * Desktop (lg+): fixed right rail — dots only at rest,
 *   labels slide in from right on hover.
 *   Active dot travels via Framer layoutId spring.
 *
 * Mobile / tablet: hidden (page already has sticky top nav).
 * ══════════════════════════════════════════════════════════════ */
export function SideProgressNav({
  sections,
  theme,
}: {
  sections: { id: string; label: string }[];
  theme: Theme;
}) {
  const { activeId, scrollPct } = useScrollState(sections.map((s) => s.id));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReduced = useReducedMotion();

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const n = sections.length;

  // Track geometry — anchored to dot centers, never overflows
  const trackHeight = Math.max(0, (n - 1) * DOT_AREA);
  // Top offset: align track start with center of first dot
  const trackTopOffset = CARD_PAD_Y + DOT_AREA / 2 - DOT_SIZE / 2;
  // Filled height: fills from first dot center to active dot center
  const filledHeight =
    n > 1
      ? Math.min(
          trackHeight,
          (activeIndex / (n - 1)) * trackHeight + DOT_SIZE / 2,
        )
      : 0;

  return (
    <AnimatePresence>
      <motion.nav
        key="side-nav"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.45, ease: EASE }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setHoveredId(null);
        }}
        className="fixed z-40 hidden lg:flex flex-col items-end"
        style={{
          right: "1.25rem",
          top: "35%",
          transform: "translateY(-50%)",
        }}
        aria-label="Page sections"
        role="navigation"
      >
        <motion.div
          animate={{
            width: isExpanded ? "auto" : "28px",
            paddingLeft: isExpanded ? "14px" : "6px",
            paddingRight: isExpanded ? "14px" : "6px",
          }}
          transition={{ duration: 0.28, ease: EASE }}
          className="relative flex flex-col items-end rounded-2xl overflow-hidden"
          style={{
            paddingTop: `${CARD_PAD_Y}px`,
            paddingBottom: `${CARD_PAD_Y}px`,
            background: isExpanded
              ? "rgba(255,255,255,0.96)"
              : "rgba(255,255,255,0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${isExpanded ? theme.border : "rgba(15,35,64,0.08)"}`,
            boxShadow: isExpanded
              ? "0 12px 40px rgba(15,35,64,0.1), 0 2px 8px rgba(15,35,64,0.06)"
              : "0 2px 12px rgba(15,35,64,0.06)",
            transition:
              "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
          }}
        >
          {/* Track line — spans dot[0] center → dot[n-1] center exactly */}
          {n > 1 && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${trackTopOffset}px`,
                // Height = trackHeight + DOT_SIZE so the background track
                // visually reaches the center of the last dot
                height: `${trackHeight + DOT_SIZE}px`,
                right: isExpanded ? "19px" : "7px",
                width: "2px",
                transition: "right 0.28s ease",
                // Clip strictly to the dot span — no overflow
                overflow: "hidden",
              }}
            >
              {/* Background track */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(15,35,64,0.09)" }}
              />
              {/* Filled track — grows to active dot center, never beyond */}
              <motion.div
                className="absolute top-0 left-0 right-0 rounded-full origin-top"
                style={{
                  background: `linear-gradient(to bottom, ${theme.primary}, ${theme.strong})`,
                }}
                animate={{ height: `${filledHeight}px` }}
                transition={
                  prefersReduced ? {} : { duration: 0.38, ease: EASE }
                }
              />
            </div>
          )}

          {/* Dots + labels */}
          {sections.map((section) => {
            const isActive = section.id === activeId;
            const isHovered = hoveredId === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex items-center gap-3 w-full"
                style={{
                  padding: "5px 0",
                  justifyContent: "flex-end",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  minHeight: `${DOT_AREA}px`,
                }}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: 10, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: "auto" }}
                      exit={{ opacity: 0, x: 6, width: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="font-display whitespace-nowrap overflow-hidden"
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive
                          ? theme.primary
                          : isHovered
                            ? "var(--color-brand-blue-navy)"
                            : "var(--color-brand-text-faint)",
                        transition: "color 0.15s ease",
                        letterSpacing: isActive ? "0" : "-0.01em",
                      }}
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <div
                  className="relative flex-shrink-0"
                  style={{ width: `${DOT_SIZE}px`, height: `${DOT_SIZE}px` }}
                >
                  {/* Pulse ring for active */}
                  {isActive && !prefersReduced && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${theme.primary}` }}
                      animate={{
                        scale: [1, 1.65, 1],
                        opacity: [0.45, 0, 0.45],
                      }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Traveling active fill */}
                  {isActive && (
                    <motion.span
                      layoutId="side-nav-active"
                      className="absolute inset-0 rounded-full"
                      style={{ background: theme.primary }}
                      transition={SPRING}
                    />
                  )}

                  {/* Idle / hovered dot */}
                  <span
                    className="absolute rounded-full"
                    style={{
                      background: isActive
                        ? "transparent"
                        : isHovered
                          ? theme.softStrong
                          : "rgba(15,35,64,0.15)",
                      inset: isActive ? 0 : isHovered ? "2px" : "4px",
                      border:
                        !isActive && isHovered
                          ? `1.5px solid ${theme.border}`
                          : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              </button>
            );
          })}

          {/* Scroll progress bar — no text, just the bar */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="progress-bar"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="w-full rounded-full overflow-hidden"
                style={{
                  height: "3px",
                  marginTop: "10px",
                  background: "rgba(15,35,64,0.08)",
                  flexShrink: 0,
                  transformOrigin: "left",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`,
                    width: `${scrollPct}%`,
                  }}
                  transition={{ duration: 0.12 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.nav>
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SCROLL TO TOP BUTTON
 *
 * Appears after scrolling > 320px.
 * Spring-in from bottom, spring-out back.
 * Paired visually with SideProgressNav (same right offset).
 * Shows a mini arc progress ring around the button.
 * ══════════════════════════════════════════════════════════════ */
export function ScrollToTopButton({ theme }: { theme: Theme }) {
  const { scrollPct, scrollY } = useScrollState([]);
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const visible = scrollY > 320;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "instant" : "smooth",
    });
  };

  // Arc SVG parameters
  const SIZE = 48;
  const STROKE = 2.5;
  const R = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const dashOffset = CIRCUMFERENCE * (1 - scrollPct / 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          onClick={scrollToTop}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={SPRING}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="fixed z-40 flex items-center justify-center"
          style={{
            right: "1.25rem",
            bottom: "1.5rem",
            width: `${SIZE}px`,
            height: `${SIZE}px`,
            background: hovered ? theme.primary : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1.5px solid ${hovered ? theme.primary : theme.border}`,
            borderRadius: "14px",
            cursor: "pointer",
            boxShadow: hovered
              ? `0 8px 28px ${theme.border}, 0 2px 8px rgba(15,35,64,0.1)`
              : "0 4px 16px rgba(15,35,64,0.1), 0 1px 4px rgba(15,35,64,0.06)",
            transition:
              "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
          }}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          {/* Progress arc ring */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={hovered ? "rgba(255,255,255,0.2)" : "rgba(15,35,64,0.07)"}
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={hovered ? "rgba(255,255,255,0.7)" : theme.primary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.15s linear, stroke 0.22s ease",
              }}
            />
          </svg>

          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={hovered ? { y: -2 } : { y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <ArrowUp
              size={20}
              strokeWidth={2.2}
              style={{
                color: hovered ? "white" : theme.primary,
                transition: "color 0.22s ease",
              }}
            />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
