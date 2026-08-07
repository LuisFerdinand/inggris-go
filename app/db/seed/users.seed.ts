// app/db/seed/users.ts
import bcrypt from "bcryptjs";
import { inArray, sql } from "drizzle-orm";

import { db } from "@/app/db/db";
import { user } from "../schema/auth-schema";
import { role, userRole } from "../schema/roles";
import { generateId } from "@/lib/utils";

type UserInsert = typeof user.$inferInsert;

const ROLES = [
  {
    name: "guest",
    description: "Guest user",
  },
  {
    name: "user",
    description: "Regular user",
  },
  {
    name: "teacher",
    description: "Teacher",
  },
  {
    name: "author",
    description: "Content author",
  },
  {
    name: "admin",
    description: "Administrator",
  },
  {
    name: "super_admin",
    description: "Super Administrator",
  },
] as const;

/**
 * Super admins
 */
const SUPER_ADMIN_EMAIL =
  process.env.SEED_SUPER_ADMIN_EMAIL ?? "ferdinandluis88@gmail.com";

const SUPER_ADMIN_PASSWORD =
  process.env.SEED_SUPER_ADMIN_PASSWORD ?? "LuisSuperAdmin123!";

const NINA_SUPER_ADMIN_EMAIL =
  process.env.SEED_NINA_SUPER_ADMIN_EMAIL ?? "inggrisgo.nina@gmail.com";

const NINA_SUPER_ADMIN_PASSWORD =
  process.env.SEED_NINA_SUPER_ADMIN_PASSWORD ?? SUPER_ADMIN_PASSWORD;

/**
 * Staff users
 */
const TYAS_EMAIL =
  process.env.SEED_TYAS_EMAIL ?? "inggrisgo.cs@gmail.com";

const TYAS_PASSWORD =
  process.env.SEED_TYAS_PASSWORD ?? "TyasAdmin123!";

const VIVI_EMAIL =
  process.env.SEED_VIVI_EMAIL ?? "inggrisgo.vivi@gmail.com";

const VIVI_PASSWORD =
  process.env.SEED_VIVI_PASSWORD ?? "ViviAuthor123!";

const GITA_EMAIL =
  process.env.SEED_GITA_EMAIL ?? "jinggagita14@gmail.com";

const GITA_PASSWORD =
  process.env.SEED_GITA_PASSWORD ?? "GitaAuthor123!";

const USERS = [
  {
    name: "Luis",
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    roles: ["super_admin"],
  },
  {
    name: "Nina",
    email: NINA_SUPER_ADMIN_EMAIL,
    password: NINA_SUPER_ADMIN_PASSWORD,
    roles: ["super_admin"],
  },
  {
    name: "Tyas",
    email: TYAS_EMAIL,
    password: TYAS_PASSWORD,
    roles: ["user", "admin"],
  },
  {
    name: "Vivi",
    email: VIVI_EMAIL,
    password: VIVI_PASSWORD,
    roles: ["user", "author"],
  },
  {
    name: "Gita",
    email: GITA_EMAIL,
    password: GITA_PASSWORD,
    roles: ["user", "author"],
  },
] as const;

export async function seedRoles() {
  console.log("Seeding Roles...");

  await db
    .insert(role)
    .values(
      ROLES.map((roleData) => ({
        id: generateId("role"),
        name: roleData.name,
        description: roleData.description,
      })),
    )
    .onConflictDoNothing();

  console.log("Roles seeded successfully.");
}

export async function seedUsers() {
  console.log("Seeding Users...");

  const data: UserInsert[] = await Promise.all(
    USERS.map(async (seedUser) => ({
      id: generateId("user"),
      name: seedUser.name,
      email: seedUser.email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(seedUser.password, 12),
      emailVerified: true,
    })),
  );

  await db
    .insert(user)
    .values(data)
    .onConflictDoUpdate({
      target: user.email,
      set: {
        name: sql`excluded.name`,
        passwordHash: sql`excluded.password_hash`,
        emailVerified: sql`excluded.email_verified`,
        updatedAt: new Date(),
      },
    });

  console.log("Users seeded successfully.");
}

export async function seedUserRoles() {
  console.log("Seeding User Roles...");

  const databaseUsers = await db.select().from(user);
  const databaseRoles = await db.select().from(role);

  const userMap = new Map(
    databaseUsers.map((databaseUser) => [
      databaseUser.email.trim().toLowerCase(),
      databaseUser.id,
    ]),
  );

  const roleMap = new Map(
    databaseRoles.map((databaseRole) => [
      databaseRole.name,
      databaseRole.id,
    ]),
  );

  const seededUserIds = USERS.map((seedUser) => {
    const normalizedEmail = seedUser.email.trim().toLowerCase();
    const userId = userMap.get(normalizedEmail);

    if (!userId) {
      throw new Error(`User not found after seeding: ${normalizedEmail}`);
    }

    return userId;
  });

  /*
   * Remove existing roles belonging to the seeded users.
   *
   * This ensures that rerunning the seeder updates their roles correctly.
   * For example, if Vivi previously had the teacher role, it will be replaced
   * with the configured user + author roles.
   */
  if (seededUserIds.length > 0) {
    await db
      .delete(userRole)
      .where(inArray(userRole.userId, seededUserIds));
  }

  const data = USERS.flatMap((seedUser) => {
    const normalizedEmail = seedUser.email.trim().toLowerCase();
    const userId = userMap.get(normalizedEmail);

    if (!userId) {
      throw new Error(`User not found: ${normalizedEmail}`);
    }

    return seedUser.roles.map((roleName) => {
      const roleId = roleMap.get(roleName);

      if (!roleId) {
        throw new Error(`Role not found: ${roleName}`);
      }

      return {
        id: generateId("user-role"),
        userId,
        roleId,
      };
    });
  });

  await db.insert(userRole).values(data).onConflictDoNothing();

  console.log("User roles seeded successfully.");
}

export async function seedAuth() {
  await seedRoles();
  await seedUsers();
  await seedUserRoles();

  console.log("Authentication seed completed successfully.");
}