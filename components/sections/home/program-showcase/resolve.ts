// components/sections/home/program-showcase/resolve.ts
//
// Turns the CMS configuration of the Beranda "Program Kami" section plus the
// live catalog (real programs, prices, packages) into plain view models the
// layouts can render. Pure functions, safe for client and server.
//
// The catalog is the source of truth: every text shown on a tab is derived from
// the program in the system (title, short description, description, highlight
// tags, benefits, packages, prices, next batch, sign-up method). A field typed
// in the CMS only OVERRIDES that derived value — leave it blank to follow the
// program.

import { buildWhatsAppUrl } from "@/lib/config";
import type {
  HomeCatalog,
  HomeCatalogPackage,
  HomeCatalogProgram,
} from "@/app/modules/program/home-catalog.types";
import type {
  ProgramShowcase,
  ShowcaseCard,
  ShowcaseChip,
  ShowcaseTab,
  ShowcaseTemplate,
  ShowcaseTile,
} from "@/app/modules/site-content/site-content.types";

/* ── helpers ───────────────────────────────────────────────── */

export function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

const clean = (v: string | null | undefined) => (v ?? "").trim();

/** Whole sentences from `text` up to roughly `max` characters. */
export function summarize(text: string | null | undefined, max = 230) {
  const t = clean(text).replace(/\s+/g, " ");
  if (t.length <= max) return t;

  const sentences = t.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  if (out && out.length <= max + 60) return out.trim();

  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : max)}…`;
}

/** Icon for a highlight that has none (best guess from the wording). */
function guessIcon(text: string) {
  const t = text.toLowerCase();
  if (/zoom|video|rekaman|live/.test(t)) return "video";
  if (/whatsapp|chat|komentar|masukan|feedback|laporan|report/.test(t)) {
    return "message-circle";
  }
  if (/hari|jam|menit|minggu|durasi|jadwal|waktu/.test(t)) return "clock";
  if (/siswa|anak|grup|kelas|max|maks|tutor|1-on-1|private|pj/.test(t)) {
    return "users";
  }
  return "check";
}

/* ── derived values (from the program itself) ──────────────── */

function autoChips(program: HomeCatalogProgram): ShowcaseChip[] {
  if (program.highlights.length > 0) {
    return program.highlights.map((h) => ({
      icon: h.icon || guessIcon(h.text),
      text: h.text,
    }));
  }
  return program.tags.slice(0, 4).map((text) => ({ icon: guessIcon(text), text }));
}

function autoTiles(program: HomeCatalogProgram, count = 3): ShowcaseTile[] {
  if (program.benefits.length > 0) {
    return program.benefits.slice(0, count).map((b) => ({
      title: b.title,
      desc: summarize(b.desc, 90),
    }));
  }
  return program.highlights.slice(0, count).map((h) => ({ title: h.text, desc: "" }));
}

/** Short list of reasons to buy, shown with check marks on cards. */
function autoFeatures(program: HomeCatalogProgram, count = 3): string[] {
  if (program.highlights.length > 0) {
    return program.highlights.slice(0, count).map((h) => h.text);
  }
  return program.benefits.slice(0, count).map((b) => b.title);
}

/** Packages a visitor can choose between, each distinct title once. */
function distinctPackages(program: HomeCatalogProgram): HomeCatalogPackage[] {
  const seen = new Set<string>();
  return program.packages.filter((p) => {
    const key = clean(p.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ── view models ───────────────────────────────────────────── */

export type CtaView = { label: string; href: string; external: boolean };

export type PriceView = {
  /** "Rp99.000" or "Hubungi Admin". */
  text: string;
  /** Struck-through price, only when it is higher than the real one. */
  original: string | null;
  /** true when there is no public price. */
  isContact: boolean;
};

type GroupHeader = {
  eyebrow: string;
  heading: string;
  description: string;
};

export type FeatureView = GroupHeader & {
  template: "feature";
  kicker: string;
  badge: string;
  headline: string;
  body: string;
  chips: ShowcaseChip[];
  priceLabel: string;
  priceNotes: string[];
  price: PriceView;
  cta: CtaView;
};

export type SpotlightView = GroupHeader & {
  template: "spotlight";
  headline: string;
  body: string;
  tiles: ShowcaseTile[];
  image: string | null;
  priceText: string | null;
  nextBatch: string | null;
  cta: CtaView | null;
  secondaryCta: CtaView | null;
};

export type BannerView = GroupHeader & {
  template: "banner";
  headline: string;
  body: string;
  tiles: ShowcaseTile[];
  chips: ShowcaseChip[];
  cta: CtaView | null;
};

export type CardView = {
  key: string;
  eyebrow: string;
  badge: string;
  title: string;
  price: PriceView;
  meta: string;
  desc: string;
  chipsLabel: string;
  chips: string[];
  features: string[];
  cta: CtaView;
  featured: boolean;
};

export type CardsView = GroupHeader & {
  template: "cards";
  cards: CardView[];
  helpTitle: string;
  helpItems: { label: string; text: string }[];
};

export type TabView = {
  id: string;
  label: string;
  view: FeatureView | SpotlightView | BannerView | CardsView;
};

/* ── price / link resolution ───────────────────────────────── */

function resolvePrice(
  overridePrice: string,
  overrideOriginal: string,
  price: number | null,
  original: number | null,
): PriceView {
  const op = clean(overridePrice);
  const oo = clean(overrideOriginal);

  if (op) return { text: op, original: oo || null, isContact: false };

  if (price != null && price > 0) {
    return {
      text: formatRupiah(price),
      original: oo || (original && original > price ? formatRupiah(original) : null),
      isContact: false,
    };
  }

  return { text: "Hubungi Admin", original: null, isContact: true };
}

function makeCta(label: string, href: string): CtaView {
  return { label, href, external: isExternalHref(href) };
}

function whatsappCta(label: string, title: string): CtaView {
  return makeCta(
    label,
    buildWhatsAppUrl({
      intent: "consultation",
      title,
      message: `Halo Inggris Go! Saya ingin bertanya tentang ${title}.`,
    }),
  );
}

function registerHref(
  program: HomeCatalogProgram,
  pkg?: HomeCatalogPackage | null,
) {
  const base = program.register.href;
  if (!pkg || program.register.external) return base;
  const params = new URLSearchParams();
  if (pkg.batchId) params.set("batchId", pkg.batchId);
  params.set("packageId", pkg.id);
  return `${base}?${params.toString()}`;
}

function findProgram(catalog: HomeCatalog, slug: string) {
  const key = clean(slug);
  if (!key) return null;
  return catalog.programs.find((p) => p.slug === key) ?? null;
}

function groupHeader(
  tab: ShowcaseTab,
  fallback: Partial<GroupHeader>,
): GroupHeader {
  return {
    eyebrow: clean(tab.eyebrow) || clean(fallback.eyebrow),
    heading: clean(tab.heading) || clean(fallback.heading),
    description: clean(tab.description) || clean(fallback.description),
  };
}

/** "Starter Program · Online" — where the program sits in the catalog. */
function programEyebrow(program: HomeCatalogProgram) {
  const category = clean(program.categoryLabel);
  const format = clean(program.formatLabel);
  // "Program Offline" already says "Offline" — don't repeat it.
  const repeats = format && category.toLowerCase().includes(format.toLowerCase());
  return [category, repeats ? "" : format].filter(Boolean).join(" · ");
}

/** First sentence of a text ("A. B." → "A."). */
function firstSentence(text: string | null | undefined) {
  const t = clean(text).replace(/\s+/g, " ");
  const m = t.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : t).trim();
}

/* ── per-template resolvers ────────────────────────────────── */

function resolveFeature(
  tab: ShowcaseTab,
  program: HomeCatalogProgram,
): FeatureView {
  const chips = tab.chips.filter((c) => clean(c.text));
  const notes = tab.priceNotes.map(clean).filter(Boolean);
  const distinctPrices = new Set(
    program.packages.filter((p) => p.price > 0).map((p) => p.price),
  );

  return {
    template: "feature",
    ...groupHeader(tab, {
      eyebrow: programEyebrow(program),
      heading: program.title,
    }),
    // The category already shows in the small label above the heading, so the
    // yellow kicker is only shown when the admin writes one.
    kicker: clean(tab.kicker),
    badge: clean(tab.badge) || clean(program.badge),
    headline:
      clean(tab.headline) || clean(program.shortDesc) || program.title,
    body: clean(tab.body) || summarize(program.description),
    chips: chips.length > 0 ? chips : autoChips(program),
    priceLabel:
      clean(tab.priceLabel) ||
      (distinctPrices.size > 1 ? "Mulai dari" : "Biaya program"),
    priceNotes:
      notes.length > 0
        ? notes
        : distinctPackages(program)
            .map((p) => clean(p.description))
            .filter(Boolean)
            .slice(0, 2),
    price: resolvePrice(tab.price, tab.originalPrice, program.price, program.originalPrice),
    cta: makeCta(
      clean(tab.ctaLabel) || `Daftar ${program.title}`,
      clean(tab.ctaHref) || program.register.href,
    ),
  };
}

function resolveSpotlight(
  tab: ShowcaseTab,
  program: HomeCatalogProgram,
): SpotlightView {
  const ctaLabel = clean(tab.ctaLabel) || "Lihat Detail";
  const secondaryLabel = clean(tab.secondaryCtaLabel);
  const tiles = tab.tiles.filter((t) => clean(t.title));

  return {
    template: "spotlight",
    ...groupHeader(tab, {
      eyebrow: programEyebrow(program),
      heading: program.title,
    }),
    headline:
      clean(tab.headline) || clean(program.shortDesc) || program.title,
    body: clean(tab.body) || summarize(program.description),
    tiles: tiles.length > 0 ? tiles : autoTiles(program),
    // Program cover photos are generic per category, so only an image chosen
    // for this tab is shown; otherwise a neutral placeholder is rendered.
    image: clean(tab.image) || null,
    priceText: program.price ? `Mulai dari ${formatRupiah(program.price)}` : null,
    nextBatch: formatDate(program.nextBatchStart),
    cta: makeCta(ctaLabel, clean(tab.ctaHref) || program.detailHref),
    secondaryCta: secondaryLabel
      ? clean(tab.secondaryCtaHref)
        ? makeCta(secondaryLabel, clean(tab.secondaryCtaHref))
        : whatsappCta(secondaryLabel, program.title)
      : null,
  };
}

function resolveBanner(
  tab: ShowcaseTab,
  program: HomeCatalogProgram,
): BannerView {
  const label = clean(tab.ctaLabel) || "Minta Penawaran";
  const tiles = tab.tiles.filter((t) => clean(t.title));
  const chips = tab.chips.filter((c) => clean(c.text));

  return {
    template: "banner",
    ...groupHeader(tab, {
      eyebrow: programEyebrow(program),
      heading: program.title,
    }),
    // The group heading above already shows the program name, so the big
    // yellow line is the program's one-line pitch instead.
    headline:
      clean(tab.headline) || firstSentence(program.shortDesc) || program.title,
    body:
      clean(tab.body) ||
      summarize(program.description) ||
      clean(program.shortDesc),
    tiles: tiles.length > 0 ? tiles : autoTiles(program),
    chips: chips.length > 0 ? chips : autoChips(program),
    cta: clean(tab.ctaHref)
      ? makeCta(label, clean(tab.ctaHref))
      : whatsappCta(label, program.title),
  };
}

/** Card for a whole program. */
function cardFromProgram(program: HomeCatalogProgram): CardView {
  const defaultPkg =
    program.packages.find((p) => p.isDefault) ?? program.packages[0] ?? null;
  const nextBatch = formatDate(program.nextBatchStart);

  return {
    key: program.slug,
    eyebrow: "",
    badge: clean(program.badge),
    title: program.title,
    price: resolvePrice("", "", program.price, program.originalPrice),
    meta: nextBatch ? `Batch berikutnya: ${nextBatch}` : program.formatLabel,
    desc: clean(program.shortDesc),
    chipsLabel: "",
    chips: program.tags.slice(0, 4),
    features:
      defaultPkg && defaultPkg.features.length > 0
        ? defaultPkg.features
        : program.benefits.slice(0, 3).map((b) => b.title),
    cta: makeCta(`Daftar ${program.title}`, program.register.href),
    featured: false,
  };
}

/** Card for one package of a program. */
function cardFromPackage(
  program: HomeCatalogProgram,
  pkg: HomeCatalogPackage,
): CardView {
  return {
    key: pkg.id,
    eyebrow: program.title,
    badge: pkg.isDefault && program.scheduleType === "permanent" ? "Paling Populer" : "",
    title: pkg.title,
    price: resolvePrice("", "", pkg.price, pkg.originalPrice),
    meta: "",
    desc: clean(pkg.description),
    chipsLabel: "",
    chips: [],
    features: pkg.features.length > 0 ? pkg.features : autoFeatures(program),
    cta: makeCta(`Daftar ${pkg.title}`, registerHref(program, pkg)),
    featured: pkg.isDefault && program.scheduleType === "permanent",
  };
}

function cardsFromPackages(program: HomeCatalogProgram): CardView[] {
  return distinctPackages(program).map((pkg) => cardFromPackage(program, pkg));
}

/**
 * Cards for every program of a category. A program sold as several fixed
 * packages (e.g. Private Kids Fleksibel / Eksklusif) is shown as one card per
 * package, so visitors compare what they can actually buy.
 */
function cardsFromProgram(program: HomeCatalogProgram): CardView[] {
  const pkgs = distinctPackages(program);
  const expand =
    program.scheduleType === "permanent" &&
    pkgs.filter((p) => p.price > 0).length > 1;
  return expand ? cardsFromPackages(program) : [cardFromProgram(program)];
}

function cardFromManual(
  card: ShowcaseCard,
  index: number,
  catalog: HomeCatalog,
): CardView | null {
  const program = findProgram(catalog, card.programSlug);
  const wanted = clean(card.packageTitle).toLowerCase();
  const pkg = program && wanted
    ? (program.packages.find((p) => clean(p.title).toLowerCase() === wanted) ?? null)
    : null;

  const title = clean(card.title) || pkg?.title || program?.title || "";
  if (!title) return null;

  const livePrice = pkg ? pkg.price : (program?.price ?? null);
  const liveOriginal = pkg ? pkg.originalPrice : (program?.originalPrice ?? null);

  const href =
    clean(card.ctaHref) ||
    (program ? registerHref(program, pkg) : "/programs");

  const base = program
    ? pkg
      ? cardFromPackage(program, pkg)
      : cardFromProgram(program)
    : null;

  const chips = card.chips.map(clean).filter(Boolean);
  const features = card.features.map(clean).filter(Boolean);

  return {
    key: `${card.programSlug}-${card.packageTitle}-${index}`,
    eyebrow: clean(card.eyebrow) || base?.eyebrow || "",
    badge: clean(card.badge) || base?.badge || "",
    title,
    price: resolvePrice(card.price, card.originalPrice, livePrice, liveOriginal),
    meta: clean(card.meta) || base?.meta || "",
    desc: clean(card.desc) || base?.desc || "",
    chipsLabel: clean(card.chipsLabel),
    chips: chips.length > 0 ? chips : (base?.chips ?? []),
    features: features.length > 0 ? features : (base?.features ?? []),
    cta: makeCta(clean(card.ctaLabel) || `Daftar ${title}`, href),
    featured: card.featured || (base?.featured ?? false),
  };
}

function resolveCards(tab: ShowcaseTab, catalog: HomeCatalog): CardsView | null {
  let cards: CardView[] = [];
  const fallback: Partial<GroupHeader> = {};

  if (tab.cardSource === "category") {
    const cat = catalog.categories.find((c) => c.slug === clean(tab.categorySlug));
    fallback.heading = cat?.label ?? "";
    fallback.description = cat?.description ?? "";
    cards = catalog.programs
      .filter((p) => p.categorySlug === clean(tab.categorySlug))
      .flatMap(cardsFromProgram);
  } else if (tab.cardSource === "program") {
    const program = findProgram(catalog, tab.programSlug);
    fallback.heading = program?.title ?? "";
    fallback.description = program ? clean(program.shortDesc) : "";
    cards = program ? cardsFromPackages(program) : [];
  } else {
    cards = tab.cards
      .map((c, i) => cardFromManual(c, i, catalog))
      .filter((c): c is CardView => c !== null);
  }

  if (cards.length === 0) return null;

  return {
    template: "cards",
    ...groupHeader(tab, fallback),
    cards,
    helpTitle: clean(tab.helpTitle),
    helpItems: tab.helpItems.filter((h) => clean(h.label) || clean(h.text)),
  };
}

/* ── public API ────────────────────────────────────────────── */

export function resolveTab(
  tab: ShowcaseTab,
  catalog: HomeCatalog,
): TabView | null {
  const label = clean(tab.label) || clean(tab.heading);
  const make = (view: TabView["view"]): TabView => ({
    id: tab.id,
    label: label || view.heading,
    view,
  });

  if (tab.template === "cards") {
    const view = resolveCards(tab, catalog);
    return view ? make(view) : null;
  }

  const program = findProgram(catalog, tab.programSlug);
  if (!program) return null;

  if (tab.template === "feature") return make(resolveFeature(tab, program));
  if (tab.template === "spotlight") return make(resolveSpotlight(tab, program));
  return make(resolveBanner(tab, program));
}

export function resolveShowcase(
  section: ProgramShowcase,
  catalog: HomeCatalog,
): TabView[] {
  return section.tabs
    .map((tab) => resolveTab(tab, catalog))
    .filter((t): t is TabView => t !== null);
}

/**
 * The same tab with every typed text removed — i.e. exactly what the website
 * shows when the admin leaves all fields blank. The CMS editor uses it to show
 * the real values as placeholders and in its "Data dari program" preview.
 */
export function withoutOverrides(tab: ShowcaseTab): ShowcaseTab {
  return {
    ...tab,
    label: "",
    eyebrow: "",
    heading: "",
    description: "",
    kicker: "",
    badge: "",
    headline: "",
    body: "",
    chips: [],
    tiles: [],
    priceLabel: "",
    priceNotes: [],
    price: "",
    originalPrice: "",
    ctaLabel: "",
    ctaHref: "",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    cards: tab.cards.map((c) => ({
      ...c,
      eyebrow: "",
      badge: "",
      title: "",
      price: "",
      originalPrice: "",
      meta: "",
      desc: "",
      chipsLabel: "",
      chips: [],
      features: [],
      ctaLabel: "",
      ctaHref: "",
      featured: false,
    })),
    helpTitle: "",
    helpItems: [],
  };
}

/** Why a tab would not show on the public page (for the CMS editor). */
export function describeTabProblem(
  tab: ShowcaseTab,
  catalog: HomeCatalog | undefined,
): string | null {
  if (!catalog) return null;
  const template: ShowcaseTemplate = tab.template;

  if (template !== "cards" || tab.cardSource === "program") {
    if (!clean(tab.programSlug)) return "Pilih program terlebih dahulu.";
    if (!findProgram(catalog, tab.programSlug)) {
      return "Program ini belum dipublikasikan, tab disembunyikan.";
    }
  }
  if (template === "cards") {
    if (tab.cardSource === "category") {
      if (!clean(tab.categorySlug)) return "Pilih kategori terlebih dahulu.";
      if (!resolveCards(tab, catalog)) {
        return "Kategori ini belum punya program yang dipublikasikan.";
      }
    }
    if (tab.cardSource === "manual" && !resolveCards(tab, catalog)) {
      return "Tambahkan minimal satu kartu.";
    }
  }
  return null;
}
