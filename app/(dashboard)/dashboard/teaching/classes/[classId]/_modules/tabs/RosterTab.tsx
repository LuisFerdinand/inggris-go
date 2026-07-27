// .../[classId]/_modules/tabs/RosterTab.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, UserMinus, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { Checkbox } from "@/components/ui/checkbox";

type RosterRow = {
  id: string;
  studentName: string;
  addedAt: string | Date;
  score?: { finalizedAt: string | Date | null } | null;
};

export function RosterTab({
  classId,
  batchId,
  roster,
}: {
  classId: string;
  batchId: string;
  roster: RosterRow[];
}) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const utils = trpc.useUtils();

  const studentsQuery = trpc.classes.getRegisteredStudents.useQuery(
    { batchId },
    { enabled: showAddPanel },
  );

  const addMutation = trpc.classes.addStudents.useMutation({
    onSuccess: async () => {
      await utils.classes.getById.invalidate({ id: classId });
      toast.success("Siswa ditambahkan ke kelas");
      setSelectedIds(new Set());
      setShowAddPanel(false);
    },
    onError: (err) => toast.error(err.message || "Gagal menambahkan siswa"),
  });

  const removeMutation = trpc.classes.removeStudent.useMutation({
    onSuccess: async () => {
      await utils.classes.getById.invalidate({ id: classId });
      toast.success("Siswa dikeluarkan dari kelas");
    },
    onError: (err) => toast.error(err.message || "Gagal mengeluarkan siswa"),
  });

  const addableStudents = (studentsQuery.data ?? []).filter(
    (s) => !s.alreadyRostered,
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-slate-400" />
          <h2 className="text-[13.5px] font-bold text-slate-700">
            Roster ({roster.length} siswa)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddPanel((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-[12px] font-bold text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          <Plus className="size-3.5" /> Tambah Siswa
        </button>
      </div>

      {showAddPanel && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {studentsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-[12.5px]">Memuat siswa terdaftar…</span>
            </div>
          ) : addableStudents.length === 0 ? (
            <p className="py-3 text-center text-[12.5px] text-slate-400">
              Tidak ada siswa terdaftar yang belum masuk kelas ini.
            </p>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-slate-100">
                {addableStudents.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-3 py-2"
                  >
                    <Checkbox
                      checked={selectedIds.has(s.id)}
                      onCheckedChange={() => toggle(s.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-800">
                        {s.childName || s.customerName}
                      </p>
                      <p className="truncate text-[11.5px] text-slate-400">
                        {s.phone}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={selectedIds.size === 0 || addMutation.isPending}
                onClick={() =>
                  addMutation.mutate({
                    classId,
                    enrollmentIds: Array.from(selectedIds),
                  })
                }
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {addMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                Tambahkan ({selectedIds.size})
              </button>
            </>
          )}
        </div>
      )}

      {roster.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-[12.5px] text-slate-400">
          Belum ada siswa di kelas ini.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {roster.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="truncate text-[13px] font-semibold text-slate-800">
                {student.studentName}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                {student.score?.finalizedAt && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600">
                    Sudah dinilai
                  </span>
                )}
                <button
                  type="button"
                  disabled={
                    removeMutation.isPending &&
                    removeMutation.variables?.classEnrollmentId === student.id
                  }
                  onClick={() =>
                    removeMutation.mutate({ classEnrollmentId: student.id })
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  <UserMinus className="size-3.5" /> Keluarkan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
