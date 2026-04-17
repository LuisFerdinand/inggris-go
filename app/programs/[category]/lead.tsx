"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { buildWhatsAppUrl } from "@/lib/config";
import { CATEGORIES, ProgramMeta } from "./data";
import { Button, ButtonProps } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";

const LEAD = CATEGORIES["lead"];

type SP = { size?: number; className?: string };
const Target = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const MsgCircle = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    />
  </svg>
);
const Zap = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 2 3 14h9l-1 8 10-12h-9z"
    />
  </svg>
);
const Vol2 = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path strokeLinecap="round" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);
const Briefcase = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const BookIcon = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path
      strokeLinecap="round"
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
    />
  </svg>
);
const Sprout = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      d="M7 20h10M12 20v-7.5M12 12.5C12 9 9.5 6 6 6c0 3.5 2.5 6.5 6 6.5zM12 12.5c0-3.5 2.5-6.5 6-6.5 0 3.5-2.5 6.5-6 6.5z"
    />
  </svg>
);
const SmileIcon = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
);
const ShieldIcon = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    />
  </svg>
);
const ClockIcon = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);
const CheckIcon = ({ size = 20, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
  </svg>
);
const ArrRight = ({ size = 16, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14M12 5l7 7-7 7"
    />
  </svg>
);
const ChevL = ({ size = 18, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);
const ChevR = ({ size = 18, className }: SP) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

const ICON_MAP: Record<string, React.FC<SP>> = {
  target: Target,
  "message-circle": MsgCircle,
  zap: Zap,
  "volume-2": Vol2,
  briefcase: Briefcase,
  book: BookIcon,
  sprout: Sprout,
  smile: SmileIcon,
  shield: ShieldIcon,
  clock: ClockIcon,
};
function Icon({
  name,
  size,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = ICON_MAP[name] ?? ChevR;
  return <C size={size} className={className} />;
}
type FId = "all" | "beginner" | "confidence" | "career";
const FILTERS: {
  id: FId;
  label: string;
  sub: string;
  IC: React.FC<SP>;
  slugs: string[];
}[] = [
  { id: "all", label: "Semua Program", sub: "", IC: Target, slugs: [] },
  {
    id: "beginner",
    label: "Dari nol",
    sub: "Belum pernah belajar",
    IC: Sprout,
    slugs: [
      "speaking-challenge",
      "daily-conversation-drill",
      "grammar-for-speaking",
    ],
  },
  {
    id: "confidence",
    label: "Percaya diri",
    sub: "Berani ngomong tanpa takut",
    IC: SmileIcon,
    slugs: [
      "speaking-challenge",
      "confidence-booster-class",
      "pronunciation-mastery",
    ],
  },
  {
    id: "career",
    label: "Siap kerja",
    sub: "Untuk karir & profesional",
    IC: Briefcase,
    slugs: [
      "interview-english-prep",
      "confidence-booster-class",
      "grammar-for-speaking",
    ],
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, [handleMove]);
  return { ref, pos };
}

function Pill({
  children,
  color = "navy",
}: {
  children: React.ReactNode;
  color?: "orange" | "navy" | "green";
}) {
  const styles = {
    orange: {
      background: "rgba(255,107,53,0.1)",
      color: BRAND.goldVivid,
      border: "1px solid rgba(255,107,53,0.2)",
    },
    navy: {
      background: BRAND.background,
      color: BRAND.blue,
      border: "1px solid rgba(15,35,64,0.12)",
    },
    green: {
      background: "rgba(34,197,94,0.1)",
      color: "#16a34a",
      border: "1px solid rgba(34,197,94,0.2)",
    },
  }[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
      style={styles}
    >
      {children}
    </span>
  );
}

type BtnPrimaryProps =
  | ({
      href: string;
      external?: boolean;
    } & Omit<ButtonProps, "asChild">)
  | ButtonProps;

function BtnPrimary(props: BtnPrimaryProps) {
  if ("href" in props && props.href) {
    const { href, external, children, ...rest } = props;

    if (external) {
      return (
        <Button asChild variant="brand" size="brand-md" {...rest}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        </Button>
      );
    }

    return (
      <Button asChild variant="brand" size="brand-md" {...rest}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return <Button variant="brand" size="brand-md" {...props} />;
}

type BtnSecondaryProps =
  | ({
      href: string;
      external?: boolean;
    } & Omit<ButtonProps, "asChild">)
  | ButtonProps;

function BtnSecondary(props: BtnSecondaryProps) {
  if ("href" in props && props.href) {
    const { href, external, children, ...rest } = props;

    if (external) {
      return (
        <Button asChild variant="brand-secondary" size="brand-md" {...rest}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        </Button>
      );
    }

    return (
      <Button asChild variant="brand-secondary" size="brand-md" {...rest}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return <Button variant="brand-secondary" size="brand-md" {...props} />;
}

function Section({
  children,
  className = "",
  id,
  bg,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: string;
}) {
  return (
    <section
      id={id}
      className={`relative py-20 lg:py-28 ${className}`}
      style={bg ? { background: bg } : undefined}
    >
      {children}
    </section>
  );
}

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex items-center gap-3 mb-5 ${align === "center" ? "justify-center" : ""}`}
    >
      <div className="h-px w-8 bg-gradient-to-r from-brand-orange to-brand-orange/30" />
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-orange">
        {children}
      </span>
      <div className="h-px w-8 bg-gradient-to-l from-brand-orange to-brand-orange/30" />
    </div>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * to));
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    requestAnimationFrame((t) => step(t, t));
  }, [inView, to]);
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function HeroSection() {
  const [visible, setVisible] = useState(false);
  const { ref: mouseRef, pos } = useMousePosition();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const a = (d: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s ease ${d}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  });

  return (
    <section
      ref={mouseRef as React.RefObject<HTMLElement>}
      className="relative min-h-[92vh] flex flex-col overflow-hidden"
      style={{
        background: BRAND.background,
      }}
    >
      {/* Interactive gradient orb following mouse */}
      <div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-30 transition-transform duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, ${BRAND.background} 0%, transparent 70%)`,
          left: pos.x - 300,
          top: pos.y - 300,
          filter: "blur(40px)",
        }}
      />

      {/* Static bg elements */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-[55%] h-[70%] rounded-bl-[80px]"
          style={{ background: BRAND.background }}
        />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-brand-orange/6" />
        <div className="absolute -top-16 -right-16 w-[300px] h-[300px] rounded-full border border-brand-orange/8" />
        {/* Dot grid */}
        <svg
          className="absolute top-0 right-0 w-64 h-64 opacity-[0.07]"
          viewBox="0 0 200 200"
        >
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={c * 26 + 10}
                cy={r * 26 + 10}
                r="2"
                fill={BRAND.blue}
              />
            )),
          )}
        </svg>
      </div>

      {/* Breadcrumb */}
      <Container className="pt-7">
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.05s",
          }}
        >
          <nav className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-brand-sand rounded-full px-4 py-2">
            <Link
              href="/"
              className="text-xs text-brand-charcoal/40 hover:text-brand-orange transition-colors font-medium"
            >
              Beranda
            </Link>
            <span>/</span>
            <Link
              href="/programs"
              className="text-xs text-brand-charcoal/40 hover:text-brand-orange transition-colors font-medium"
            >
              Program
            </Link>
            <span>/</span>
            <span className="text-xs text-brand-orange font-semibold">
              Starter Program
            </span>
          </nav>
        </div>
      </Container>

      {/* Main content */}
      <Container className="flex-1 flex items-center py-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
          {/* Left */}
          <div className="max-w-xl">
            <div style={a(0.1)}>
              <Pill color="navy">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: BRAND.blue }}
                />
                Starter Program
              </Pill>
            </div>

            <h1
              className="font-display font-extrabold text-brand-navy mt-5 mb-6 leading-[1.06]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", ...a(0.18) }}
            >
              {LEAD.tagline}
              <br />
              <span className="relative" style={{ color: BRAND.blueNavy }}>
                {LEAD.taglineAccent}
                {/* Underline accent */}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  preserveAspectRatio="none"
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.8s ease 0.6s",
                  }}
                >
                  <path
                    d="M0 5 Q50 1 100 4 Q150 7 200 3"
                    stroke={BRAND.goldVivid}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="text-brand-charcoal/60 text-base lg:text-lg leading-relaxed mb-8"
              style={a(0.26)}
            >
              {LEAD.description}
            </p>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap items-center gap-4 mb-8"
              style={a(0.3)}
            >
              {[
                { icon: "clock", label: "Self-paced" },
                { icon: "shield", label: "Pemula friendly" },
                { icon: "zap", label: "Mulai 2 menit" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-sm text-brand-charcoal/55"
                >
                  <Icon
                    name={item.icon}
                    className="w-3.5 h-3.5 text-brand-orange/70"
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3" style={a(0.34)}>
              <BtnPrimary href={LEAD.cta.primaryHref} size="lg">
                {LEAD.cta.primaryLabel}
                <Icon
                  name="arrow-right"
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </BtnPrimary>
              <BtnSecondary href={buildWhatsAppUrl("Starter Program")} external>
                <Icon name="whatsapp" className="w-4 h-4 text-green-600" />
                {LEAD.cta.secondaryLabel}
              </BtnSecondary>
            </div>
          </div>

          {/* Right: Interactive card */}
          <div
            className="hidden lg:block"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(32px)",
              transition:
                "opacity 0.8s ease 0.35s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s",
            }}
          >
            <HeroCard />
          </div>
        </div>
      </Container>

      {/* Bottom fade */}
      <div className="h-16 bg-gradient-to-b from-transparent to-white/60 pointer-events-none" />
    </section>
  );
}

function HeroCard() {
  const [activeDay, setActiveDay] = useState(3);

  return (
    <div className="relative mx-auto" style={{ maxWidth: 380 }}>
      {/* Main card */}
      <div
        className="relative rounded-[28px] bg-white overflow-hidden"
        style={{
          boxShadow:
            "0 40px 100px rgba(15,35,64,0.14), 0 0 0 1px rgba(15,35,64,0.06)",
        }}
      >
        {/* Top gradient bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.blueVivid} 60%, ${BRAND.blueNavy} 100%)`,
          }}
        />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-brand-charcoal/35 font-semibold mb-1">
                Program
              </p>
              <h3 className="font-display font-bold text-brand-navy text-xl">
                {LEAD.programs[0].title}
              </h3>
            </div>
            <Pill color="navy">{LEAD.programs[0].badge}</Pill>
          </div>

          {/* Day tracker */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-brand-charcoal/50">
                Progress Challenge
              </p>
              <span className="text-xs font-bold text-brand-orange">
                Hari {activeDay}/7
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i + 1)}
                  className="flex-1 h-8 rounded-lg transition-all duration-200 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      i < activeDay
                        ? `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueNavy})`
                        : i === activeDay - 1
                          ? "rgba(255,107,53,0.15)"
                          : "rgba(15,35,64,0.05)",
                    color:
                      i < activeDay
                        ? "white"
                        : i === activeDay - 1
                          ? BRAND.goldVivid
                          : "rgba(15,35,64,0.3)",
                    transform:
                      i === activeDay - 1 ? "scaleY(1.08)" : "scaleY(1)",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-brand-charcoal/35 mt-2">
              {activeDay < 7
                ? `${7 - activeDay} hari lagi — terus semangat! 🔥`
                : "Challenge selesai! 🎉"}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {LEAD.programs[0].tags?.map((t) => (
              <span
                key={t}
                className="text-[11px] font-medium px-3 py-1 rounded-lg bg-brand-sand text-brand-navy/55"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="h-px bg-brand-sand mb-5" />

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brand-charcoal/30 mb-1">
                Harga
              </p>
              <p className="text-2xl font-extrabold text-brand-navy">
                {LEAD.programs[0].price}
              </p>
            </div>
            <a
              href={LEAD.programs[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
              }}
            >
              Daftar
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div
        className="absolute -top-5 -left-8  text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2"
        style={{
          boxShadow: "0 8px 24px rgba(15,35,64,0.3)",
          animation: "float 5s ease-in-out infinite",
          color: BRAND.goldVivid,
          background: BRAND.blueNavy,
        }}
      >
        <Icon name="check" className="w-3.5 h-3.5" />
        Mulai dari nol
      </div>
      <div
        className="absolute -bottom-5 -right-6 text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2"
        style={{
          background: BRAND.background,
          color: BRAND.blueNavy,
          // boxShadow: "0 8px 24px rgba(255,107,53,0.25)",
          animation: "float 5s ease-in-out 2s infinite",
        }}
      >
        <Icon name="smile" className="w-3.5 h-3.5" />
        Tanpa tekanan
      </div>

      {/* Background glow */}
      <div
        className="absolute -z-10 inset-4 rounded-[32px] blur-2xl opacity-20"
        style={{
          background: `linear-gradient(135deg, ${BRAND.blueNavy}, ${BRAND.blueSky})`,
        }}
      />
    </div>
  );
}

function StatsBar() {
  const stats = [
    { n: 200, suffix: "+", label: "Peserta aktif" },
    { n: 7, suffix: " hari", label: "Challenge pendek" },
    { n: 4.9, suffix: "/5", label: "Rating peserta" },
    { n: 89, suffix: "%", label: "Merasa lebih percaya diri" },
  ];

  return (
    <div className="relative bg-brand-navy py-10 lg:py-12 overflow-hidden">
      {/* Subtle pattern */}
      <div aria-hidden className="absolute inset-0 opacity-[0.04]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              duration={0.7}
              direction="up"
              type="slide"
              className="text-center lg:px-8"
            >
              <p
                className="font-display font-extrabold text-white mb-1"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                <Counter to={s.n} suffix={s.suffix} />
              </p>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}

function PainCard({ p, i }: { p: any; i: number }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{
        rest: { y: 0, scale: 1 },
        hover: { y: -6, scale: 1.01 },
      }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative group rounded-3xl p-6 overflow-hidden cursor-default"
      style={{
        background: BRAND.background,
        border: "1px solid rgba(15,35,64,0.06)",
        boxShadow: "0 2px 20px rgba(15,35,64,0.06)",
      }}
    >
      {/* ✨ Border glow (VERY subtle premium effect) */}
      <motion.div
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: "0 0 0 1px rgba(255,107,53,0.15)",
        }}
      />

      {/* ✨ Top accent line */}
      <motion.div
        variants={{
          rest: { scaleX: 0, opacity: 0 },
          hover: { scaleX: 1, opacity: 1 },
        }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{
          background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
        }}
      />

      {/* ✨ Directional light (pro-level subtle effect) */}
      <motion.div
        variants={{
          rest: { opacity: 0, x: "-20%" },
          hover: { opacity: 1, x: "0%" },
        }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 60%, transparent 80%)",
        }}
      />

      {/* CONTENT */}

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          variants={{
            rest: { scale: 1, rotate: 0 },
            hover: { scale: 1.08, rotate: -2 },
          }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: BRAND.background,
            border: `1px solid ${BRAND.border}`,
          }}
        >
          <Icon name={p.icon || "book"} className="w-5 h-5 text-brand-orange" />
        </motion.div>
        <motion.div
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,107,53,0.04), transparent 60%)",
          }}
        />
        {/* Title */}
        <motion.h3
          variants={{
            rest: { y: 0 },
            hover: { y: -2 },
          }}
          transition={{ duration: 0.25, delay: 0.03 }}
          className="font-display font-bold mb-2 text-brand-navy"
        >
          {p.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          variants={{
            rest: { opacity: 0.75 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="text-sm leading-relaxed text-brand-charcoal/55"
        >
          {p.description}
        </motion.p>
      </div>

      {/* ✨ Watermark number */}
      <motion.span
        variants={{
          rest: { opacity: 0.05, scale: 1 },
          hover: { opacity: 0.08, scale: 1.04 },
        }}
        transition={{ duration: 0.3 }}
        className="absolute top-5 right-5 font-display font-black text-5xl text-brand-navy"
      >
        {String(i + 1).padStart(2, "0")}
      </motion.span>
    </motion.div>
  );
}

function PainSection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: BRAND.background,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000000'/%3E%3C/svg%3E\")",
        }}
      />
      <Container className="relative z-10">
        <Reveal
          delay={0.08}
          duration={0.7}
          direction="left"
          type="slide"
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <SectionLabel align="center">
            Kamu mungkin pernah merasa…
          </SectionLabel>
          <h2
            className="font-display font-extrabold text-brand-navy leading-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Kenapa susah banget{" "}
            <span className="text-brand-orange">mulai ngomong Inggris?</span>
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-4">
          {LEAD.painPoints?.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.08} // ✨ nicer stagger
              duration={0.7}
              direction="left"
              type="slide"
            >
              <PainCard p={p} i={i} />
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.35}
          duration={0.7}
          direction="none"
          type="scale"
          className="text-center mt-10"
        >
          <p className="text-brand-charcoal/50 text-sm">
            Kamu tidak sendirian —{" "}
            <span className="text-brand-orange font-semibold">
              program ini dibuat tepat untuk situasi itu.
            </span>
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

function SolutionSection() {
  return (
    <Section bg={BRAND.background}>
      {/* Decorative side accent */}
      <div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-r-full bg-gradient-to-b from-transparent via-brand-orange/30 to-transparent"
      />

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal delay={0.08} duration={0.7} direction="left" type="slide">
            <SectionLabel>Solusi tepat untuk kamu</SectionLabel>
            <h2
              className="font-display font-extrabold text-brand-navy leading-tight mb-6"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              Belajar yang{" "}
              <span className="text-brand-orange">beneran jalan</span>
              <br />
              buat kesibukan kamu
            </h2>
            <p className="text-brand-charcoal/60 leading-relaxed text-base max-w-md">
              Tidak harus punya waktu banyak. Tidak harus grammar bagus dulu.
              Kamu hanya perlu mulai dari satu langkah kecil — dan terus.
            </p>

            {/* Comparison snippet */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-brand-sand">
              {[
                {
                  before: "Hafalin 1000 vocab dulu",
                  after: "Langsung latihan ngomong",
                },
                {
                  before: "Takut salah grammar",
                  after: "Fokus ke keberanian dulu",
                },
                {
                  before: "Butuh waktu kosong banyak",
                  after: "Cukup 10–15 menit sehari",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 text-sm"
                  style={{
                    borderTop:
                      i > 0 ? "1px solid rgba(15,35,64,0.06)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 px-4 py-3.5 bg-brand-cream/50">
                    <span className="w-4 h-4 rounded-full bg-brand-charcoal/10 flex items-center justify-center flex-shrink-0">
                      <span className="block w-2 h-px bg-brand-charcoal/40" />
                    </span>
                    <span className="text-brand-charcoal/45 line-through text-xs">
                      {row.before}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3.5 bg-white">
                    <span className="w-4 h-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                      <Icon
                        name="check"
                        className="w-2.5 h-2.5 text-green-500"
                      />
                    </span>
                    <span className="text-brand-navy font-medium text-xs">
                      {row.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Benefits */}
          <div className="flex flex-col gap-4">
            {LEAD.benefits?.map((b, i) => (
              <Reveal
                key={b.title}
                delay={0.08}
                duration={0.7}
                direction="right"
                type="slide"
              >
                <div
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 group hover:-translate-y-0.5 transition-all duration-300"
                  style={{
                    boxShadow: "0 2px 16px rgba(15,35,64,0.07)",
                    border: "1px solid rgba(15,35,64,0.05)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: BRAND.background }}
                  >
                    <Icon
                      name={b.icon || "book"}
                      className="w-5 h-5 text-brand-orange"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-brand-navy">
                        {b.title}
                      </h3>
                    </div>
                    <p className="text-brand-charcoal/55 text-sm leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="check" className="w-3.5 h-3.5 text-green-500" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ProgramsSection({ programs }: { programs: ProgramMeta[] }) {
  const [filter, setFilter] = useState<FId>("all");
  const [activeIdx, setIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  /* ── filter logic ── */
  const af = FILTERS.find((f) => f.id === filter)!;
  const shown =
    filter === "all"
      ? programs
      : programs.filter((p) => af.slugs.includes(p.slug));
  const faded = (slug: string) => filter !== "all" && !af.slugs.includes(slug);

  /* ── carousel scroll tracking ── */
  const onScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    // card width = 78vw capped at 300px, plus 12px gap
    const cardW = Math.min(window.innerWidth * 0.78, 300) + 12;
    setIdx(Math.round(el.scrollLeft / cardW));
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const goTo = (i: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardW = Math.min(window.innerWidth * 0.78, 300) + 12;
    el.scrollTo({ left: i * cardW, behavior: "smooth" });
  };

  /* ── entry animation style ── */
  const fadeIn = (delay = 0) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(22px)",
    transition: `opacity .55s ease ${delay}s, transform .55s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <section
      id="programs"
      className="relative overflow-hidden py-20 lg:py-28"
      style={{
        background: BRAND.background,
      }}
    >
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle,rgba(255,107,53,.15),transparent 70%)",
        }}
      />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10" style={fadeIn(0)}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="h-px w-6 opacity-60"
              style={{ background: BRAND.goldVivid }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-orange">
              Program Tersedia
            </span>
            <div
              className="h-px w-6 opacity-60"
              style={{ background: BRAND.goldVivid }}
            />
          </div>
          <h2
            className="font-display font-extrabold text-brand-navy leading-tight mb-3"
            style={{ fontSize: "clamp(1.65rem,3.5vw,2.6rem)" }}
          >
            Pilih program yang{" "}
            <span className="text-brand-orange">cocok buat kamu</span>
          </h2>
          <p className="text-brand-charcoal/50 text-sm max-w-xs mx-auto leading-relaxed">
            Fleksibel dan ramah pemula — mulai ringan dulu, lanjut sesuai
            tujuanmu.
          </p>
          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {[BRAND.goldVivid, "#2DB8B0", "#7C3AED", "#0F2340"].map(
                (bg, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: bg, zIndex: 4 - i }}
                  >
                    {"ARSD"[i]}
                  </div>
                ),
              )}
            </div>
            <span className="text-[11px] text-brand-charcoal/40 font-medium">
              1.200+ peserta bergabung
            </span>
          </div>
        </div>

        {/* ── FILTER ──────────────────────────────────────────────────── */}
        <div className="mb-8" style={fadeIn(0.08)}>
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-brand-navy/40 mb-3">
            Tujuan kamu apa?
          </p>
          {/* Scrollable pill row — works on all screen sizes */}
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            <style>{`.filter-row::-webkit-scrollbar{display:none}`}</style>
            <div className="flex gap-2 mx-auto flex-nowrap px-1">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFilter(f.id);
                      setIdx(0);
                      carouselRef.current?.scrollTo({
                        left: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12.5px] font-semibold select-none"
                    style={{
                      background: active
                        ? `linear-gradient(135deg,${BRAND.blue},${BRAND.blueNavy})`
                        : "white",
                      color: active ? "white" : "rgba(15,35,64,.55)",
                      border: `1.5px solid ${active ? "transparent" : "rgba(15,35,64,.09)"}`,
                      boxShadow: active
                        ? "0 4px 18px rgba(255,107,53,.3)"
                        : "0 1px 6px rgba(15,35,64,.06)",
                      transition: "all .22s cubic-bezier(.16,1,.3,1)",
                      transform: active ? "scale(1.03)" : "scale(1)",
                    }}
                  >
                    <f.IC size={14} />
                    {f.label}
                    {active && f.id !== "all" && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-px rounded-md"
                        style={{ background: "rgba(255,255,255,.22)" }}
                      >
                        {f.slugs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {filter !== "all" && (
            <p
              className="text-center text-[11px] mt-2.5 font-medium"
              style={{ color: BRAND.blue }}
            >
              {af.sub} · {af.slugs.length} program tersedia
            </p>
          )}
        </div>

        {/* ── DESKTOP GRID (md+) ──────────────────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((prog, i) => (
            <div key={prog.slug} style={{ ...fadeIn(0.12 + i * 0.07) }}>
              <ProgramCard prog={prog} faded={false} />
            </div>
          ))}
          {/* Empty state */}
          {shown.length === 0 && (
            <div className="col-span-3 text-center py-16 text-brand-charcoal/30 text-sm">
              Tidak ada program untuk filter ini.
            </div>
          )}
        </div>

        {/* ── MOBILE CAROUSEL (< md) ──────────────────────────────────── */}
        <div className="md:hidden">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-3 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "8px",
              /* bleed to screen edges */
              marginLeft: "calc(-1rem)",
              marginRight: "calc(-1rem)",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <style>{`
              #programs .mobile-carousel::-webkit-scrollbar { display: none; }
            `}</style>
            {programs.map((prog) => (
              <div
                key={prog.slug}
                className="flex-shrink-0 snap-center"
                style={{
                  width: "78vw",
                  maxWidth: "300px",
                  minWidth: "240px",
                  opacity: faded(prog.slug) ? 0.25 : 1,
                  transition: "opacity .3s ease",
                }}
              >
                <ProgramCard prog={prog} faded={false} />
              </div>
            ))}
            {/* trailing peek spacer */}
            <div className="flex-shrink-0 w-8" aria-hidden />
          </div>

          {/* Nav: prev / dots / next */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => goTo(Math.max(0, activeIdx - 1))}
              disabled={activeIdx === 0}
              aria-label="Sebelumnya"
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-90"
              style={{
                borderColor:
                  activeIdx === 0
                    ? "rgba(15,35,64,.1)"
                    : "rgba(255,107,53,.35)",
                color: activeIdx === 0 ? "rgba(15,35,64,.2)" : BRAND.goldVivid,
                background:
                  activeIdx === 0 ? "transparent" : "rgba(255,107,53,.06)",
              }}
            >
              <ChevL size={15} />
            </button>

            <div className="flex items-center gap-1.5">
              {programs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Program ${i + 1}`}
                  className="rounded-full transition-all duration-300 active:scale-75"
                  style={{
                    width: activeIdx === i ? 18 : 6,
                    height: 6,
                    background:
                      activeIdx === i ? BRAND.goldVivid : "rgba(15,35,64,.15)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(Math.min(programs.length - 1, activeIdx + 1))}
              disabled={activeIdx >= programs.length - 1}
              aria-label="Berikutnya"
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-90"
              style={{
                borderColor:
                  activeIdx >= programs.length - 1
                    ? "rgba(15,35,64,.1)"
                    : "rgba(255,107,53,.35)",
                color:
                  activeIdx >= programs.length - 1
                    ? "rgba(15,35,64,.2)"
                    : BRAND.goldVivid,
                background:
                  activeIdx >= programs.length - 1
                    ? "transparent"
                    : "rgba(255,107,53,.06)",
              }}
            >
              <ChevR size={15} />
            </button>
          </div>

          {/* Counter */}
          <p className="text-center text-[11px] text-brand-charcoal/28 mt-1.5 font-medium tabular-nums">
            {activeIdx + 1} / {programs.length}
          </p>
        </div>

        {/* ── REASSURANCE FOOTER ──────────────────────────────────────── */}
        <div
          className="mt-12 pt-8 border-t border-brand-sand"
          style={fadeIn(0.38)}
        >
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto sm:max-w-lg">
            {(
              [
                { IC: ShieldIcon, text: "Cocok pemula" },
                { IC: ClockIcon, text: "Mulai kapan saja" },
                { IC: SmileIcon, text: "Tanpa tekanan" },
              ] as { IC: React.FC<SP>; text: string }[]
            ).map(({ IC, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: BRAND.background }}
                >
                  <IC size={18} className="text-brand-orange" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-brand-charcoal/48 leading-tight">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ prog, faded }: { prog: ProgramMeta; faded: boolean }) {
  return (
    <div
      className="pgc group relative bg-white rounded-[22px] flex flex-col h-full overflow-hidden"
      style={{
        border: "1.5px solid rgba(15,35,64,0.07)",
        boxShadow: "0 2px 14px rgba(15,35,64,0.06)",
        opacity: faded ? 0.28 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* CSS hover — zero JS */}
      <style>{`
        .pgc{transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s ease;}
        .pgc:hover{transform:translateY(-6px);box-shadow:0 22px 52px rgba(15,35,64,.12),0 0 0 1.5px rgba(255,107,53,.2)!important;}
        .pgc:hover .pgc-ic{transform:scale(1.12) rotate(-5deg);}
        .pgc:hover .pgc-t{color:${BRAND.blueNavy};}
        .pgc:hover .pgc-btn{box-shadow:0 8px 26px rgba(255,107,53,.45)!important;transform:scale(1.05);}
        .pgc-ic{transition:transform .3s cubic-bezier(.16,1,.3,1);}
        .pgc-t{transition:color .2s ease;}
        .pgc-btn{transition:box-shadow .28s ease,transform .28s cubic-bezier(.16,1,.3,1);}
      `}</style>

      {/* Top bar */}
      <div className="h-[3px]" style={{ background: BRAND.background }} />

      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        {/* Icon + badge */}
        <div className="flex items-start justify-between">
          <div
            className="pgc-ic w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: BRAND.background }}
          >
            <Icon name={prog.icon} size={22} className="text-brand-orange" />
          </div>
          {prog.badge && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gold-btn"
              style={{ color: BRAND.blueNavy }}
            >
              {prog.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="pgc-t font-display font-bold text-[1.05rem] text-brand-navy leading-snug">
          {prog.title}
        </h3>

        {/* Highlight */}
        {prog.highlight && (
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg w-fit bg-gold-btn"
            style={{ color: BRAND.blueNavy }}
          >
            <CheckIcon size={10} />
            {prog.highlight}
          </div>
        )}

        {/* Desc */}
        <p className="text-[12.5px] leading-relaxed text-brand-charcoal/52 line-clamp-2">
          {prog.description}
        </p>

        {/* Benefits */}
        {prog.benefits && (
          <div className="flex flex-col gap-1.5 flex-1">
            {prog.benefits.slice(0, 3).map((b) => (
              <div key={b.title} className="flex items-start gap-2">
                <div
                  className="w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0 mt-[2px]"
                  style={{ background: "rgba(255,107,53,.12)" }}
                >
                  <CheckIcon size={8} className="text-brand-orange" />
                </div>
                <p className="text-[12px] leading-snug">
                  <span className="font-semibold text-brand-navy">
                    {b.title}
                  </span>
                  <span className="text-brand-charcoal/40">
                    {" "}
                    — {b.description}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Meta */}
        <div className="flex flex-wrap gap-1.5">
          {[prog.duration, prog.format, prog.level].filter(Boolean).map((m) => (
            <span
              key={m}
              className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
              style={{
                background: "rgba(15,35,64,0.05)",
                color: "rgba(15,35,64,0.45)",
              }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "rgba(15,35,64,0.07)" }} />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p
              className="text-[9px] uppercase tracking-wider mb-0.5"
              style={{ color: "rgba(15,35,64,0.3)" }}
            >
              Harga
            </p>
            <p className="text-[1.35rem] font-extrabold text-brand-navy leading-none">
              {prog.price}
            </p>
          </div>
          <a
            href={prog.href}
            target="_blank"
            rel="noopener noreferrer"
            className="pgc-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg,${BRAND.blue},${BRAND.blueNavy})`,
              boxShadow: "0 4px 14px rgba(255,107,53,.3)",
            }}
          >
            Daftar
            <ArrRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

function StepsSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <Section bg={BRAND.background}>
      <Container>
        <Reveal className="text-center mb-16">
          <SectionLabel align="center">Cara Kerja</SectionLabel>
          <h2
            className="font-display font-extrabold text-brand-navy leading-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
          >
            Mulai dalam{" "}
            <span className="text-brand-orange">3 langkah mudah</span>
          </h2>
        </Reveal>

        <div ref={ref} className="relative">
          {/* Connecting dashed line */}
          <div
            className="hidden lg:block absolute top-10 left-[calc(50%/3+10%)] right-[calc(50%/3+10%)] h-px"
            style={{
              background: `repeating-linear-gradient(90deg, ${BRAND.blueNavy} 0px, ${BRAND.blueNavy} 8px, transparent 8px, transparent 18px)`,
              opacity: 0.25,
            }}
          />

          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            {LEAD.steps?.map((s, i) => (
              <div
                key={s.n}
                className="flex flex-col items-center text-center"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`,
                }}
              >
                {/* Step number ring */}
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                      boxShadow: "0 12px 36px rgba(255,107,53,0.35)",
                    }}
                  >
                    <span className="font-display font-black text-2xl text-white">
                      {s.n}
                    </span>
                  </div>
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                    }}
                  />
                </div>

                <h3 className="font-display font-bold text-brand-navy text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-brand-charcoal/55 text-sm leading-relaxed max-w-[180px]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA nudge */}
        <Reveal delay={0.4} className="text-center mt-12">
          <BtnPrimary href={LEAD.programs[0].href} external size="lg">
            Mulai Sekarang
            <Icon
              name="arrow-right"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </BtnPrimary>
        </Reveal>
      </Container>
    </Section>
  );
}

function ReassuranceSection() {
  const reassurance = [
    {
      icon: "clock",
      label: "Tanpa jadwal",
      desc: "Belajar kapan kamu mau, tidak ada sesi wajib atau deadline",
    },
    {
      icon: "smile",
      label: "Tanpa tekanan",
      desc: "Tidak ada penilaian, tidak ada ujian — fokus ke progress",
    },
    {
      icon: "shield",
      label: "Cocok pemula",
      desc: "Dari nol pun oke, tidak ada syarat atau pengalaman sebelumnya",
    },
    {
      icon: "zap",
      label: "Hasil cepat",
      desc: "Challenge 7 hari sudah cukup untuk mulai merasakan perubahan",
    },
  ];

  return (
    <Section bg={BRAND.background}>
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal direction="left">
              <SectionLabel>Kenapa aman dicoba</SectionLabel>
              <h2
                className="font-display font-extrabold text-brand-navy leading-tight mb-10"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
              >
                Rancangan yang{" "}
                <span style={GRADIENT_GOLD_TEXT}>mendukung kamu</span>
                <br />
                bukan membebani
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 gap-4">
              {reassurance.map((r, i) => (
                <Reveal key={r.label} delay={i * 0.08} direction="left">
                  <div
                    className="rounded-2xl p-5 h-full group hover:-translate-y-1 transition-all duration-300"
                    style={{
                      background: "white",
                      border: "1px solid rgba(15,35,64,0.06)",
                      boxShadow: "0 2px 12px rgba(15,35,64,0.05)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: BRAND.background }}
                    >
                      <Icon
                        name={r.icon}
                        className="w-4.5 h-4.5 text-brand-orange"
                      />
                    </div>
                    <p className="font-bold text-brand-navy text-sm mb-1">
                      {r.label}
                    </p>
                    <p className="text-brand-charcoal/50 text-xs leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <Reveal direction="right">
              <SectionLabel>Kata mereka</SectionLabel>
              <h2
                className="font-display font-extrabold text-brand-navy leading-tight mb-8"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
              >
                Sudah <span className="text-brand-orange">ratusan peserta</span>
                <br />
                yang mulai duluan
              </h2>
            </Reveal>

            <div className="flex flex-col gap-4">
              {LEAD.socialProof?.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.12} direction="right">
                  <div
                    className="relative bg-white rounded-2xl p-6 overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
                    style={{
                      boxShadow: "0 4px 24px rgba(15,35,64,0.08)",
                      border: "1px solid rgba(15,35,64,0.06)",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                      style={{
                        background: `linear-gradient(180deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                      }}
                    />

                    <div className="flex items-start gap-3 pl-3">
                      <Icon
                        name="quote"
                        className="w-7 h-7 text-brand-orange/15 flex-shrink-0 -mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-brand-navy font-medium leading-relaxed text-sm mb-4">
                          "{t.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              background: `linear-gradient(180deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                            }}
                          >
                            {t.name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-navy text-sm">
                              {t.name}
                            </p>
                            {t.role && (
                              <p className="text-brand-charcoal/40 text-xs">
                                {t.role}
                              </p>
                            )}
                          </div>
                          <div className="ml-auto flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((j) => (
                              <Icon
                                key={j}
                                name="star"
                                className="w-3 h-3 text-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
function CtaSection() {
  return (
    <Section className="pb-24" bg="#FFF8F3">
      <Container>
        <Reveal>
          <div
            className="relative rounded-[32px] overflow-hidden px-8 py-16 lg:px-16 lg:py-20 text-center"
            style={{
              background:
                "linear-gradient(145deg, #0F2340 0%, #162d55 60%, #1e3a6e 100%)",
            }}
          >
            {/* Ambient glows */}
            <div
              aria-hidden
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,107,53,0.2) 0%, transparent 65%)",
              }}
            />
            <div
              aria-hidden
              className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,184,154,0.06) 0%, transparent 70%)",
              }}
            />

            {/* Dot pattern */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <pattern
                    id="dots-cta"
                    width="15"
                    height="15"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="7.5" cy="7.5" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots-cta)" />
              </svg>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <Pill color="orange">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                Starter Program
              </Pill>

              <h2
                className="font-display font-extrabold text-white mt-5 mb-4 leading-tight"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
              >
                {LEAD.cta.title}
                <br />
                <span className="text-brand-orange">
                  {LEAD.cta.titleAccent}
                </span>
              </h2>

              <p className="text-white/50 text-base max-w-md mx-auto mb-10 leading-relaxed">
                {LEAD.cta.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={LEAD.programs[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97] group"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.goldVivid}, ${BRAND.goldMid})`,
                    color: BRAND.blueNavy,
                    boxShadow: "0 6px 28px rgba(255,107,53,0.45)",
                  }}
                >
                  {LEAD.cta.primaryLabel}
                  <Icon
                    name="arrow-right"
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  />
                </a>
                <a
                  href={buildWhatsAppUrl("Starter Program Speaking Challenge")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-2xl font-semibold text-sm text-white/70 border border-white/12 transition-all hover:scale-[1.03] hover:bg-white/8 active:scale-[0.97]"
                >
                  <Icon name="whatsapp" className="w-4 h-4 text-green-400" />
                  {LEAD.cta.secondaryLabel}
                </a>
              </div>

              {/* Micro trust signals */}
              <div className="flex items-center justify-center gap-6 mt-8">
                {[
                  { icon: "shield", label: "Hanya Rp 49.000" },
                  { icon: "zap", label: "Mulai dalam 2 menit" },
                  { icon: "clock", label: "Tanpa jadwal" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-white/30 text-xs"
                  >
                    <Icon name={item.icon} className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export default function LeadPageClient() {
  return (
    <main className="min-h-screen bg-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <HeroSection />
      <PainSection />
      <SolutionSection />
      <ProgramsSection programs={LEAD.programs} />
      <StepsSection />
      <ReassuranceSection />
      <CtaSection />
    </main>
  );
}
