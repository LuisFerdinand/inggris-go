"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CategorySnap = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string | null;
  themePrimary: string;
  icon: string | null;
};
type Step = "category" | "program" | "batch" | "form";

const STEPS: Step[] = ["category", "program", "batch", "form"];

// ─── Shared animation presets ─────────────────────────────────────────────────

/** Entrance: slide up + fade in */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: {
    duration: 0.55,
    delay,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
});

const gentleFloat = (amplitude = 6, duration = 4.5, delay = 0) => ({
  animate: { y: [0, -amplitude, 0] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pulsing ring that expands and fades */
function PulseRing({
  size,
  color,
  delay = 0,
}: {
  size: number;
  color: string;
  delay?: number;
}) {
  const offset = size / 2;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        top: "50%",
        left: "50%",
        marginTop: -offset,
        marginLeft: -offset,
      }}
      animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0, 0.45] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/** Small dot that orbits around the center of its parent */
function OrbitDot({
  radius,
  size,
  color,
  duration,
  delay = 0,
}: {
  radius: number;
  size: number;
  color: string;
  duration: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      animate={{
        x: [radius, 0, -radius, 0, radius],
        y: [0, radius, 0, -radius, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

/** Frosted-glass stat bubble */
function StatBubble({
  value,
  sub,
  style,
  delay = 0,
}: {
  value: string;
  sub: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="absolute z-20 flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-center"
      style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
          "0 4px 20px rgba(26,82,200,0.14), 0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.95)",
        minWidth: 56,
        ...style,
      }}
    >
      <span
        className="text-[14px] font-black leading-none"
        style={{ color: "#0a2d87" }}
      >
        {value}
      </span>
      <span
        className="text-[8px] font-bold uppercase tracking-widest mt-0.5"
        style={{ color: "#8fa3cc" }}
      >
        {sub}
      </span>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LeftPanel({
  step,
  categorySnap,
}: {
  step: Step;
  categorySnap: CategorySnap | null;
}) {
  const stepIdx = STEPS.indexOf(step);

  return (
    <div
      className="hidden xl:flex flex-col gap-2.5 flex-shrink-0 pt-2"
      style={{ width: 168 }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          CARD 1 — Hero student photo with orbiting particles
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0)}
        className="relative overflow-hidden"
        style={{
          height: 198,
          borderRadius: 24,
          background: "linear-gradient(148deg, #d6eaff 0%, #c9f0e2 100%)",
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow: "0 8px 32px rgba(26,82,200,0.11)",
        }}
      >
        {/* Radial glow behind photo */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,82,200,0.13) 0%, transparent 70%)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Pulse rings */}
        <div
          className="absolute pointer-events-none"
          style={{ top: "40%", left: "50%" }}
        >
          <PulseRing size={78} color="rgba(26,82,200,0.20)" delay={0} />
          <PulseRing size={108} color="rgba(26,82,200,0.11)" delay={1.1} />
        </div>

        {/* Orbiting particles */}
        <div
          className="absolute pointer-events-none"
          style={{ top: "38%", left: "50%", width: 0, height: 0 }}
        >
          <OrbitDot radius={56} size={5} color="#1a52c8" duration={7} />
          <OrbitDot
            radius={50}
            size={3.5}
            color="#ffc107"
            duration={5}
            delay={1.2}
          />
          <OrbitDot
            radius={63}
            size={3}
            color="#1a52c8"
            duration={9}
            delay={3}
          />
        </div>

        {/* ── Student photo ─────────────────────────────────────────────
            When ready, replace the PLACEHOLDER block below with:

           
        ──────────────────────────────────────────────────────────────── */}
        <motion.div
          {...gentleFloat(6, 4.5, 0)}
          className="absolute bottom-0 left-1/2 z-10 pointer-events-none select-none"
          style={{ transform: "translateX(-50%)" }}
        >
          <motion.img
            src="/images/student-.jpg"
            alt=""
            aria-hidden="true"
            {...gentleFloat(6, 4.5, 0)}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[168px]
                         object-contain object-bottom z-10
                         select-none pointer-events-none"
          />
        </motion.div>

        {/* Floating stat chips */}
        <StatBubble
          value="5k+"
          sub="students"
          style={{ top: 12, right: 8 }}
          delay={0.35}
        />
        <StatBubble
          value="4.9★"
          sub="rating"
          style={{ bottom: 12, left: 8 }}
          delay={0.5}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 2 — Dark blue award / trophy visual
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.1)}
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          height: 68,
          borderRadius: 20,
          background:
            "linear-gradient(135deg, #06195c 0%, #0a2d87 55%, #2563eb 100%)",
          boxShadow: "0 6px 22px rgba(6,25,92,0.24)",
        }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px)",
            backgroundSize: "13px 13px",
          }}
        />
        {/* Gold glow top-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,193,7,0.2)",
            right: -20,
            top: -20,
            filter: "blur(18px)",
          }}
        />

        {/* Three circular award badges */}
        <div className="flex items-center gap-2.5 z-10">
          {[
            { size: 36, bg: "rgba(255,255,255,0.13)", iconSize: 13 },
            { size: 46, bg: "rgba(255,193,7,0.30)", iconSize: 20 },
            { size: 36, bg: "rgba(255,255,255,0.13)", iconSize: 13 },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2 + i * 0.12,
                duration: 0.38,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: c.size, height: c.size, background: c.bg }}
            >
              <svg
                width={c.iconSize}
                height={c.iconSize}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z"
                  fill={i === 1 ? "#ffc107" : "rgba(255,255,255,0.45)"}
                />
              </svg>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 3 — Warm amber parent + child photo
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.2)}
        className="relative overflow-hidden"
        style={{
          height: 126,
          borderRadius: 22,
          background:
            "linear-gradient(148deg, #fff8e1 0%, #fde68a 55%, #fbbf24 100%)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "0 6px 22px rgba(251,191,36,0.22)",
        }}
      >
        {/* White glow top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.40)",
            top: -22,
            left: -22,
            filter: "blur(18px)",
          }}
        />
        {/* Diagonal stripe texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 14px)",
          }}
        />

        {/* Floating heart icon */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [-6, 6, -6] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-10"
          style={{
            top: 12,
            left: 12,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        {/* ── Parent + child photo ─────────────────────────────────────
            When ready, replace the PLACEHOLDER block below with:

           
        ──────────────────────────────────────────────────────────────── */}
        <motion.div
          {...gentleFloat(4, 5, 0.8)}
          className="absolute bottom-0 right-0 z-10 flex items-end pointer-events-none select-none"
        >
          {/* PLACEHOLDER ↓ delete when image is available */}
          <img
            src="/images/student-success.jpg"
            alt=""
            aria-hidden="true"
            {...gentleFloat(4, 5, 0.8)}
            className="absolute bottom-0 right-0 h-[118px]
                         object-contain object-bottom z-10
                         select-none pointer-events-none"
          />
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 4 — Avatar stack social proof
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.3)}
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          height: 58,
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid rgba(26,82,200,0.09)",
          boxShadow: "0 4px 16px rgba(26,82,200,0.07)",
        }}
      >
        {/* Avatar stack */}
        <div className="flex items-center">
          {[
            { init: "AS", from: "#378add", to: "#185fa5" },
            { init: "RW", from: "#639922", to: "#3b6d11" },
            { init: "BD", from: "#ba7517", to: "#854f0b" },
            { init: "NF", from: "#7f77dd", to: "#534ab7" },
            { init: "ZK", from: "#d4537e", to: "#993556" },
          ].map((a, i) => (
            <motion.div
              key={i}
              initial={{ x: -10 * (4 - i), opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: 0.36 + i * 0.07,
                duration: 0.38,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                border: "2.5px solid white",
                marginLeft: i === 0 ? 0 : -7,
                zIndex: 5 - i,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                fontWeight: 800,
                color: "white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
                flexShrink: 0,
              }}
            >
              {a.init}
            </motion.div>
          ))}
          {/* +1k chip */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.75,
              duration: 0.35,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#e6f1fb",
              border: "2.5px solid white",
              marginLeft: -7,
              zIndex: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 7,
              fontWeight: 900,
              color: "#185fa5",
              flexShrink: 0,
            }}
          >
            +1k
          </motion.div>
        </div>

        {/* Live indicator dot */}
        <motion.div
          animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute top-3 right-3"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 0 2.5px rgba(34,197,94,0.22)",
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 5 — Star rating mosaic
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.4)}
        className="relative overflow-hidden flex items-center justify-center gap-3"
        style={{
          height: 50,
          borderRadius: 18,
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: "1px solid rgba(251,191,36,0.28)",
          boxShadow: "0 4px 14px rgba(251,191,36,0.14)",
        }}
      >
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.48 + i * 0.06,
                  duration: 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <Star className="w-3 h-3 fill-[#fbbf24] text-[#fbbf24]" />
              </motion.div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: 30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.65 + i * 0.055,
                  duration: 0.28,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <Star className="w-2 h-2 fill-[#fcd34d] text-[#fcd34d]" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Big numeral */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.95, duration: 0.38 }}
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#b45309",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          4.9
        </motion.span>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 6 — Step progress dots (reacts to current step)
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.5)}
        className="relative overflow-hidden flex items-center justify-center gap-1.5"
        style={{
          height: 46,
          borderRadius: 16,
          background: "linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%)",
          border: "1px solid rgba(26,82,200,0.09)",
          boxShadow: "0 4px 14px rgba(26,82,200,0.06)",
          padding: "0 14px",
        }}
      >
        {STEPS.map((s, i) => {
          const isDone = i < stepIdx;
          const isActive = i === stepIdx;
          return (
            <div key={s} className="flex items-center">
              <motion.div
                animate={{
                  width: isActive ? 24 : isDone ? 10 : 10,
                  background: isDone
                    ? "#1a52c8"
                    : isActive
                      ? "#ffc107"
                      : "rgba(26,82,200,0.18)",
                }}
                transition={{ duration: 0.38, ease: "easeInOut" }}
                style={{ height: 10, borderRadius: 99, flexShrink: 0 }}
              />
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 5,
                    height: 1.5,
                    background: isDone
                      ? "rgba(26,82,200,0.38)"
                      : "rgba(26,82,200,0.11)",
                    marginLeft: 3,
                    flexShrink: 0,
                    borderRadius: 2,
                    transition: "background 0.35s",
                  }}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 7 — Dark decorative pattern (bottom flair)
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fadeUp(0.6)}
        className="relative overflow-hidden"
        style={{
          height: 54,
          borderRadius: 18,
          background:
            "linear-gradient(148deg, #06195c 0%, #0a2d87 50%, #1a52c8 100%)",
          boxShadow: "0 6px 22px rgba(6,25,92,0.26)",
        }}
      >
        {/* Concentric arcs — bottom-left */}
        {[38, 62, 86, 110].map((r, i) => (
          <div
            key={`bl-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: r,
              height: r,
              border: `1px solid rgba(255,255,255,${0.06 + i * 0.025})`,
              bottom: -r / 2,
              left: -r / 2 + 18,
            }}
          />
        ))}
        {/* Concentric arcs — top-right */}
        {[38, 62, 86, 110].map((r, i) => (
          <div
            key={`tr-${i}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: r,
              height: r,
              border: `1px solid rgba(255,193,7,${0.06 + i * 0.022})`,
              top: -r / 2,
              right: -r / 2 + 18,
            }}
          />
        ))}

        {/* Animated dot cluster */}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {[
            { size: 6, color: "rgba(255,255,255,0.55)", delay: 0 },
            { size: 9, color: "#ffc107", delay: 0.5 },
            { size: 6, color: "rgba(255,255,255,0.55)", delay: 1 },
            { size: 4.5, color: "rgba(255,255,255,0.30)", delay: 1.5 },
            { size: 8, color: "rgba(255,193,7,0.70)", delay: 2 },
          ].map((dot, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.35, 1], opacity: [0.65, 1, 0.65] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: dot.delay,
              }}
              className="rounded-full flex-shrink-0"
              style={{
                width: dot.size,
                height: dot.size,
                background: dot.color,
                boxShadow:
                  dot.color === "#ffc107"
                    ? "0 0 8px rgba(255,193,7,0.55)"
                    : "none",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
