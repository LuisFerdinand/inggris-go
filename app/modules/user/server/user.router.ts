// app/modules/user/server/user.router.ts
//
// NOTE: If this file already has other procedures beyond what's
// shown here (e.g. profile-related queries from before this was
// generated), merge the imports and procedures below into the
// existing `userRouter = createTRPCRouter({ ... })` instead of
// replacing the whole file.

import { z } from "zod";
import { and, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole, ROLES } from "@/app/db/schema/roles";

/* =========================================================
   HELPERS
========================================================= */

function genId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function getRequiredAuthUserId(ctx: { auth?: { userId?: string | null } }) {
  const userId = ctx.auth?.userId;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return userId;
}

async function getOrCreateRole(name: (typeof ROLES)[number]) {
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

/* =========================================================
   INPUT SCHEMAS
========================================================= */

const getAllUsersInput = z.object({
  search: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),

  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const updateUserRoleInput = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

const updateUserStatusInput = z.object({
  userId: z.string().min(1),
  emailVerified: z.boolean(),
});

const getUserByIdInput = z.object({
  id: z.string().min(1),
});

const updatePasswordInput = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
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
    if (searchCondition) conditions.push(searchCondition);
  }

  if (input.role) {
    // Filter to users that have a userRole row pointing at this role name.
    conditions.push(
      sql`exists (
        select 1 from ${userRole}
        inner join ${role} on ${role.id} = ${userRole.roleId}
        where ${userRole.userId} = ${user.id}
          and ${role.name} = ${input.role}
      )`,
    );
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(user)
    .where(and(...conditions));

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
    .where(and(...conditions))
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
        .where(sql`${userRole.userId} in ${userIds}`)
    : [];

  const rolesByUser = new Map<string, (typeof ROLES)[number][]>();
  for (const r of roleRows) {
    const existing = rolesByUser.get(r.userId) ?? [];
    existing.push(r.roleName);
    rolesByUser.set(r.userId, existing);
  }

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    image: r.image,
    phone: r.phone,
    age: r.age,
    emailVerified: r.emailVerified,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    roles: rolesByUser.get(r.id) ?? [],
    // Primary role shown in the UI — highest-privilege role wins.
    primaryRole: pickPrimaryRole(rolesByUser.get(r.id) ?? []),
  }));

  return {
    items,
    total: count,
    limit: input.limit,
    offset: input.offset,
  };
}

// ROLES is ordered from least to most privileged.
const ROLE_PRIORITY = [...ROLES].reverse();

function pickPrimaryRole(roles: (typeof ROLES)[number][]): (typeof ROLES)[number] {
  for (const candidate of ROLE_PRIORITY) {
    if (roles.includes(candidate)) return candidate;
  }
  return "user";
}

/* =========================================================
   ROUTER
========================================================= */

export const userRouter = createTRPCRouter({
  /* ────────────────────────────────────────────────────────
     USER MANAGEMENT — "/dashboard/users" (admin)
  ───────────────────────────────────────────────────────── */

  getAll: protectedProcedure
    .input(getAllUsersInput)
    .query(async ({ input }) => buildUserList(input)),

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
        throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
      }

      const roleRows = await db
        .select({ roleName: role.name })
        .from(userRole)
        .innerJoin(role, eq(role.id, userRole.roleId))
        .where(eq(userRole.userId, input.id));

      return {
        ...account,
        roles: roleRows.map((r) => r.roleName),
      };
    }),

  /**
   * Roles available for assignment — used to populate the role
   * select in the user management table.
   */
  getRoleOptions: protectedProcedure.query(async () => {
    return ROLES.map((name) => ({ value: name, label: name }));
  }),

  /**
   * Replace a user's role assignment with a single role.
   * (Simplest model: one effective role per user. If you need
   * multi-role support, change this to add/remove instead of
   * replace.)
   */
  updateUserRole: protectedProcedure
    .input(updateUserRoleInput)
    .mutation(async ({ input, ctx }) => {
      const account = await db.query.user.findFirst({
        where: eq(user.id, input.userId),
        columns: { id: true },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
      }

      // Prevent a super_admin from demoting themselves accidentally
      // and locking everyone out.
      if (ctx.auth?.userId === input.userId && input.role !== "super_admin") {
        const currentRoles = await db
          .select({ roleName: role.name })
          .from(userRole)
          .innerJoin(role, eq(role.id, userRole.roleId))
          .where(eq(userRole.userId, input.userId));

        const isSuperAdmin = currentRoles.some((r) => r.roleName === "super_admin");

        if (isSuperAdmin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tidak bisa menurunkan role akun super_admin milik sendiri.",
          });
        }
      }

      const targetRole = await getOrCreateRole(input.role);

      // Replace existing role assignments with the single new role.
      await db.delete(userRole).where(eq(userRole.userId, input.userId));

      await db.insert(userRole).values({
        id: genId("urole"),
        userId: input.userId,
        roleId: targetRole.id,
      });

      return { userId: input.userId, role: input.role };
    }),

  /**
   * Manually toggle a user's email-verified flag — useful for
   * admin-assisted/offline registrations.
   */
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
        throw new TRPCError({ code: "NOT_FOUND", message: "User tidak ditemukan" });
      }

      return row;
    }),

  /* ────────────────────────────────────────────────────────
     ACCOUNT SETTINGS — "/dashboard/settings/account" (self-service)
  ───────────────────────────────────────────────────────── */

  /**
   * Get the current account's basic profile + whether it already
   * has a password set (some accounts may be OAuth-only with no
   * passwordHash, in which case "current password" isn't required
   * to set one for the first time).
   */
  getMyAccount: protectedProcedure.query(async ({ ctx }) => {
    const userId = getRequiredAuthUserId(ctx);

    const account = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        age: true,
        emailVerified: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!account) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Akun tidak ditemukan" });
    }

    const { passwordHash, ...rest } = account;

    return {
      ...rest,
      hasPassword: !!passwordHash,
    };
  }),

  /**
   * Change the current user's password.
   *
   * - If the account already has a password set, `currentPassword`
   *   is required and verified before allowing the change.
   * - If the account has no password yet, this lets the user set
   *   one for the first time without `currentPassword`.
   */
  updatePassword: protectedProcedure
    .input(updatePasswordInput)
    .mutation(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);

      const account = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { id: true, passwordHash: true },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Akun tidak ditemukan" });
      }

      if (account.passwordHash) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password saat ini wajib diisi.",
          });
        }

        const isValid = await bcrypt.compare(
          input.currentPassword,
          account.passwordHash,
        );

        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Password saat ini salah.",
          });
        }

        const isSameAsOld = await bcrypt.compare(
          input.newPassword,
          account.passwordHash,
        );

        if (isSameAsOld) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password baru tidak boleh sama dengan password lama.",
          });
        }
      }

      const newHash = await bcrypt.hash(input.newPassword, 10);

      await db
        .update(user)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(user.id, userId));

      return { success: true };
    }),
});