// .../[classId]/_modules/tabs/SessionsTab.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarPlus,
  ClipboardCheck,
  Link2,
  Loader2,
  Trash2,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_META } from "@/lib/enums/enums";
import type { AttendanceStatus } from "@/lib/enums/enums";
import type { RouterOutputs } from "@/lib/trpc/react";

type SessionRow = RouterOutputs["classSessions"]["list"][number];

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type AttendanceRosterRow = {
  classEnrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  note: string | null;
};

function AttendancePanel({ session }: { session: SessionRow }) {
  const attendanceQuery = trpc.classSessions.getAttendance.useQuery({
    classSessionId: session.id,
  });

  if (attendanceQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/60 py-6 text-slate-400">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-[12.5px]">Memuat kehadiran…</span>
      </div>
    );
  }

  return (
    <AttendancePanelInner
      session={session}
      roster={attendanceQuery.data ?? []}
    />
  );
}

type DraftRow = { status: AttendanceStatus; note: string };

function AttendancePanelInner({
  session,
  roster,
}: {
  session: SessionRow;
  roster: AttendanceRosterRow[];
}) {
  const utils = trpc.useUtils();

  const [draft, setDraft] = useState<Record<string, DraftRow>>(() => {
    const initial: Record<string, DraftRow> = {};
    for (const row of roster) {
      initial[row.classEnrollmentId] = {
        status: row.status ?? "present",
        note: row.note ?? "",
      };
    }
    return initial;
  });

  const [googleDriveLink, setGoogleDriveLink] = useState(session.googleDriveLink ?? "");
  const [sessionNote, setSessionNote] = useState(session.note ?? "");

  const saveMutation = trpc.classSessions.recordAttendance.useMutation({
    onSuccess: async () => {
      await utils.classSessions.getAttendance.invalidate({
        classSessionId: session.id,
      });
      await utils.classSessions.getAttendanceSummary.invalidate();
      await utils.classSessions.list.invalidate({ classId: session.classId });
      toast.success("Kehadiran tersimpan");
    },
    onError: (err) => toast.error(err.message || "Gagal menyimpan kehadiran"),
  });

  function updateDraft(classEnrollmentId: string, patch: Partial<DraftRow>) {
    setDraft((prev) => ({
      ...prev,
      [classEnrollmentId]: {
        status: prev[classEnrollmentId]?.status ?? "present",
        note: prev[classEnrollmentId]?.note ?? "",
        ...patch,
      },
    }));
  }

  function handleSave() {
    saveMutation.mutate({
      classSessionId: session.id,
      records: roster.map((r) => ({
        classEnrollmentId: r.classEnrollmentId,
        status: draft[r.classEnrollmentId]?.status ?? "present",
        note: draft[r.classEnrollmentId]?.note.trim() || undefined,
      })),
      googleDriveLink: googleDriveLink.trim(),
      sessionNote: sessionNote.trim(),
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 p-4">
      {roster.length === 0 ? (
        <p className="text-center text-[12px] text-slate-400">
          Belum ada siswa di kelas ini.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {roster.map((student) => (
            <div key={student.classEnrollmentId} className="flex flex-col gap-1.5 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[12.5px] font-medium text-slate-700">
                  {student.studentName}
                </p>
                <div className="flex shrink-0 gap-1">
                  {ATTENDANCE_STATUS.map((status) => {
                    const active =
                      (draft[student.classEnrollmentId]?.status ?? "present") === status;
                    const meta = ATTENDANCE_STATUS_META[status];

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateDraft(student.classEnrollmentId, { status })}
                        className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors"
                        style={{
                          borderColor: active ? meta.color : "#e2e8f0",
                          background: active ? `${meta.color}18` : "white",
                          color: active ? meta.color : "#94a3b8",
                        }}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Input
                value={draft[student.classEnrollmentId]?.note ?? ""}
                onChange={(e) =>
                  updateDraft(student.classEnrollmentId, { note: e.target.value })
                }
                placeholder="Catatan untuk siswa ini (opsional)"
                className="h-8 text-[12px]"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-slate-500">
            Link Google Drive (opsional)
          </label>
          <Input
            value={googleDriveLink}
            onChange={(e) => setGoogleDriveLink(e.target.value)}
            placeholder="https://drive.google.com/…"
            className="h-9 text-[12.5px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-slate-500">
            Catatan Kelas (opsional)
          </label>
          <Textarea
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            rows={2}
            placeholder="Catatan umum untuk sesi ini"
            className="text-[12.5px]"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={saveMutation.isPending || roster.length === 0}
        onClick={handleSave}
        className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {saveMutation.isPending && (
          <Loader2 className="size-3.5 animate-spin" />
        )}
        Simpan Kehadiran
      </button>
    </div>
  );
}

export function SessionsTab({ classId }: { classId: string }) {
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const utils = trpc.useUtils();
  const sessionsQuery = trpc.classSessions.list.useQuery({ classId });

  const createMutation = trpc.classSessions.create.useMutation({
    onSuccess: async () => {
      await utils.classSessions.list.invalidate({ classId });
      setNewDate("");
      setNewLabel("");
      toast.success("Sesi ditambahkan");
    },
    onError: (err) => toast.error(err.message || "Gagal menambahkan sesi"),
  });

  const removeMutation = trpc.classSessions.remove.useMutation({
    onSuccess: async () => {
      await utils.classSessions.list.invalidate({ classId });
      toast.success("Sesi dihapus");
    },
    onError: (err) => toast.error(err.message || "Gagal menghapus sesi"),
  });

  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Tanggal Sesi
          </label>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Label (opsional)
          </label>
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={`Hari ${sessions.length + 1}`}
          />
        </div>
        <button
          type="button"
          disabled={!newDate || createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              classId,
              sessionDate: new Date(newDate),
              label: newLabel.trim() || undefined,
            })
          }
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CalendarPlus className="size-3.5" />
          )}
          Tambah Sesi
        </button>
      </div>

      {sessionsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12.5px]">Memuat sesi…</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-[12.5px] text-slate-400">
          Belum ada sesi. Tambahkan sesi pertama di atas.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sessions.map((session) => {
            const isOpen = openSessionId === session.id;

            return (
              <div
                key={session.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13px] font-bold text-slate-800">
                        {session.label}
                      </p>
                      {session.googleDriveLink && (
                        <a
                          href={session.googleDriveLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex shrink-0 items-center text-slate-400 hover:text-indigo-500"
                          title="Buka link Google Drive"
                        >
                          <Link2 className="size-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-400">
                      {formatDate(session.sessionDate)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSessionId(isOpen ? null : session.id)
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                        isOpen
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-100",
                      )}
                    >
                      <ClipboardCheck className="size-3.5" />
                      {isOpen ? "Tutup" : "Isi Kehadiran"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate({ id: session.id })}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {isOpen && <AttendancePanel session={session} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
