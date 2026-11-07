// app/(dashboard)/dashboard/projects/_modules/EditProjectSheet.tsx
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

const fieldLabelClass = "mb-1.5 block text-[12.5px] font-semibold text-slate-700";

export type EditableProject = {
  id: string;
  name: string;
  description: string | null;
  picId: string | null;
  pic: { id: string; name: string } | null;
};

export function EditProjectSheet({
  project,
  open,
  onOpenChange,
}: {
  project: EditableProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-slate-100">
          <SheetTitle className="text-[16px] font-extrabold text-slate-800">
            Ubah Proyek
          </SheetTitle>
        </SheetHeader>

        {/* Mounted only while the sheet is open, so the fields always start
            from the project's latest saved values. */}
        <EditProjectForm project={project} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function EditProjectForm({
  project,
  onDone,
}: {
  project: EditableProject;
  onDone: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [picId, setPicId] = useState(project.picId ?? "");

  const usersQuery = trpc.taskBoard.listAssignableUsers.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.projects.getById.invalidate({ id: project.id }),
        utils.projects.list.invalidate(),
      ]);
      toast.success("Proyek berhasil diperbarui");
      onDone();
    },
    onError: (err) => toast.error(err.message || "Gagal memperbarui proyek"),
  });

  const users = usersQuery.data ?? [];
  // Keep the current PIC selectable even if they're no longer in the
  // assignable-users list (e.g. their role changed) so the Select never
  // shows a blank value for a PIC that is actually set.
  const currentPicMissing =
    project.pic && !users.some((u) => u.id === project.pic?.id) ? project.pic : null;

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nama proyek wajib diisi");
      return;
    }

    updateMutation.mutate({
      id: project.id,
      name: name.trim(),
      description: description.trim() || null,
      picId: picId || null,
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className={fieldLabelClass}>Nama Proyek</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
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

      <div>
        <label className={fieldLabelClass}>Penanggung Jawab (PIC)</label>
        <Select value={picId || "none"} onValueChange={(v) => setPicId(v === "none" ? "" : v)}>
          <SelectTrigger className="h-9 w-full text-[12.5px]">
            <SelectValue placeholder="Belum ditentukan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Belum ditentukan</SelectItem>
            {currentPicMissing && (
              <SelectItem value={currentPicMissing.id}>{currentPicMissing.name}</SelectItem>
            )}
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        disabled={updateMutation.isPending}
        onClick={handleSubmit}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Simpan Perubahan
      </button>
    </div>
  );
}
