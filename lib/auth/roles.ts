// lib/auth/roles.ts
import { Role } from "@/app/db/schema";
import { TRPCError } from "@trpc/server";

type RequireRoleOptions = {
  userId?: string | null;
  roles?: Role[];
  allowedRoles: Role[];
};

export function requireRole({
  userId,
  roles,
  allowedRoles,
}: RequireRoleOptions) {
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  if (!roles?.length) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No roles assigned",
    });
  }

  // Super admin bypass
  if (roles.includes("super_admin")) {
    return {
      userId,
      roles,
    };
  }

  const hasAccess = roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Required roles: ${allowedRoles.join(", ")}`,
    });
  }

  return {
    userId,
    roles,
  };
}
