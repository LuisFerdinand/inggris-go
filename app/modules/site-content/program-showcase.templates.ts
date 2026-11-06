// app/modules/site-content/program-showcase.templates.ts
//
// Starter content for every layout of the Beranda "Program Kami" section.
// The CMS uses `createShowcaseTab(template)` so a new tab starts from a
// filled-in example instead of an empty form; DEFAULT_PROGRAM_SHOWCASE is the
// section that is shown until an admin saves their own version.

import type {
  ProgramShowcase,
  ShowcaseCard,
  ShowcaseTab,
  ShowcaseTemplate,
} from "./site-content.types";

export const SHOWCASE_TEMPLATES: {
  value: ShowcaseTemplate;
  title: string;
  description: string;
  /** What the tab shows. */
  source: string;
}[] = [
  {
    value: "feature",
    title: "Program Unggulan",
    description: "Blok biru besar dengan kartu harga. Cocok untuk program starter atau promo.",
    source: "1 program",
  },
  {
    value: "cards",
    title: "Kartu Pilihan",
    description: "Deretan kartu berisi harga & fitur. Cocok untuk satu kategori atau beberapa paket.",
    source: "Kategori / paket / manual",
  },
  {
    value: "spotlight",
    title: "Sorotan Program",
    description: "Foto di kiri, penjelasan dan tombol di kanan. Cocok untuk camp atau event.",
    source: "1 program",
  },
  {
    value: "banner",
    title: "Banner Lembaga",
    description: "Banner biru dengan 3 layanan. Cocok untuk sekolah, lembaga, atau kerja sama.",
    source: "1 program",
  },
];

export function createShowcaseId() {
  return `tab-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyShowcaseCard(): ShowcaseCard {
  return {
    programSlug: "",
    packageTitle: "",
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
  };
}

function baseTab(template: ShowcaseTemplate): ShowcaseTab {
  return {
    id: createShowcaseId(),
    label: "",
    template,
    programSlug: "",
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
    image: "",
    ctaLabel: "",
    ctaHref: "",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    cardSource: "category",
    categorySlug: "",
    cards: [],
    helpTitle: "",
    helpItems: [],
  };
}

/** A tab with every field empty (used to complete older saved data). */
export function emptyShowcaseTab(template: ShowcaseTemplate = "feature"): ShowcaseTab {
  return baseTab(template);
}

/**
 * A new tab for the chosen layout. Text fields start empty on purpose: the
 * website fills them from the program the admin picks (title, description,
 * highlights, benefits, packages, prices). Only button labels get a default.
 */
export function createShowcaseTab(template: ShowcaseTemplate): ShowcaseTab {
  const tab = baseTab(template);

  switch (template) {
    case "spotlight":
      return { ...tab, ctaLabel: "Lihat Detail", secondaryCtaLabel: "Tanya Admin" };
    case "banner":
      return { ...tab, ctaLabel: "Minta Penawaran" };
    default:
      return tab;
  }
}

/* ── Default section ───────────────────────────────────────────
 * Same four layouts as the reference design, but every tab only POINTS at real
 * programs — all text, prices and packages are read from the system. Nothing
 * here needs updating when a program or package changes.
 */

const speakingChallenge: ShowcaseTab = {
  ...baseTab("feature"),
  id: "starter",
  programSlug: "speaking-challenge",
};

const belajarOnline: ShowcaseTab = {
  ...baseTab("cards"),
  id: "online",
  cardSource: "category",
  categorySlug: "online",
};

const vipCamp: ShowcaseTab = {
  ...baseTab("spotlight"),
  id: "camp",
  programSlug: "vip-english-for-kids",
  ctaLabel: "Lihat Detail",
  secondaryCtaLabel: "Tanya Admin",
};

const rombongan: ShowcaseTab = {
  ...baseTab("banner"),
  id: "rombongan",
  programSlug: "kelas-rombongan",
  ctaLabel: "Minta Penawaran",
};

export const DEFAULT_PROGRAM_SHOWCASE: ProgramShowcase = {
  eyebrow: "Program Kami",
  title: "Pilih Program Sesuai",
  titleAccent: "Kebutuhan Ananda",
  description:
    "Dari kelas online di rumah sampai English camp di Kampung Inggris Pare, pilih yang paling cocok untuk Ananda.",
  display: "tabs",
  tabs: [speakingChallenge, belajarOnline, vipCamp, rombongan],
};
