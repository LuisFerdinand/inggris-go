// lib/auth/guards.ts
import { redirect } from "next/navigation";

import { getServerSession } from "./session";

export async function requireSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/");
  }

  return session;
}

export async function requireGuest() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return null;
}

export async function requireAdmin() {
  const session = await requireSession();

  const role = session.user.role;

  if (role !== "admin" && role !== "super_admin") {
    redirect("/");
  }

  return session;
}