// app/modules/program/server/program.public.router.ts
//
// PUBLIC, UNAUTHENTICATED reads for the marketing site.
// Kept separate from the protected dashboard router so the public pages can
// fetch published data without an admin session.
//
// Uses `baseProcedure` (the unauthenticated procedure from "@/lib/trpc/init"),
// so the public site can read published data without an admin session.

import { z } from "zod";
import { and, asc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, baseProcedure } from "@/lib/trpc/init";
import { siteConfig } from "@/lib/config";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { db } from "@/app/db/db";
import {
  programs,
  programCategories,
  programBatches,
  programPackages,
  programContent,
} from "@/app/db/schema";

const PUBLISHED = "published" as const;

export type { HomeCatalogProgram, HomeCatalog } from "../home-catalog.types";
import type {
  HomeCatalogBenefit,
  HomeCatalogHighlight,
  HomeCatalogProgram,
  HomeCatalogTestimonial,
} from "../home-catalog.types";

const DURATION_UNITS = [
  { factor: 10080, label: "minggu" },
  { factor: 1440, label: "hari" },
  { factor: 60, label: "jam" },
  { factor: 1, label: "menit" },
] as const;

function formatProgramDuration(totalMinutes: number | null | undefined) {
  if (!totalMinutes || totalMinutes <= 0) return null;

  const unit =
    DURATION_UNITS.find((u) => totalMinutes % u.factor === 0) ??
    DURATION_UNITS[DURATION_UNITS.length - 1];

  const value = totalMinutes / unit.factor;

  return `${value} ${unit.label}`;
}

const FORMAT_LABEL: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

type LooseSection = {
  type?: string;
  visible?: boolean;
  content?: Record<string, unknown>;
};

const asText = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const sameText = (a: string, b: string) => {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
};

/**
 * Short selling points for a program: the icon tags of its page hero first,
 * then the parts of the "highlight" line that say something new.
 */
function pickHighlights(
  highlight: string | null,
  sections: LooseSection[],
): HomeCatalogHighlight[] {
  const hero = sections.find((s) => s.type === "hero" && s.visible !== false);
  const heroTags = Array.isArray(hero?.content?.tags)
    ? (hero!.content!.tags as { icon?: unknown; title?: unknown }[])
    : [];

  const out: HomeCatalogHighlight[] = [];
  for (const t of heroTags) {
    const text = asText(t.title);
    if (text) out.push({ icon: asText(t.icon), text });
  }

  for (const part of (highlight ?? "").split(/\s*[•|·\n]\s*/)) {
    const text = part.trim();
    if (!text) continue;
    if (out.some((h) => sameText(h.text, text))) continue;
    out.push({ icon: "", text });
  }

  return out.slice(0, 4);
}

/** Benefits (title + description) from the first visible "benefits" section. */
function pickBenefits(sections: LooseSection[]): HomeCatalogBenefit[] {
  const section = sections.find(
    (s) => s.type === "benefits" && s.visible !== false,
  );
  const items = Array.isArray(section?.content?.items)
    ? (section!.content!.items as Record<string, unknown>[])
    : [];

  return items
    .map((it) => ({
      icon: asText(it.icon),
      title: asText(it.title),
      desc: asText(it.description ?? it.desc),
    }))
    .filter((b) => b.title)
    .slice(0, 6);
}

/** Testimonials from the first visible "testimonials" section of a program. */
function pickTestimonials(sections: LooseSection[]): HomeCatalogTestimonial[] {
  const section = sections.find(
    (s) => s.type === "testimonials" && s.visible !== false,
  );
  const items = Array.isArray(section?.content?.items)
    ? (section!.content!.items as Record<string, unknown>[])
    : [];

  return items
    .map((it) => ({
      name: asText(it.name),
      role: asText(it.role),
      quote: asText(it.quote),
      meta: asText(it.meta),
    }))
    .filter((t) => t.name && t.quote);
}

export const programPublicRouter = createTRPCRouter({
  /**
   * All published categories (ordered) with a slim list of their published
   * programs. Powers the navbar "Program Kami" dropdown.
   */
  menu: baseProcedure.query(async () => {
    const cats = await db.query.programCategories.findMany({
      where: eq(programCategories.status, PUBLISHED),
      orderBy: [asc(programCategories.order)],
    });
    if (cats.length === 0) return [];

    const progs = await db.query.programs.findMany({
      where: and(
        inArray(
          programs.categoryId,
          cats.map((c) => c.id),
        ),
        eq(programs.status, PUBLISHED),
      ),
      orderBy: [asc(programs.createdAt)],
    });

    return cats.map((c) => ({
      slug: c.slug,
      label: c.label,
      shortLabel: c.shortLabel ?? null,
      icon: c.icon ?? null,
      themePrimary: c.themePrimary,
      tagline: c.tagline ?? null,
      description: c.description ?? null,
      href: "/programs",
      programs: progs
        .filter((p) => p.categoryId === c.id)
        .map((p) => ({
          slug: p.slug,
          title: p.title,
          icon: p.icon ?? null,
          badge: p.badge ?? null,
          href: `/programs/${c.slug}/${p.slug}`,
        })),
    }));
  }),

  /**
   * Everything the Beranda "Program Kami" section needs in one read: published
   * categories and programs with live prices (cheapest real package), packages,
   * the next open batch and where the register button should go.
   */
  homeCatalog: baseProcedure.query(async () => {
    const [cats, progs] = await Promise.all([
      db.query.programCategories.findMany({
        where: eq(programCategories.status, PUBLISHED),
        orderBy: [asc(programCategories.order)],
      }),
      db.query.programs.findMany({
        where: eq(programs.status, PUBLISHED),
        orderBy: [asc(programs.createdAt)],
      }),
    ]);

    const categoriesOut = cats.map((c) => ({
      slug: c.slug,
      label: c.label,
      description: c.description ?? null,
    }));

    if (progs.length === 0) {
      return {
        categories: categoriesOut,
        programs: [] as HomeCatalogProgram[],
      };
    }

    const ids = progs.map((p) => p.id);
    const [pkgs, batches, contents] = await Promise.all([
      db.query.programPackages.findMany({
        where: inArray(programPackages.programId, ids),
        orderBy: [asc(programPackages.order)],
      }),
      db.query.programBatches.findMany({
        where: and(
          inArray(programBatches.programId, ids),
          eq(programBatches.status, "open"),
        ),
        orderBy: [asc(programBatches.startDate)],
      }),
      db.query.programContent.findMany({
        where: inArray(programContent.programId, ids),
      }),
    ]);

    const now = Date.now();
    const catById = new Map(cats.map((c) => [c.id, c]));
    const openBatchIds = new Set(batches.map((b) => b.id));
    const sectionsByProgram = new Map(
      contents.map((c) => [c.programId, (c.sections ?? []) as LooseSection[]]),
    );

    const programsOut: HomeCatalogProgram[] = progs.map((p) => {
      const cat = catById.get(p.categoryId);
      const categorySlug = cat?.slug ?? "";
      const sections = sectionsByProgram.get(p.id) ?? [];
      const packages = pkgs
        // Only what can be bought now: the program's own packages plus those
        // of open batches (packages of closed batches are history).
        .filter(
          (k) =>
            k.programId === p.id && (!k.batchId || openBatchIds.has(k.batchId)),
        )
        .map((k) => ({
          id: k.id,
          batchId: k.batchId ?? null,
          title: k.title,
          description: k.description ?? null,
          price: k.price,
          originalPrice: k.originalPrice ?? null,
          features: Array.isArray(k.features) ? k.features : [],
          isDefault: k.isDefault,
        }));

      // Rp 0 = "hubungi admin": never the starting price.
      const cheapest = packages
        .filter((k) => k.price > 0)
        .sort((a, b) => a.price - b.price)[0];

      const nextBatch = batches.find(
        (b) =>
          b.programId === p.id &&
          b.startDate &&
          new Date(b.startDate).getTime() >= now,
      );

      const method = p.registrationMethod;
      const register =
        method === "link" && p.registrationLinkUrl
          ? {
              href: p.registrationLinkUrl,
              label: p.registrationLinkLabel || "Daftar Sekarang",
              external: true,
            }
          : {
              href: `/registrasi/${p.slug}`,
              label:
                method === "whatsapp" ? "Daftar via WhatsApp" : "Daftar Online",
              external: false,
            };

      return {
        slug: p.slug,
        title: p.title,
        shortDesc: p.shortDesc ?? null,
        description: p.description ?? null,
        categorySlug,
        categoryLabel: cat?.label ?? "",
        badge: p.badge ?? null,
        tags: Array.isArray(p.tags) ? p.tags : [],
        thumbnailUrl: p.thumbnailUrl ?? null,
        formatLabel: FORMAT_LABEL[p.format] ?? "",
        durationLabel: formatProgramDuration(p.duration),
        scheduleType: p.scheduleType === "scheduled" ? "scheduled" : "permanent",
        highlights: pickHighlights(p.highlight ?? null, sections),
        benefits: pickBenefits(sections),
        testimonials: pickTestimonials(sections),
        price: cheapest?.price ?? null,
        originalPrice:
          cheapest?.originalPrice && cheapest.originalPrice > cheapest.price
            ? cheapest.originalPrice
            : null,
        packages,
        nextBatchStart: nextBatch?.startDate
          ? new Date(nextBatch.startDate).toISOString()
          : null,
        detailHref: categorySlug
          ? `/programs/${categorySlug}/${p.slug}`
          : "/programs",
        register,
      };
    });

    return {
      categories: categoriesOut,
      programs: programsOut,
    };
  }),

  /** A single published category by slug (for /programs/[categorySlug]). */
  categoryBySlug: baseProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const category = await db.query.programCategories.findFirst({
        where: and(
          eq(programCategories.slug, input.slug),
          eq(programCategories.status, PUBLISHED),
        ),
      });
      return category ?? null; // null → caller falls back to static data
    }),

  /** All published programs within a category slug (for category listing). */
  programsByCategory: baseProcedure
    .input(z.object({ categorySlug: z.string().min(1) }))
    .query(async ({ input }) => {
      const category = await db.query.programCategories.findFirst({
        where: eq(programCategories.slug, input.categorySlug),
      });
      if (!category) return [];

      const progs = await db.query.programs.findMany({
        where: and(
          eq(programs.categoryId, category.id),
          eq(programs.status, PUBLISHED),
        ),
        orderBy: [asc(programs.createdAt)],
      });
      if (progs.length === 0) return [];

      // One query for all packages across these programs, then group.
      const pkgs = await db.query.programPackages.findMany({
        where: inArray(
          programPackages.programId,
          progs.map((p) => p.id),
        ),
        orderBy: [asc(programPackages.order)],
      });

      return progs.map((p) => {
        const packages = pkgs.filter((k) => k.programId === p.id);
        const prices = packages
          .map((k) => k.price)
          // Rp 0 = "hubungi admin" (no public price) → never the starting price.
          .filter((n): n is number => typeof n === "number" && n > 0);

        return {
          ...p,
          durationMinutes: p.duration,
          duration: formatProgramDuration(p.duration),
          packages,
          startingPrice: prices.length ? Math.min(...prices) : null,
        };
      });
    }),

  /**
   * Full published program detail by slug — the composite the detail page
   * needs: program row, its category, landing-content sections, batches (with
   * packages), and direct packages.
   */
  programDetailBySlug: baseProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: and(
          eq(programs.slug, input.slug),
          eq(programs.status, PUBLISHED),
        ),
      });
      if (!program) return null; // null → caller falls back to static

      const [category, content, batches, packages] = await Promise.all([
        db.query.programCategories.findFirst({
          where: eq(programCategories.id, program.categoryId),
        }),
        db.query.programContent.findFirst({
          where: eq(programContent.programId, program.id),
        }),
        db.query.programBatches.findMany({
          where: eq(programBatches.programId, program.id),
          orderBy: [asc(programBatches.order)],
          with: { packages: true },
        }),
        db.query.programPackages.findMany({
          where: eq(programPackages.programId, program.id),
          orderBy: [asc(programPackages.order)],
        }),
      ]);

      return {
        program: {
          ...program,
          durationMinutes: program.duration,
          duration: formatProgramDuration(program.duration),
        },
        category: category ?? null,
        sections: (content?.sections ?? []) as unknown[],
        theme: content?.theme ?? null,
        isPublished: content?.isPublished ?? false,
        batches: batches.map((b) => ({
          ...b,
          packages: [...(b.packages ?? [])].sort((a, c) => a.order - c.order),
        })),
        directPackages: packages.filter((p) => !p.batchId),
      };
    }),

  /**
   * Lightweight commerce payload for the registration form: just what's needed
   * to render package/batch choices and create an order.
   */
  registrationOptions: baseProcedure
    .input(z.object({ programSlug: z.string().min(1) }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: and(
          eq(programs.slug, input.programSlug),
          eq(programs.status, PUBLISHED),
        ),
      });
      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan atau belum dipublikasikan",
        });
      }

      const [batches, packages] = await Promise.all([
        db.query.programBatches.findMany({
          where: eq(programBatches.programId, program.id),
          orderBy: [asc(programBatches.order)],
          with: { packages: true },
        }),
        db.query.programPackages.findMany({
          where: eq(programPackages.programId, program.id),
          orderBy: [asc(programPackages.order)],
        }),
      ]);

      return {
        program: {
          id: program.id,
          slug: program.slug,
          title: program.title,
          scheduleType: program.scheduleType,
          categoryId: program.categoryId,
          registrationMethod: program.registrationMethod,
          // WhatsApp sign-ups go to this program's number, else the site default.
          whatsappNumber:
            normalizeWhatsappNumber(program.registrationWhatsapp) ??
            siteConfig.whatsapp,
          linkUrl: program.registrationLinkUrl,
          linkLabel: program.registrationLinkLabel,
        },
        batches: batches.map((b) => ({
          id: b.id,
          title: b.title,
          status: b.status,
          startDate: b.startDate,
          endDate: b.endDate,
          capacity: b.capacity,
          enrolledCount: b.enrolledCount,
          packages: [...(b.packages ?? [])]
            .sort((a, c) => a.order - c.order)
            .map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description ?? null,
              price: p.price,
              originalPrice: p.originalPrice,
              isDefault: p.isDefault,
            })),
        })),
        directPackages: packages
          .filter((p) => !p.batchId)
          .map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description ?? null,
            price: p.price,
            originalPrice: p.originalPrice,
            isDefault: p.isDefault,
          })),
      };
    }),
});