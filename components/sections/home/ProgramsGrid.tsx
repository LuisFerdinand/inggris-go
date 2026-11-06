"use client";

// Beranda "Program Kami". Layout, texts and which programs appear are managed
// in the dashboard (CMS Program Beranda); prices and links are read live from
// the program catalog.

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildWhatsAppUrl } from "@/lib/config";
import { BRAND } from "@/constants/brand";
import { trpc } from "@/lib/trpc/client";
import { DEFAULT_HOME } from "@/app/modules/site-content/site-content.defaults";
import ProgramShowcase, {
  ShowcaseHeading,
} from "./program-showcase/ProgramShowcase";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-64px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function ProgramsGrid() {
  const { data } = trpc.siteContent.getHome.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: catalog } = trpc.publicPrograms.homeCatalog.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  const c = data && data.isActive !== false ? data : DEFAULT_HOME;
  const section = c.programShowcase ?? DEFAULT_HOME.programShowcase;

  return (
    <section
      id="programs"
      className="relative w-full overflow-hidden py-16 sm:py-20 lg:py-28"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 5% 20%, rgba(10,45,135,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 95% 80%, rgba(194,138,0,0.05) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-8 max-w-3xl sm:mb-10 lg:mb-12">
          {section.eyebrow && (
            <Reveal>
              <span
                className="inline-block rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-tight"
                style={{
                  background: "#fff",
                  color: BRAND.blueNavy,
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                {section.eyebrow}
              </span>
            </Reveal>
          )}
          <Reveal delay={0.07}>
            <h2
              className="mt-4 font-display font-extrabold leading-[1.08]"
              style={{
                fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: BRAND.blueNavy,
              }}
            >
              <ShowcaseHeading
                title={section.title}
                accent={section.titleAccent}
              />
            </h2>
          </Reveal>
          {section.description && (
            <Reveal delay={0.13}>
              <p
                className="mt-3 leading-relaxed"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "560px",
                }}
              >
                {section.description}
              </p>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <ProgramShowcase section={section} catalog={catalog} />
        </Reveal>

        {/* ── Bottom CTA ────────────────────────────────────── */}
        <Reveal delay={0.08} className="mt-12 lg:mt-14">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <p style={{ fontSize: "0.875rem", color: "var(--text-faint)" }}>
              Belum tahu program yang cocok?
            </p>
            <Link
              href={buildWhatsAppUrl({
                intent: "consultation",
                title: "Konsultasi",
              })}
              className="inline-flex items-center gap-1.5 font-display font-semibold transition-all duration-200 hover:gap-2.5"
              style={{
                fontSize: "0.875rem",
                color: BRAND.blue,
                textDecoration: "none",
              }}
            >
              Konsultasi gratis dengan admin
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
