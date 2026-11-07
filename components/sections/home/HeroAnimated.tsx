"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { trpc } from "@/lib/trpc/client";
import { formatCount, SHOW_PUBLIC_RATING } from "@/constants";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { DEFAULT_HOME } from "@/app/modules/site-content/site-content.defaults";
import type {
  HeroFloatingText,
  HeroStatLabel,
  SiteStats,
} from "@/app/modules/site-content/site-content.types";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

function formatStat(key: HeroStatLabel["key"], stats: SiteStats): string {
  switch (key) {
    case "alumni":
      return `${formatCount(stats.alumni)}+`;
    case "rating":
      return `${stats.rating}★`;
    case "years":
      return `${stats.years}+`;
    case "programs":
      return `${stats.programs}`;
  }
}

/** Renders `text` with the first occurrence of `highlight` styled. */
function Highlighted({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, ...rest] = text.split(highlight);
  return (
    <>
      {before}
      <strong style={{ color: BRAND.blue, fontWeight: 600 }}>{highlight}</strong>
      {rest.join(highlight)}
    </>
  );
}

// ── Pulsing mic icon (SVG) ──────────────────────────────────────────────────
function MicIcon({ color }: { color: string }) {
  return (
    <svg className="w-5 h-5" fill={color} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className="flex gap-px">
      {[...Array(count)].map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className="w-3 h-3"
          fill="#FBBF24"
          aria-hidden="true"
        >
          <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
        </svg>
      ))}
    </span>
  );
}

function WaveformBars({ color }: { color: string }) {
  const heights = [8, 14, 20, 14, 18, 10, 16, 12, 20, 8, 14, 18];
  return (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="rounded-full"
          style={{ width: 2, height: h, background: color, opacity: 0.7 }}
          animate={{ scaleY: [1, 0.4, 1.2, 0.6, 1] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function SpeechBubble({ floating }: { floating: HeroFloatingText }) {
  return (
    <motion.div
      className="absolute z-30"
      style={{
        top: "12%",
        left: "-12%",
        maxWidth: 200,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderRadius: "18px 18px 18px 4px",
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(10,45,135,0.13)",
        border: `1.5px solid ${BRAND.borderSoft}`,
      }}
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 1.1, duration: 0.55, ease }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -9,
          left: 14,
          width: 0,
          height: 0,
          borderLeft: "10px solid rgba(255,255,255,0.97)",
          borderRight: "4px solid transparent",
          borderTop: "10px solid rgba(255,255,255,0.97)",
          filter: "drop-shadow(0 2px 2px rgba(10,45,135,0.08))",
        }}
      />

      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
          style={{
            background: BRAND.surfaceSoft,
            color: BRAND.blueNavy,
            border: `1.5px solid ${BRAND.borderSoft}`,
          }}
        >
          {floating.speechInitials}
        </div>
        <div>
          <p
            className="font-bold leading-none"
            style={{ fontSize: "0.75rem", color: BRAND.blueNavy }}
          >
            {floating.speechName}
          </p>
          <Stars />
        </div>
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: BRAND.textMuted,
          lineHeight: 1.55,
          fontStyle: "italic",
          margin: 0,
        }}
      >
        &ldquo;{floating.speechQuote}&rdquo;
      </p>
    </motion.div>
  );
}

function LiveBadge({ title }: { title: string }) {
  return (
    <motion.div
      className="absolute z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
      style={{
        bottom: "10%",
        right: "-10%",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(10,45,135,0.13)",
        border: `1.5px solid ${BRAND.borderSoft}`,
        minWidth: 160,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.3, duration: 0.5, ease }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: BRAND.overlayBlueIconStrong }}
      >
        <MicIcon color={BRAND.blueVivid} />
      </div>
      <div>
        <p
          className="font-bold leading-none mb-1"
          style={{ fontSize: "0.75rem", color: BRAND.blueNavy }}
        >
          {title}
        </p>
        <WaveformBars color={BRAND.blue} />
      </div>
    </motion.div>
  );
}

function ActiveStudentsBadge({
  activeCount,
  text,
}: {
  activeCount: number;
  text: string;
}) {
  return (
    <motion.div
      className="absolute z-30 flex items-center gap-2 px-3.5 py-2 rounded-full"
      style={{
        top: "38%",
        right: "-8%",
        background: BRAND.gradientBlue,
        boxShadow: BRAND.shadowBlue,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.45, ease }}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
      <p
        className="font-bold text-white leading-none"
        style={{ fontSize: "0.75rem" }}
      >
        {activeCount}+ {text}
      </p>
    </motion.div>
  );
}

function ConversationCard({ floating }: { floating: HeroFloatingText }) {
  const messages = [
    { text: floating.chatMsg1, align: "left" as const },
    { text: floating.chatMsg2, align: "right" as const },
  ];
  return (
    <motion.div
      className="absolute z-30 rounded-2xl overflow-hidden"
      style={{
        bottom: "28%",
        left: "-14%",
        width: 180,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(10,45,135,0.11)",
        border: `1.5px solid ${BRAND.borderSoft}`,
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.5, ease }}
    >
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{
          background: BRAND.surfaceSoft,
          borderBottom: `1px solid ${BRAND.borderSoft}`,
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <p
          className="font-bold"
          style={{
            fontSize: "0.75rem",
            color: BRAND.textFaint,
            letterSpacing: "0.06em",
          }}
        >
          {floating.chatHeader}
        </p>
      </div>
      <div className="p-3 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}
          >
            <span
              className="px-2.5 py-1.5 rounded-xl text-white"
              style={{
                fontSize: "0.75rem",
                background: msg.align === "right" ? BRAND.blue : BRAND.blueNavy,
                borderRadius:
                  msg.align === "right"
                    ? "12px 12px 4px 12px"
                    : "12px 12px 12px 4px",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ImageGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 75% 80% at 50% 60%, ${BRAND.overlayBlueBlob} 0%, transparent 70%)`,
        borderRadius: "50%",
        transform: "scale(1.1)",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function HeroAnimated() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 500], [0, -40]);

  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  const { data } = trpc.siteContent.getHome.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const statsQuery = trpc.siteContent.getSiteStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const c = data && data.isActive !== false ? data : DEFAULT_HOME;
  const stats: SiteStats = statsQuery.data ?? {
    alumni: 2000,
    rating: 4.9,
    years: 8,
    programs: 12,
  };

  const badge = c.heroBadgeText || DEFAULT_HOME.heroBadgeText;
  const title = c.heroTitle || DEFAULT_HOME.heroTitle;
  const titleAccent = c.heroTitleAccent ?? DEFAULT_HOME.heroTitleAccent;
  const subtitle = c.heroSubtitle || DEFAULT_HOME.heroSubtitle;
  const subtitleHighlight =
    c.heroSubtitleHighlight ?? DEFAULT_HOME.heroSubtitleHighlight;
  const description = c.heroDescription || DEFAULT_HOME.heroDescription;
  const imageUrl = c.heroImageUrl || DEFAULT_HOME.heroImageUrl;
  const imageAlt = c.heroImageAlt || DEFAULT_HOME.heroImageAlt;
  const primaryLabel = c.heroPrimaryCtaLabel || DEFAULT_HOME.heroPrimaryCtaLabel;
  const primaryHref = c.heroPrimaryCtaHref || DEFAULT_HOME.heroPrimaryCtaHref;
  const secondaryLabel =
    c.heroSecondaryCtaLabel || DEFAULT_HOME.heroSecondaryCtaLabel;
  const secondaryHref =
    c.heroSecondaryCtaHref || DEFAULT_HOME.heroSecondaryCtaHref;
  const floating: HeroFloatingText = {
    ...DEFAULT_HOME.heroFloatingText,
    ...(c.heroFloatingText ?? {}),
  };
  const statLabels = (
    c.heroStatLabels && c.heroStatLabels.length > 0
      ? c.heroStatLabels
      : DEFAULT_HOME.heroStatLabels
  ).filter((s) => SHOW_PUBLIC_RATING || s.key !== "rating");

  const statColors = [BRAND.blue, BRAND.blueVivid, BRAND.blueNavy];

  return (
    <section
      aria-label="Hero section"
      className="relative w-full overflow-hidden"
      style={{
        background: BRAND.gradientPage,
        paddingTop: "var(--navbar-height)",
      }}
    >
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob"}
        style={{
          position: "absolute",
          top: "6%",
          left: "-8%",
          width: "clamp(200px, 26vw, 380px)",
          height: "clamp(200px, 26vw, 380px)",
          background: BRAND.overlayGoldBlob,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(1px)",
        }}
      />
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob-reverse"}
        style={{
          position: "absolute",
          bottom: "-4%",
          right: "-7%",
          width: "clamp(240px, 30vw, 440px)",
          height: "clamp(240px, 30vw, 440px)",
          background: BRAND.overlayBlueBlob,
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          filter: "blur(1px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 xl:gap-16 items-center min-h-[min(88vh,780px)] lg:min-h-0">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {badge && (
              <motion.div variants={item} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
                  style={{
                    background: BRAND.surface,
                    color: BRAND.blueNavy,
                    boxShadow: BRAND.shadowSoft,
                  }}
                >
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  {badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={item}
              className="font-jakarta font-extrabold leading-[1.07] mb-5"
              style={{
                color: BRAND.blueNavy,
                fontSize: "clamp(2.4rem, 4.8vw, 4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              {title}{" "}
              {titleAccent && (
                <span style={GRADIENT_GOLD_TEXT}>{titleAccent}</span>
              )}
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg sm:text-xl leading-relaxed mb-2 max-w-[500px]"
              style={{ color: BRAND.textMuted }}
            >
              <Highlighted text={subtitle} highlight={subtitleHighlight} />
            </motion.p>

            <motion.p
              variants={item}
              className="text-base leading-relaxed mb-9 max-w-[480px]"
              style={{ color: BRAND.textMuted }}
            >
              {description}
            </motion.p>

            <motion.div variants={item} className="flex flex-col gap-3 mb-10 sm:flex-row sm:flex-wrap">
              <Link
                href={primaryHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 font-bold text-base rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: BRAND.gradientGold,
                  boxShadow: primaryHovered
                    ? BRAND.shadowGoldBtnHover
                    : BRAND.shadowGoldBtn,
                  color: "#3a1c00",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={() => setPrimaryHovered(true)}
                onMouseLeave={() => setPrimaryHovered(false)}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {primaryLabel}
              </Link>

              <a
                href={secondaryHref}
                className="inline-flex min-h-12 items-center justify-center font-bold text-base text-white rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: BRAND.gradientNavy,
                  boxShadow: secondaryHovered
                    ? BRAND.shadowNavyBtnHover
                    : BRAND.shadowNavyBtn,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={() => setSecondaryHovered(true)}
                onMouseLeave={() => setSecondaryHovered(false)}
              >
                {secondaryLabel}
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="flex items-center gap-5 sm:gap-8 flex-wrap"
            >
              {statLabels.map((stat, i) => (
                <div
                  key={stat.key}
                  className="flex items-center gap-5 sm:gap-8"
                >
                  {i > 0 && (
                    <div
                      style={{
                        width: "1px",
                        height: "44px",
                        background: BRAND.borderSoft,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <p
                      className="font-display font-bold leading-none mb-1"
                      style={{
                        fontSize: "1.75rem",
                        color: statColors[i % statColors.length],
                      }}
                    >
                      {formatStat(stat.key, stats)}
                    </p>
                    <p className="text-sm" style={{ color: BRAND.textMuted }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: reduced ? 0 : imageY }}
            className="relative hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            <div
              className="relative"
              style={{ width: "clamp(340px, 38vw, 480px)", aspectRatio: "4/5" }}
            >
              <ImageGlow />

              <div
                aria-hidden
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `2px dashed ${BRAND.borderSoft}`,
                  borderRadius: "50%",
                  transform: "scale(0.88)",
                  top: "8%",
                  opacity: 0.5,
                }}
              />

              <motion.div
                className="relative z-10 w-full h-full flex items-end justify-center"
                transition={{
                  repeat: Infinity,
                  duration: 5.5,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 0px, 38vw"
                  className="object-contain object-bottom"
                  style={{
                    filter: "drop-shadow(0 24px 56px rgba(10,45,135,0.18))",
                  }}
                  priority
                />
              </motion.div>

              <SpeechBubble floating={floating} />
              <LiveBadge title={floating.liveTitle} />
              <ActiveStudentsBadge
                activeCount={stats.alumni}
                text={floating.activeText}
              />
              <ConversationCard floating={floating} />
            </div>
          </motion.div>

          <motion.div
            className="lg:hidden flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ background: BRAND.surface, boxShadow: BRAND.shadowCard }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: BRAND.overlayBlueIconStrong }}
                >
                  <MicIcon color={BRAND.blueVivid} />
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: BRAND.blueNavy }}
                  >
                    {floating.liveTitle}
                  </p>
                  <WaveformBars color={BRAND.blue} />
                </div>
                <span
                  className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#16a34a",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { text: floating.chatMsg1, right: false },
                  { text: floating.chatMsg2, right: true },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.right ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className="px-4 py-2 rounded-2xl text-sm text-white max-w-[75%]"
                      style={{
                        background: msg.right ? BRAND.blue : BRAND.blueNavy,
                        borderRadius: msg.right
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
