// lib/auth/guards.ts
import { redirect } from "next/navigation";

import type { Role } from "@/app/db/schema/roles";
import { getServerSession } from "./session";
import { canUseRole, getDashboardHome } from "./permissions";

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
    redirect(getDashboardHome(session.user.role));
  }

  return null;
}

export async function requireDashboardRole(allowedRoles: Role[]) {
  const session = await requireSession();

  const activeRole = session.user.role;

  if (!canUseRole(allowedRoles, activeRole)) {
    redirect(getDashboardHome(activeRole));
  }

  return session;
}

export async function requireAdmin() {
  return requireDashboardRole(["admin"]);
}