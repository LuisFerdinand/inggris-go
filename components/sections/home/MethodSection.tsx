"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { trpc } from "@/lib/trpc/client";
import SectionHeading from "@/components/ui/SectionHeading";
import { Icon } from "@/components/Icon";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { DEFAULT_HOME } from "@/app/modules/site-content/site-content.defaults";

const ease = [0.22, 1, 0.36, 1] as const;

type Step = (typeof DEFAULT_HOME.methodSteps)[number];

/** Per-index visual treatment (not CMS-managed — keeps the zig-zag look). */
const STYLES = [
  { squareBg: BRAND.gradientBlue, accentBg: BRAND.gradientNavy, rotate: "-6deg" },
  { squareBg: BRAND.gradientGold, accentBg: BRAND.gradientBlue, rotate: "5deg" },
  { squareBg: BRAND.gradientNavy, accentBg: BRAND.gradientGold, rotate: "-4deg" },
  { squareBg: BRAND.gradientBlue, accentBg: BRAND.gradientNavy, rotate: "6deg" },
];
const styleFor = (i: number) => STYLES[i % STYLES.length];

/** Dark amber for the tag chips: the bright brand gold on its own pale-gold tint was ~1.7:1; this is ~5:1. */
const CHIP_TEXT = "#8a5a00";

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
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function DesktopStepCard({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const s = styleFor(index);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease }}
      className="group flex min-w-0 flex-1 cursor-default flex-col items-center text-center"
    >
      <div className="relative mb-5" style={{ width: "88px", height: "88px" }}>
        <motion.div
          className="transition-all duration-300 group-hover:scale-105"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "76px",
            height: "76px",
            borderRadius: "20px",
            background: s.squareBg,
            transform: `rotate(${s.rotate})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: BRAND.shadowBlueBtn,
          }}
        >
          <span
            className="select-none font-display font-black text-white"
            style={{ fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.03em" }}
          >
            {step.num}
          </span>
        </motion.div>

        <div
          className="absolute bottom-0 right-0 z-10 flex items-center justify-center text-white transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: s.accentBg,
            boxShadow: BRAND.shadowBlueBtn,
          }}
        >
          <Icon name={step.icon} className="h-4 w-4" />
        </div>
      </div>

      <span
        className="mb-1 font-display font-semibold uppercase transition-colors duration-200"
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          color: BRAND.textMuted,
        }}
      >
        {step.subtitle}
      </span>

      <h3
        className="mb-2 font-display font-bold leading-snug transition-colors duration-200"
        style={{ fontSize: "1.0625rem", color: BRAND.blueNavy }}
      >
        {step.title}
      </h3>

      <p
        className="mb-4 leading-relaxed"
        style={{ fontSize: "0.875rem", color: BRAND.textMuted, maxWidth: "200px" }}
      >
        {step.body}
      </p>

      <div className="flex flex-wrap justify-center gap-1.5">
        {step.tags.map((tag) => (
          <span
            key={tag}
            className="translate-y-2 rounded-full px-2.5 py-1 font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              fontSize: "0.75rem",
              background: BRAND.overlayGoldIcon,
              color: CHIP_TEXT,
              border: `1px solid var(--overlay-gold-blob)`,
              transitionDelay: "40ms",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function MobileStep({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px 0px" });
  const s = styleFor(index);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease }}
      className="group relative flex gap-5"
    >
      <div className="flex flex-shrink-0 flex-col items-center">
        <div className="relative" style={{ width: "68px", height: "68px" }}>
          <div
            className="absolute top-0 left-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background: s.squareBg,
              transform: `rotate(${s.rotate})`,
              boxShadow: BRAND.shadowBlueBtn,
            }}
          >
            <span
              className="select-none font-display font-black text-white"
              style={{ fontSize: "1.5rem", lineHeight: 1, letterSpacing: "-0.03em" }}
            >
              {step.num}
            </span>
          </div>

          <div
            className="absolute bottom-0 right-0 z-10 flex items-center justify-center text-white transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-110"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: s.accentBg,
              boxShadow: BRAND.shadowBlueBtn,
            }}
          >
            <Icon name={step.icon} className="h-3.5 w-3.5" />
          </div>
        </div>

        {!isLast && (
          <div
            className="mt-3 flex flex-1 flex-col items-center"
            style={{ minHeight: "40px" }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: "100%" } : {}}
              transition={{ duration: 0.7, delay: index * 0.1 + 0.3, ease }}
              style={{
                width: "2px",
                background: `linear-gradient(180deg, ${BRAND.blueVivid} 0%, ${BRAND.blueFrost} 100%)`,
                borderRadius: "2px",
                flex: 1,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 pb-10 pt-1">
        <span
          className="mb-1 block font-display font-semibold uppercase"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            color: BRAND.textMuted,
          }}
        >
          Langkah {step.num} · {step.subtitle}
        </span>

        <h3
          className="mb-2 font-display font-bold leading-snug transition-colors duration-200"
          style={{ fontSize: "1.0625rem", color: BRAND.blueNavy }}
        >
          {step.title}
        </h3>

        <p
          className="mb-3 leading-relaxed"
          style={{ fontSize: "0.875rem", color: BRAND.textMuted }}
        >
          {step.body}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 font-medium"
              style={{
                fontSize: "0.75rem",
                background: BRAND.overlayGoldIcon,
                color: CHIP_TEXT,
                border: `1px solid var(--overlay-gold-blob)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function MethodSection() {
  const { data } = trpc.siteContent.getHome.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_HOME;

  const eyebrow = c.methodEyebrow || DEFAULT_HOME.methodEyebrow;
  const title = c.methodTitle || DEFAULT_HOME.methodTitle;
  const titleAccent = c.methodTitleAccent ?? DEFAULT_HOME.methodTitleAccent;
  const description = c.methodDescription || DEFAULT_HOME.methodDescription;
  const steps =
    c.methodSteps && c.methodSteps.length > 0
      ? c.methodSteps
      : DEFAULT_HOME.methodSteps;
  const fnPrefix = c.methodFootnotePrefix ?? DEFAULT_HOME.methodFootnotePrefix;
  const fnHighlight =
    c.methodFootnoteHighlight ?? DEFAULT_HOME.methodFootnoteHighlight;
  const fnSuffix = c.methodFootnoteSuffix ?? DEFAULT_HOME.methodFootnoteSuffix;

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 60% 50% at 85% 15%, ${BRAND.overlayBlueBlob} 0%, transparent 60%),` +
            `radial-gradient(ellipse 50% 60% at 15% 85%, ${BRAND.overlayGoldBlob} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 xl:px-12">
        <SectionHeading
          className="mb-12 lg:mb-20"
          eyebrow={eyebrow}
          title={title}
          accent={titleAccent}
          description={description}
        />

        <div className="hidden items-start justify-center gap-0 lg:flex">
          {steps.map((step, i) => (
            <div key={`${step.num}-${i}`} className="flex items-start">
              <DesktopStepCard step={step} index={i} />
              {i < steps.length - 1 && (
                <div
                  className="flex flex-shrink-0 items-start justify-center"
                  style={{ paddingTop: "36px", width: "56px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "3px",
                      borderRadius: "2px",
                      background: BRAND.gradientGold,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-sm lg:hidden">
          {steps.map((step, i) => (
            <MobileStep
              key={`${step.num}-${i}`}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {(fnPrefix || fnHighlight || fnSuffix) && (
          <Reveal delay={0.1} className="mt-14 lg:mt-16">
            <div className="flex items-center justify-center gap-2.5">
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  background: BRAND.gradientGold,
                  borderRadius: "1px",
                }}
              />
              <p
                className="text-center font-display font-medium"
                style={{ fontSize: "0.875rem", color: BRAND.textMuted }}
              >
                {fnPrefix}{" "}
                <span style={{ color: BRAND.goldVivid, fontWeight: 700 }}>
                  {fnHighlight}
                </span>{" "}
                {fnSuffix}
              </p>
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  background: BRAND.gradientGold,
                  borderRadius: "1px",
                }}
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
