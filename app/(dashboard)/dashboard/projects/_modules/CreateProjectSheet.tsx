// app/(dashboard)/dashboard/projects/_modules/CreateProjectSheet.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS, PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/enums/enums";

const fieldLabelClass = "mb-1.5 block text-[12.5px] font-semibold text-slate-700";

export function CreateProjectSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [picId, setPicId] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");

  const usersQuery = trpc.taskBoard.listAssignableUsers.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: async () => {
      await utils.projects.list.invalidate();
      toast.success("Proyek berhasil dibuat");
      reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message || "Gagal membuat proyek"),
  });

  function reset() {
    setName("");
    setDescription("");
    setPicId("");
    setStatus("active");
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama proyek wajib diisi");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      picId: picId || undefined,
      status,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-slate-100">
          <SheetTitle className="text-[16px] font-extrabold text-slate-800">
            Proyek Baru
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <label className={fieldLabelClass}>Nama Proyek</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Peluncuran Batch September"
            />
          </div>

          <div>
            <label className={fieldLabelClass}>Deskripsi (opsional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tujuan dan cakupan proyek ini"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>Penanggung Jawab</label>
              <Select value={picId || "none"} onValueChange={(v) => setPicId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-9 w-full text-[12.5px]">
                  <SelectValue placeholder="Belum ditentukan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Belum ditentukan</SelectItem>
                  {usersQuery.data?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={fieldLabelClass}>Status Awal</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="h-9 w-full text-[12.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS.filter((s) => s === "draft" || s === "active").map((s) => (
                    <SelectItem key={s} value={s}>
                      {PROJECT_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleSubmit}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Buat Proyek
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
