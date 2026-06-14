// app/modules/user/server/user.router.ts

import { randomUUID } from "crypto";
import { z } from "zod";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole, ROLES } from "@/app/db/schema/roles";

/* =========================================================
   TYPES
========================================================= */

type RoleName = (typeof ROLES)[number];

/* =========================================================
   HELPERS
========================================================= */

function genId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function getActorUserId(ctx: unknown) {
  const c = ctx as {
    authUserId?: string | null;
    auth?: { userId?: string | null };
    session?: { user?: { id?: string | null } };
    user?: { id?: string | null };
  };

  return (
    c.authUserId ??
    c.auth?.userId ??
    c.session?.user?.id ??
    c.user?.id ??
    null
  );
}

async function getOrCreateRole(name: RoleName) {
  const existing = await db.query.role.findFirst({
    where: eq(role.name, name),
  });

  if (existing) return existing;

  const inserted = await db
    .insert(role)
    .values({
      id: genId("role"),
      name,
      description: null,
    })
    .returning();

  const created = inserted[0];

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Gagal membuat role "${name}".`,
    });
  }

  return created;
}

// ROLES is ordered from least to most privileged.
const ROLE_PRIORITY = [...ROLES].reverse();

function pickPrimaryRole(roles: RoleName[]): RoleName {
  for (const candidate of ROLE_PRIORITY) {
    if (roles.includes(candidate)) return candidate;
  }

  return "user";
}

/* =========================================================
   INPUT SCHEMAS
========================================================= */

const getAllUsersInput = z.object({
  search: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),

  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const getUserByIdInput = z.object({
  id: z.string().min(1),
});

const updateUserRoleInput = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

const updateUserStatusInput = z.object({
  userId: z.string().min(1),
  emailVerified: z.boolean(),
});

/* =========================================================
   PUBLIC TYPES
========================================================= */

export type UserListResult = Awaited<ReturnType<typeof buildUserList>>;
export type UserListItem = UserListResult["items"][number];

/* =========================================================
   BUILDERS
========================================================= */

async function buildUserList(input: z.infer<typeof getAllUsersInput>) {
  const conditions: SQL[] = [];

  if (input.search) {
    const term = `%${input.search}%`;

    const searchCondition = or(
      ilike(user.name, term),
      ilike(user.email, term),
      ilike(user.phone, term),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (input.role) {
    conditions.push(
      sql`exists (
        select 1
        from ${userRole}
        inner join ${role} on ${role.id} = ${userRole.roleId}
        where ${userRole.userId} = ${user.id}
          and ${role.name} = ${input.role}
      )`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(user)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      phone: user.phone,
      age: user.age,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(input.limit)
    .offset(input.offset);

  const userIds = rows.map((r) => r.id);

  const roleRows = userIds.length
    ? await db
        .select({
          userId: userRole.userId,
          roleName: role.name,
        })
        .from(userRole)
        .innerJoin(role, eq(role.id, userRole.roleId))
        .where(inArray(userRole.userId, userIds))
    : [];

  const rolesByUser = new Map<string, RoleName[]>();

  for (const r of roleRows) {
    const existing = rolesByUser.get(r.userId) ?? [];
    existing.push(r.roleName);
    rolesByUser.set(r.userId, existing);
  }

  const items = rows.map((r) => {
    const roles = rolesByUser.get(r.id) ?? [];

    return {
      id: r.id,
      name: r.name,
      email: r.email,
      image: r.image,
      phone: r.phone,
      age: r.age,
      emailVerified: r.emailVerified,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      roles,
      primaryRole: pickPrimaryRole(roles),
    };
  });

  return {
    items,
    total,
    limit: input.limit,
    offset: input.offset,
  };
}

/* =========================================================
   ROUTER
========================================================= */

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(getAllUsersInput)
    .query(async ({ input }) => {
      return buildUserList(input);
    }),

  getById: protectedProcedure
    .input(getUserByIdInput)
    .query(async ({ input }) => {
      const account = await db.query.user.findFirst({
        where: eq(user.id, input.id),
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          age: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan",
        });
      }

      const roleRows = await db
        .select({
          roleName: role.name,
        })
        .from(userRole)
        .innerJoin(role, eq(role.id, userRole.roleId))
        .where(eq(userRole.userId, input.id));

      const roles = roleRows.map((r) => r.roleName);

      return {
        ...account,
        roles,
        primaryRole: pickPrimaryRole(roles),
      };
    }),

  getRoleOptions: protectedProcedure.query(async () => {
    return ROLES.map((name) => ({
      value: name,
      label: name,
    }));
  }),

  updateUserRole: protectedProcedure
    .input(updateUserRoleInput)
    .mutation(async ({ input, ctx }) => {
      const account = await db.query.user.findFirst({
        where: eq(user.id, input.userId),
        columns: {
          id: true,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan",
        });
      }

      const actorUserId = getActorUserId(ctx);

      // Prevent a super_admin from demoting themselves accidentally.
      if (actorUserId === input.userId && input.role !== "super_admin") {
        const currentRoles = await db
          .select({
            roleName: role.name,
          })
          .from(userRole)
          .innerJoin(role, eq(role.id, userRole.roleId))
          .where(eq(userRole.userId, input.userId));

        const isSuperAdmin = currentRoles.some(
          (r) => r.roleName === "super_admin",
        );

        if (isSuperAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tidak bisa menurunkan role akun super_admin milik sendiri.",
          });
        }
      }

      const targetRole = await getOrCreateRole(input.role);

      await db.delete(userRole).where(eq(userRole.userId, input.userId));

      await db.insert(userRole).values({
        id: genId("urole"),
        userId: input.userId,
        roleId: targetRole.id,
      });

      return {
        userId: input.userId,
        role: input.role,
      };
    }),

  updateUserStatus: protectedProcedure
    .input(updateUserStatusInput)
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(user)
        .set({
          emailVerified: input.emailVerified,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan",
        });
      }

      return row;
    }),
});