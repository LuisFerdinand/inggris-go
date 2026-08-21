// app/(dashboard)/dashboard/users/_modules/PromoteStaffModal.tsx

"use client";

import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { ROLE_META, type RoleName } from "./role-meta";
import type { UserListItem } from "@/app/modules/user/server/user.router";

const SEARCH_LIMIT = 10;
const DEFAULT_TARGET_ROLE: RoleName = "teacher";

/* =========================================================
   STUDENT RESULT ROW
========================================================= */

function StudentResultRow({
  item,
  staffRoleOptions,
  onPromoted,
}: {
  item: UserListItem;
  staffRoleOptions: { value: string; label: string }[];
  onPromoted: () => void;
}) {
  const [targetRole, setTargetRole] = useState<RoleName>(DEFAULT_TARGET_ROLE);

  const promote = trpc.users.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success(`${item.name} berhasil dipromosikan menjadi staff`);
      onPromoted();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mempromosikan user");
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-black text-slate-800">
          {item.name}
        </p>

        <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Mail className="size-3 shrink-0 text-slate-400" />
            <span className="truncate">{item.email}</span>
          </span>

          <span className="inline-flex items-center gap-1">
            <Phone className="size-3 shrink-0 text-slate-400" />
            {item.phone || "No phone"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={targetRole}
          disabled={promote.isPending}
          onChange={(e) => setTargetRole(e.target.value as RoleName)}
          className="h-9 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 text-[12px] font-bold text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {staffRoleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {ROLE_META[option.value as RoleName]?.label ?? option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={promote.isPending}
          onClick={() => promote.mutate({ userId: item.id, role: targetRole })}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[12px] font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {promote.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          Promosikan
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

export function PromoteStaffModal({
  open,
  onClose,
  staffRoleOptions,
  onPromoted,
}: {
  open: boolean;
  onClose: () => void;
  staffRoleOptions: { value: string; label: string }[];
  onPromoted: () => void;
}) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const studentsQuery = trpc.users.getAll.useQuery(
    {
      search: deferredSearch || undefined,
      role: "student",
      limit: SEARCH_LIMIT,
      offset: 0,
    },
    { enabled: open },
  );

  function handlePromoted() {
    void utils.users.getAll.invalidate();
    onPromoted();
  }

  if (!open) return null;

  const items = studentsQuery.data?.items ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus className="size-4.5" />
            </div>
            <div>
              <p className="text-[14px] font-black text-slate-800">
                Promosikan ke Staff
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Cari siswa lalu jadikan staff
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau nomor HP siswa..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {studentsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-12 text-slate-400">
              <Loader2 className="size-4.5 animate-spin" />
              <p className="text-[12px] font-semibold">Mencari siswa…</p>
            </div>
          ) : studentsQuery.isError ? (
            <p className="py-12 text-center text-[12px] font-semibold text-red-500">
              {studentsQuery.error.message}
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <GraduationCap className="size-7 text-slate-300" />
              <p className="text-[12px] font-semibold text-slate-500">
                {search
                  ? "Tidak ada siswa yang cocok dengan pencarian."
                  : "Ketik nama, email, atau nomor HP untuk mencari siswa."}
              </p>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-2")}>
              {items.map((item) => (
                <StudentResultRow
                  key={item.id}
                  item={item}
                  staffRoleOptions={staffRoleOptions}
                  onPromoted={handlePromoted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
