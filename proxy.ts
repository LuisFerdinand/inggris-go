// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import type { Role } from "@/app/db/schema/roles";
import { canAccessPath, getDashboardHome } from "@/lib/auth/permissions";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // getToken()'s auto-detection of the "__Secure-" cookie prefix relies on
  // reading the request's protocol; on a real https production domain this
  // must be forced explicitly rather than trusting that detection, or a
  // genuinely-set session cookie can silently fail to be read back here.
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
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
