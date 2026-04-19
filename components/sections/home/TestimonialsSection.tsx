"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";

const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_OUT = [0.32, 0, 0.68, 0] as const;
const AUTO_DELAY = 4800;

/* ── Data ──────────────────────────────────────────────────────────── */
const testimonials = [
  {
    initials: "RA",
    name: "Rina Amelia",
    role: "Mahasiswa",
    location: "Jakarta",
    program: "Speaking Challenge",
    programColor: "#FF6B35",
    programBg: "rgba(255,107,53,0.1)",
    avatarBg: "#FF6B35",
    rating: 5,
    quote:
      "Sebelumnya saya sangat takut speaking, tapi setelah ikut Speaking Challenge di Inggris Go, sekarang saya sudah berani ngobrol pakai bahasa Inggris! Metodenya praktis dan tutornya sabar banget.",
  },
  {
    initials: "BH",
    name: "Budi Hartono",
    role: "Orang Tua",
    location: "Surabaya",
    program: "VIP English Camp",
    programColor: "#2DB8B0",
    programBg: "rgba(45,184,176,0.1)",
    avatarBg: "#2DB8B0",
    rating: 5,
    quote:
      "Anak saya ikut VIP English Camp dan pulang dengan perubahan luar biasa! Sekarang dia lebih percaya diri dan suka belajar bahasa Inggris. Terima kasih Inggris Go!",
  },
  {
    initials: "SW",
    name: "Sri Wahyuni, S.Pd",
    role: "Kepala Sekolah SMP",
    location: "Bandung",
    program: "School Camp",
    programColor: "#7C3AED",
    programBg: "rgba(124,58,237,0.1)",
    avatarBg: "#7C3AED",
    rating: 5,
    quote:
      "Kami sudah bekerja sama dengan Inggris Go untuk English Camp sekolah kami 2 tahun berturut-turut. Programnya terstruktur dan siswa-siswa sangat antusias belajar di Pare!",
  },
  {
    initials: "DK",
    name: "Dian Kusuma",
    role: "Profesional",
    location: "Bandung",
    program: "GoPrivate",
    programColor: "#E8521C",
    programBg: "rgba(232,82,28,0.1)",
    avatarBg: "#E8521C",
    rating: 5,
    quote:
      "GoPrivate benar-benar mengubah cara saya belajar. Tutor memahami kelemahan saya dan memberikan latihan yang tepat. Dalam 2 bulan, speaking saya meningkat drastis!",
  },
  {
    initials: "AP",
    name: "Anisa Putri",
    role: "Ibu Rumah Tangga",
    location: "Yogyakarta",
    program: "Speaking Challenge",
    programColor: "#10B981",
    programBg: "rgba(16,185,129,0.1)",
    avatarBg: "#10B981",
    rating: 5,
    quote:
      "Awalnya ragu karena sudah lama tidak belajar bahasa Inggris. Tapi sistem challenge mingguan bikin saya tetap semangat. Sekarang saya tidak malu lagi kalau salah ngomong!",
  },
  {
    initials: "AF",
    name: "Ahmad Fauzi, M.Pd",
    role: "Guru Bahasa Inggris",
    location: "Semarang",
    program: "School Camp",
    programColor: "#F59E0B",
    programBg: "rgba(245,158,11,0.1)",
    avatarBg: "#F59E0B",
    rating: 5,
    quote:
      "Program School Camp dari Inggris Go jauh melebihi ekspektasi. Siswa-siswa kami kembali dengan semangat belajar yang baru dan kepercayaan diri yang meningkat signifikan.",
  },
];

/* ── Helpers ───────────────────────────────────────────────────────── */
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#FBBF24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function QuoteMark({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 32 24"
      fill="none"
      className="w-6 h-5 flex-shrink-0 mt-0.5"
      aria-hidden
    >
      <path
        d="M0 15.6C0 20.4 2.85 24 7.8 24c4.2 0 7.2-3 7.2-7.2 0-3.9-2.7-6.6-6.3-6.6-.3 0-.75 0-1.2.15C8.4 6.6 11.4 3.6 15 1.8L12.6 0C5.7 3 0 8.7 0 15.6zm16 0C16 20.4 18.85 24 23.8 24 28 24 31 21 31 16.8c0-3.9-2.7-6.6-6.3-6.6-.3 0-.75 0-1.2.15C24.4 6.6 27.4 3.6 31 1.8L28.6 0C21.7 3 16 8.7 16 15.6z"
        fill={color}
        fillOpacity={0.2}
      />
    </svg>
  );
}

/* ── Card ──────────────────────────────────────────────────────────── */
interface CardProps {
  t: (typeof testimonials)[0];
  position: "center" | "side";
  onClick?: () => void;
}

function TestimonialCard({ t, position, onClick }: CardProps) {
  const isCenter = position === "center";

  return (
    <div
      onClick={onClick}
      className={`flex flex-col h-full w-full rounded-2xl card ${isCenter ? "card-center" : "card-default"}`}
      style={{
        padding: isCenter ? "1.75rem" : "1.25rem 1.5rem",
        background: isCenter
          ? "linear-gradient(145deg, #ffffff 0%, #FFF8F3 100%)"
          : "#ffffff",

        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Stars + tag */}
      <div className="flex items-center justify-between mb-3">
        <Stars count={t.rating} />
        <span
          className="px-2.5 py-1 rounded-full font-display font-semibold"
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.04em",
            color: t.programColor,
            background: t.programBg,
          }}
        >
          {t.program}
        </span>
      </div>

      {/* Quote body */}
      <div className="flex gap-2.5 flex-1 mb-4">
        <QuoteMark color={t.avatarBg} />
        <p
          className="leading-relaxed italic flex-1"
          style={{
            fontSize: isCenter ? "0.9375rem" : "0.8125rem",
            color: isCenter ? "#334155" : "#64748B",
            lineHeight: "1.75",
            ...(isCenter
              ? {}
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }),
          }}
        >
          {t.quote}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(15,35,64,0.06)",
          marginBottom: "0.875rem",
        }}
      />

      {/* Author row */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0"
          style={{ fontSize: "0.6875rem", background: t.avatarBg }}
        >
          {t.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-display font-bold leading-tight truncate"
            style={{
              fontSize: isCenter ? "0.875rem" : "0.8125rem",
              color: "#0F2340",
            }}
          >
            {t.name}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            {t.role} · {t.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-72px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * DESKTOP 3-UP CAROUSEL
 * - Side cards use layout animations — no key remount, no flicker
 * - Center uses cross-fade + translate (mode="popLayout" for instant swap)
 * ══════════════════════════════════════════════════════════════════════ */
function DesktopCarousel({
  current,
  direction,
  onPrev,
  onNext,
  onManual,
}: {
  current: number;
  direction: 1 | -1;
  onPrev: () => void;
  onNext: () => void;
  onManual: () => void;
}) {
  const total = testimonials.length;
  const prevIdx = mod(current - 1, total);
  const nextIdx = mod(current + 1, total);

  const slideVariants = {
    enter: (d: number) => ({
      opacity: 0,
      x: d === 1 ? 60 : -60,
      scale: 0.97,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.42, ease: EASE },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d === 1 ? -60 : 60,
      scale: 0.97,
      transition: { duration: 0.32, ease: EASE_OUT },
    }),
  };

  const sideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d === 1 ? 30 : -30 }),
    visible: {
      opacity: 0.6,
      x: 0,
      scale: 0.93,
      transition: { duration: 0.42, ease: EASE },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d === 1 ? -30 : 30,
      transition: { duration: 0.3, ease: EASE_OUT },
    }),
  };

  return (
    <div
      className="grid grid-cols-12 gap-5 items-stretch"
      style={{ minHeight: "300px" }}
    >
      {/* LEFT */}
      <div
        className="col-span-3 flex"
        style={{ transformOrigin: "right center" }}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`left-${prevIdx}`}
            className="w-full"
            custom={direction}
            variants={sideVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            onClick={() => {
              onPrev();
              onManual();
            }}
            style={{ cursor: "pointer", filter: "blur(0.4px)" }}
          >
            <TestimonialCard t={testimonials[prevIdx]} position="side" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CENTER */}
      <div className="col-span-6 flex" style={{ zIndex: 10 }}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`center-${current}`}
            className="w-full"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <TestimonialCard t={testimonials[current]} position="center" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT */}
      <div
        className="col-span-3 flex"
        style={{ transformOrigin: "left center" }}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`right-${nextIdx}`}
            className="w-full"
            custom={direction}
            variants={sideVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            onClick={() => {
              onNext();
              onManual();
            }}
            style={{ cursor: "pointer", filter: "blur(0.4px)" }}
          >
            <TestimonialCard t={testimonials[nextIdx]} position="side" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * TABLET CAROUSEL (sm–lg): center + right side-by-side
 * ══════════════════════════════════════════════════════════════════════ */
function TabletCarousel({
  current,
  direction,
  onNext,
  onManual,
}: {
  current: number;
  direction: 1 | -1;
  onNext: () => void;
  onManual: () => void;
}) {
  const total = testimonials.length;
  const nextIdx = mod(current + 1, total);

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d === 1 ? 50 : -50, scale: 0.97 }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.42, ease: EASE },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d === 1 ? -50 : 50,
      scale: 0.97,
      transition: { duration: 0.3, ease: EASE_OUT },
    }),
  };

  const sideVariants = {
    enter: () => ({ opacity: 0, x: 30 }),
    visible: {
      opacity: 0.6,
      x: 0,
      scale: 0.94,
      transition: { duration: 0.42, ease: EASE },
    },
    exit: () => ({
      opacity: 0,
      x: -30,
      transition: { duration: 0.3, ease: EASE_OUT },
    }),
  };

  return (
    <div
      className="grid grid-cols-12 gap-4 items-stretch"
      style={{ minHeight: "280px" }}
    >
      <div className="col-span-7 flex" style={{ zIndex: 10 }}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`tablet-center-${current}`}
            className="w-full"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <TestimonialCard t={testimonials[current]} position="center" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div
        className="col-span-5 flex"
        style={{ transformOrigin: "left center" }}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`tablet-right-${nextIdx}`}
            className="w-full"
            custom={direction}
            variants={sideVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            onClick={() => {
              onNext();
              onManual();
            }}
            style={{ cursor: "pointer", filter: "blur(0.3px)" }}
          >
            <TestimonialCard t={testimonials[nextIdx]} position="side" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MOBILE DRAG CAROUSEL
 * - Framer Motion drag with constraints + snap-on-release
 * - Momentum-aware: velocity decides next slide
 * - No imperative animate() calls — fully declarative
 * ══════════════════════════════════════════════════════════════════════ */
function MobileCarousel({
  current,
  onNext,
  onPrev,
  onManual,
}: {
  current: number;
  onNext: () => void;
  onPrev: () => void;
  onManual: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const total = testimonials.length;

  const CARD_RATIO = 0.84; // fraction of container width
  const GAP = 12;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setContainerWidth(e.contentRect.width),
    );
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const cardW = containerWidth * CARD_RATIO;
  const stepW = cardW + GAP;

  // Center offset so active card is centered in container
  const getX = useCallback(
    (idx: number) => {
      if (!containerWidth) return 0;
      return (containerWidth - cardW) / 2 - idx * stepW;
    },
    [containerWidth, cardW, stepW],
  );

  const x = useMotionValue(0);

  // Sync x to current index
  useEffect(() => {
    if (!containerWidth) return;
    animate(x, getX(current), {
      type: "spring",
      stiffness: 380,
      damping: 36,
      mass: 0.8,
    });
  }, [current, containerWidth, getX, x]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
      const vx = info.velocity.x;
      const ox = info.offset.x;
      // velocity threshold OR offset threshold
      if (vx < -200 || (vx >= -200 && ox < -stepW * 0.35)) {
        onNext();
      } else if (vx > 200 || (vx <= 200 && ox > stepW * 0.35)) {
        onPrev();
      } else {
        // snap back
        animate(x, getX(current), {
          type: "spring",
          stiffness: 380,
          damping: 36,
          mass: 0.8,
        });
      }
      onManual();
    },
    [current, stepW, onNext, onPrev, onManual, x, getX],
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10"
        style={{
          background: "linear-gradient(to right, #FFF8F3 10%, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10"
        style={{
          background: "linear-gradient(to left, #FFF8F3 10%, transparent)",
        }}
      />

      <motion.div
        className="flex"
        style={{ x, gap: `${GAP}px`, paddingTop: 8, paddingBottom: 8 }}
        drag="x"
        dragConstraints={{ left: -stepW * 1.5, right: stepW * 1.5 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        onDragStart={onManual}
      >
        {testimonials.map((t, i) => {
          const isActive = i === current;
          return (
            <motion.div
              key={i}
              style={{
                width: cardW || `${CARD_RATIO * 100}vw`,
                flexShrink: 0,
              }}
              animate={{
                scale: isActive ? 1 : 0.93,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <TestimonialCard
                t={t}
                position={isActive ? "center" : "side"}
                onClick={() => {
                  if (i === mod(current - 1, total)) {
                    onPrev();
                    onManual();
                  } else if (i === mod(current + 1, total)) {
                    onNext();
                    onManual();
                  }
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ── Progress dots with animated active pill ──────────────────────── */
function ProgressDots({
  total,
  current,
  onGoTo,
  onManual,
}: {
  total: number;
  current: number;
  onGoTo: (i: number) => void;
  onManual: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => {
            onGoTo(i);
            onManual();
          }}
          aria-label={`Testimonial ${i + 1}`}
          className="rounded-full"
          animate={{
            width: i === current ? 22 : 7,
            background:
              i === current
                ? `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`
                : "rgba(15,35,64,0.14)",
          }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ height: 7, border: "none", padding: 0, cursor: "pointer" }}
        />
      ))}
    </div>
  );
}

/* ── Nav Button ────────────────────────────────────────────────────── */
function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileHover={{
        scale: 1.06,
        borderColor: BRAND.blue,
        backgroundColor: BRAND.background,
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        border: "1.5px solid rgba(15,35,64,0.14)",
        background: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * MAIN SECTION
 * ══════════════════════════════════════════════════════════════════════ */
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const total = testimonials.length;

  const effectivelyPaused = isPaused || userPaused;

  /* Auto-advance */
  useEffect(() => {
    if (effectivelyPaused) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((c) => mod(c + 1, total));
    }, AUTO_DELAY);
    return () => clearInterval(id);
  }, [effectivelyPaused, total]);

  const goTo = useCallback(
    (idx: number, dir?: 1 | -1) => {
      const resolved = dir ?? (idx > current ? 1 : -1);
      setDirection(resolved);
      setCurrent(mod(idx, total));
    },
    [current, total],
  );

  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);

  const handleManual = useCallback(() => {
    setIsPaused(true);
    const t = setTimeout(() => setIsPaused(false), 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28 bg-background">
      {/* Warm radial bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,107,53,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold tracking-tight uppercase"
                style={{
                  background: BRAND.background,
                  color: BRAND.blueNavy,
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                Testimoni
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: BRAND.blueNavy,
              }}
            >
              Apa Kata Mereka Tentang{" "}
              <span style={GRADIENT_GOLD_TEXT}>Inggris Go</span>?
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: BRAND.blueAbyss,
                maxWidth: "400px",
              }}
              className="leading-relaxed"
            >
              Lebih dari 500 siswa sudah merasakan manfaatnya — ini cerita
              mereka.
            </p>
          </Reveal>
        </div>

        {/* ── DESKTOP ───────────────────────────────────────────── */}
        <Reveal delay={0.1} className="hidden lg:block mb-10">
          <DesktopCarousel
            current={current}
            direction={direction}
            onPrev={prev}
            onNext={next}
            onManual={handleManual}
          />
        </Reveal>

        {/* ── TABLET ────────────────────────────────────────────── */}
        <Reveal delay={0.1} className="hidden sm:block lg:hidden mb-10">
          <TabletCarousel
            current={current}
            direction={direction}
            onNext={next}
            onManual={handleManual}
          />
        </Reveal>

        {/* ── MOBILE ────────────────────────────────────────────── */}
        <div className="sm:hidden mb-10">
          <MobileCarousel
            current={current}
            onNext={next}
            onPrev={prev}
            onManual={handleManual}
          />
        </div>

        {/* ── Controls ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4">
          <NavButton
            label="Previous"
            onClick={() => {
              prev();
              handleManual();
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M10 4L6 8l4 4"
                stroke="#0F2340"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </NavButton>

          <ProgressDots
            total={total}
            current={current}
            onGoTo={goTo}
            onManual={handleManual}
          />

          <NavButton
            label="Next"
            onClick={() => {
              next();
              handleManual();
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M6 4l4 4-4 4"
                stroke="#0F2340"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </NavButton>
        </div>
      </div>
    </section>
  );
}
