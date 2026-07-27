// app/(dashboard)/dashboard/tasks/_modules/TaskDetailSheet.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITY, TASK_PRIORITY_LABEL, type TaskPriority } from "@/lib/enums/enums";

import { TaskPriorityBadge, TaskStatusBadge } from "./badges";
import { initials } from "./helpers";

const fieldLabelClass = "mb-1.5 block text-[11.5px] font-semibold text-slate-500";

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskDetailSheet({
  taskId,
  onOpenChange,
}: {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;

  const utils = trpc.useUtils();

  const taskQuery = trpc.taskBoard.getById.useQuery(
    { id: taskId ?? "" },
    { enabled: !!taskId },
  );
  const usersQuery = trpc.taskBoard.listAssignableUsers.useQuery();

  const task = taskQuery.data;

  const isCreator = !!task && task.createdBy === userId;
  const isAssignee = !!task && task.assigneeId === userId;
  const canEdit = isCreator || isAssignee || isAdmin;
  const canDelete =
    isAdmin ||
    (isCreator && (task?.status === "pending_review" || task?.status === "rejected"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const syncedTaskId = useRef<string | null>(null);

  useEffect(() => {
    if (!task) return;
    if (syncedTaskId.current === task.id) return;
    syncedTaskId.current = task.id;

    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setAssigneeId(task.assigneeId ?? "");
    setStartDate(toDateInputValue(task.startDate));
    setDueDate(toDateInputValue(task.dueDate));
    setShowRejectForm(false);
    setRejectNote("");
    setCommentBody("");
    setPendingAttachments([]);
  }, [task]);

  function invalidateAll() {
    utils.taskBoard.list.invalidate();
    if (taskId) utils.taskBoard.getById.invalidate({ id: taskId });
  }

  const updateMutation = trpc.taskBoard.update.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("Perubahan disimpan");
    },
    onError: (err) => toast.error(err.message || "Gagal menyimpan perubahan"),
  });

  const verifyMutation = trpc.taskBoard.verify.useMutation({
    onSuccess: (row) => {
      invalidateAll();
      setShowRejectForm(false);
      setRejectNote("");
      toast.success(row?.status === "direncanakan" ? "Tugas disetujui" : "Tugas ditolak");
    },
    onError: (err) => toast.error(err.message || "Gagal memverifikasi tugas"),
  });

  const confirmDoneMutation = trpc.taskBoard.confirmDone.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("Tugas ditandai selesai");
    },
    onError: (err) => toast.error(err.message || "Gagal menandai tugas selesai"),
  });

  const moveMutation = trpc.taskBoard.move.useMutation({
    onSuccess: () => invalidateAll(),
    onError: (err) => toast.error(err.message || "Gagal memindahkan tugas"),
  });

  const resubmitMutation = trpc.taskBoard.resubmit.useMutation({
    onSuccess: () => {
      invalidateAll();
      toast.success("Tugas diajukan ulang untuk verifikasi");
    },
    onError: (err) => toast.error(err.message || "Gagal mengajukan ulang"),
  });

  const deleteMutation = trpc.taskBoard.delete.useMutation({
    onSuccess: () => {
      utils.taskBoard.list.invalidate();
      toast.success("Tugas dihapus");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message || "Gagal menghapus tugas"),
  });

  const addCommentMutation = trpc.taskBoard.addComment.useMutation({
    onSuccess: () => {
      invalidateAll();
      setCommentBody("");
      setPendingAttachments([]);
    },
    onError: (err) => toast.error(err.message || "Gagal menambah komentar"),
  });

  const deleteCommentMutation = trpc.taskBoard.deleteComment.useMutation({
    onSuccess: () => invalidateAll(),
    onError: (err) => toast.error(err.message || "Gagal menghapus komentar"),
  });

  const coverUpload = useCloudinaryUpload();
  const commentUpload = useCloudinaryUpload();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  function saveDetails() {
    if (!task) return;
    if (!title.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }

    updateMutation.mutate({
      id: task.id,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      assigneeId: assigneeId || null,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
  }

  async function handleCoverFile(file: File | undefined | null) {
    if (!file || !task) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const url = await coverUpload.upload(file);
    if (url) {
      updateMutation.mutate({ id: task.id, coverImageUrl: url });
    }
  }

  function removeCoverImage() {
    if (!task) return;
    updateMutation.mutate({ id: task.id, coverImageUrl: null });
  }

  async function handleCommentFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, 6 - pendingAttachments.length);
    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      const url = await commentUpload.upload(file);
      if (url) setPendingAttachments((prev) => [...prev, url]);
    }
  }

  function submitComment() {
    if (!task) return;
    if (!commentBody.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }
    addCommentMutation.mutate({
      taskId: task.id,
      body: commentBody.trim(),
      attachmentUrls: pendingAttachments,
    });
  }

  const open = !!taskId;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {/* Radix requires a DialogTitle to be present whenever the sheet is
            open, even while the task is still loading — kept visually
            hidden here since the visible heading below (Input or <p>)
            isn't itself a SheetTitle element. */}
        <SheetTitle className="sr-only">
          {task ? task.title : "Memuat detail tugas"}
        </SheetTitle>

        {!task ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            <SheetHeader className="gap-2 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 pr-6">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              {canEdit ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveDetails}
                  className="h-auto border-none p-0 text-[16px] font-extrabold text-slate-800 shadow-none focus-visible:ring-0"
                />
              ) : (
                <p className="text-[16px] font-extrabold text-slate-800">{task.title}</p>
              )}
            </SheetHeader>

            <div className="flex flex-col gap-4 p-4">
              {/* Verification banner */}
              {task.status === "pending_review" &&
                (isSuperAdmin ? (
                  <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[12px] font-semibold text-amber-700">
                      Tugas ini menunggu verifikasi Anda sebagai super admin.
                    </p>
                    {!showRejectForm ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={verifyMutation.isPending}
                          onClick={() =>
                            verifyMutation.mutate({ id: task.id, decision: "approve" })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="size-3.5" /> Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="size-3.5" /> Tolak
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Alasan penolakan…"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={verifyMutation.isPending}
                            onClick={() => {
                              if (!rejectNote.trim()) {
                                toast.error("Alasan penolakan wajib diisi");
                                return;
                              }
                              verifyMutation.mutate({
                                id: task.id,
                                decision: "reject",
                                reviewNote: rejectNote.trim(),
                              });
                            }}
                            className="inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Konfirmasi Tolak
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectForm(false)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-500 hover:bg-slate-50"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-medium text-amber-700">
                    Menunggu verifikasi super admin sebelum tugas ini dapat dikerjakan.
                  </div>
                ))}

              {task.status === "rejected" && (
                <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-[12px] font-semibold text-red-700">
                    Tugas ditolak{task.verifier?.name ? ` oleh ${task.verifier.name}` : ""}.
                  </p>
                  {task.reviewNote && (
                    <p className="text-[12px] text-red-600">&ldquo;{task.reviewNote}&rdquo;</p>
                  )}
                  {(isCreator || isAdmin) && (
                    <button
                      type="button"
                      disabled={resubmitMutation.isPending}
                      onClick={() => resubmitMutation.mutate({ id: task.id })}
                      className="mt-1 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      Ajukan Ulang
                    </button>
                  )}
                </div>
              )}

              {task.status === "review" && (
                <div className="flex flex-col gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
                  <p className="text-[12px] font-semibold text-teal-700">
                    {isSuperAdmin
                      ? "Tugas ini menunggu review Anda sebelum ditandai selesai."
                      : "Menunggu review super admin sebelum tugas ini ditandai selesai."}
                  </p>
                  <div className="flex gap-2">
                    {isSuperAdmin && (
                      <button
                        type="button"
                        disabled={confirmDoneMutation.isPending}
                        onClick={() => confirmDoneMutation.mutate({ id: task.id })}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="size-3.5" /> Tandai Selesai
                      </button>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        disabled={moveMutation.isPending}
                        onClick={() =>
                          moveMutation.mutate({ id: task.id, status: "in_progress", position: 0 })
                        }
                        className="inline-flex flex-1 items-center justify-center rounded-lg border border-teal-200 bg-white px-3 py-2 text-[12px] font-bold text-teal-700 hover:bg-teal-100"
                      >
                        Kembalikan ke Dikerjakan
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabelClass}>Urgensi</label>
                  {canEdit ? (
                    <Select
                      value={priority}
                      onValueChange={(v) => {
                        setPriority(v as TaskPriority);
                        updateMutation.mutate({ id: task.id, priority: v as TaskPriority });
                      }}
                    >
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
                  ) : (
                    <TaskPriorityBadge priority={task.priority} />
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>Penanggung Jawab</label>
                  {canEdit ? (
                    <Select
                      value={assigneeId || "none"}
                      onValueChange={(v) => {
                        const next = v === "none" ? "" : v;
                        setAssigneeId(next);
                        updateMutation.mutate({ id: task.id, assigneeId: next || null });
                      }}
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
                  ) : (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                      <Avatar size="sm">
                        <AvatarImage src={task.assignee?.image ?? undefined} />
                        <AvatarFallback className="text-[9px]">
                          {initials(task.assignee?.name)}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee?.name ?? "Belum ditentukan"}
                    </div>
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>Mulai</label>
                  {canEdit ? (
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onBlur={saveDetails}
                    />
                  ) : (
                    <p className="text-[12.5px] text-slate-600">{startDate || "—"}</p>
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>Tenggat</label>
                  {canEdit ? (
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      onBlur={saveDetails}
                    />
                  ) : (
                    <p className="text-[12.5px] text-slate-600">{dueDate || "—"}</p>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Dibuat oleh {task.creator?.name ?? "—"} · {formatDateTime(task.createdAt)}
                {task.verifier ? ` · Diverifikasi oleh ${task.verifier.name}` : ""}
              </p>

              {/* Description */}
              <div>
                <label className={fieldLabelClass}>Deskripsi</label>
                {canEdit ? (
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={saveDetails}
                    rows={4}
                    placeholder="Tidak ada deskripsi"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-[13px] text-slate-600">
                    {task.description || "Tidak ada deskripsi"}
                  </p>
                )}
              </div>

              {/* Cover image */}
              <div>
                <label className={fieldLabelClass}>Gambar Sampul</label>
                {task.coverImageUrl ? (
                  <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={task.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="500px"
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  canEdit && (
                    <button
                      type="button"
                      disabled={coverUpload.isUploading}
                      onClick={() => coverInputRef.current?.click()}
                      className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-60"
                    >
                      {coverUpload.isUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ImageIcon className="size-4" />
                      )}
                      <span className="text-[11px] font-medium">Unggah gambar</span>
                    </button>
                  )
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCoverFile(e.target.files?.[0])}
                />
              </div>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Hapus tugas ini? Tindakan ini tidak dapat dibatalkan.")) {
                      deleteMutation.mutate({ id: task.id });
                    }
                  }}
                  className="inline-flex w-fit items-center gap-1.5 self-start text-[12px] font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" /> Hapus Tugas
                </button>
              )}

              {/* Comments */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                <h3 className="text-[12.5px] font-bold text-slate-700">
                  Komentar ({task.comments.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5">
                      <Avatar size="sm" className="mt-0.5">
                        <AvatarImage src={comment.author?.image ?? undefined} />
                        <AvatarFallback className="text-[9px]">
                          {initials(comment.author?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-bold text-slate-700">
                            {comment.author?.name ?? "—"}
                          </p>
                          {(comment.authorId === userId || isAdmin) && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteCommentMutation.mutate({ commentId: comment.id })
                              }
                              className="text-slate-300 hover:text-red-500"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-[12.5px] text-slate-600">
                          {comment.body}
                        </p>
                        {comment.attachments.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {comment.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="relative size-14 overflow-hidden rounded-lg border border-slate-200"
                              >
                                <Image
                                  src={att.url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDateTime(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {task.comments.length === 0 && (
                    <p className="text-[12px] text-slate-400">Belum ada komentar.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-2.5">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={2}
                    placeholder="Tulis komentar atau catatan follow-up…"
                    className="border-none p-0 shadow-none focus-visible:ring-0"
                  />

                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pendingAttachments.map((url) => (
                        <div key={url} className="relative size-12 overflow-hidden rounded-lg border border-slate-200">
                          <Image src={url} alt="" fill className="object-cover" sizes="48px" />
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAttachments((prev) => prev.filter((u) => u !== url))
                            }
                            className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={commentUpload.isUploading || pendingAttachments.length >= 6}
                      onClick={() => commentFileInputRef.current?.click()}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-400 hover:text-indigo-500",
                        commentUpload.isUploading && "opacity-60",
                      )}
                    >
                      {commentUpload.isUploading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="size-3.5" />
                      )}
                      Gambar
                    </button>
                    <input
                      ref={commentFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleCommentFiles(e.target.files)}
                    />

                    <button
                      type="button"
                      disabled={addCommentMutation.isPending || !commentBody.trim()}
                      onClick={submitComment}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
                    >
                      {addCommentMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
