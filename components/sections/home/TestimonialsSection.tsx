"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTO_DELAY = 4800; // ms per slide

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
      className="flex flex-col h-full w-full rounded-2xl"
      style={{
        padding: isCenter ? "1.75rem" : "1.25rem 1.5rem",
        background: isCenter
          ? "linear-gradient(145deg, #ffffff 0%, #FFF8F3 100%)"
          : "#ffffff",
        border: isCenter
          ? "2px solid rgba(255,107,53,0.2)"
          : "1.5px solid rgba(15,35,64,0.07)",
        boxShadow: isCenter
          ? "0 20px 60px rgba(255,107,53,0.11), 0 4px 20px rgba(0,0,0,0.06)"
          : "0 2px 12px rgba(15,35,64,0.05)",
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

/* ── Pause / Play icon ─────────────────────────────────────────────── */
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="3" y="2" width="4" height="12" rx="1.5" />
      <rect x="9" y="2" width="4" height="12" rx="1.5" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5"
      style={{ marginLeft: "1px" }}
    >
      <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
    </svg>
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
 *  MOBILE TRACK — true spatial drag carousel
 *  - All cards rendered in a horizontal flex track
 *  - Track slides via transform translateX
 *  - No AnimatePresence — no content-swap flicker
 * ══════════════════════════════════════════════════════════════════════ */
function MobileTrack({
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
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const total = testimonials.length;

  /* Card width = 82vw, gap = 12px */
  const CARD_W_VW = 82;
  const GAP = 12;

  const getOffset = useCallback((idx: number) => {
    if (!trackRef.current) return 0;
    const vw = trackRef.current.parentElement?.offsetWidth ?? window.innerWidth;
    const cardW = (CARD_W_VW / 100) * vw;
    /* Center the active card */
    const containerCenter = vw / 2;
    const cardCenter = cardW / 2;
    return -(idx * (cardW + GAP)) + containerCenter - cardCenter;
  }, []);

  /* Animate track on current change */
  useEffect(() => {
    if (!trackRef.current) return;
    const offset = getOffset(current);
    animate(trackRef.current, { x: offset }, { duration: 0.5, ease: EASE });
  }, [current, getOffset]);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    isDragging.current = false;
    onManual();
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    if (Math.abs(x - dragStartX.current) > 5) isDragging.current = true;
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const endX =
      "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStartX.current - endX;
    if (delta > 40) onNext();
    else if (delta < -40) onPrev();
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ touchAction: "pan-y" }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8"
        style={{
          background: "linear-gradient(to right, #FFF8F3, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8"
        style={{ background: "linear-gradient(to left, #FFF8F3, transparent)" }}
      />

      {/* Sliding track */}
      <div
        ref={trackRef}
        className="flex"
        style={{
          gap: `${GAP}px`,
          willChange: "transform",
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        {testimonials.map((t, i) => {
          const isActive = i === current;
          return (
            <div
              key={i}
              onClick={() => {
                if (!isDragging.current) {
                  if (i === mod(current - 1, total)) onPrev();
                  else if (i === mod(current + 1, total)) onNext();
                }
              }}
              style={{
                width: `${CARD_W_VW}vw`,
                flexShrink: 0,
                transition:
                  "transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
                transform: isActive ? "scale(1)" : "scale(0.94)",
                opacity: isActive ? 1 : 0.55,
                cursor: isActive ? "default" : "pointer",
              }}
            >
              <TestimonialCard t={t} position={isActive ? "center" : "side"} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN SECTION ──────────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false); // explicit pause/play toggle
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
    /* Temporarily pause auto-play for 6s after manual interaction */
    setIsPaused(true);
    const t = setTimeout(() => setIsPaused(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const prevIdx = mod(current - 1, total);
  const nextIdx = mod(current + 1, total);

  /* Center card slide variants — direction-aware */
  const slideVariants = useMemo(
    () => ({
      enter: (d: number) => ({
        opacity: 0,
        x: d === 1 ? "12%" : "-12%",
        scale: 0.96,
      }),
      center: { opacity: 1, x: 0, scale: 1 },
      exit: (d: number) => ({
        opacity: 0,
        x: d === 1 ? "-12%" : "12%",
        scale: 0.96,
      }),
    }),
    [],
  );

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

        {/* ════════════════════════════════════════════════════════
         *  DESKTOP: 3-column — prev (3) | center (6) | next (3)
         * ════════════════════════════════════════════════════════ */}
        <Reveal delay={0.1} className="hidden lg:block mb-10">
          <div
            className="grid grid-cols-12 gap-5 items-stretch"
            style={{ minHeight: "300px" }}
          >
            {/* LEFT — prev, dimmed, clickable */}
            <motion.div
              key={`left-${prevIdx}`}
              className="col-span-3 flex"
              initial={{
                opacity: 0,
                x: direction === 1 ? "-20%" : "20%",
                scale: 0.9,
              }}
              animate={{ opacity: 0.6, x: 0, scale: 0.93 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={() => {
                prev();
                handleManual();
              }}
              style={{ cursor: "pointer", transformOrigin: "right center" }}
            >
              <div className="w-full" style={{ filter: "blur(0.4px)" }}>
                <TestimonialCard t={testimonials[prevIdx]} position="side" />
              </div>
            </motion.div>

            {/* CENTER — featured */}
            <div className="col-span-6 flex" style={{ zIndex: 10 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`center-${current}`}
                  className="w-full"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.48, ease: EASE }}
                >
                  <TestimonialCard
                    t={testimonials[current]}
                    position="center"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT — next, dimmed, clickable */}
            <motion.div
              key={`right-${nextIdx}`}
              className="col-span-3 flex"
              initial={{
                opacity: 0,
                x: direction === 1 ? "20%" : "-20%",
                scale: 0.9,
              }}
              animate={{ opacity: 0.6, x: 0, scale: 0.93 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={() => {
                next();
                handleManual();
              }}
              style={{ cursor: "pointer", transformOrigin: "left center" }}
            >
              <div className="w-full" style={{ filter: "blur(0.4px)" }}>
                <TestimonialCard t={testimonials[nextIdx]} position="side" />
              </div>
            </motion.div>
          </div>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
         *  TABLET (sm–lg): 2-col — center + next side-by-side
         * ════════════════════════════════════════════════════════ */}
        <Reveal delay={0.1} className="hidden sm:block lg:hidden mb-10">
          <div
            className="grid grid-cols-12 gap-4 items-stretch"
            style={{ minHeight: "280px" }}
          >
            {/* Center */}
            <div className="col-span-7 flex" style={{ zIndex: 10 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`tablet-center-${current}`}
                  className="w-full"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <TestimonialCard
                    t={testimonials[current]}
                    position="center"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Right (next) */}
            <motion.div
              key={`tablet-right-${nextIdx}`}
              className="col-span-5 flex"
              initial={{ opacity: 0, x: "15%" }}
              animate={{ opacity: 0.6, x: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={() => {
                next();
                handleManual();
              }}
              style={{ cursor: "pointer", transformOrigin: "left center" }}
            >
              <div className="w-full" style={{ filter: "blur(0.3px)" }}>
                <TestimonialCard t={testimonials[nextIdx]} position="side" />
              </div>
            </motion.div>
          </div>
        </Reveal>

        {/* ════════════════════════════════════════════════════════
         *  MOBILE: true spatial drag track
         *  Cards stay mounted — only track position changes
         * ════════════════════════════════════════════════════════ */}
        <div className="sm:hidden mb-10">
          <MobileTrack
            current={current}
            onNext={() => {
              next();
              handleManual();
            }}
            onPrev={() => {
              prev();
              handleManual();
            }}
            onManual={handleManual}
          />
        </div>

        {/* ── Controls ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 mb-5">
          {/* Prev */}
          <button
            onClick={() => {
              prev();
              handleManual();
            }}
            aria-label="Previous"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              border: "1.5px solid rgba(15,35,64,0.14)",
              background: "white",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#FF6B35";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,107,53,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(15,35,64,0.14)";
              (e.currentTarget as HTMLElement).style.background = "white";
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
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  goTo(i);
                  handleManual();
                }}
                aria-label={`Testimonial ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "22px" : "7px",
                  height: "7px",
                  background:
                    i === current
                      ? `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`
                      : "rgba(15,35,64,0.14)",
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => {
              next();
              handleManual();
            }}
            aria-label="Next"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              border: "1.5px solid rgba(15,35,64,0.14)",
              background: "white",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = BRAND.blue;
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,107,53,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(15,35,64,0.14)";
              (e.currentTarget as HTMLElement).style.background = "white";
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
          </button>

          {/* Divider */}
          {/* <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(15,35,64,0.1)",
            }}
          /> */}

          {/* Pause / Play toggle */}
          {/* <button
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play autoplay" : "Pause autoplay"}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              border: "1.5px solid rgba(15,35,64,0.14)",
              background: "white",
              color: "#0F2340",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#FF6B35";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,107,53,0.05)";
              (e.currentTarget as HTMLElement).style.color = "#FF6B35";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = userPaused
                ? "#FF6B35"
                : "rgba(15,35,64,0.14)";
              (e.currentTarget as HTMLElement).style.background = userPaused
                ? "rgba(255,107,53,0.08)"
                : "white";
              (e.currentTarget as HTMLElement).style.color = userPaused
                ? "#FF6B35"
                : "#0F2340";
            }}
          >
            {userPaused ? <PlayIcon /> : <PauseIcon />}
          </button> */}
        </div>

        {/* Auto-play progress bar */}
        {/* <div className="flex justify-center">
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: "100px",
              height: "2px",
              background: "rgba(15,35,64,0.08)",
            }}
          >
            <motion.div
              key={`progress-${current}-${effectivelyPaused}`}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #FF6B35, #E8521C)" }}
              initial={{ width: "0%" }}
              animate={{ width: effectivelyPaused ? "0%" : "100%" }}
              transition={{
                duration: effectivelyPaused ? 0.15 : AUTO_DELAY / 1000,
                ease: "linear",
              }}
            />
          </div>
        </div> */}
      </div>
    </section>
  );
}
