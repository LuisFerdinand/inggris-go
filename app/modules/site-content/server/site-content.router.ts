// app/modules/site-content/server/site-content.router.ts

import { revalidatePath } from "next/cache";
import { and, asc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { role, userRole } from "@/app/db/schema/roles";
import { user } from "@/app/db/schema/auth-schema";
import { programs, programCategories } from "@/app/db/schema/programs";
import {
  aboutPageSettings,
  contactPageSettings,
  homePageSettings,
  siteCtaSettings,
} from "@/app/db/schema/site-content";

import {
  updateAboutInput,
  updateContactInput,
  updateCtaInput,
  updateHomeInput,
  updateProgramShowcaseInput,
} from "../site-content.schema";
import type { Role } from "@/app/db/schema/roles";
import type { TeamMember, TeamMemberOverrideMap } from "../site-content.types";
import {
  getAboutPageSettings,
  getContactPage,
  getHomePage,
  getSiteCta,
  getSiteStats,
  SITE_CONTENT_ID,
} from "./site-content.service";

/* =========================================================
   AUTH
========================================================= */

const EMPLOYEE_ROLES: Role[] = [
  "teacher",
  "author",
  "operational_manager",
  "admin",
  "super_admin",
];

const PUBLIC_ROLE_TITLE: Record<string, string> = {
  teacher: "Tutor",
  author: "Content Author",
  operational_manager: "Operational Manager",
  admin: "Admin",
  super_admin: "Founder & Director",
};

/** Higher = more senior; used to pick a person's headline role. */
const ROLE_RANK: Record<string, number> = {
  teacher: 1,
  author: 2,
  operational_manager: 3,
  admin: 4,
  super_admin: 5,
};

function getActorUserId(ctx: unknown) {
  const c = ctx as {
    authUserId?: string | null;
    auth?: { userId?: string | null };
    session?: { user?: { id?: string | null } };
  };
  return c.authUserId ?? c.auth?.userId ?? c.session?.user?.id ?? null;
}

async function assertCanManageSiteContent(ctx: unknown) {
  const actorUserId = getActorUserId(ctx);

  if (!actorUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Anda harus login terlebih dahulu.",
    });
  }

  const rows = await db
    .select({ roleName: role.name })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(eq(userRole.userId, actorUserId));

  const allowed = rows.some(
    (row) => row.roleName === "admin" || row.roleName === "super_admin",
  );

  if (!allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Hanya admin yang bisa mengubah konten halaman.",
    });
  }
}

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** revalidatePath throws outside a request scope — never let that break a save. */
function safeRevalidate(...paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      /* not in a request context (e.g. script) — ignore */
    }
  }
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

async function resolveTeam(
  overrides: TeamMemberOverrideMap | null | undefined,
): Promise<TeamMember[]> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      roleName: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .innerJoin(user, eq(user.id, userRole.userId))
    .where(inArray(role.name, EMPLOYEE_ROLES));

  const byUser = new Map<
    string,
    { id: string; name: string; image: string | null; roles: string[] }
  >();

  for (const row of rows) {
    const entry = byUser.get(row.id) ?? {
      id: row.id,
      name: row.name,
      image: row.image,
      roles: [],
    };
    entry.roles.push(row.roleName);
    byUser.set(row.id, entry);
  }

  const ov = overrides ?? {};

  const members = [...byUser.values()]
    .map((u, index) => {
      const topRole = [...u.roles].sort(
        (a, b) => (ROLE_RANK[b] ?? 0) - (ROLE_RANK[a] ?? 0),
      )[0];
      const o = ov[u.id] ?? {};
      return {
        id: u.id,
        name: u.name,
        title: o.title?.trim() || PUBLIC_ROLE_TITLE[topRole] || "Tim Inggris Go",
        imageUrl: o.imageUrl?.trim() || u.image || null,
        initials: initialsFrom(u.name),
        order: o.order ?? index,
        hidden: o.hidden ?? false,
      };
    })
    .filter((m) => !m.hidden)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((m) => ({
      id: m.id,
      name: m.name,
      title: m.title,
      imageUrl: m.imageUrl,
      initials: m.initials,
      order: m.order,
    }));

  return members;
}

/* =========================================================
   ROUTER
========================================================= */

export const siteContentRouter = createTRPCRouter({
  /* ── Public reads ──────────────────────────────────── */

  getHome: baseProcedure.query(() => getHomePage()),

  getAbout: baseProcedure.query(async () => {
    const settings = await getAboutPageSettings();
    const team = await resolveTeam(settings.teamMemberOverrides);
    return { ...settings, team };
  }),

  getContact: baseProcedure.query(() => getContactPage()),

  getCta: baseProcedure.query(() => getSiteCta()),

  getSiteStats: baseProcedure.query(() => getSiteStats()),

  /* ── Admin: team candidates for the About CMS editor ─ */

  getTeamCandidates: protectedProcedure.query(async ({ ctx }) => {
    await assertCanManageSiteContent(ctx);

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roleName: role.name,
      })
      .from(userRole)
      .innerJoin(role, eq(role.id, userRole.roleId))
      .innerJoin(user, eq(user.id, userRole.userId))
      .where(inArray(role.name, EMPLOYEE_ROLES));

    const byUser = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        image: string | null;
        roles: string[];
      }
    >();

    for (const row of rows) {
      const entry = byUser.get(row.id) ?? {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        roles: [],
      };
      entry.roles.push(row.roleName);
      byUser.set(row.id, entry);
    }

    return [...byUser.values()]
      .map((u) => ({
        ...u,
        topRole: [...u.roles].sort(
          (a, b) => (ROLE_RANK[b] ?? 0) - (ROLE_RANK[a] ?? 0),
        )[0],
        defaultTitle:
          PUBLIC_ROLE_TITLE[
            [...u.roles].sort(
              (a, b) => (ROLE_RANK[b] ?? 0) - (ROLE_RANK[a] ?? 0),
            )[0]
          ] ?? "Tim Inggris Go",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }),

  /* ── Admin: selectable published programs (Footer CMS) ─ */

  getSelectablePrograms: protectedProcedure.query(async ({ ctx }) => {
    await assertCanManageSiteContent(ctx);

    const rows = await db
      .select({
        title: programs.title,
        slug: programs.slug,
        categorySlug: programCategories.slug,
      })
      .from(programs)
      .innerJoin(
        programCategories,
        eq(programCategories.id, programs.categoryId),
      )
      .where(
        and(
          eq(programs.status, "published"),
          eq(programCategories.status, "published"),
        ),
      )
      .orderBy(asc(programs.title));

    return rows.map((r) => ({
      label: r.title,
      href: `/programs/${r.categorySlug}/${r.slug}`,
    }));
  }),

  /* ── Admin: mutations ──────────────────────────────── */

  updateHome: protectedProcedure
    .input(updateHomeInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSiteContent(ctx);

      const values = {
        id: SITE_CONTENT_ID,
        heroBadgeText: cleanText(input.heroBadgeText),
        heroTitle: cleanText(input.heroTitle),
        heroTitleAccent: cleanText(input.heroTitleAccent),
        heroSubtitle: cleanText(input.heroSubtitle),
        heroSubtitleHighlight: cleanText(input.heroSubtitleHighlight),
        heroDescription: cleanText(input.heroDescription),
        heroImageUrl: cleanText(input.heroImageUrl),
        heroImageAlt: cleanText(input.heroImageAlt),
        heroPrimaryCtaLabel: cleanText(input.heroPrimaryCtaLabel),
        heroPrimaryCtaHref: cleanText(input.heroPrimaryCtaHref),
        heroSecondaryCtaLabel: cleanText(input.heroSecondaryCtaLabel),
        heroSecondaryCtaHref: cleanText(input.heroSecondaryCtaHref),
        heroFloatingText: input.heroFloatingText ?? null,
        heroStatLabels: input.heroStatLabels ?? null,

        problemEyebrow: cleanText(input.problemEyebrow),
        problemTitle: cleanText(input.problemTitle),
        problemTitleAccent: cleanText(input.problemTitleAccent),
        problemDescription: cleanText(input.problemDescription),
        problemCards: input.problemCards ?? null,
        problemCalloutText: cleanText(input.problemCalloutText),
        problemCalloutHighlight: cleanText(input.problemCalloutHighlight),
        problemCalloutIcon: cleanText(input.problemCalloutIcon),

        methodEyebrow: cleanText(input.methodEyebrow),
        methodTitle: cleanText(input.methodTitle),
        methodTitleAccent: cleanText(input.methodTitleAccent),
        methodDescription: cleanText(input.methodDescription),
        methodSteps: input.methodSteps ?? null,
        methodFootnotePrefix: cleanText(input.methodFootnotePrefix),
        methodFootnoteHighlight: cleanText(input.methodFootnoteHighlight),
        methodFootnoteSuffix: cleanText(input.methodFootnoteSuffix),

        advantageEyebrow: cleanText(input.advantageEyebrow),
        advantageTitle: cleanText(input.advantageTitle),
        advantageTitleAccent: cleanText(input.advantageTitleAccent),
        advantageDescription: cleanText(input.advantageDescription),
        advantageFeatures: input.advantageFeatures ?? null,

        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(homePageSettings)
        .values(values)
        .onConflictDoUpdate({ target: homePageSettings.id, set: values })
        .returning();

      safeRevalidate("/");
      return row;
    }),

  updateProgramShowcase: protectedProcedure
    .input(updateProgramShowcaseInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSiteContent(ctx);

      // Only this column is written, so the rest of the Beranda CMS is untouched.
      const [row] = await db
        .insert(homePageSettings)
        .values({
          id: SITE_CONTENT_ID,
          programShowcase: input,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: homePageSettings.id,
          set: { programShowcase: input, updatedAt: new Date() },
        })
        .returning();

      safeRevalidate("/");
      return row;
    }),

  updateAbout: protectedProcedure
    .input(updateAboutInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSiteContent(ctx);

      const values = {
        id: SITE_CONTENT_ID,
        heroLocationBadge: cleanText(input.heroLocationBadge),
        heroSectionBadge: cleanText(input.heroSectionBadge),
        heroOverline: cleanText(input.heroOverline),
        heroTitle: cleanText(input.heroTitle),
        heroTitleAccent: cleanText(input.heroTitleAccent),
        heroDescription: cleanText(input.heroDescription),
        heroStatLabels: input.heroStatLabels ?? null,
        heroTeamStripLabel: cleanText(input.heroTeamStripLabel),
        heroEditorial: input.heroEditorial ?? null,

        whoEyebrow: cleanText(input.whoEyebrow),
        whoTitle: cleanText(input.whoTitle),
        whoParagraphs: input.whoParagraphs ?? null,
        whoTags: input.whoTags ?? null,
        whoImageUrl: cleanText(input.whoImageUrl),
        whoFilosofiQuote: cleanText(input.whoFilosofiQuote),
        whoFilosofiDescription: cleanText(input.whoFilosofiDescription),
        whoFounderName: cleanText(input.whoFounderName),
        whoFounderRole: cleanText(input.whoFounderRole),
        whoFounderInitials: cleanText(input.whoFounderInitials),
        whoFounderImageUrl: cleanText(input.whoFounderImageUrl),
        whoLocationLine: cleanText(input.whoLocationLine),

        vmEyebrow: cleanText(input.vmEyebrow),
        vmTitle: cleanText(input.vmTitle),
        vmTitleAccent: cleanText(input.vmTitleAccent),
        visionBadge: cleanText(input.visionBadge),
        visionStatement: cleanText(input.visionStatement),
        visionStatementAccent: cleanText(input.visionStatementAccent),
        visionFooterNote: cleanText(input.visionFooterNote),
        missions: input.missions ?? null,

        teamMemberOverrides: input.teamMemberOverrides ?? null,

        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(aboutPageSettings)
        .values(values)
        .onConflictDoUpdate({ target: aboutPageSettings.id, set: values })
        .returning();

      safeRevalidate("/about");
      return row;
    }),

  updateContact: protectedProcedure
    .input(updateContactInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSiteContent(ctx);

      const values = {
        id: SITE_CONTENT_ID,
        heroBadgeText: cleanText(input.heroBadgeText),
        heroTitle: cleanText(input.heroTitle),
        heroTitleAccent: cleanText(input.heroTitleAccent),
        heroDescription: cleanText(input.heroDescription),
        heroTrustPills: input.heroTrustPills ?? null,
        heroStats: input.heroStats ?? null,
        heroImageUrl: cleanText(input.heroImageUrl),

        methodsEyebrow: cleanText(input.methodsEyebrow),
        methodsTitle: cleanText(input.methodsTitle),
        methodsSubtitle: cleanText(input.methodsSubtitle),
        methods: input.methods ?? null,

        formRecipientEmail: cleanText(input.formRecipientEmail),
        formEyebrow: cleanText(input.formEyebrow),
        formTitle: cleanText(input.formTitle),
        formSubtitle: cleanText(input.formSubtitle),
        formCategories: input.formCategories ?? null,
        infoItems: input.infoItems ?? null,
        faqItems: input.faqItems ?? null,
        faqSeeAllHref: cleanText(input.faqSeeAllHref),
        sidebarCtaTitle: cleanText(input.sidebarCtaTitle),
        sidebarCtaText: cleanText(input.sidebarCtaText),
        sidebarCtaButtonLabel: cleanText(input.sidebarCtaButtonLabel),
        sidebarCtaButtonHref: cleanText(input.sidebarCtaButtonHref),

        whyChooseEyebrow: cleanText(input.whyChooseEyebrow),
        whyChooseBadgeText: cleanText(input.whyChooseBadgeText),
        whyChooseTitle: cleanText(input.whyChooseTitle),
        whyChooseDescription: cleanText(input.whyChooseDescription),
        whyChooseItems: input.whyChooseItems ?? null,

        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(contactPageSettings)
        .values(values)
        .onConflictDoUpdate({ target: contactPageSettings.id, set: values })
        .returning();

      safeRevalidate("/contact");
      return row;
    }),

  updateCta: protectedProcedure
    .input(updateCtaInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSiteContent(ctx);

      const values = {
        id: SITE_CONTENT_ID,
        eyebrow: cleanText(input.eyebrow),
        title: cleanText(input.title),
        titleAccent: cleanText(input.titleAccent),
        description: cleanText(input.description),
        primaryLabel: cleanText(input.primaryLabel),
        primaryHref: cleanText(input.primaryHref),
        secondaryLabel: cleanText(input.secondaryLabel),
        secondaryHref: cleanText(input.secondaryHref),
        secondaryIsWhatsapp: input.secondaryIsWhatsapp ?? true,
        trustPoints: input.trustPoints ?? null,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(siteCtaSettings)
        .values(values)
        .onConflictDoUpdate({ target: siteCtaSettings.id, set: values })
        .returning();

      safeRevalidate("/", "/about", "/contact");
      return row;
    }),
});

export type SiteContentRouter = typeof siteContentRouter;
