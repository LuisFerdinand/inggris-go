// components/sections/home/program-showcase/blocks.tsx
//
// The four layouts of the Beranda "Program Kami" section. They only render the
// view models from ./resolve — all texts, prices and links are decided there.

"use client";

import Link from "next/link";
import { ArrowRight, Check, ImageIcon } from "lucide-react";

import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

import type {
  BannerView,
  CardView,
  CardsView,
  CtaView,
  FeatureView,
  PriceView,
  SpotlightView,
} from "./resolve";

/* ── design tokens (site colours) ──────────────────────────── */

const NAVY = "var(--blue-navy)";
const GOLD_BG = "linear-gradient(135deg, var(--gold-vivid) 0%, var(--gold-mid) 100%)";
const DARK_PANEL =
  "linear-gradient(150deg, #0a2d87 0%, #0a2470 55%, #071a52 100%)";

/* ── shared pieces ─────────────────────────────────────────── */

type CtaVariant = "gold" | "navy" | "outline" | "ghost-light";

export function CtaButton({
  cta,
  variant = "gold",
  block = false,
  arrow = true,
}: {
  cta: CtaView;
  variant?: CtaVariant;
  block?: boolean;
  arrow?: boolean;
}) {
  const style: React.CSSProperties =
    variant === "gold"
      ? { background: GOLD_BG, color: NAVY, boxShadow: "0 8px 22px rgba(245,168,0,0.28)" }
      : variant === "navy"
        ? { background: NAVY, color: "#fff", boxShadow: "0 8px 22px rgba(10,45,135,0.22)" }
        : variant === "outline"
          ? { background: "#fff", color: NAVY, border: `1.5px solid ${NAVY}` }
          : { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.45)" };

  const className = cn(
    "group/cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-display text-[0.9375rem] font-bold leading-tight transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0",
    block && "w-full",
  );

  const inner = (
    <>
      <span>{cta.label}</span>
      {arrow && (
        <ArrowRight className="size-4 shrink-0 transition-transform group-hover/cta:translate-x-0.5" />
      )}
    </>
  );

  return cta.external ? (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
    >
      {inner}
    </a>
  ) : (
    <Link href={cta.href} className={className} style={style}>
      {inner}
    </Link>
  );
}

function PriceBlock({
  price,
  size = "lg",
  light = false,
}: {
  price: PriceView;
  size?: "lg" | "md";
  light?: boolean;
}) {
  return (
    <div>
      {price.original && (
        <p
          className="font-display font-bold line-through"
          style={{
            fontSize: size === "lg" ? "1.0625rem" : "0.9375rem",
            color: light ? "rgba(255,255,255,0.55)" : "var(--text-faint)",
          }}
        >
          {price.original}
        </p>
      )}
      <p
        className="font-display font-black leading-none"
        style={{
          fontSize:
            size === "lg"
              ? price.isContact
                ? "clamp(1.75rem, 4vw, 2.25rem)"
                : "clamp(2.25rem, 5vw, 3rem)"
              : price.isContact
                ? "1.5rem"
                : "clamp(1.75rem, 3vw, 2.125rem)",
          letterSpacing: "-0.03em",
          color: light ? "#fff" : NAVY,
        }}
      >
        {price.text}
      </p>
    </div>
  );
}

export function GroupHeader({
  eyebrow,
  heading,
  description,
}: {
  eyebrow: string;
  heading: string;
  description?: string;
}) {
  if (!eyebrow && !heading && !description) return null;
  return (
    <div className="mb-5 sm:mb-6">
      {eyebrow && (
        <p
          className="font-display text-xs font-extrabold uppercase sm:text-xs"
          style={{ letterSpacing: "0.12em", color: "var(--blue)" }}
        >
          {eyebrow}
        </p>
      )}
      {heading && (
        <h3
          className="mt-1.5 font-display font-extrabold leading-tight"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.125rem)",
            letterSpacing: "-0.022em",
            color: NAVY,
          }}
        >
          {heading}
        </h3>
      )}
      {description && (
        <p
          className="mt-2 max-w-2xl leading-relaxed"
          style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 1. FEATURE — dark block + price card
 * ══════════════════════════════════════════════════════════════ */
export function FeatureBlock({ view }: { view: FeatureView }) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
      style={{ background: DARK_PANEL, boxShadow: "0 24px 60px rgba(10,45,135,0.22)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--blue-vivid)" }}
      />

      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-10 lg:p-10">
        <div className="min-w-0">
          {(view.kicker || view.badge) && (
            <div className="flex flex-wrap items-center gap-2">
              {view.kicker && (
                <span
                  className="font-display text-xs font-extrabold uppercase"
                  style={{ letterSpacing: "0.12em", color: "var(--gold-vivid)" }}
                >
                  {view.kicker}
                </span>
              )}
              {view.badge && (
                <span
                  className="rounded-full px-2.5 py-1 font-display text-xs font-extrabold uppercase"
                  style={{ background: GOLD_BG, color: NAVY, letterSpacing: "0.06em" }}
                >
                  {view.badge}
                </span>
              )}
            </div>
          )}

          {view.headline && (
            <h4
              className="mt-3 font-display font-extrabold leading-[1.15] text-white"
              style={{
                fontSize: "clamp(1.25rem, 3vw, 2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {view.headline}
            </h4>
          )}

          {view.body && (
            <p
              className="mt-3 max-w-2xl leading-relaxed"
              style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.8)" }}
            >
              {view.body}
            </p>
          )}

          {view.chips.length > 0 && (
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {view.chips.map((chip, i) => (
                <li
                  key={`${chip.text}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-white"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  <Icon
                    name={chip.icon || "check"}
                    className="size-4 shrink-0"
                    style={{ color: "var(--gold-vivid)" }}
                  />
                  <span className="leading-snug">{chip.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-5 sm:p-6" style={{ boxShadow: "0 18px 44px rgba(3,10,40,0.28)" }}>
          {view.priceLabel && (
            <p
              className="mb-2 font-display text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              {view.priceLabel}
            </p>
          )}
          <PriceBlock price={view.price} />
          {view.priceNotes.length > 0 && (
            <ul className="mt-3 space-y-1">
              {view.priceNotes.map((note) => (
                <li key={note} className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {note}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5">
            <CtaButton cta={view.cta} variant="gold" block />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 2. CARDS — grid of programs / packages
 * ══════════════════════════════════════════════════════════════ */
function ProgramCardItem({ card }: { card: CardView }) {
  return (
    <article
      className="relative flex h-full flex-col rounded-3xl bg-white p-5 sm:p-6"
      style={{
        border: card.featured ? `2px solid ${NAVY}` : "1.5px solid var(--border)",
        boxShadow: card.featured
          ? "0 18px 44px rgba(10,45,135,0.14)"
          : "0 2px 14px rgba(15,35,64,0.05)",
      }}
    >
      {(card.eyebrow || card.badge) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className="font-display text-xs font-extrabold uppercase"
            style={{ letterSpacing: "0.1em", color: "var(--blue)" }}
          >
            {card.eyebrow}
          </span>
          {card.badge && (
            <span
              className="rounded-full px-2.5 py-1 font-display text-xs font-extrabold uppercase"
              style={{
                background: "rgba(255,193,7,0.22)",
                color: "#7a5300",
                letterSpacing: "0.04em",
              }}
            >
              {card.badge}
            </span>
          )}
        </div>
      )}

      <h4
        className="font-display font-extrabold leading-tight"
        style={{
          fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
          letterSpacing: "-0.02em",
          color: NAVY,
        }}
      >
        {card.title}
      </h4>

      <div className="mt-3">
        <PriceBlock price={card.price} size="md" />
        {card.meta && (
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            {card.meta}
          </p>
        )}
      </div>

      {card.desc && (
        <p
          className="mt-3 leading-relaxed"
          style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
        >
          {card.desc}
        </p>
      )}

      {card.chips.length > 0 && (
        <div className="mt-4">
          {card.chipsLabel && (
            <p
              className="mb-2 font-display text-xs font-extrabold"
              style={{ color: NAVY }}
            >
              {card.chipsLabel}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {card.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full px-2.5 py-1 text-[0.75rem] font-medium"
                style={{
                  background: "var(--blue-frost)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {card.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {card.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5"
              style={{ fontSize: "0.875rem", color: "var(--text-main)" }}
            >
              <Check
                className="mt-0.5 size-4 shrink-0"
                style={{ color: "var(--blue)" }}
                strokeWidth={2.5}
              />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-6">
        <CtaButton
          cta={card.cta}
          variant={card.featured ? "navy" : "outline"}
          block
          arrow={false}
        />
      </div>
    </article>
  );
}

export function CardsBlock({ view }: { view: CardsView }) {
  const count = view.cards.length;

  return (
    <div>
      {/* Phones: cards stack so nothing is cut off. md+: grid. */}
      <div
        className={cn(
          "grid gap-4",
          count === 1 && "md:max-w-md",
          count === 2 && "md:grid-cols-2",
          count >= 3 && "md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {view.cards.map((card) => (
          <ProgramCardItem key={card.key} card={card} />
        ))}
      </div>

      {view.helpItems.length > 0 && (
        <div
          className="mt-4 flex flex-col gap-x-6 gap-y-2 rounded-2xl px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:px-5"
          style={{ background: "var(--blue-frost)", border: "1px solid var(--border)" }}
        >
          {view.helpTitle && (
            <span
              className="font-display text-sm font-extrabold"
              style={{ color: NAVY }}
            >
              {view.helpTitle}
            </span>
          )}
          {view.helpItems.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <strong style={{ color: NAVY }}>{item.label}</strong>
              {item.label && item.text ? ": " : ""}
              {item.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 3. SPOTLIGHT — photo + highlights
 * ══════════════════════════════════════════════════════════════ */
export function SpotlightBlock({ view }: { view: SpotlightView }) {
  return (
    <div
      className="overflow-hidden rounded-[1.75rem] bg-white sm:rounded-[2rem]"
      style={{ border: "1.5px solid var(--border)", boxShadow: "0 18px 50px rgba(15,35,64,0.07)" }}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div
          className={cn(
            "relative md:min-h-[320px]",
            // A real photo gets a proper landscape frame on phones; the empty
            // placeholder stays a slim strip instead of wasting a screen.
            view.image ? "aspect-[16/10] md:aspect-auto" : "min-h-[110px]",
          )}
        >
          {view.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={view.image}
              alt={view.heading}
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(145deg, var(--blue-frost) 0%, #dbe7ff 100%)",
                color: "var(--blue)",
              }}
            >
              <ImageIcon className="size-12 opacity-40" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
          {view.headline && (
            <h4
              className="font-display font-extrabold leading-[1.15]"
              style={{
                fontSize: "clamp(1.375rem, 2.6vw, 1.75rem)",
                letterSpacing: "-0.02em",
                color: NAVY,
              }}
            >
              {view.headline}
            </h4>
          )}

          {view.body && (
            <p
              className="mt-3 leading-relaxed"
              style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}
            >
              {view.body}
            </p>
          )}

          {/* Tiles are always stacked: three side by side were too narrow next to the photo and cut the words off. */}
          {view.tiles.length > 0 && (
            <ul className="mt-5 grid gap-2.5">
              {view.tiles.slice(0, 3).map((tile) => (
                <li
                  key={tile.title}
                  className="rounded-xl px-3.5 py-3"
                  style={{ background: "var(--blue-frost)", border: "1px solid var(--border)" }}
                >
                  <p className="font-display text-sm font-extrabold leading-snug" style={{ color: NAVY }}>
                    {tile.title}
                  </p>
                  {tile.desc && (
                    <p className="mt-0.5 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                      {tile.desc}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {(view.nextBatch || view.priceText) && (
            <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
              {view.nextBatch && (
                <>
                  Batch berikutnya:{" "}
                  <strong style={{ color: NAVY }}>{view.nextBatch}</strong>
                </>
              )}
              {view.nextBatch && view.priceText && " · "}
              {view.priceText && (
                <strong style={{ color: NAVY }}>{view.priceText}</strong>
              )}
            </p>
          )}

          {(view.cta || view.secondaryCta) && (
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {view.cta && <CtaButton cta={view.cta} variant="gold" />}
              {view.secondaryCta && (
                <CtaButton cta={view.secondaryCta} variant="outline" arrow={false} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 4. BANNER — dark banner with three services
 * ══════════════════════════════════════════════════════════════ */
export function BannerBlock({ view }: { view: BannerView }) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-8 lg:p-10"
      style={{ background: DARK_PANEL, boxShadow: "0 24px 60px rgba(10,45,135,0.22)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--blue-vivid)" }}
      />

      <div className="relative">
        {view.headline && (
          <h4
            className="max-w-2xl font-display font-extrabold leading-[1.15]"
            style={{
              fontSize: "clamp(1.3125rem, 3.4vw, 2.25rem)",
              letterSpacing: "-0.022em",
              color: "var(--gold-vivid)",
            }}
          >
            {view.headline}
          </h4>
        )}

        {view.body && (
          <p
            className="mt-3 max-w-2xl leading-relaxed"
            style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.82)" }}
          >
            {view.body}
          </p>
        )}

        {view.tiles.length > 0 && (
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {view.tiles.map((tile) => (
              <li
                key={tile.title}
                className="rounded-2xl p-4 sm:p-5"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <p className="font-display text-[0.9375rem] font-extrabold leading-snug text-white">
                  {tile.title}
                </p>
                {tile.desc && (
                  <p className="mt-1 text-sm leading-snug" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {tile.desc}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {view.chips.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {view.chips.map((chip, i) => (
              <li
                key={`${chip.text}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white"
                style={{ border: "1px solid rgba(255,255,255,0.35)" }}
              >
                {chip.icon && (
                  <Icon name={chip.icon} className="size-3.5" style={{ color: "var(--gold-vivid)" }} />
                )}
                {chip.text}
              </li>
            ))}
          </ul>
        )}

        {view.cta && (
          <div className="mt-6">
            <CtaButton cta={view.cta} variant="gold" />
          </div>
        )}
      </div>
    </div>
  );
}
