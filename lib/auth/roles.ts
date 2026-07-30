// lib/auth/roles.ts
import { Role } from "@/app/db/schema";
import { TRPCError } from "@trpc/server";
import { getUserRoles } from "@/lib/auth/default-role";

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

/**
 * Same as `requireRole`, but looks the caller's roles up straight from the
 * database instead of trusting the (client-switchable) `activeRole` on the
 * session/JWT. Use this for sensitive mutations — role changes, payment
 * gateway credentials — where a stale or spoofed session role must not be
 * enough to get through.
 */
export async function requireDbRole(
  userId: string | null | undefined,
  allowedRoles: Role[],
) {
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const roles = await getUserRoles(userId);

  return requireRole({ userId, roles, allowedRoles });
}
