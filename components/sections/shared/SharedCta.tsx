"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

import { trpc } from "@/lib/trpc/client";
import { buildWhatsAppUrl } from "@/lib/config";
import { BRAND } from "@/constants/brand";
import { DEFAULT_CTA } from "@/app/modules/site-content/site-content.defaults";

const ease = [0.22, 1, 0.36, 1] as const;

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
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The single shared call-to-action rendered at the end of the Home,
 * About and Contact pages. Content is managed from
 * /dashboard/settings/cta; falls back to DEFAULT_CTA.
 */
export default function SharedCta() {
  const { data } = trpc.siteContent.getCta.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const cta = data && data.isActive !== false ? data : DEFAULT_CTA;

  const eyebrow = cta.eyebrow || DEFAULT_CTA.eyebrow;
  const title = cta.title || DEFAULT_CTA.title;
  const titleAccent = cta.titleAccent ?? DEFAULT_CTA.titleAccent;
  const description = cta.description || DEFAULT_CTA.description;
  const primaryLabel = cta.primaryLabel || DEFAULT_CTA.primaryLabel;
  const primaryHref = cta.primaryHref || DEFAULT_CTA.primaryHref;
  const secondaryLabel = cta.secondaryLabel || DEFAULT_CTA.secondaryLabel;
  const trustPoints =
    cta.trustPoints && cta.trustPoints.length > 0
      ? cta.trustPoints
      : DEFAULT_CTA.trustPoints;

  const secondaryHref = cta.secondaryIsWhatsapp
    ? buildWhatsAppUrl({
        intent: "consultation",
        title: "konsultasi dari CTA section",
      })
    : cta.secondaryHref || "/contact";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cline x1='16' y1='10' x2='16' y2='22' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3Cline x1='10' y1='16' x2='22' y2='16' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-28">
        {eyebrow && (
          <Reveal>
            <span
              className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display font-semibold text-white"
              style={{
                fontSize: "0.875rem",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(4px)",
              }}
            >
              {eyebrow}
            </span>
          </Reveal>
        )}

        <Reveal delay={0.08}>
          <h2
            className="mb-5 font-display font-extrabold leading-[1.08] text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {title}
            {titleAccent && (
              <>
                <br />
                <span style={{ color: "#fbbf24" }}>{titleAccent}</span>
              </>
            )}
          </h2>
        </Reveal>

        {description && (
          <Reveal delay={0.14}>
            <p
              className="mx-auto mb-10 leading-relaxed"
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.82)",
                maxWidth: "440px",
                lineHeight: "1.75",
              }}
            >
              {description}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            {primaryLabel && (
              <Link
                href={primaryHref || "/programs"}
                className="inline-flex min-h-12 items-center justify-center rounded-full font-display font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  fontSize: "0.9375rem",
                  background: "white",
                  color: BRAND.blueNavy,
                  padding: "0.875rem 2rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                }}
              >
                {primaryLabel}
              </Link>
            )}

            {secondaryLabel && (
              <a
                href={secondaryHref}
                target={cta.secondaryIsWhatsapp ? "_blank" : undefined}
                rel={cta.secondaryIsWhatsapp ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full font-display font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  fontSize: "0.9375rem",
                  background: "transparent",
                  padding: "0.875rem 2rem",
                  border: "2px solid rgba(255,255,255,0.55)",
                }}
              >
                {secondaryLabel}
              </a>
            )}
          </div>
        </Reveal>

        {trustPoints.length > 0 && (
          <Reveal delay={0.26}>
            <p
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
              style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.95)" }}
            >
              {trustPoints.map((point) => (
                <span key={point} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 flex-shrink-0">
                    <path
                      d="M3 8l3.5 3.5L13 4"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </span>
              ))}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
