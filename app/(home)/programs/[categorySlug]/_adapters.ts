// app/(home)/programs/[categorySlug]/_adapters.ts
//
// Server-only. Maps DB rows (from the public router) into the static `data.ts`
// shapes the marketing UI is built around, and exposes a server-side caller.

import { createCallerFactory, createTRPCContext } from "@/lib/trpc/init";
import { appRouter } from "@/lib/trpc/routers/_app";

import type {
  CategoryCTA,
  CategoryMeta,
  PricingPackage,
  ProgramBatch,
  ProgramDetail,
  ProgramMeta,
  ProgramSection,
} from "./data";

/* ── Server caller (no HTTP; runs the router in-process) ── */

const createCaller = createCallerFactory(appRouter);

export async function getPublicCaller() {
  return createCaller(await createTRPCContext());
}

/* ── Helpers ── */

function formatIDR(v: number | null | undefined) {
  // Rp 0 means "no public price" (e.g. school quotes) — never show "Rp 0".
  if (v == null || v <= 0) return "Hubungi Admin";
  return `Rp ${v.toLocaleString("id-ID")}`;
}

// DB package row → marketing PricingPackage (price ints → "Rp ..." strings)
type DbPackage = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  isDefault?: boolean | null;
  features?: unknown;
};

function dbPackageToPricing(p: DbPackage): PricingPackage {
  const features = Array.isArray(p.features)
    ? p.features.filter((f): f is string => typeof f === "string" && !!f.trim())
    : [];

  return {
    id: p.id,
    label: p.title,
    price: formatIDR(p.price),
    originalPrice:
      p.originalPrice != null && p.originalPrice > p.price
        ? formatIDR(p.originalPrice)
        : undefined,
    highlight: p.isDefault ? "Paling Populer" : undefined,
    note: p.description ?? undefined,
    features: features.length ? features : undefined,
  };
}

function registrationHref(
  programSlug: string,
  batchId?: string,
  packageId?: string,
) {
  const href = `/registrasi/${encodeURIComponent(programSlug)}`;
  const params = new URLSearchParams();
  if (batchId) params.set("batchId", batchId);
  if (packageId) params.set("packageId", packageId);
  const query = params.toString();
  return query ? `${href}?${query}` : href;
}


type RegistrationTarget = {
  method: "form" | "whatsapp" | "link";
  /** Where every "Daftar" button goes. */
  href: string;
  /** Text of those buttons. */
  label: string;
  /** True when href leaves the site (external link method). */
  external: boolean;
};

/**
 * Resolve the program's sign-up method (set by the admin in Dashboard →
 * Program → Komersial → Cara Pendaftaran) into the link + label shared by
 * every "Daftar" button on the program page.
 */
function resolveRegistrationTarget(program: {
  slug: string;
  registrationMethod?: string | null;
  registrationLinkUrl?: string | null;
  registrationLinkLabel?: string | null;
}): RegistrationTarget {
  if (program.registrationMethod === "link" && program.registrationLinkUrl) {
    return {
      method: "link",
      href: program.registrationLinkUrl,
      label: program.registrationLinkLabel?.trim() || "Daftar Sekarang",
      external: true,
    };
  }

  if (program.registrationMethod === "whatsapp") {
    return {
      method: "whatsapp",
      href: registrationHref(program.slug),
      label: "Daftar via WhatsApp",
      external: false,
    };
  }

  return {
    method: "form",
    href: registrationHref(program.slug),
    label: "Daftar Online",
    external: false,
  };
}

// Pick the price shown on a batch card: the default package, else the cheapest.
function pickBatchPackage(pkgs: DbPackage[]): DbPackage | undefined {
  if (!pkgs.length) return undefined;
  const def = pkgs.find((p) => p.isDefault);
  if (def) return def;
  return [...pkgs].sort((a, b) => a.price - b.price)[0];
}

/* ── Program (card) ── */

type DbProgramWithPricing = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  shortDesc?: string | null;
  badge?: string | null;
  highlight?: string | null;
  icon?: string | null;
  tags?: string[] | null;
  duration?: number | string | null;
  format?: string | null;
  level?: string | null;
  packages: { id: string; title: string; price: number }[];
  startingPrice: number | null;
};

function dbProgramToMeta(
  p: DbProgramWithPricing,
  categorySlug: string,
): ProgramMeta {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description ?? "",
    shortDesc: p.shortDesc ?? undefined,
    price: formatIDR(p.startingPrice),
    priceTiers: p.packages.length
      ? p.packages.map((k) => ({ label: k.title, price: formatIDR(k.price) }))
      : undefined,
    badge: p.badge ?? undefined,
    highlight: p.highlight ?? undefined,
    tags: Array.isArray(p.tags) ? p.tags : [],
    icon: p.icon ?? "book-open",
    href: `/programs/${categorySlug}/${p.slug}`,
    duration:
      typeof p.duration === "number"
        ? `${p.duration} hari`
        : (p.duration ?? undefined),
    format: p.format ?? undefined,
    level: p.level ?? undefined,
  };
}

/* ── Category ── */

export function dbCategoryToMeta(
  category: any,
  programs: DbProgramWithPricing[],
  categorySlug: string,
): CategoryMeta {
  const fallbackCta: CategoryCTA = {
    title: category.tagline ?? "Mulai sekarang",
    description: category.description ?? "",
    primaryLabel: "Lihat Semua Program",
    primaryHref: "#program-list",
  };

  return {
    key: category.slug,
    label: category.label,
    shortLabel: category.shortLabel ?? undefined,
    href: "/programs",
    icon: category.icon ?? undefined,
    heroImage: category.heroImage ?? undefined,
    theme: { primary: category.themePrimary ?? "#4da3ff" },
    quickDecisionLabel: category.quickDecisionLabel ?? "",
    quickDecisionDesc: category.quickDecisionDesc ?? "",
    tagline: category.tagline ?? category.label,
    taglineAccent: category.taglineAccent ?? undefined,
    description: category.description ?? "",
    forWho: category.forWho ?? "",
    programs: programs.map((p) => dbProgramToMeta(p, categorySlug)),
    // These jsonb columns are stored in the same shape as data.ts, so they pass
    // through. `?? undefined` guards null/empty so optional fields stay optional.
    painPoints: category.painPoints ?? undefined,
    benefits: category.benefits ?? undefined,
    steps: category.steps ?? undefined,
    experience: category.experience ?? undefined,
    comparison: category.comparison ?? undefined,
    socialProof: category.socialProof ?? undefined,
    cta: (category.cta as CategoryCTA) ?? fallbackCta,
    emptyState: category.emptyState ?? undefined,
  };
}

/* ── Program detail ── */
function dbBatchToProgramBatch(
  b: any,
  programSlug: string,
  target: RegistrationTarget,
): ProgramBatch {
  const status: ProgramBatch["status"] =
    b.status === "open"
      ? "open"
      : b.status === "full"
        ? "full"
        : b.status === "coming_soon"
          ? "coming_soon"
          : "closed";

  const chosen = pickBatchPackage((b.packages ?? []) as DbPackage[]);

  // ✅ Keep old CMS primary CTA, usually WA, as secondary CTA.
  const oldPrimaryHref = b.primaryCtaHref ?? undefined;
  const oldPrimaryLabel = b.primaryCtaLabel ?? undefined;
  const oldPrimaryIcon = b.primaryCtaIcon ?? undefined;

  return {
    id: b.id,
    label: b.title,
    startDate: b.startDate ? new Date(b.startDate).toISOString() : undefined,
    endDate: b.endDate ? new Date(b.endDate).toISOString() : undefined,
    note: b.notes ?? undefined,
    status,
    isOpen: b.status === "open" || b.status === "ongoing",
    capacity: b.capacity ?? undefined,
    // 0 = nobody tracked yet → hide the "x kursi tersisa / % terisi" meter
    // instead of advertising an untouched capacity as real data.
    enrolled: b.enrolledCount > 0 ? b.enrolledCount : undefined,
    price: chosen ? formatIDR(chosen.price) : undefined,
    originalPrice:
      chosen?.originalPrice != null && chosen.originalPrice > chosen.price
        ? formatIDR(chosen.originalPrice)
        : undefined,
    brochure: b.brochureUrl
      ? { url: b.brochureUrl, label: b.brochureLabel ?? undefined }
      : undefined,

    // ✅ Main button follows the program's sign-up method. Built-in methods
    // carry the batch id so the form opens on the right batch.
    primaryCtaLabel: target.label,
    primaryCtaHref: target.external
      ? target.href
      : registrationHref(programSlug, b.id),
    primaryCtaIcon: "arrow-right",

    // ✅ WhatsApp/admin CTA stays available as secondary button.
    secondaryCtaLabel:
      b.secondaryCtaLabel ?? oldPrimaryLabel ?? "Tanya Admin",
    secondaryCtaHref:
      b.secondaryCtaHref ?? oldPrimaryHref,
    secondaryCtaIcon:
      b.secondaryCtaIcon ?? oldPrimaryIcon ?? "message-circle",
  };
}

type PricingProgramSection = Extract<ProgramSection, { type: "pricing" }>;

/**
 * Packages for the "Harga" section, read from the packages the admin created in
 * the dashboard — so prices on the page can never drift from the system.
 *
 *  - permanent program → its own packages
 *  - scheduled program → the distinct packages of the batches that are open now
 *
 * Every package carries its own sign-up link (`?packageId=` / `?batchId=`), or
 * the program's external link when that sign-up method is used.
 */
function buildPricingPackages(
  d: any,
  target: RegistrationTarget,
): PricingPackage[] {
  const slug: string = d.program.slug;
  const isScheduled = d.program.scheduleType === "scheduled";

  const withLink = (p: DbPackage, batchId?: string): PricingPackage => ({
    ...dbPackageToPricing(p),
    // "Default" on a batch only means "the price shown on the batch card", not
    // "most popular" — so only permanent programs get the badge.
    highlight: !isScheduled && p.isDefault ? "Paling Populer" : undefined,
    href: target.external ? target.href : registrationHref(slug, batchId, p.id),
    ctaLabel: target.method === "form" ? "Pilih Paket" : target.label,
  });

  if (!isScheduled) {
    return ((d.directPackages ?? []) as DbPackage[]).map((p) => withLink(p));
  }

  const seen = new Set<string>();
  const out: PricingPackage[] = [];
  for (const b of d.batches ?? []) {
    if (b.status !== "open" && b.status !== "ongoing") continue;
    for (const p of (b.packages ?? []) as DbPackage[]) {
      const key = `${p.title}|${p.price}|${p.originalPrice ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(withLink(p, b.id));
    }
  }
  return out;
}

/**
 * Replace the hand-typed package list of the pricing section with live data.
 * The CMS text (heading, "what's included", bonus, notes) stays; only prices and
 * package names come from the program's packages. A permanent program that has
 * priced packages but no pricing section gets one, so packages are never hidden.
 */
function applyLivePricing(
  sections: ProgramSection[],
  packages: PricingPackage[],
  program: { title: string; scheduleType?: string | null },
): ProgramSection[] {
  if (packages.length === 0) return sections;

  const idx = sections.findIndex((s) => s.type === "pricing");

  if (idx >= 0) {
    const section = sections[idx] as PricingProgramSection;
    const first = section.content.groups?.[0];
    const next: PricingProgramSection = {
      ...section,
      content: {
        ...section.content,
        groups: [
          {
            title: first?.title ?? program.title,
            subtitle: first?.subtitle,
            icon: first?.icon,
            features: first?.features ?? [],
            packages,
          },
        ],
      },
    };
    return sections.map((s, i) => (i === idx ? next : s));
  }

  const hasPublicPrice = packages.some((p) => p.price !== formatIDR(0));
  if (program.scheduleType === "scheduled" || !hasPublicPrice) return sections;

  const injected: PricingProgramSection = {
    id: "pricing",
    type: "pricing",
    content: {
      title: "Pilih Paket Belajar",
      groups: [
        { title: program.title, features: [], packages },
      ],
    },
  };
  const before = sections.findIndex((s) =>
    ["testimonials", "faq", "cta"].includes(s.type),
  );
  const at = before >= 0 ? before : sections.length;
  return [...sections.slice(0, at), injected, ...sections.slice(at)];
}

export function dbDetailToProgramDetail(d: any): ProgramDetail {
  const isScheduled = d.program.scheduleType === "scheduled";
  const target = resolveRegistrationTarget(d.program);
  const onlineRegistrationHref = target.href;
  const pricingPackages = buildPricingPackages(d, target);

  return {
    slug: d.program.slug,
    theme: {
      primary: d.theme?.primary ?? d.category?.themePrimary ?? "#1a52c8",
    },
    hasBatch: isScheduled && d.batches.length > 0,
    registerHref: target.href,
    registerLabel: target.label,

    // ✅ pass program slug so each batch gets `/registrasi/[slug]?batchId=...`
    batches: d.batches.map((b: any) =>
      dbBatchToProgramBatch(b, d.program.slug, target),
    ),

    packages: (d.directPackages ?? []).map((p: DbPackage) =>
      dbPackageToPricing(p),
    ),

    // Optional but recommended:
    // makes bottom CTA section go online too if CMS CTA still points to WA.
    sections: applyLivePricing(
      ((d.sections ?? []) as ProgramSection[]).map((section) => {
        if (section.type !== "cta") return section;

        return {
          ...section,
          content: {
            ...section.content,
            cta: {
              ...section.content.cta,
              label: section.content.cta.label ?? target.label,
              href: onlineRegistrationHref,
            },
          },
        };
      }),
      pricingPackages,
      { title: d.program.title, scheduleType: d.program.scheduleType },
    ),
  };
}