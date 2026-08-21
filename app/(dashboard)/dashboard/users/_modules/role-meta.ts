// app/(dashboard)/dashboard/users/_modules/role-meta.ts

export type RoleName =
  | "guest"
  | "user"
  | "student"
  | "teacher"
  | "author"
  | "operational_manager"
  | "admin"
  | "super_admin";

export const ROLE_META: Record<
  RoleName,
  {
    label: string;
    className: string;
  }
> = {
  guest: {
    label: "Guest",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  user: {
    label: "User",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  student: {
    label: "Student",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  teacher: {
    label: "Teacher",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  author: {
    label: "Author",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  operational_manager: {
    label: "Operasional Manager",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  admin: {
    label: "Admin",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  super_admin: {
    label: "Super Admin",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

// "/dashboard/users" is the staff roster — students are managed
// exclusively on "/dashboard/data-siswa" and never appear here, so
// role filter/select options on that page never offer "student".
const NON_STAFF_ROLES: RoleName[] = ["student"];

export function isStaffRole(role: string): role is Exclude<RoleName, "student"> {
  return !NON_STAFF_ROLES.includes(role as RoleName);
}
