// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/LandingPagePreview.tsx
"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { generateTheme } from "@/lib/utils";
import type { ProgramSectionInput } from "@/app/modules/program/program-content.schema";

type CmsSection = ProgramSectionInput;
type Theme = ReturnType<typeof generateTheme>;
type Obj = Record<string, unknown>;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function asObj(v: unknown): Obj {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {};
}

function arr(v: unknown): Obj[] {
  return Array.isArray(v) ? (v.filter(Boolean) as Obj[]) : [];
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function itemTitle(it: Obj): string {
  return (
    str(it.title) ||
    str(it.label) ||
    str(it.name) ||
    str(it.week) ||
    str(it.caption) ||
    str(it.q) ||
    "Untitled"
  );
}

function itemDesc(it: Obj): string {
  return (
    str(it.description) ||
    str(it.subtitle) ||
    str(it.value) ||
    str(it.note) ||
    str(it.a) ||
    ""
  );
}

function imageOf(it: Obj): string {
  return str(it.src) || str(it.image);
}

function SectionPill({
  children,
  theme,
}: {
  children: ReactNode;
  theme: Theme;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display font-bold uppercase"
      style={{
        fontSize: "0.6rem",
        letterSpacing: "0.18em",
        background: theme.soft,
        color: theme.primary,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 2px 16px ${theme.border}`,
      }}
    >
      {children}
    </span>
  );
}

function GridTexture({ theme }: { theme: Theme }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(${theme.border} 1px, transparent 1px),
          linear-gradient(90deg, ${theme.border} 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        opacity: 0.35,
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
  );
}

function SectionHeading({
  eyebrow = "✦ Section",
  title,
  accent,
  subtitle,
  theme,
  center = true,
}: {
  eyebrow?: string;
  title?: string;
  accent?: string;
  subtitle?: string;
  theme: Theme;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto mb-14 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
      <SectionPill theme={theme}>{eyebrow}</SectionPill>

      <h2
        className="font-display mt-5 mb-4 font-extrabold leading-[1.07]"
        style={{
          fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
          letterSpacing: "-0.026em",
          color: "var(--blue-navy)",
        }}
      >
        {title || "Judul Section"}{" "}
        {accent && <span style={{ color: theme.primary }}>{accent}</span>}
      </h2>

      {subtitle && (
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-muted)",
            lineHeight: "1.75",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function PreviewShell({
  sectionId,
  selected,
  children,
}: {
  sectionId: string;
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-preview-id={sectionId}
      className="relative"
      style={{
        outline: selected ? "3px solid rgba(79, 70, 229, 0.45)" : undefined,
        outlineOffset: selected ? "-3px" : undefined,
      }}
    >
      {selected && (
        <div className="pointer-events-none absolute right-4 top-4 z-30 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
          Editing
        </div>
      )}
      {children}
    </div>
  );
}

function HeroSection({ content, theme }: { content: Obj; theme: Theme }) {
  const tags = arr(content.tags);
  const ctas = arr(content.cta);
  const image = str(content.image);

  return (
    <section
      className="relative overflow-hidden lg:pt-20"
      style={{
        background: "var(--surface)",
        minHeight: "min(92vh, 820px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: theme.gradient }} />
      <GridTexture theme={theme} />

      <div
        className="pointer-events-none absolute -right-10 -top-32 h-[520px] w-[520px] rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${theme.softStrong} 0%, transparent 70%)`,
          filter: "blur(64px)",
          opacity: 0.6,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-[360px] w-[360px] rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${theme.softStrong} 0%, transparent 70%)`,
          filter: "blur(64px)",
          opacity: 0.45,
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_440px] lg:px-12">
        <div>
          {str(content.label) && (
            <div className="mb-6">
              <SectionPill theme={theme}>{str(content.label)}</SectionPill>
            </div>
          )}

          <h1
            className="font-display mb-6 font-extrabold leading-[1.03]"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)",
              letterSpacing: "-0.035em",
              color: "black",
            }}
          >
            {str(content.tagline) || "Judul utama program"}{" "}
            <span style={{ color: theme.primary }}>{str(content.taglineAccent)}</span>
          </h1>

          {(str(content.description) || str(content.subtitle)) && (
            <p
              style={{
                fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)",
                color: "var(--text-muted)",
                lineHeight: "1.8",
                maxWidth: "520px",
                marginBottom: "2rem",
              }}
            >
              {str(content.description) || str(content.subtitle)}
            </p>
          )}

          {ctas.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-3">
              {ctas.slice(0, 2).map((cta, i) => (
                <span
                  key={i}
                  className="font-display inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-bold"
                  style={{
                    fontSize: "0.9375rem",
                    color: i === 0 ? "white" : theme.primary,
                    background: i === 0 ? theme.primary : theme.soft,
                    border: i === 0 ? undefined : `1.5px solid ${theme.border}`,
                    boxShadow: i === 0 ? `0 8px 32px ${theme.border}` : undefined,
                  }}
                >
                  {str(cta.label) || "Daftar Sekarang"}
                  <span>→</span>
                </span>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {tags.slice(0, 6).map((tag, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <p
                    className="font-display font-bold"
                    style={{ color: theme.primary, fontSize: "0.8125rem" }}
                  >
                    {itemTitle(tag)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              background: "var(--surface)",
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 40px 96px ${theme.border}, 0 8px 24px rgba(10,45,135,0.08)`,
            }}
          >
            <div
              style={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`,
              }}
            />

            <div className="border-b px-5 py-4" style={{ borderColor: theme.border }}>
              <p
                className="font-display font-bold"
                style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
              >
                Preview Program
              </p>
              <p style={{ fontSize: "0.5625rem", color: "var(--text-faint)" }}>
                Landing page content
              </p>
            </div>

            <div className="p-5">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="h-[320px] w-full rounded-2xl object-cover"
                  style={{
                    filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.12))",
                  }}
                />
              ) : (
                <div
                  className="flex h-[320px] items-center justify-center rounded-2xl"
                  style={{
                    background: theme.soft,
                    border: `1px dashed ${theme.border}`,
                    color: theme.primary,
                  }}
                >
                  Gambar Hero
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection({ content, theme }: { content: Obj; theme: Theme }) {
  const items = arr(content.items);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--surface)" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 55% at 0% 60%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Kamu Tidak Sendirian"
          title={str(content.tagline) || str(content.title) || "Masalah yang sering bikin"}
          accent={str(content.taglineAccent) || "stuck"}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,107,53,0.05)",
                border: "1.5px solid rgba(255,107,53,0.15)",
              }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Icon name={(str(item.icon) || "alert-circle") as any} className="h-5 w-5" />
              </div>
              <p className="font-display mb-1 font-bold" style={{ color: "var(--blue-navy)" }}>
                {itemTitle(item)}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {itemDesc(item)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CardsSection({
  content,
  theme,
  kind,
}: {
  content: Obj;
  theme: Theme;
  kind: "benefits" | "facilities" | "mentorship" | "bonus" | "classes";
}) {
  const items = arr(content.items);

  const eyebrow =
    kind === "benefits"
      ? "✦ Benefit Program"
      : kind === "facilities"
        ? "✦ Fasilitas"
        : kind === "mentorship"
          ? "✦ Mentorship"
          : kind === "classes"
            ? "✦ Pilihan Kelas"
            : "✦ Bonus";

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: kind === "benefits" || kind === "classes" ? "var(--bg-soft)" : "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 50% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow={eyebrow}
          title={str(content.tagline) || str(content.title)}
          accent={str(content.taglineAccent)}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-3xl p-6 transition-transform"
              style={{
                background: theme.softStrong,
                border: `1.5px solid ${theme.border}`,
                boxShadow: `0 4px 24px ${theme.border}`,
              }}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full" style={{ background: theme.soft }} />

              <div className="relative z-10">
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: theme.primary,
                    boxShadow: `0 8px 24px ${theme.border}`,
                  }}
                >
                  <Icon name={(str(item.icon) || "sparkles") as any} className="h-6 w-6 text-white" />
                </div>

                <p
                  className="font-display mb-2 font-extrabold"
                  style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
                >
                  {itemTitle(item)}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.68 }}>
                  {itemDesc(item)}
                </p>

                {str(item.highlight) && (
                  <div
                    className="font-display mt-4 inline-flex rounded-full px-3 py-1 font-bold uppercase"
                    style={{
                      fontSize: "0.5625rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {str(item.highlight)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {kind === "benefits" && arr(content.images).length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {arr(content.images)
              .slice(0, 3)
              .map((img, i) => (
                <div key={i} className="overflow-hidden rounded-3xl" style={{ border: `1.5px solid ${theme.border}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageOf(img)} alt={str(img.caption)} className="h-48 w-full object-cover" />
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StepsSection({ content, theme }: { content: Obj; theme: Theme }) {
  const steps = arr(content.items);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--bg-soft)" }}>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Cara Mulai"
          title={str(content.tagline) || str(content.title) || "Mulai dalam"}
          accent={str(content.taglineAccent) || `${steps.length} langkah mudah`}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        <div className="relative">
          {steps.length > 1 && (
            <div
              className="pointer-events-none absolute top-8 hidden h-0.5 lg:block"
              style={{
                left: `calc(100% / ${steps.length * 2})`,
                right: `calc(100% / ${steps.length * 2})`,
                background: `linear-gradient(90deg, transparent, ${theme.border}, ${theme.primary}, ${theme.border}, transparent)`,
              }}
            />
          )}

          <div className={`grid gap-8 ${steps.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className="font-display mb-6 flex h-16 w-16 items-center justify-center rounded-2xl font-black"
                  style={{
                    background: theme.primary,
                    color: "white",
                    fontSize: "1.25rem",
                    boxShadow: `0 8px 28px ${theme.border}`,
                  }}
                >
                  {str(step.n) || String(i + 1).padStart(2, "0")}
                </div>

                <p
                  className="font-display mb-2 font-extrabold"
                  style={{ fontSize: "1.0625rem", color: "var(--blue-navy)" }}
                >
                  {itemTitle(step)}
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.68,
                    maxWidth: 220,
                  }}
                >
                  {itemDesc(step)}
                </p>

                <div
                  className="font-display mt-4 rounded-full px-3 py-1 font-semibold uppercase"
                  style={{
                    fontSize: "0.5625rem",
                    background: theme.soft,
                    color: theme.primary,
                    border: `1px solid ${theme.border}`,
                    letterSpacing: "0.1em",
                  }}
                >
                  Langkah {i + 1}/{steps.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineSection({ content, theme }: { content: Obj; theme: Theme }) {
  const weeks = arr(content.weeks);
  const meta = arr(content.meta);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Timeline"
          title={str(content.tagline) || str(content.title)}
          accent={str(content.taglineAccent)}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        {meta.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {meta.map((m, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: theme.soft, border: `1px solid ${theme.border}` }}>
                <p className="font-display font-bold" style={{ color: theme.primary }}>
                  {itemTitle(m)}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{itemDesc(m)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {weeks.map((week, i) => (
            <div key={i} className="rounded-3xl bg-white p-5" style={{ border: `1.5px solid ${theme.border}` }}>
              <div className="flex items-start gap-4">
                <div
                  className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-white"
                  style={{ background: theme.primary }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
                    {str(week.week) || `Minggu ${i + 1}`}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-extrabold text-[var(--blue-navy)]">
                    {itemTitle(week)}
                  </h3>

                  {strArr(week.points).length > 0 && (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {strArr(week.points).map((point, j) => (
                        <li key={j} className="flex gap-2 text-sm text-[var(--text-muted)]">
                          <span style={{ color: theme.primary }}>✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ content, theme }: { content: Obj; theme: Theme }) {
  const photos = arr(content.photos);
  const signals = strArr(content.trustSignals);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--bg-soft)" }}>
      <GridTexture theme={theme} />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Dokumentasi"
          title={str(content.tagline) || str(content.title)}
          accent={str(content.taglineAccent)}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={i === 0 ? "overflow-hidden rounded-3xl sm:col-span-2" : "overflow-hidden rounded-3xl"}
              style={{ border: `1.5px solid ${theme.border}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageOf(photo)} alt={str(photo.caption)} className="h-64 w-full object-cover" />
            </div>
          ))}
        </div>

        {signals.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {signals.map((signal, i) => (
              <div key={i} className="rounded-2xl bg-white p-4 text-center" style={{ border: "1px solid var(--border-soft)" }}>
                <p className="font-display text-sm font-bold text-[var(--blue-navy)]">{signal}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PricingSection({ content, theme }: { content: Obj; theme: Theme }) {
  const groups = arr(content.groups);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--bg-soft)" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Harga Program"
          title={str(content.title) || "Pilih paket terbaik"}
          accent=""
          subtitle={str(content.description)}
          theme={theme}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map((group, gi) => (
            <div key={gi} className="rounded-3xl bg-white p-6" style={{ border: `1.5px solid ${theme.border}` }}>
              <p className="font-display mb-1 text-xl font-extrabold text-[var(--blue-navy)]">{itemTitle(group)}</p>
              {str(group.subtitle) && <p className="mb-5 text-sm text-[var(--text-muted)]">{str(group.subtitle)}</p>}

              <div className="grid gap-3">
                {arr(group.packages).map((pkg, pi) => (
                  <div key={pi} className="rounded-2xl p-4" style={{ background: theme.soft, border: `1px solid ${theme.border}` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display font-bold text-[var(--blue-navy)]">{str(pkg.label) || "Paket"}</p>
                        {str(pkg.note) && <p className="mt-1 text-sm text-[var(--text-muted)]">{str(pkg.note)}</p>}
                      </div>
                      <div className="text-right">
                        {str(pkg.highlight) && (
                          <p className="font-display mb-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: theme.primary }}>
                            {str(pkg.highlight)}
                          </p>
                        )}
                        <p className="font-display text-xl font-black" style={{ color: theme.primary }}>
                          {str(pkg.price) || "Rp —"}
                        </p>
                        {str(pkg.originalPrice) && <p className="text-xs text-slate-400 line-through">{str(pkg.originalPrice)}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {str(content.urgency) && (
          <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: theme.soft, border: `1px solid ${theme.border}` }}>
            <p className="font-display font-bold" style={{ color: theme.primary }}>
              {str(content.urgency)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection({ content, theme }: { content: Obj; theme: Theme }) {
  const items = arr(content.items);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--surface)" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 65% 50% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Cerita Nyata"
          title={str(content.title) || "Mereka sudah"}
          accent="membuktikannya"
          theme={theme}
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((proof, i) => (
            <div
              key={i}
              className="relative rounded-3xl bg-white p-6"
              style={{
                border: `1.5px solid ${theme.border}`,
                boxShadow: `0 4px 20px ${theme.border}`,
              }}
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} viewBox="0 0 12 12" className="h-4 w-4" fill="#FBBF24">
                    <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
                  </svg>
                ))}
              </div>

              <p className="relative z-10 mb-5 italic" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
                “{str(proof.quote) || "Testimoni peserta..."}”
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="font-display flex h-10 w-10 items-center justify-center rounded-full font-black"
                  style={{
                    background: theme.soft,
                    border: `2px solid ${theme.border}`,
                    color: theme.primary,
                  }}
                >
                  {(str(proof.name)[0] || "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-bold text-[var(--blue-navy)]">{str(proof.name) || "Nama"}</p>
                  {str(proof.role) && <p className="text-xs text-[var(--text-faint)]">{str(proof.role)}</p>}
                </div>
                <span
                  className="font-display ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                  style={{
                    background: theme.soft,
                    color: theme.primary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  Alumni
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ content, theme }: { content: unknown; theme: Theme }) {
  const faqs = arr(content);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--surface)" }}>
      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ FAQ"
          title="Pertanyaan yang"
          accent="sering ditanyakan"
          theme={theme}
        />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-2xl" style={{ border: `1.5px solid ${theme.border}` }}>
              <div className="flex items-center justify-between gap-4 p-5" style={{ background: i === 0 ? theme.soft : "var(--surface)" }}>
                <p className="font-display font-bold text-[var(--blue-navy)]">{str(faq.q) || "Pertanyaan"}</p>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: i === 0 ? theme.primary : theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <span style={{ color: i === 0 ? "white" : theme.primary }}>+</span>
                </div>
              </div>

              {str(faq.a) && (
                <div className="px-5 pb-5" style={{ background: i === 0 ? theme.soft : "var(--surface)" }}>
                  <p className="border-t pt-4 text-sm leading-7 text-[var(--text-muted)]" style={{ borderColor: theme.border }}>
                    {str(faq.a)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ content, theme }: { content: Obj; theme: Theme }) {
  const cta = asObj(content.cta);

  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 55%, #1346b0 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute -right-16 -top-32 h-[640px] w-[640px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(96px)",
          opacity: 0.65,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)" }}>
            Admin siap membantu kamu sekarang
          </span>
        </div>

        <h2
          className="font-display mb-5 font-extrabold leading-[1.05]"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
            letterSpacing: "-0.03em",
            color: "white",
          }}
        >
          {str(content.title) || "Siap Mulai?"}{" "}
          {str(content.titleAccent) && <span style={{ color: theme.primary }}>{str(content.titleAccent)}</span>}
        </h2>

        {str(content.subtitle) && (
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.58)",
              maxWidth: 480,
              margin: "0 auto 2.5rem",
              lineHeight: 1.78,
            }}
          >
            {str(content.subtitle)}
          </p>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <span
            className="font-display inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 font-bold text-white"
            style={{
              fontSize: "1rem",
              background: theme.primary,
              boxShadow: `0 8px 36px ${theme.border}`,
            }}
          >
            {str(cta.label) || "Daftar Sekarang"}
            <span>→</span>
          </span>
        </div>

        {str(content.urgency) && (
          <p className="mt-8 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {str(content.urgency)}
          </p>
        )}
      </div>
    </section>
  );
}

function BatchesSection({ content, theme }: { content: Obj; theme: Theme }) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--bg-soft)" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="✦ Batch Tersedia"
          title={str(content.tagline) || str(content.title) || "Pilih batch"}
          accent={str(content.taglineAccent)}
          subtitle={str(content.subtitle)}
          theme={theme}
        />

        <div
          className="rounded-3xl bg-white p-8 text-center"
          style={{
            border: `1.5px dashed ${theme.border}`,
            boxShadow: `0 4px 24px ${theme.border}`,
          }}
        >
          <Icon name="boxes" className="mx-auto mb-3 h-8 w-8" style={{ color: theme.primary }} />
          <p className="font-display font-bold text-[var(--blue-navy)]">
            Data batch ditarik dari tab Batch & Paket
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {str(content.emptyMessage) || "Saat ini belum ada batch tersedia."}
          </p>
        </div>
      </div>
    </section>
  );
}

function renderSection(section: CmsSection, theme: Theme) {
  const content = asObj(section.content);

  switch (section.type) {
    case "hero":
      return <HeroSection content={content} theme={theme} />;
    case "why":
      return <ProblemSection content={content} theme={theme} />;
    case "benefits":
      return <CardsSection content={content} theme={theme} kind="benefits" />;
    case "steps":
      return <StepsSection content={content} theme={theme} />;
    case "timeline":
      return <TimelineSection content={content} theme={theme} />;
    case "gallery":
      return <GallerySection content={content} theme={theme} />;
    case "classes":
      return <CardsSection content={content} theme={theme} kind="classes" />;
    case "facilities":
      return <CardsSection content={content} theme={theme} kind="facilities" />;
    case "mentorship":
      return <CardsSection content={content} theme={theme} kind="mentorship" />;
    case "pricing":
      return <PricingSection content={content} theme={theme} />;
    case "bonus":
      return <CardsSection content={content} theme={theme} kind="bonus" />;
    case "testimonials":
      return <TestimonialsSection content={content} theme={theme} />;
    case "faq":
      return <FAQSection content={section.content} theme={theme} />;
    case "cta":
      return <CTASection content={content} theme={theme} />;
    case "batches":
      return <BatchesSection content={content} theme={theme} />;
    default:
      return (
        <section className="px-5 py-20 text-center text-sm text-slate-400">
          Unknown section: {section.type}
        </section>
      );
  }
}

export function LandingPagePreview({
  sections,
  primary,
  selectedId,
}: {
  sections: CmsSection[];
  primary: string;
  selectedId: string | null;
}) {
  const theme = useMemo(
    () => generateTheme(primary || "#1a52c8"),
    [primary],
  );

  if (sections.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-white text-sm text-slate-400">
        Tidak ada section aktif untuk ditampilkan.
      </div>
    );
  }

  return (
    <main
      className="relative w-full overflow-hidden bg-white"
      style={{
        transition: `all 240ms ${EASE}`,
      }}
    >
      {sections.map((section) => (
        <PreviewShell
          key={section.id}
          sectionId={section.id}
          selected={section.id === selectedId}
        >
          {renderSection(section, theme)}
        </PreviewShell>
      ))}
    </main>
  );
}