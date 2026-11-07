"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { trpc } from "@/lib/trpc/client";
import SectionHeading from "@/components/ui/SectionHeading";
import { Icon } from "@/components/Icon";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { DEFAULT_HOME } from "@/app/modules/site-content/site-content.defaults";
import type { ProblemColorKey } from "@/app/modules/site-content/site-content.types";

const ease = [0.22, 1, 0.36, 1] as const;

const COLOR_MAP: Record<ProblemColorKey, (typeof BRAND.problem)[keyof typeof BRAND.problem]> = {
  orange: BRAND.problem.orange,
  teal: BRAND.problem.teal,
  amber: BRAND.problem.amber,
  purple: BRAND.problem.purple,
};

type Card = (typeof DEFAULT_HOME.problemCards)[number];

/* ── Reusable scroll-reveal wrapper ── */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  const initial = {
    opacity: 0,
    y: direction === "up" ? 32 : 0,
    x: direction === "left" ? -28 : direction === "right" ? 28 : 0,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Individual problem card ── */
function ProblemCard({ problem, index }: { problem: Card; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const color = COLOR_MAP[problem.colorKey] ?? BRAND.problem.orange;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease } }}
      className="group relative flex cursor-default flex-col rounded-3xl p-7"
      style={{
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="pointer-events-none absolute top-4 right-5 select-none font-display font-black leading-none"
        style={{
          fontSize: "5rem",
          color: color.accent,
          opacity: 0.07,
          lineHeight: 1,
        }}
      >
        {problem.number}
      </span>

      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: color.accent, color: "white" }}
      >
        <Icon name={problem.icon} className="h-6 w-6" />
      </div>

      <span
        className="mb-2 font-display text-xs font-bold uppercase tracking-widest"
        style={{ color: color.accent, opacity: 0.7 }}
      >
        {problem.number}
      </span>

      <h3
        className="mb-3 font-display text-xl font-bold leading-snug"
        style={{ color: "#0F2340" }}
      >
        {problem.title}
      </h3>

      <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
        {problem.body}
      </p>
    </motion.div>
  );
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { data } = trpc.siteContent.getHome.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_HOME;

  const eyebrow = c.problemEyebrow || DEFAULT_HOME.problemEyebrow;
  const title = c.problemTitle || DEFAULT_HOME.problemTitle;
  const titleAccent = c.problemTitleAccent ?? DEFAULT_HOME.problemTitleAccent;
  const description = c.problemDescription || DEFAULT_HOME.problemDescription;
  const cards =
    c.problemCards && c.problemCards.length > 0
      ? c.problemCards
      : DEFAULT_HOME.problemCards;
  const calloutText = c.problemCalloutText || DEFAULT_HOME.problemCalloutText;
  const calloutHighlight =
    c.problemCalloutHighlight ?? DEFAULT_HOME.problemCalloutHighlight;
  const calloutIcon = c.problemCalloutIcon || DEFAULT_HOME.problemCalloutIcon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background py-16 sm:py-20 lg:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(255,107,53,0.05) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 60% at 85% 80%, rgba(45,184,176,0.05) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 xl:px-12">
        <SectionHeading
          className="mb-10 sm:mb-14 lg:mb-20"
          eyebrow={eyebrow}
          title={title}
          accent={titleAccent}
          description={description}
        />

        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((p, i) => (
            <ProblemCard key={`${p.number}-${i}`} problem={p} index={i} />
          ))}
        </div>

        {calloutText && (
          <Reveal delay={0.1}>
            <div
              className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl px-8 py-6 text-center sm:flex-row sm:text-left"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45,184,176,0.08) 0%, rgba(45,184,176,0.14) 100%)",
                border: "1.5px solid rgba(45,184,176,0.2)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
                style={{
                  background: "rgba(45,184,176,0.12)",
                  filter: "blur(32px)",
                }}
              />

              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(45,184,176,0.15)", color: "#2DB8B0" }}
              >
                <Icon name={calloutIcon} className="h-6 w-6" />
              </div>

              <p
                className="relative z-10 text-base font-medium sm:text-lg"
                style={{ color: BRAND.blueNavy }}
              >
                {calloutText}{" "}
                {calloutHighlight && (
                  <span
                    className="font-bold"
                    style={{ color: BRAND.goldVivid }}
                  >
                    {calloutHighlight}
                  </span>
                )}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
