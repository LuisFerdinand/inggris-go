// lib/auth/permissions.ts
import type { Role } from "@/app/db/schema/roles";

export const ROLE_LABELS: Record<Role, string> = {
  guest: "Guest",
  user: "User",
  student: "Student",
  teacher: "Teacher",
  author: "Author",
  operational_manager: "Operasional Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const SWITCHABLE_ROLES = [
  "user",
  "student",
  "teacher",
  "author",
  "operational_manager",
  "admin",
  "super_admin",
] as const satisfies readonly Role[];

export type SwitchableRole = (typeof SWITCHABLE_ROLES)[number];

export function isSwitchableRole(role: Role): role is SwitchableRole {
  return SWITCHABLE_ROLES.some((item) => item === role);
}

export const ROLE_HOME_PATH: Record<Role, string> = {
  guest: "/",
  user: "/dashboard/program-saya",
  student: "/dashboard/program-saya",
  teacher: "/dashboard/program-saya",
  author: "/dashboard/blog",
  operational_manager: "/dashboard/blog",
  admin: "/dashboard",
  super_admin: "/dashboard",
};

type AccessRule = {
  path: string;
  exact?: boolean;
  roles: Role[];
};

export const DASHBOARD_ACCESS_RULES: AccessRule[] = [
  {
    path: "/dashboard",
    exact: true,
    roles: ["admin", "super_admin"],
  },

  {
    path: "/dashboard/program-saya",
    roles: ["user", "student", "teacher", "admin", "super_admin"],
  },

  {
    path: "/dashboard/koleksi",
    roles: [
      "user",
      "student",
      "teacher",
      "author",
      "operational_manager",
      "admin",
      "super_admin",
    ],
  },

  {
    path: "/dashboard/settings/account",
    roles: [
      "user",
      "student",
      "teacher",
      "author",
      "operational_manager",
      "admin",
      "super_admin",
    ],
  },
  {
    path: "/dashboard/settings/header",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/dashboard/settings/footer",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/dashboard/settings/payment-gateway",
    roles: ["super_admin"],
  },
  {
    path: "/dashboard/settings/merchant-requests",
    roles: ["super_admin"],
  },
  {
    path: "/dashboard/teaching/classes/persetujuan",
    roles: ["author", "operational_manager", "admin", "super_admin"],
  },
  {
    path: "/dashboard/teaching/classes/create",
    roles: ["author", "operational_manager", "admin", "super_admin"],
  },
  {
    path: "/dashboard/teaching",
    roles: ["teacher", "author", "operational_manager", "admin", "super_admin"],
  },

  {
    path: "/dashboard/tasks/persetujuan",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/dashboard/tasks/keputusan-direktur",
    roles: ["super_admin"],
  },
  {
    path: "/dashboard/tasks/persetujuan-done",
    roles: ["super_admin"],
  },
  {
    path: "/dashboard/tasks",
    roles: ["user", "teacher", "author", "operational_manager", "admin", "super_admin"],
  },

  {
    path: "/dashboard/projects",
    roles: ["user", "teacher", "author", "operational_manager", "admin", "super_admin"],
  },

  {
    path: "/dashboard/programs",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/dashboard/program-batches",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/dashboard/program-packages",
    roles: ["admin", "super_admin"],
  },

  {
    path: "/dashboard/blog/comments",
    roles: ["author", "operational_manager", "admin", "super_admin"],
  },
  {
    path: "/dashboard/blog",
    roles: ["author", "operational_manager", "admin", "super_admin"],
  },

  {
    path: "/dashboard/orders",
    roles: ["admin", "author", "operational_manager", "super_admin"],
  },
  {
    path: "/dashboard/users",
    roles: ["super_admin"],
  },
  {
    path: "/dashboard/data-siswa",
    roles: ["admin", "author", "operational_manager", "super_admin"],
  },

  {
    path: "/dashboard/analitik",
    roles: ["admin", "super_admin"],
  },

  {
    path: "/dashboard/merchant",
    roles: ["super_admin"],
  },

  {
    path: "/dashboard/tim/kinerja",
    roles: ["admin", "super_admin"],
  },

  {
    path: "/dashboard/laporan-harian",
    roles: ["teacher", "author", "operational_manager", "admin", "super_admin"],
  },
];

export function getDashboardHome(role: Role) {
  return ROLE_HOME_PATH[role] ?? "/";
}

export function canUseRole(allowedRoles: readonly Role[], activeRole: Role) {
  if (activeRole === "super_admin") {
    return true;
  }

  return allowedRoles.includes(activeRole);
}

export function canAccessPath(pathname: string, activeRole: Role) {
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const rule = DASHBOARD_ACCESS_RULES.find((item) => {
    if (item.exact) {
      return normalizedPathname === item.path;
    }

    return (
      normalizedPathname === item.path ||
      normalizedPathname.startsWith(item.path + "/")
    );
  });

  if (!rule) {
    return false;
  }

  return canUseRole(rule.roles, activeRole);
}