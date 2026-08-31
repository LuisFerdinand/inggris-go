// app/modules/analytics/server/analytics.router.ts
import { desc, eq, gte, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { requireDbRole } from "@/lib/auth/roles";

import { enrollments } from "@/app/db/schema/orders";
import { programs, programCategories } from "@/app/db/schema/programs";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";

/* =========================================================
   HELPERS
========================================================= */

const SUCCESS_FILTER = sql`${enrollments.status} in ('paid', 'confirmed')`;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

const TREND_MONTHS = 6;

/* =========================================================
   BUILDER
========================================================= */

async function buildAnalyticsOverview() {
  const now = new Date();
    const trendStart = new Date(
      now.getFullYear(),
      now.getMonth() - (TREND_MONTHS - 1),
      1,
    );
    const newUsersSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      programStatusRows,
      userRoleRows,
      totalUsersRow,
      newUsersRow,
      enrollmentSummaryRow,
      trendRows,
      topProgramRows,
      categoryRows,
    ] = await Promise.all([
      db
        .select({
          status: programs.status,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(programs)
        .groupBy(programs.status),

      db
        .select({
          roleName: role.name,
          count: sql<number>`count(distinct ${user.id})`.mapWith(Number),
        })
        .from(user)
        .innerJoin(userRole, eq(userRole.userId, user.id))
        .innerJoin(role, eq(role.id, userRole.roleId))
        .groupBy(role.name),

      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(user),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(user)
        .where(gte(user.createdAt, newUsersSince)),

      db
        .select({
          totalEnrollments: sql<number>`count(*)`.mapWith(Number),
          successEnrollments: sql<number>`count(*) filter (where ${SUCCESS_FILTER})`.mapWith(
            Number,
          ),
          pendingEnrollments: sql<number>`count(*) filter (where ${enrollments.status} = 'pending_payment')`.mapWith(
            Number,
          ),
          totalRevenue: sql<number>`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`.mapWith(
            Number,
          ),
        })
        .from(enrollments),

      db
        .select({
          bucket: sql<string>`to_char(${enrollments.createdAt}, 'YYYY-MM')`,
          count: sql<number>`count(*)`.mapWith(Number),
          revenue: sql<number>`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`.mapWith(
            Number,
          ),
        })
        .from(enrollments)
        .where(gte(enrollments.createdAt, trendStart))
        .groupBy(sql`to_char(${enrollments.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${enrollments.createdAt}, 'YYYY-MM')`),

      db
        .select({
          programId: enrollments.programId,
          title: programs.title,
          enrollmentCount: sql<number>`count(*)`.mapWith(Number),
          revenue: sql<number>`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`.mapWith(
            Number,
          ),
        })
        .from(enrollments)
        .innerJoin(programs, eq(programs.id, enrollments.programId))
        .groupBy(enrollments.programId, programs.title)
        .orderBy(
          desc(
            sql`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`,
          ),
        )
        .limit(5),

      db
        .select({
          categoryId: programCategories.id,
          categoryLabel: programCategories.label,
          enrollmentCount: sql<number>`count(*)`.mapWith(Number),
          revenue: sql<number>`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`.mapWith(
            Number,
          ),
        })
        .from(enrollments)
        .innerJoin(programs, eq(programs.id, enrollments.programId))
        .innerJoin(
          programCategories,
          eq(programCategories.id, programs.categoryId),
        )
        .groupBy(programCategories.id, programCategories.label)
        .orderBy(
          desc(
            sql`coalesce(sum(${enrollments.finalPrice}) filter (where ${SUCCESS_FILTER}), 0)`,
          ),
        ),
    ]);

    const trendMap = new Map(trendRows.map((r) => [r.bucket, r]));
    const trend = Array.from({ length: TREND_MONTHS }).map((_, i) => {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - (TREND_MONTHS - 1) + i,
        1,
      );
      const key = monthKey(d);
      const row = trendMap.get(key);
      return {
        key,
        label: monthLabel(d),
        enrollments: row?.count ?? 0,
        revenue: row?.revenue ?? 0,
      };
    });

    const programStatusMap = Object.fromEntries(
      programStatusRows.map((r) => [r.status, r.count]),
    );
    const totalPrograms = programStatusRows.reduce((sum, r) => sum + r.count, 0);

    const roleMap = Object.fromEntries(
      userRoleRows.map((r) => [r.roleName, r.count]),
    );

    return {
      programs: {
        total: totalPrograms,
        published: programStatusMap.published ?? 0,
        draft: programStatusMap.draft ?? 0,
        archived: programStatusMap.archived ?? 0,
      },
      users: {
        total: totalUsersRow[0]?.count ?? 0,
        newLast30Days: newUsersRow[0]?.count ?? 0,
        byRole: roleMap,
      },
      enrollments: {
        total: enrollmentSummaryRow[0]?.totalEnrollments ?? 0,
        success: enrollmentSummaryRow[0]?.successEnrollments ?? 0,
        pending: enrollmentSummaryRow[0]?.pendingEnrollments ?? 0,
        revenue: enrollmentSummaryRow[0]?.totalRevenue ?? 0,
      },
    trend,
    topPrograms: topProgramRows,
    categories: categoryRows,
  };
}

export type AnalyticsOverview = Awaited<
  ReturnType<typeof buildAnalyticsOverview>
>;

/* =========================================================
   ROUTER
========================================================= */

export const analyticsRouter = createTRPCRouter({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    await requireDbRole(ctx.auth.userId, ["admin", "super_admin"]);

    return buildAnalyticsOverview();
  }),
});
