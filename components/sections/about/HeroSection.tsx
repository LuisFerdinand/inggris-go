"use client";

import Reveal from "@/components/ui/Reveal";
import { trpc } from "@/lib/trpc/client";
import { formatCount, SHOW_PUBLIC_RATING } from "@/constants";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { DEFAULT_ABOUT } from "@/app/modules/site-content/site-content.defaults";
import type {
  HeroStatLabel,
  SiteStats,
  TeamMember,
} from "@/app/modules/site-content/site-content.types";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, MapPin, Star, Users } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const STAT_META: Record<
  HeroStatLabel["key"],
  { Icon: React.ElementType; accent: string }
> = {
  alumni: { Icon: Users, accent: BRAND.blue },
  years: { Icon: Star, accent: "#F59E0B" },
  programs: { Icon: BookOpen, accent: "#0D9488" },
  rating: { Icon: Star, accent: "#F59E0B" },
};

const AVATAR_BG = ["#1B4FDB", "#0D9488", "#E8521C", "#7C3AED", "#0EA5E9"];

function statValue(key: HeroStatLabel["key"], s: SiteStats): string {
  if (key === "alumni") return `${formatCount(s.alumni)}+`;
  if (key === "years") return `${s.years}+`;
  if (key === "rating") return `${s.rating}`;
  return `${s.programs}`;
}

/* ── LEFT / RIGHT decorations (unchanged) ── */
function LeftDecor({ reduced }: { reduced: boolean | null }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden lg:block"
      style={{
        left: "clamp(8px, calc(50% - 560px), calc(50% - 280px))",
        top: 80,
        width: 160,
        height: 420,
        zIndex: 0,
      }}
    >
      <svg
        viewBox="0 0 110 140"
        fill="none"
        className="absolute inset-0 w-full h-full"
      >
        {Array.from({ length: 6 }).map((_, col) =>
          Array.from({ length: 7 }).map((_, row) => (
            <circle
              key={`${col}-${row}`}
              cx={col * 18 + 10}
              cy={row * 18 + 12}
              r="2"
              fill={BRAND.blueNavy}
              fillOpacity={Math.max(0.05, 0.18 - row * 0.018 - col * 0.01)}
            />
          )),
        )}
      </svg>
      <motion.svg
        viewBox="0 0 120 120"
        fill="none"
        className="absolute"
        style={{ top: 50, left: 10, width: 110, height: 110 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.path
          d="M 100 5 A 95 95 0 0 0 5 100"
          stroke={BRAND.blue}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.22"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.5, ease }}
        />
      </motion.svg>
      {!reduced && (
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
          style={{ bottom: 110, left: 90, width: 24, height: 24 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={BRAND.blueNavy}
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
        </motion.svg>
      )}
    </div>
  );
}

function RightDecor({ reduced }: { reduced: boolean | null }) {
  const teal = "#0D9488";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden lg:block"
      style={{
        right: "clamp(8px, calc(50% - 560px), calc(50% - 280px))",
        top: 60,
        width: 160,
        height: 440,
        zIndex: 0,
      }}
    >
      <motion.svg
        viewBox="0 0 140 140"
        fill="none"
        className="absolute"
        style={{ top: 10, right: 0, width: 140, height: 140 }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.4, ease }}
      >
        {[54, 40, 27, 14].map((r, i) => (
          <circle
            key={r}
            cx="70"
            cy="70"
            r={r}
            stroke={teal}
            strokeWidth={i === 3 ? 2 : 1}
            strokeOpacity={0.12 + i * 0.04}
            fill={i === 3 ? teal : "none"}
            fillOpacity={i === 3 ? 0.15 : 0}
          />
        ))}
      </motion.svg>
      {!reduced && (
        <motion.svg
          viewBox="0 0 18 18"
          fill="none"
          className="absolute"
          style={{ top: 148, right: 10, width: 18, height: 18 }}
          animate={{ y: [0, -12, 0], rotate: [0, 18, 0] }}
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: "easeInOut",
            delay: 0.4,
          }}
        >
          <rect
            x="2"
            y="2"
            width="14"
            height="14"
            rx="2.5"
            stroke={teal}
            strokeWidth="1.5"
            strokeOpacity="0.38"
            fill="none"
          />
        </motion.svg>
      )}
    </div>
  );
}

function StatsPill({
  labels,
  stats,
}: {
  labels: HeroStatLabel[];
  stats: SiteStats;
}) {
  return (
    <div
      className="mx-auto grid w-full max-w-md overflow-hidden rounded-2xl sm:inline-flex sm:w-auto sm:max-w-none"
      style={{
        gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, minmax(0, 1fr))`,
        border: `1.5px solid rgba(15,35,64,0.08)`,
        background: "white",
        boxShadow: "0 6px 32px rgba(15,35,64,0.07)",
      }}
    >
      {labels.map((s, i) => {
        const meta = STAT_META[s.key];
        return (
          <div
            key={s.key}
            className="flex items-stretch"
            style={i > 0 ? { borderLeft: "1px solid rgba(15,35,64,0.07)" } : undefined}
          >
            <motion.div
              className="flex w-full flex-col items-center justify-center gap-2 px-2 py-4 text-center sm:flex-row sm:gap-3 sm:px-7 sm:text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 + i * 0.08, ease }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${meta.accent}14` }}
              >
                <meta.Icon
                  style={{ color: meta.accent, width: 18, height: 18 }}
                />
              </div>
              <div>
                <p
                  className="font-display font-extrabold leading-none"
                  style={{
                    fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                    color: BRAND.blueNavy,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {statValue(s.key, stats)}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: 4 }}>
                  {s.label}
                </p>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

function TeamStrip({
  label,
  team,
}: {
  label: string;
  team: TeamMember[];
}) {
  const shown = team.slice(0, 5);
  const overflow = Math.max(0, team.length - shown.length);

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex -space-x-3.5">
        {shown.map((a, i) => (
          <motion.div
            key={a.id}
            title={`${a.name} — ${a.title}`}
            className="w-11 h-11 rounded-full border-[2.5px] border-white flex items-center justify-center font-display font-black text-white cursor-default select-none"
            style={{
              fontSize: "0.75rem",
              background: AVATAR_BG[i % AVATAR_BG.length],
              zIndex: shown.length - i,
              boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
            }}
            initial={{ opacity: 0, scale: 0.65, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.38, delay: 0.34 + i * 0.07, ease }}
          >
            {a.initials}
          </motion.div>
        ))}
        {overflow > 0 && (
          <motion.div
            className="w-11 h-11 rounded-full border-[2.5px] border-white flex items-center justify-center font-display font-bold select-none"
            style={{
              fontSize: "0.75rem",
              background: "#F1F5F9",
              color: "#64748B",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              zIndex: 0,
            }}
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, delay: 0.34 + shown.length * 0.07, ease }}
          >
            +{overflow}
          </motion.div>
        )}
      </div>

      <motion.div
        className="text-left"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7, ease }}
      >
        <p
          className="font-display font-semibold"
          style={{ fontSize: "0.9375rem", color: BRAND.blueNavy }}
        >
          {label}
        </p>
        <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: 1 }}>
          {team.length} orang · tutors, educators &amp; creatives
        </p>
      </motion.div>
    </div>
  );
}

function EditorialBand({ editorial }: { editorial: typeof DEFAULT_ABOUT.heroEditorial }) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
      style={{ borderTop: "1.5px solid rgba(15,35,64,0.08)" }}
    >
      <div
        className="lg:col-span-8 relative flex items-center gap-6 px-8 py-9 lg:px-14 lg:py-11 overflow-hidden"
        style={{ background: BRAND.blueNavy }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />
        <svg
          viewBox="0 0 60 46"
          fill="none"
          className="flex-shrink-0 hidden sm:block"
          style={{ width: 52, height: 40, opacity: 0.22 }}
          aria-hidden
        >
          <path
            d="M0 29.7C0 38.9 5.4 46 14.8 46c8 0 13.7-5.7 13.7-13.7 0-7.4-5.1-12.5-12-12.5-.6 0-1.4 0-2.3.3 1.7-7.1 7.3-13.4 14.3-17.3L23.9 0C10.8 5.7 0 16.5 0 29.7zm31.7 0C31.7 38.9 37.1 46 46.5 46c8 0 13.5-5.7 13.5-13.7 0-7.4-5.1-12.5-12-12.5-.6 0-1.4 0-2.3.3 1.7-7.1 7.3-13.4 14.3-17.3L55.6 0C42.5 5.7 31.7 16.5 31.7 29.7z"
            fill="white"
          />
        </svg>

        <div className="relative z-10">
          <motion.p
            className="font-display font-extrabold text-white mb-3"
            style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease }}
          >
            &ldquo;{editorial.quote}&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.54, ease }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-white flex-shrink-0"
                style={{
                  background: "#1B4FDB",
                  fontSize: "0.75rem",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                {editorial.authorInitials}
              </div>
              <div>
                <p
                  className="font-display font-semibold text-white"
                  style={{ fontSize: "0.875rem", opacity: 0.9 }}
                >
                  {editorial.authorName}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {editorial.authorRole}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1"
        style={{ borderLeft: "1.5px solid rgba(13,148,136,0.18)" }}
      >
        {[
          { label: editorial.fact1Label, value: editorial.fact1Value },
          { label: editorial.fact2Label, value: editorial.fact2Value },
        ].map((fact, i) => (
          <motion.div
            key={fact.label + i}
            className="flex flex-col justify-center px-6 py-6 lg:py-5"
            style={{
              background:
                i === 0 ? "rgba(13,148,136,0.07)" : "rgba(13,148,136,0.04)",
              borderTop: i === 1 ? "1.5px solid rgba(13,148,136,0.12)" : undefined,
            }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(13,148,136,0.75)",
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              {fact.label}
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "0.9375rem", color: BRAND.blueNavy }}
            >
              {fact.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const HeroSection = () => {
  const reduced = useReducedMotion();

  const { data } = trpc.siteContent.getAbout.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const statsQuery = trpc.siteContent.getSiteStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const c = data && data.isActive !== false ? data : DEFAULT_ABOUT;
  const stats: SiteStats = statsQuery.data ?? {
    alumni: 2000,
    rating: 4.9,
    years: 8,
    programs: 12,
  };

  const locationBadge = c.heroLocationBadge || DEFAULT_ABOUT.heroLocationBadge;
  const sectionBadge = c.heroSectionBadge || DEFAULT_ABOUT.heroSectionBadge;
  const overline = c.heroOverline || DEFAULT_ABOUT.heroOverline;
  const title = c.heroTitle || DEFAULT_ABOUT.heroTitle;
  const titleAccent = c.heroTitleAccent ?? DEFAULT_ABOUT.heroTitleAccent;
  const description = c.heroDescription || DEFAULT_ABOUT.heroDescription;
  const teamStripLabel =
    c.heroTeamStripLabel || DEFAULT_ABOUT.heroTeamStripLabel;
  const statLabels = (
    c.heroStatLabels && c.heroStatLabels.length > 0
      ? c.heroStatLabels
      : (DEFAULT_ABOUT.heroStatLabels as HeroStatLabel[])
  ).filter((s) => SHOW_PUBLIC_RATING || s.key !== "rating");
  const editorial = { ...DEFAULT_ABOUT.heroEditorial, ...(c.heroEditorial ?? {}) };
  const team: TeamMember[] = data?.team ?? [];

  return (
    <section
      className="relative w-full overflow-hidden pt-28 pb-0 lg:pt-36"
      style={{ background: "var(--color-brand-background, #F8FAFC)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(27,79,219,0.07) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1.2' fill='%230F2340' fill-opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundSize: "28px 28px",
        }}
      />

      <LeftDecor reduced={reduced} />
      <RightDecor reduced={reduced} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center">
        <Reveal>
          <div className="flex items-center justify-center flex-wrap gap-2.5 mb-7">
            <span
              className="inline-flex items-center gap-2 font-display font-semibold rounded-full px-4 py-1.5"
              style={{
                fontSize: "0.75rem",
                background: "white",
                color: BRAND.blueNavy,
                border: "1px solid rgba(15,35,64,0.1)",
                boxShadow: "0 2px 14px rgba(15,35,64,0.07)",
              }}
            >
              <span className="relative flex w-2 h-2 flex-shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ background: "#22C55E" }}
                />
                <span
                  className="relative inline-flex w-2 h-2 rounded-full"
                  style={{ background: "#22C55E" }}
                />
              </span>
              <MapPin
                className="w-3 h-3 flex-shrink-0"
                style={{ color: BRAND.blueNavy }}
              />
              {locationBadge}
            </span>

            {sectionBadge && (
              <span
                className="inline-flex items-center gap-1.5 font-display font-semibold rounded-full px-4 py-1.5"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.03em",
                  background: "rgba(234,88,12,0.09)",
                  color: "#C2410C",
                  border: "1px solid rgba(234,88,12,0.18)",
                }}
              >
                {sectionBadge}
              </span>
            )}
          </div>
        </Reveal>

        {overline && (
          <Reveal delay={0.04}>
            <p
              className="font-display font-bold uppercase tracking-widest mb-4"
              style={{
                fontSize: "0.75rem",
                color: "#94A3B8",
                letterSpacing: "0.2em",
              }}
            >
              {overline}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.09}>
          <h1
            className="font-display font-extrabold leading-[1.06] mb-5 mx-auto"
            style={{
              fontSize: "clamp(2.1rem, 5.5vw, 3.75rem)",
              letterSpacing: "-0.028em",
              color: BRAND.blueNavy,
              maxWidth: "780px",
            }}
          >
            {title} <br className="hidden sm:block" />
            {titleAccent && (
              <span style={GRADIENT_GOLD_TEXT}>{titleAccent}</span>
            )}
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p
            className="leading-relaxed mx-auto"
            style={{
              fontSize: "1.0625rem",
              color: "#64748B",
              maxWidth: "540px",
              lineHeight: "1.8",
            }}
          >
            {description}
          </p>
        </Reveal>

        <Reveal delay={0.19}>
          <div className="flex items-center justify-center gap-3 my-10">
            <div style={{ width: 40, height: 1, background: "rgba(15,35,64,0.12)" }} />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 2,
                background: BRAND.blue,
                opacity: 0.5,
                transform: "rotate(45deg)",
              }}
            />
            <div style={{ width: 40, height: 1, background: "rgba(15,35,64,0.12)" }} />
          </div>
        </Reveal>

        <Reveal delay={0.21}>
          <StatsPill labels={statLabels} stats={stats} />
        </Reveal>

        {team.length > 0 && (
          <Reveal delay={0.28} className="mt-10 mb-16">
            <TeamStrip label={teamStripLabel} team={team} />
          </Reveal>
        )}
      </div>

      <Reveal delay={0.34}>
        <EditorialBand editorial={editorial} />
      </Reveal>
    </section>
  );
};

export default HeroSection;
