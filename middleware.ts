// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import type { Role } from "@/app/db/schema/roles";
import { canAccessPath, getDashboardHome } from "@/lib/auth/permissions";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const activeRole = (token.activeRole ?? token.role ?? "guest") as Role;

  if (!canAccessPath(pathname, activeRole)) {
    return NextResponse.redirect(
      new URL(getDashboardHome(activeRole), req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};