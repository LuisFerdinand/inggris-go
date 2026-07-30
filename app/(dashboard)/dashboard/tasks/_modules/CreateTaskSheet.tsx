// app/(dashboard)/dashboard/tasks/_modules/CreateTaskSheet.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITY, TASK_PRIORITY_LABEL, type TaskPriority } from "@/lib/enums/enums";

const fieldLabelClass = "mb-1.5 block text-[12.5px] font-semibold text-slate-700";

export function CreateTaskSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [checklistDraft, setChecklistDraft] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useCloudinaryUpload();

  const usersQuery = trpc.taskBoard.listAssignableUsers.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.taskBoard.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.taskBoard.list.invalidate(),
        utils.taskBoard.badgeCounts.invalidate(),
      ]);
      toast.success(
        isAdmin
          ? "Tugas berhasil dibuat dan otomatis disetujui"
          : "Tugas berhasil dibuat, menunggu verifikasi admin",
      );
      reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Gagal membuat tugas");
    },
  });

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setStartDate("");
    setDueDate("");
    setCoverImageUrl("");
    setChecklistDraft([]);
    setNewChecklistText("");
  }

  function addChecklistDraftItem() {
    const text = newChecklistText.trim();
    if (!text) return;
    setChecklistDraft((prev) => [...prev, text]);
    setNewChecklistText("");
  }

  function removeChecklistDraftItem(index: number) {
    setChecklistDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const url = await upload(file);
    if (url) setCoverImageUrl(url);
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Judul tugas wajib diisi");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assigneeId: assigneeId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      coverImageUrl: coverImageUrl || undefined,
      checklistItems: checklistDraft.length
        ? checklistDraft.map((text) => ({ text }))
        : undefined,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-slate-100">
          <SheetTitle className="text-[16px] font-extrabold text-slate-800">
            Tugas Baru
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <label className={fieldLabelClass}>Judul</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Review konten batch Juli"
            />
          </div>

          <div>
            <label className={fieldLabelClass}>Deskripsi (opsional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detail tugas, konteks, atau referensi"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>Urgensi</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-9 w-full text-[12.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={fieldLabelClass}>Penanggung Jawab</label>
              <Select
                value={assigneeId || "none"}
                onValueChange={(v) => setAssigneeId(v === "none" ? "" : v)}
              >
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>Mulai</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className={fieldLabelClass}>Tenggat</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabelClass}>Checklist (opsional)</label>
            <div className="flex flex-col gap-1.5">
              {checklistDraft.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-1.5"
                >
                  <span className="flex-1 text-[12.5px] text-slate-600">{text}</span>
                  <button
                    type="button"
                    onClick={() => removeChecklistDraftItem(index)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistDraftItem();
                  }
                }}
                placeholder="Tambah item checklist…"
                className="h-9 text-[12.5px]"
              />
              <button
                type="button"
                disabled={!newChecklistText.trim()}
                onClick={addChecklistDraftItem}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <Plus className="size-3.5" /> Tambah
              </button>
            </div>
          </div>

          <div>
            <label className={fieldLabelClass}>Gambar Sampul (opsional)</label>
            {coverImageUrl ? (
              <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200">
                <Image src={coverImageUrl} alt="" fill className="object-cover" sizes="400px" />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ImageIcon className="size-5" />
                )}
                <span className="text-[11.5px] font-medium">
                  {isUploading ? "Mengunggah…" : "Unggah gambar"}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <button
            type="button"
            disabled={createMutation.isPending || isUploading}
            onClick={handleSubmit}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Buat Tugas
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
