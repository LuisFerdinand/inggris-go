// app/modules/program/server/program.router.ts
import { z } from "zod";
import { and, asc, desc, eq, ilike, SQL, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";

import {
  updateContentSectionsSchema,
  removeContentSectionSchema,
} from "../program-content.schema";

import {
  programs,
  programBatches,
  programCategories,
  programContent,
  programPackages,
  enrollments,
} from "@/app/db/schema";

import type {
  ProgramFormat,
  ProgramLevel,
  ProgramScheduleType,
  ProgramStatus,
} from "@/lib/enums/enums";
import { PROGRAM_STATUS } from "@/lib/enums/enums";

import {
  programFilterSchema,
  programInsertSchema,
  programUpdateSchema,
} from "../program.schema";

import { generateUniqueSlug, getNextOrder } from "./program.slug";

/* =========================================================
   PUBLIC TYPES
========================================================= */

export type FilteredProgram = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  status: ProgramStatus;
  format: ProgramFormat;
  level: ProgramLevel;
  duration: number | null;
  scheduleType: ProgramScheduleType;
  registrationType: "online" | "offline";
  startingPrice: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  category: { id: string; label: string; slug: string } | null;
  batchCount: number;
  packageCount: number;
};

export type DetailData = Awaited<ReturnType<typeof buildDetail>>;
export type OverviewData = Awaited<ReturnType<typeof buildOverview>>;

/* =========================================================
   INPUT SCHEMAS
========================================================= */

const idInput = z.object({
  id: z.string().min(1),
});

const programIdInput = z.object({
  programId: z.string().min(1),
});

const identityInput = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDesc: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10),
  categoryId: z.string().min(1),
});

const structureInput = z.object({
  id: z.string().min(1),
  scheduleType: z.enum(["permanent", "scheduled"]),
  registrationType: z.enum(["online", "offline"]),
  format: z.enum(["online", "offline", "hybrid"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().int().min(1).nullable().optional(),
});

const marketingInput = z.object({
  id: z.string().min(1),
  badge: z.string().max(30).optional().or(z.literal("")),
  highlight: z.string().max(80).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(15),
});

const brandingInput = z.object({
  id: z.string().min(1),
  icon: z.string().nullable().optional(),
});

const activateContentSectionInput = z.object({
  programId: z.string().min(1),
  sectionId: z.string().min(1),
  sectionType: z.string().min(1),
});

const sectionVisibilityInput = z.object({
  programId: z.string().min(1),
  sectionId: z.string().min(1),
  visible: z.boolean(),
});

const sectionOrderInput = z.object({
  programId: z.string().min(1),
  sectionId: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

// const updateContentSectionsInput = z.object({
//   programId: z.string().min(1),
//   sections: z.array(z.any()),
// });


const updateContentThemeInput = z.object({
  programId: z.string().min(1),
  theme: z
    .object({
      primary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      foreground: z.string().optional(),
      gradient: z
        .object({
          from: z.string(),
          to: z.string(),
        })
        .optional(),
    })
    .nullable(),
});

/* =========================================================
   HELPERS
========================================================= */

async function getProgramCounts(programId: string) {
  const [counts] = await db
    .select({
      packagesCount: sql<number>`(
        select count(*) from ${programPackages}
        where ${programPackages.programId} = ${programId}
      )`.mapWith(Number),

      batchesCount: sql<number>`(
        select count(*) from ${programBatches}
        where ${programBatches.programId} = ${programId}
      )`.mapWith(Number),

      openBatchesCount: sql<number>`(
        select count(*) from ${programBatches}
        where ${programBatches.programId} = ${programId}
          and ${programBatches.status} = 'open'
      )`.mapWith(Number),

      enrollmentsCount: sql<number>`(
        select count(*) from ${enrollments}
        where ${enrollments.programId} = ${programId}
      )`.mapWith(Number),
    })
    .from(programs)
    .where(eq(programs.id, programId));

  return (
    counts ?? {
      packagesCount: 0,
      batchesCount: 0,
      openBatchesCount: 0,
      enrollmentsCount: 0,
    }
  );
}

async function fetchProgramWithCategory(id: string) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, id),
    with: { category: true },
  });

  if (!program) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Program tidak ditemukan",
    });
  }

  return program;
}

async function fetchProgramContent(programId: string) {
  return db.query.programContent.findFirst({
    where: eq(programContent.programId, programId),
  });
}

async function ensureProgramContent(programId: string) {
  const existing = await fetchProgramContent(programId);

  if (existing) return existing;

  const [row] = await db
    .insert(programContent)
    .values({
      id: crypto.randomUUID(),
      programId,
      sections: [],
      theme: null,
      isPublished: false,
    })
    .returning();

  return row;
}

function visibleSectionsCount(sections: unknown) {
  if (!Array.isArray(sections)) return 0;

  return sections.filter((section: any) => section?.visible !== false).length;
}

function buildPublicUrl(categorySlug: string, programSlug: string) {
  return `/programs/${categorySlug}/${programSlug}`;
}

function createDefaultSection(sectionId: string, sectionType: string) {
  const base = {
    id: sectionId,
    type: sectionType,
    visible: true,
  };

  switch (sectionType) {
    case "hero":
      return {
        ...base,
        content: {
          image: "",
          label: "Program Unggulan",
          tagline: "Judul utama program",
          taglineAccent: "yang menarik",
          description: "",
          subtitle: "",
          highlight: "",
          tags: [],
          cta: [],
          socialProof: undefined,
        },
      };

    case "why":
      return {
        ...base,
        content: {
          title: "Kenapa program ini penting?",
          tagline: "Masalah yang",
          taglineAccent: "sering terjadi",
          subtitle: "",
          icon: "",
          conclusion: undefined,
          items: [],
        },
      };

    case "benefits":
      return {
        ...base,
        content: {
          title: "Benefit Program",
          tagline: "Yang Akan",
          taglineAccent: "Kamu Dapatkan",
          subtitle: "",
          icon: "",
          conclusion: undefined,
          images: [],
          items: [],
        },
      };

    case "steps":
      return {
        ...base,
        content: {
          title: "Cara Kerja Program",
          tagline: "Langkah",
          taglineAccent: "Belajar",
          subtitle: "",
          icon: "",
          items: [],
        },
      };

    case "timeline":
      return {
        ...base,
        content: {
          icon: "calendar",
          tagline: "Timeline",
          taglineAccent: "Program",
          title: "Timeline Program",
          subtitle: "",
          meta: [],
          weeks: [],
        },
      };

    case "gallery":
      return {
        ...base,
        content: {
          icon: "",
          tagline: "Dokumentasi",
          taglineAccent: "Program",
          title: "Galeri Kegiatan",
          subtitle: "",
          photos: [],
          trustSignals: [],
        },
      };

    case "classes":
      return {
        ...base,
        content: {
          title: "Pilihan Kelas",
          tagline: "Pilih",
          taglineAccent: "Kelas",
          subtitle: "",
          layout: "grid",
          info: [],
          items: [],
        },
      };

    case "facilities":
      return {
        ...base,
        content: {
          title: "Fasilitas",
          tagline: "Fasilitas",
          taglineAccent: "Tersedia",
          subtitle: "",
          visuals: [],
          items: [],
        },
      };

    case "mentorship":
      return {
        ...base,
        content: {
          tagline: "Dibimbing",
          taglineAccent: "Langsung",
          title: "Mentor Terpercaya",
          subtitle: "",
          highlight: "",
          items: [],
          visuals: [],
        },
      };

    case "pricing":
      return {
        ...base,
        content: {
          globalNote: "",
          title: "Harga Program",
          description: "",
          groups: [],
          bonusTitle: "",
          bonusNote: "",
          bonus: [],
          urgency: "",
        },
      };

    case "bonus":
      return {
        ...base,
        content: {
          title: "Bonus Program",
          items: [],
        },
      };

    case "testimonials":
      return {
        ...base,
        content: {
          title: "Apa Kata Alumni",
          items: [],
        },
      };

    case "faq":
      return {
        ...base,
        content: [],
      };

    case "cta":
      return {
        ...base,
        content: {
          title: "Siap Mulai?",
          titleAccent: "",
          subtitle: "",
          highlight: "",
          cta: {
            label: "Daftar Sekarang",
            href: "",
            note: "",
          },
          urgency: "",
        },
      };

    case "batches":
      return {
        ...base,
        content: {
          variant: "card",
          tagline: "Pilih Batch",
          taglineAccent: "Terdekat",
          title: "Batch Tersedia",
          subtitle: "",
          emptyMessage:
            "Saat ini belum ada batch tersedia. Hubungi admin untuk info berikutnya.",
        },
      };

    default:
      return {
        ...base,
        content: {},
      };
  }
}

/* =========================================================
   BUILDERS
========================================================= */

async function buildDetail(id: string) {
  const program = await fetchProgramWithCategory(id);
  const counts = await getProgramCounts(id);
  const content = await fetchProgramContent(id);

  const category = program.category;

  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    description: program.description,
    shortDesc: program.shortDesc,
    categoryId: program.categoryId,

    category: {
      id: category.id,
      label: category.label,
      shortLabel: category.shortLabel,
      slug: category.slug,
      themePrimary: category.themePrimary,
      icon: category.icon,
    },

    scheduleType: program.scheduleType,
    registrationType: program.registrationType,
    format: program.format,
    level: program.level,
    duration: program.duration,

    badge: program.badge,
    highlight: program.highlight,
    tags: program.tags,

    thumbnailUrl: program.thumbnailUrl,
    thumbnailKey: program.thumbnailKey,
    thumbnailBlurDataUrl: program.thumbnailBlurDataUrl,
    icon: program.icon,

    status: program.status,
    publishedAt: program.publishedAt,
    updatedAt: program.updatedAt,
    createdAt: program.createdAt,

    startingPrice: program.startingPrice,
    startingOriginalPrice: program.startingOriginalPrice,
    budget: program.budget,

    packagesCount: counts.packagesCount,
    activePackagesCount: counts.packagesCount,

    batchesCount: counts.batchesCount,
    openBatchesCount: counts.openBatchesCount,

    enrollmentsCount: counts.enrollmentsCount,

    hasEnrollments: counts.enrollmentsCount > 0,
    hasPackages: counts.packagesCount > 0,
    hasBatches: counts.batchesCount > 0,

    content: {
      id: content?.id ?? null,
      programId: program.id,
      theme: content?.theme ?? null,
      sections,
      isPublished: content?.isPublished ?? false,
      createdAt: content?.createdAt ?? null,
      updatedAt: content?.updatedAt ?? null,

      sectionsCount: sections.length,
      activeSectionsCount: sections.filter(
        (section: any) => section?.visible !== false,
      ).length,
    },
  };
}
async function buildOverview(id: string) {
  const program = await fetchProgramWithCategory(id);
  const counts = await getProgramCounts(id);
  const category = program.category;
  const content = await fetchProgramContent(id);

  const sections = Array.isArray(content?.sections) ? content.sections : [];
  const sectionsCount = sections.length;
  const activeSectionsCount = visibleSectionsCount(sections);

  const publicUrl = buildPublicUrl(category.slug, program.slug);

  const hasThumbnail = !!program.thumbnailUrl;
  const hasContent = sectionsCount > 0;
  const hasActiveContent = activeSectionsCount > 0;
  const hasPackages = counts.packagesCount > 0;
  const hasBatches = counts.batchesCount > 0;

  const checks =
    program.scheduleType === "scheduled"
      ? [hasThumbnail, hasPackages, hasBatches, hasActiveContent]
      : [hasThumbnail, hasPackages, hasActiveContent];

  const passed = checks.filter(Boolean).length;
  const setupProgress = Math.round((passed / checks.length) * 100);

  const issues: string[] = [];

  if (!hasThumbnail) issues.push("Thumbnail belum diunggah");
  if (!hasPackages) issues.push("Paket harga belum dibuat");
  if (program.scheduleType === "scheduled" && !hasBatches) {
    issues.push("Batch belum dibuat");
  }
  if (!hasContent) issues.push("Konten landing page kosong");
  else if (!hasActiveContent) issues.push("Semua section landing page nonaktif");

  const canPublish =
    hasThumbnail &&
    hasPackages &&
    hasActiveContent &&
    (program.scheduleType === "permanent" || hasBatches);

  return {
    identity: {
      id: program.id,
      title: program.title,
      slug: program.slug,
      shortDesc: program.shortDesc,
      thumbnailUrl: program.thumbnailUrl,
      category: {
        id: category.id,
        label: category.label,
        slug: category.slug,
      },
      badge: program.badge,
      highlight: program.highlight,
      status: program.status,
    },

    publishing: {
      status: program.status,
      publishedAt: program.publishedAt,
      publicUrl,
    },

    metrics: {
      batchesCount: counts.batchesCount,
      openBatchesCount: counts.openBatchesCount,
      packagesCount: counts.packagesCount,
      contentSectionsCount: sectionsCount,
      activeContentSectionsCount: activeSectionsCount,
      enrollmentsCount: counts.enrollmentsCount,
      startingPrice: program.startingPrice,
      startingOriginalPrice: program.startingOriginalPrice,
      budget: program.budget,
    },

    configuration: {
      scheduleType: program.scheduleType,
      registrationType: program.registrationType,
      format: program.format,
      level: program.level,
      duration: program.duration,
    },

    health: {
      setupProgress,
      issues,
      hasThumbnail,
      hasContent,
      hasActiveContent,
      hasPackages,
      hasBatches,
    },

    quickActions: {
      canPublish,
      canCreateBatch: program.scheduleType === "scheduled",
      canCreatePackage: true,
      canEditContent: true,
    },

    activity: {
      updatedAt: program.updatedAt,
      contentUpdatedAt: content?.updatedAt ?? null,
      createdAt: program.createdAt,
    },
  };
}

/* =========================================================
   ROUTER
========================================================= */

export const programRouter = createTRPCRouter({
  /* ────────────────────────────────────────────────────────
     LIST
  ───────────────────────────────────────────────────────── */

  getFiltered: protectedProcedure
    .input(programFilterSchema)
    .query(async ({ input }): Promise<FilteredProgram[]> => {
      const conditions: SQL[] = [];

      if (input.status) conditions.push(eq(programs.status, input.status));
      if (input.categoryId) conditions.push(eq(programs.categoryId, input.categoryId));
      if (input.format) conditions.push(eq(programs.format, input.format));
      if (input.level) conditions.push(eq(programs.level, input.level));
      if (input.scheduleType) conditions.push(eq(programs.scheduleType, input.scheduleType));
      if (input.registrationType) {
        conditions.push(eq(programs.registrationType, input.registrationType));
      }
      if (input.searchQuery) {
        conditions.push(ilike(programs.title, `%${input.searchQuery}%`));
      }

      const rows = await db
        .select({
          id: programs.id,
          title: programs.title,
          slug: programs.slug,
          thumbnailUrl: programs.thumbnailUrl,
          status: programs.status,
          format: programs.format,
          level: programs.level,
          duration: programs.duration,
          scheduleType: programs.scheduleType,
          registrationType: programs.registrationType,
          startingPrice: programs.startingPrice,
          createdAt: programs.createdAt,
          updatedAt: programs.updatedAt,

          categoryId: programCategories.id,
          categoryLabel: programCategories.label,
          categorySlug: programCategories.slug,

          batchCount: sql<number>`(
            select count(*) from ${programBatches}
            where ${programBatches.programId} = ${programs.id}
          )`.mapWith(Number),

          packageCount: sql<number>`(
            select count(*) from ${programPackages}
            where ${programPackages.programId} = ${programs.id}
          )`.mapWith(Number),
        })
        .from(programs)
        .leftJoin(
          programCategories,
          eq(programs.categoryId, programCategories.id),
        )
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(programs.createdAt));

      return rows.map(({ categoryId, categoryLabel, categorySlug, ...row }) => ({
        ...row,
        category:
          categoryId && categoryLabel && categorySlug
            ? {
                id: categoryId,
                label: categoryLabel,
                slug: categorySlug,
              }
            : null,
      }));
    }),

  /* ────────────────────────────────────────────────────────
     HEADER / BASIC QUERIES
  ───────────────────────────────────────────────────────── */

  getHeader: protectedProcedure.input(idInput).query(async ({ input }) => {
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, input.id),
      columns: {
        id: true,
        title: true,
        slug: true,
        status: true,
        thumbnailUrl: true,
        scheduleType: true,
        registrationType: true,
        format: true,
        level: true,
        updatedAt: true,
      },
      with: {
        category: {
          columns: {
            id: true,
            label: true,
            slug: true,
            icon: true,
            themePrimary: true,
          },
        },
      },
    });

    if (!program) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program tidak ditemukan",
      });
    }

    return {
      ...program,
      publicUrl: program.category
        ? buildPublicUrl(program.category.slug, program.slug)
        : null,
    };
  }),

  getCategories: protectedProcedure.query(async () => {
    return db
      .select({
        id: programCategories.id,
        label: programCategories.label,
        slug: programCategories.slug,
        icon: programCategories.icon,
      })
      .from(programCategories)
      .orderBy(programCategories.order);
  }),

  getById: protectedProcedure.input(idInput).query(async ({ input }) => {
    return fetchProgramWithCategory(input.id);
  }),

  getDetail: protectedProcedure
    .input(idInput)
    .query(async ({ input }): Promise<DetailData> => {
      return buildDetail(input.id);
    }),

  getOverview: protectedProcedure
    .input(idInput)
    .query(async ({ input }): Promise<OverviewData> => {
      return buildOverview(input.id);
    }),

  getUniqueSlug: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        excludeId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        idColumn: programs.id,
        title: input.title,
        excludeId: input.excludeId,
      });

      return { slug };
    }),

  /* ────────────────────────────────────────────────────────
     BATCHES SUMMARY
  ───────────────────────────────────────────────────────── */

  getBatches: protectedProcedure.input(idInput).query(async ({ input }) => {
    const program = await fetchProgramWithCategory(input.id);

    const batchRows = await db.query.programBatches.findMany({
      where: eq(programBatches.programId, input.id),
      orderBy: [asc(programBatches.order)],
      with: {
        packages: true,
      },
    });

    const counts = await getProgramCounts(input.id);

    const batches = batchRows.map((batch) => {
      const occupancyRate =
        batch.capacity && batch.capacity > 0
          ? batch.enrolledCount / batch.capacity
          : 0;

      const isFull = !!batch.capacity && batch.enrolledCount >= batch.capacity;

      return {
        ...batch,
        teacher: null as {
          id: string;
          name: string;
          avatar?: string | null;
        } | null,
        ui: {
          isAlmostFull: occupancyRate >= 0.8 && !isFull,
          isFull,
          isOpen: batch.status === "open",
          isOngoing: batch.status === "ongoing",
          occupancyRate,
        },
      };
    });

    return {
      program: {
        id: program.id,
        scheduleType: program.scheduleType,
      },
      batches,
      metrics: {
        batchesCount: counts.batchesCount,
        openBatchesCount: counts.openBatchesCount,
      },
    };
  }),

  /* ────────────────────────────────────────────────────────
     CONTENT CMS
  ───────────────────────────────────────────────────────── */

  getContent: protectedProcedure.input(programIdInput).query(async ({ input }) => {
    const content = await fetchProgramContent(input.programId);

    return {
      id: content?.id ?? null,
      programId: input.programId,
      theme: content?.theme ?? null,
      isPublished: content?.isPublished ?? false,
      sections: content?.sections ?? [],
      createdAt: content?.createdAt ?? null,
      updatedAt: content?.updatedAt ?? null,
    };
  }),

  ensureContent: protectedProcedure
    .input(programIdInput)
    .mutation(async ({ input }) => {
      return ensureProgramContent(input.programId);
    }),

  activateContentSection: protectedProcedure
    .input(activateContentSectionInput)
    .mutation(async ({ input }) => {
      const content = await ensureProgramContent(input.programId);

      const sections = Array.isArray(content.sections)
        ? [...content.sections]
        : [];

      const existingIndex = sections.findIndex(
        (section: any) => section?.id === input.sectionId,
      );

      if (existingIndex >= 0) {
        sections[existingIndex] = {
          ...sections[existingIndex],
          visible: true,
        };
      } else {
        sections.push(createDefaultSection(input.sectionId, input.sectionType) as any);
      }

      const [row] = await db
        .update(programContent)
        .set({
          sections: sections as any,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, content.id))
        .returning();

      return row;
    }),

  updateContentSections: protectedProcedure
    .input(updateContentSectionsSchema)
    .mutation(async ({ input }) => {
      const existing = await ensureProgramContent(input.programId);

      const [row] = await db
        .update(programContent)
        .set({
          sections: input.sections as any,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, existing.id))
        .returning();

      return row;
    }),

  updateContentTheme: protectedProcedure
    .input(updateContentThemeInput)
    .mutation(async ({ input }) => {
      const existing = await ensureProgramContent(input.programId);

      const [row] = await db
        .update(programContent)
        .set({
          theme: input.theme,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, existing.id))
        .returning();

      return row;
    }),

  toggleSectionVisibility: protectedProcedure
    .input(sectionVisibilityInput)
    .mutation(async ({ input }) => {
      const content = await ensureProgramContent(input.programId);

      const sections = Array.isArray(content.sections)
        ? [...content.sections]
        : [];

      const sectionExists = sections.some(
        (section: any) => section?.id === input.sectionId,
      );

      if (!sectionExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section tidak ditemukan",
        });
      }

      const nextSections = sections.map((section: any) => {
        if (section?.id !== input.sectionId) return section;

        return {
          ...section,
          visible: input.visible,
        };
      });

      const [row] = await db
        .update(programContent)
        .set({
          sections: nextSections as any,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, content.id))
        .returning();

      return row;
    }),

  moveSection: protectedProcedure
    .input(sectionOrderInput)
    .mutation(async ({ input }) => {
      const existing = await ensureProgramContent(input.programId);

      const sections = Array.isArray(existing.sections)
        ? [...existing.sections]
        : [];

      const currentIndex = sections.findIndex(
        (section: any) => section?.id === input.sectionId,
      );

      if (currentIndex === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section tidak ditemukan",
        });
      }

      const targetIndex =
        input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sections.length) {
        return existing;
      }

      const current = sections[currentIndex];
      const target = sections[targetIndex];

      sections[currentIndex] = target;
      sections[targetIndex] = current;

      const [row] = await db
        .update(programContent)
        .set({
          sections: sections as any,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, existing.id))
        .returning();

      return row;
    }),

  setContentPublished: protectedProcedure
    .input(
      z.object({
        programId: z.string().min(1),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await ensureProgramContent(input.programId);

      const [row] = await db
        .update(programContent)
        .set({
          isPublished: input.isPublished,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, existing.id))
        .returning();

      return row;
    }),

  removeContentSection: protectedProcedure
    .input(removeContentSectionSchema)
    .mutation(async ({ input }) => {
      const content = await ensureProgramContent(input.programId);

      const sections = Array.isArray(content.sections)
        ? [...content.sections]
        : [];

      const next = sections.filter(
        (section: any) => section?.id !== input.sectionId,
      );

      if (next.length === sections.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section tidak ditemukan",
        });
      }

      const [row] = await db
        .update(programContent)
        .set({
          sections: next as any,
          updatedAt: new Date(),
        })
        .where(eq(programContent.id, content.id))
        .returning();

      return row;
    }),

  /* ────────────────────────────────────────────────────────
     CREATE / UPDATE
  ───────────────────────────────────────────────────────── */

  create: protectedProcedure.input(programInsertSchema).mutation(async ({ input }) => {
    const { order: _ignoredOrder, ...values } = input;

    const slug = await generateUniqueSlug({
      table: programs,
      slugColumn: programs.slug,
      title: input.slug || input.title,
    });

    const order = await getNextOrder({
      table: programs,
      orderColumn: programs.order,
    });

    const [row] = await db
      .insert(programs)
      .values({
        ...values,
        id: crypto.randomUUID(),
        slug,
        order,
        publishedAt: input.status === "published" ? new Date() : null,
      })
      .returning();

    await db.insert(programContent).values({
      id: crypto.randomUUID(),
      programId: row.id,
      sections: [],
      theme: null,
      isPublished: false,
    });

    return row;
  }),

  update: protectedProcedure.input(programUpdateSchema).mutation(async ({ input }) => {
    const { id, slug, ...rest } = input;

    const nextSlug = slug
      ? await generateUniqueSlug({
          table: programs,
          slugColumn: programs.slug,
          idColumn: programs.id,
          title: slug,
          excludeId: id,
        })
      : undefined;

    const [row] = await db
      .update(programs)
      .set({
        ...rest,
        ...(nextSlug ? { slug: nextSlug } : {}),
        ...(rest.status === "published" ? { publishedAt: new Date() } : {}),
      })
      .where(eq(programs.id, id))
      .returning();

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program tidak ditemukan",
      });
    }

    return row;
  }),

  updateIdentity: protectedProcedure
    .input(identityInput)
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;

      const nextSlug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        idColumn: programs.id,
        title: slug,
        excludeId: id,
      });

      const [row] = await db
        .update(programs)
        .set({
          ...rest,
          shortDesc: rest.shortDesc || null,
          slug: nextSlug,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return { id: row.id, slug: row.slug };
    }),

  updateStructure: protectedProcedure
    .input(structureInput)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      const [row] = await db
        .update(programs)
        .set({
          scheduleType: rest.scheduleType,
          registrationType: rest.registrationType,
          format: rest.format,
          level: rest.level,
          duration: rest.duration ?? null,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return row;
    }),

  updateMarketing: protectedProcedure
    .input(marketingInput)
    .mutation(async ({ input }) => {
      const { id, badge, highlight, tags } = input;

      const [row] = await db
        .update(programs)
        .set({
          badge: badge || null,
          highlight: highlight || null,
          tags,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return row;
    }),

  updateBranding: protectedProcedure
    .input(brandingInput)
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({
          icon: input.icon ?? null,
        })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return row;
    }),

  removeThumbnail: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    const [row] = await db
      .update(programs)
      .set({
        thumbnailUrl: null,
        thumbnailKey: null,
        thumbnailBlurDataUrl: null,
      })
      .where(eq(programs.id, input.id))
      .returning();

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program tidak ditemukan",
      });
    }

    return row;
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(PROGRAM_STATUS),
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({
          status: input.status,
          ...(input.status === "published" ? { publishedAt: new Date() } : {}),
        })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return row;
    }),

  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(PROGRAM_STATUS),
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({
          status: input.status,
          ...(input.status === "published" ? { publishedAt: new Date() } : {}),
        })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return row;
    }),

  /* ────────────────────────────────────────────────────────
     DUPLICATE / DELETE
  ───────────────────────────────────────────────────────── */

  duplicate: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    const original = await db.query.programs.findFirst({
      where: eq(programs.id, input.id),
    });

    if (!original) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program tidak ditemukan",
      });
    }

    const originalContent = await fetchProgramContent(input.id);

    const {
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      publishedAt: _publishedAt,
      order: _order,
      ...rest
    } = original;

    const slug = await generateUniqueSlug({
      table: programs,
      slugColumn: programs.slug,
      title: `${original.title} Salinan`,
    });

    const nextOrder = await getNextOrder({
      table: programs,
      orderColumn: programs.order,
    });

    const [row] = await db
      .insert(programs)
      .values({
        ...rest,
        id: crypto.randomUUID(),
        title: `${original.title} (Salinan)`,
        slug,
        order: nextOrder,
        status: "draft",
        publishedAt: null,
      })
      .returning();

    await db.insert(programContent).values({
      id: crypto.randomUUID(),
      programId: row.id,
      sections: originalContent?.sections ?? [],
      theme: originalContent?.theme ?? null,
      isPublished: false,
    });

    return row;
  }),

  remove: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    await db.delete(programs).where(eq(programs.id, input.id));
    return { success: true };
  }),
});
