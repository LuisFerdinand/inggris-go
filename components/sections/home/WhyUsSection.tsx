"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { trpc } from "@/lib/trpc/client";
import SectionHeading from "@/components/ui/SectionHeading";
import { Icon } from "@/components/Icon";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { STUDENT_COUNT_LABEL } from "@/constants";
import { DEFAULT_HOME } from "@/app/modules/site-content/site-content.defaults";
import type { AdvantageGradientKey } from "@/app/modules/site-content/site-content.types";

const ease = [0.22, 1, 0.36, 1] as const;

const GRADIENT_MAP: Record<AdvantageGradientKey, string> = {
  blue: BRAND.gradientBlue,
  navy: BRAND.gradientNavy,
  gold: BRAND.gradientGold,
  sky: BRAND.gradientSky,
};

type Feature = (typeof DEFAULT_HOME.advantageFeatures)[number];

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

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease }}
      whileHover={{ y: -6, transition: { duration: 0.28, ease } }}
      className="group relative flex cursor-default flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-colors duration-300 hover:border-[var(--border)] sm:p-6"
      style={{ boxShadow: BRAND.shadowCard }}
    >
      <div
        className="mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-110 sm:mb-5"
        style={{
          background: GRADIENT_MAP[feature.gradientKey] ?? BRAND.gradientBlue,
        }}
      >
        <Icon name={feature.icon} className="h-5 w-5" />
      </div>

      <h3
        className="mb-2 font-display text-base font-bold leading-snug"
        style={{ color: BRAND.blueNavy }}
      >
        {feature.title}
      </h3>

      <p
        className="text-sm leading-relaxed"
        style={{ color: BRAND.textMuted }}
      >
        {feature.desc}
      </p>
    </motion.div>
  );
}

export default function WhyUsSection() {
  const { data } = trpc.siteContent.getHome.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_HOME;

  const eyebrow = c.advantageEyebrow || DEFAULT_HOME.advantageEyebrow;
  const title = c.advantageTitle || DEFAULT_HOME.advantageTitle;
  const titleAccent =
    c.advantageTitleAccent ?? DEFAULT_HOME.advantageTitleAccent;
  const description =
    c.advantageDescription || DEFAULT_HOME.advantageDescription;
  const features =
    c.advantageFeatures && c.advantageFeatures.length > 0
      ? c.advantageFeatures
      : DEFAULT_HOME.advantageFeatures;

  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      {/* Same soft blue/gold wash as the Method section, so the page flows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 60% 50% at 15% 10%, ${BRAND.overlayBlueBlob} 0%, transparent 60%),` +
            `radial-gradient(ellipse 50% 60% at 85% 90%, ${BRAND.overlayGoldBlob} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 xl:px-12">
        <SectionHeading
          className="mb-10 sm:mb-12 lg:mb-16"
          eyebrow={eyebrow}
          title={title}
          accent={titleAccent}
          titleSuffix="?"
          description={description}
        />

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-16 lg:grid-cols-3 lg:gap-5">
          {features.map((f, i) => (
            <FeatureCard key={`${f.title}-${i}`} feature={f} index={i} />
          ))}
        </div>

        {/* Bottom CTA band — static (not CMS-managed) */}
        <Reveal delay={0.1}>
          <div
            className="relative flex flex-col items-center justify-between gap-5 overflow-hidden rounded-2xl px-5 py-6 sm:flex-row sm:px-8 sm:py-7"
            style={{
              background: BRAND.overlayBlueCard,
              border: `1px solid ${BRAND.overlayBlueIcon}`,
            }}
          >
            <div className="relative z-10 text-center sm:text-left">
              <p
                className="mb-1 font-display text-lg font-bold"
                style={{ color: BRAND.blueNavy }}
              >
                Ayah/Bunda, siap mulai perjalanan belajar si kecil?
              </p>
              <p className="text-sm" style={{ color: BRAND.textMuted }}>
                Bergabung dengan {STUDENT_COUNT_LABEL} siswa yang sudah
                merasakan manfaatnya.
              </p>
            </div>

            <a
              href="#programs"
              className="relative z-10 inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-display text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 sm:w-auto"
              style={{
                background: BRAND.gradientGold,
                boxShadow: BRAND.shadowGoldBtn,
                color: BRAND.blueNavy,
              }}
            >
              Lihat Program Kami
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
