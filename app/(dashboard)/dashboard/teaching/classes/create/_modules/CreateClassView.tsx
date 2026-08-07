// app/(dashboard)/dashboard/teaching/classes/create/_modules/CreateClassView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { GraduationCap, Loader2, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateClassView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get("batchId") ?? "";

  const [batchId, setBatchId] = useState(preselectedBatchId);
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<
    Set<string>
  >(new Set());

  const batchesQuery = trpc.classes.listMyBatches.useQuery();
  const teachersQuery = trpc.classes.listAssignableTeachers.useQuery();
  const studentsQuery = trpc.classes.getRegisteredStudents.useQuery(
    { batchId },
    { enabled: !!batchId },
  );

  const utils = trpc.useUtils();

  const createMutation = trpc.classes.create.useMutation({
    onSuccess: async (row) => {
      await utils.classes.listMine.invalidate();
      toast.success("Kelas berhasil dibuat");
      if (row) router.push(`/dashboard/teaching/classes/${row.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal membuat kelas");
    },
  });

  const students = studentsQuery.data ?? [];

  const selectedBatch = useMemo(
    () => batchesQuery.data?.find((b) => b.id === batchId),
    [batchesQuery.data, batchId],
  );

  // Default the teacher picker to the batch's assigned teacher (if any),
  // but leave it overridable — oversight explicitly chooses who teaches.
  useEffect(() => {
    if (selectedBatch?.teacherId) {
      setTeacherId(selectedBatch.teacherId);
    }
  }, [selectedBatch]);

  function toggleStudent(id: string) {
    setSelectedEnrollmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    if (!batchId) {
      toast.error("Pilih batch terlebih dahulu");
      return;
    }
    if (!title.trim()) {
      toast.error("Judul kelas wajib diisi");
      return;
    }
    if (!teacherId) {
      toast.error("Pilih guru untuk kelas ini");
      return;
    }

    createMutation.mutate({
      batchId,
      teacherId,
      title: title.trim(),
      periodLabel: periodLabel.trim() || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      notes: notes.trim() || undefined,
      enrollmentIds: Array.from(selectedEnrollmentIds),
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-16 pt-4 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
          <GraduationCap className="size-5 text-indigo-600" />
          Buat Kelas Baru
        </h1>
        <p className="mt-0.5 text-[12.5px] text-slate-400">
          Buat kelas dari batch yang ditugaskan padamu, lalu tambahkan siswa
          yang sudah terdaftar.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
            Batch
          </label>
          <Select value={batchId} onValueChange={setBatchId}>
            <SelectTrigger className="h-10 text-[13px]">
              <SelectValue placeholder="Pilih batch" />
            </SelectTrigger>
            <SelectContent>
              {batchesQuery.data?.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.program?.title} — {batch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {batchesQuery.data?.length === 0 && (
            <p className="mt-1.5 text-[11.5px] text-amber-600">
              Kamu belum ditugaskan pada batch manapun.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
            Guru Pengajar
          </label>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="h-10 text-[13px]">
              <SelectValue placeholder="Pilih guru" />
            </SelectTrigger>
            <SelectContent>
              {teachersQuery.data?.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {teachersQuery.data?.length === 0 && (
            <p className="mt-1.5 text-[11.5px] text-amber-600">
              Belum ada pengguna dengan peran guru.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
            Judul Kelas
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedBatch ? `${selectedBatch.title} - Kelas A` : "Kelas A"
            }
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
            Periode (opsional)
          </label>
          <Input
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="Contoh: 20-25 Juni 2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
              Tanggal Mulai
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
              Tanggal Selesai
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-700">
            Catatan (opsional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {batchId && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-slate-400" />
            <h2 className="text-[13.5px] font-bold text-slate-700">
              Tambahkan Siswa ({selectedEnrollmentIds.size} dipilih)
            </h2>
          </div>

          {studentsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-[12.5px]">Memuat siswa terdaftar…</span>
            </div>
          ) : students.length === 0 ? (
            <p className="py-4 text-center text-[12.5px] text-slate-400">
              Belum ada siswa terdaftar (lunas/terkonfirmasi) pada batch ini.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {students.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 py-2.5",
                  )}
                >
                  <Checkbox
                    checked={selectedEnrollmentIds.has(s.id)}
                    onCheckedChange={() => toggleStudent(s.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-800">
                      {s.childName || s.customerName}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-400">
                      {s.phone}
                    </p>
                  </div>
                  {s.alreadyRostered && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                      Sudah di kelas lain
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={handleSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {createMutation.isPending && (
          <Loader2 className="size-4 animate-spin" />
        )}
        Buat Kelas
      </button>
    </div>
  );
}
