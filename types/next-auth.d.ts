// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { Role } from "@/app/db/schema/roles";

declare module "next-auth" {
  interface User extends DefaultUser {
    /**
     * Active role.
     * For normal users, this is their real role.
     * For super_admin, this can change when they switch preview role.
     */
    role?: Role;

    /**
     * Same as role, but more explicit.
     */
    activeRole?: Role;

    /**
     * Highest real role from DB.
     * Example: super_admin stays super_admin even when activeRole is user.
     */
    realRole?: Role;

    /**
     * All roles assigned from DB.
     */
    roles?: Role[];

    /**
     * True only when real roles include super_admin.
     */
    canSwitchRole?: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;

      /**
       * Active role used by sidebar, guards, and permissions.
       */
      role: Role;
      activeRole: Role;

      /**
       * Highest real DB role.
       */
      realRole: Role;

      /**
       * All real DB roles.
       */
      roles: Role[];

      /**
       * True only when real roles include super_admin.
       */
      canSwitchRole: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;

    /**
     * Active role stored in JWT.
     */
    role?: Role;
    activeRole?: Role;

    /**
     * Real DB role.
     */
    realRole?: Role;

    /**
     * All DB roles.
     */
    roles?: Role[];

    /**
     * True only when real roles include super_admin.
     */
    canSwitchRole?: boolean;
  }
}