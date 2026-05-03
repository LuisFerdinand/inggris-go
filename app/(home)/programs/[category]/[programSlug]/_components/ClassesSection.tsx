import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";

import { Theme } from "@/lib/utils";
import { Reveal, SectionHeading, SectionPill } from "../client";
import { Icon } from "@/components/Icon";

const EASE = [0.22, 1, 0.36, 1] as const;

type ClassItem = {
  title: string;
  duration?: string;
  description?: string;
  highlight?: string;
  icon?: string;
  schedules?: string[];
  meta?: { label: string; value: string }[];
  tag?: string;
};

type ClassesSectionContent = {
  title: string;
  subtitle?: string;
  tagline?: string;
  taglineAccent?: string;
  layout?: "grid" | "timeline" | "card";
  info?: { label: string; value: string }[];
  items: ClassItem[];
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 flex-shrink-0"
    style={{ stroke: "currentColor" }}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClassCard({
  item,
  index,
  theme,
}: {
  item: ClassItem;
  index: number;
  theme: Theme;
}) {
  const isFeatured = !!item.tag;

  return (
    <Reveal delay={index * 0.09}>
      <motion.div
        whileHover={{ y: -7, scale: 1.02 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="relative rounded-3xl overflow-hidden h-full flex flex-col items-center text-center"
        style={{
          background: "var(--surface)",
          border: `2px solid ${isFeatured ? theme.border : "var(--border-soft)"}`,
          boxShadow: isFeatured
            ? `0 16px 48px ${theme.border}`
            : "var(--shadow-badge)",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: "4px",
            width: "100%",
            flexShrink: 0,
            background: isFeatured
              ? `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`
              : `linear-gradient(90deg, var(--border-soft), transparent)`,
          }}
        />

        {/* Featured badge */}
        {item.tag && (
          <div
            className="absolute top-4 right-4 px-2.5 py-1 rounded-full font-display font-bold z-10"
            style={{
              fontSize: "0.5625rem",
              background: theme.primary,
              color: "white",
              letterSpacing: "0.06em",
            }}
          >
            {item.tag}
          </div>
        )}

        <div className="p-7 flex flex-col items-center flex-1">
          {/* Icon */}
          {item.icon && (
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background: theme.soft,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <Icon
                name={item.icon as any}
                className="w-6 h-6"
                style={{ color: theme.primary }}
              />
            </div>
          )}

          {/* Duration */}
          {item.duration && (
            <p
              className="font-display font-bold uppercase tracking-wider mb-2.5"
              style={{ fontSize: "0.6875rem", color: theme.primary }}
            >
              {item.duration}
            </p>
          )}

          {/* Title */}
          <p
            className="font-display font-extrabold mb-2.5 leading-tight"
            style={{ fontSize: "1.125rem", color: "var(--blue-navy)" }}
          >
            {item.title}
          </p>

          {/* Highlight */}
          {item.highlight && (
            <span
              className="inline-block px-3 py-1 rounded-full font-display font-bold mb-3.5"
              style={{
                fontSize: "0.6875rem",
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {item.highlight}
            </span>
          )}

          {/* Description */}
          {item.description && (
            <p
              className="mb-4"
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                lineHeight: "1.65",
              }}
            >
              {item.description}
            </p>
          )}

          {/* Schedules */}
          {item.schedules && item.schedules.length > 0 && (
            <div className="flex flex-col gap-1.5 w-full mb-4">
              {item.schedules.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl"
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--blue-navy)",
                    fontWeight: 500,
                    background: "var(--surface-2, #f8fafc)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <CalendarIcon />
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Meta grid */}
          {item.meta && item.meta.length > 0 && (
            <div className="grid grid-cols-2 gap-2 w-full mt-auto">
              {item.meta.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-2.5"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.5875rem",
                      color: "var(--text-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      marginBottom: 2,
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--blue-navy)",
                    }}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── Info Bar ─────────────────────────────────────────────────────────────────

function InfoBar({ info }: { info: { label: string; value: string }[] }) {
  return (
    <Reveal delay={0.1}>
      <div
        className="mt-14 rounded-2xl flex flex-wrap justify-center"
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border-soft)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          padding: "0 8px",
        }}
      >
        {info.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center text-center py-6"
            style={{
              flex: "1 1 120px",
              padding: "20px 28px",
              position: "relative",
            }}
          >
            {/* Divider between items (not after last) */}
            {i < info.length - 1 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  right: 0,
                  top: "20%",
                  height: "60%",
                  width: "1px",
                  background: "var(--border-soft)",
                }}
              />
            )}
            <p
              className="font-display font-bold uppercase tracking-widest mb-1.5"
              style={{ fontSize: "0.625rem", color: "var(--text-faint)" }}
            >
              {item.label}
            </p>
            <p
              className="font-display font-extrabold"
              style={{ fontSize: "1.125rem", color: "var(--blue-navy)" }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ClassesSection({
  content,
  theme,
}: {
  content: ClassesSectionContent;
  theme: Theme;
}) {
  return (
    <section
      id="kelas"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 400,
            borderRadius: "50%",
            background: theme.primary,
            filter: "blur(80px)",
            opacity: 0.07,
            top: -80,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 300,
            borderRadius: "50%",
            background: theme.strong,
            filter: "blur(80px)",
            opacity: 0.06,
            bottom: 100,
            left: -80,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ {content.title}</SectionPill>
          </Reveal>

          {content.tagline && (
            <Reveal delay={0.07} className="mt-5 mb-3">
              <SectionHeading
                tagline={content.tagline}
                taglineAccent={content.taglineAccent}
                theme={theme}
              />
            </Reveal>
          )}

          {content.subtitle && (
            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "440px",
                  lineHeight: "1.72",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        {/* Cards grid */}
        <div
          className={`grid gap-5 ${
            content.items.length <= 2
              ? "sm:grid-cols-2 max-w-2xl mx-auto"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {content.items.map((item, i) => (
            <ClassCard key={item.title} item={item} index={i} theme={theme} />
          ))}
        </div>

        {/* Info bar */}
        {content.info && content.info.length > 0 && (
          <InfoBar info={content.info} />
        )}
      </div>
    </section>
  );
}
