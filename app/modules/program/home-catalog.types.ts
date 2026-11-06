// app/modules/program/home-catalog.types.ts
//
// Shape of `publicPrograms.homeCatalog` — shared by the server router, the
// Beranda "Program Kami" section and its CMS editor (client-safe, types only).
//
// Everything the section shows is derived from these real program fields, so
// the CMS only has to pick a program; typed text is an optional override.

export type HomeCatalogPackage = {
  id: string;
  /** Set for packages that belong to a batch (scheduled programs). */
  batchId: string | null;
  title: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  features: string[];
  isDefault: boolean;
};

/** A short selling point with an icon (from the program page's hero tags). */
export type HomeCatalogHighlight = {
  icon: string;
  text: string;
};

/** A benefit from the program page's "benefits" section. */
export type HomeCatalogBenefit = {
  icon: string;
  title: string;
  desc: string;
};

/** A testimonial from the program page's "testimonials" section. */
export type HomeCatalogTestimonial = {
  name: string;
  role: string;
  quote: string;
  meta: string;
};

export type HomeCatalogProgram = {
  slug: string;
  title: string;
  shortDesc: string | null;
  /** Full description written on the program (Dashboard → Program → Info). */
  description: string | null;
  categorySlug: string;
  categoryLabel: string;
  badge: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  /** "Online" / "Offline" / "Hybrid". */
  formatLabel: string;
  /** "2 minggu", "7 hari"… null when the program has no fixed duration. */
  durationLabel: string | null;
  scheduleType: "permanent" | "scheduled";
  /** Cheapest real package price (Rp 0 ignored), null when none. */
  price: number | null;
  originalPrice: number | null;
  /** Packages that can be bought right now (direct + open batches). */
  packages: HomeCatalogPackage[];
  /** Selling points with icons: hero tags of the program page, else highlight. */
  highlights: HomeCatalogHighlight[];
  /** Benefits of the program page (title + description). */
  benefits: HomeCatalogBenefit[];
  /** Testimonials written on the program page (edited in the program CMS). */
  testimonials: HomeCatalogTestimonial[];
  /** ISO date of the next open batch, if any. */
  nextBatchStart: string | null;
  detailHref: string;
  register: { href: string; label: string; external: boolean };
};

export type HomeCatalog = {
  categories: { slug: string; label: string; description: string | null }[];
  programs: HomeCatalogProgram[];
};
