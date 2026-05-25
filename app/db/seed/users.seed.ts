import { db } from "@/app/db/db";
import { user } from "../schema/auth-schema";
import { role, userRole } from "../schema/roles";
import { generateId } from "@/lib/utils";
import { sql } from "drizzle-orm";

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

const USERS = [
  {
    name: "Vincent",
    email: "konvincent373@gmail.com",

    roles: ["super_admin"],
  },
  {
    name: "Luis",
    email: "ferdinandluis88@gmail.com",

    roles: ["super_admin"],
  },
] as const;

export async function seedRoles() {
  console.log("Seeding Roles...");

  await db
    .insert(role)
    .values(
      ROLES.map((r) => ({
        id: generateId("role"),

        name: r.name,
        description: r.description,
      })),
    )
    .onConflictDoNothing();
}

export async function seedUsers() {
  console.log("Seeding Users...");

  const data: UserInsert[] = USERS.map((u) => ({
    id: generateId("user"),

    name: u.name,
    email: u.email,

    emailVerified: true,
  }));

  await db
    .insert(user)
    .values(data)
    .onConflictDoUpdate({
      target: user.email,

      set: {
        name: sql`excluded.name`,
        updatedAt: new Date(),
      },
    });
}

export async function seedUserRoles() {
  console.log("Seeding User Roles...");

  const users = await db.select().from(user);

  const roles = await db.select().from(role);

  const userMap = new Map(users.map((u) => [u.email, u.id]));

  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  const data = USERS.flatMap((u) => {
    const userId = userMap.get(u.email);

    if (!userId) {
      throw new Error(`User not found: ${u.email}`);
    }

    return u.roles.map((roleName) => {
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
}
