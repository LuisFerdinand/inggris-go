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
  if (v == null) return "Hubungi Admin";
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
};

function dbPackageToPricing(p: DbPackage): PricingPackage {
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
  };
}

function registrationHref(programSlug: string, batchId?: string) {
  const href = `/registrasi/${encodeURIComponent(programSlug)}`;
  if (!batchId) return href;
  return `${href}?batchId=${encodeURIComponent(batchId)}`;
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
    href: `/programs/${category.slug}`,
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
function dbBatchToProgramBatch(b: any, programSlug: string): ProgramBatch {
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
    enrolled: b.enrolledCount ?? undefined,
    price: chosen ? formatIDR(chosen.price) : undefined,
    originalPrice:
      chosen?.originalPrice != null && chosen.originalPrice > chosen.price
        ? formatIDR(chosen.originalPrice)
        : undefined,
    brochure: b.brochureUrl
      ? { url: b.brochureUrl, label: b.brochureLabel ?? undefined }
      : undefined,

    // ✅ Main button now opens online registration, not WhatsApp.
    primaryCtaLabel: "Daftar Online",
    primaryCtaHref: registrationHref(programSlug, b.id),
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

export function dbDetailToProgramDetail(d: any): ProgramDetail {
  const isScheduled = d.program.scheduleType === "scheduled";
  const onlineRegistrationHref = registrationHref(d.program.slug);

  return {
    slug: d.program.slug,
    theme: {
      primary: d.theme?.primary ?? d.category?.themePrimary ?? "#1a52c8",
    },
    hasBatch: isScheduled && d.batches.length > 0,

    // ✅ pass program slug so each batch gets `/registrasi/[slug]?batchId=...`
    batches: d.batches.map((b: any) =>
      dbBatchToProgramBatch(b, d.program.slug),
    ),

    packages: (d.directPackages ?? []).map((p: DbPackage) =>
      dbPackageToPricing(p),
    ),

    // Optional but recommended:
    // makes bottom CTA section go online too if CMS CTA still points to WA.
    sections: ((d.sections ?? []) as ProgramSection[]).map((section) => {
      if (section.type !== "cta") return section;

      return {
        ...section,
        content: {
          ...section.content,
          cta: {
            ...section.content.cta,
            label: section.content.cta.label ?? "Daftar Online",
            href: onlineRegistrationHref,
          },
        },
      };
    }),
  };
}