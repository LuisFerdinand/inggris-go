// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";
import { generateId } from "@/lib/utils";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();

  if (!email || !email.includes("@")) return null;

  return email;
}

function normalizeName(value: unknown) {
  if (typeof value !== "string") return null;

  const name = value.trim();

  if (name.length < 2) return null;

  return name;
}

function normalizePassword(value: unknown) {
  if (typeof value !== "string") return null;

  if (value.length < 6) return null;

  return value;
}

async function getDefaultUserRoleId() {
  const existingRole = await db
    .select({
      id: role.id,
    })
    .from(role)
    .where(eq(role.name, "user"))
    .limit(1);

  if (existingRole[0]) {
    return existingRole[0].id;
  }

  const roleId = generateId("role");

  await db.insert(role).values({
    id: roleId,
    name: "user",
    description: "Regular user",
  });

  return roleId;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const password = normalizePassword(body.password);

    if (!name) {
      return jsonError("Name must be at least 2 characters.");
    }

    if (!email) {
      return jsonError("Please enter a valid email.");
    }

    if (!password) {
      return jsonError("Password must be at least 6 characters.");
    }

    const existingUser = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser[0]) {
      return jsonError("Email is already registered.", 409);
    }

    const userId = generateId("user");

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(user).values({
      id: userId,
      name,
      email,
      passwordHash,
      emailVerified: true,
    });

    const roleId = await getDefaultUserRoleId();

    await db.insert(userRole).values({
      id: generateId("user-role"),
      userId,
      roleId,
    });

    return NextResponse.json({
      ok: true,
      userId,
    });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);

    return jsonError("Something went wrong while registering.", 500);
  }
}