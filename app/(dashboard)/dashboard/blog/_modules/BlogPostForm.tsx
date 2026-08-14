// app/(dashboard)/dashboard/blog/_modules/BlogPostForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Archive,
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  FolderOpen,
  Globe,
  Hash,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  postInsertSchema,
  type PostFormValues,
  type PostStatus,
} from "@/app/modules/blog/blog.schema";
import { RichTextEditor } from "./RichTextEditor";
import { BlogPreviewModal } from "./BlogPreviewModal";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";

/* =========================================================
   TYPES
========================================================= */

type Mode = "create" | "edit";

interface BlogPostFormProps {
  mode: Mode;
  postId?: string;
  defaultValues?: Partial<PostFormValues> & { id?: string };
}

/* =========================================================
   HELPERS
========================================================= */

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "draft" as PostStatus,
    label: "Draf",
    description: "Hanya terlihat di admin",
    icon: <Pencil className="size-3.5" />,
    pill: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "published" as PostStatus,
    label: "Terbit",
    description: "Live di website publik",
    icon: <Globe className="size-3.5" />,
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "archived" as PostStatus,
    label: "Diarsip",
    description: "Disembunyikan dari publik",
    icon: <Archive className="size-3.5" />,
    pill: "border-neutral-200 bg-neutral-50 text-neutral-500",
  },
];

/* =========================================================
   FIELD WRAPPER
========================================================= */

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-neutral-400">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none",
        className,
      )}
      {...props}
    />
  );
}

/* =========================================================
   STATUS SELECTOR
========================================================= */

function StatusSelector({
  value,
  onChange,
}: {
  value: PostStatus;
  onChange: (v: PostStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const current =
    STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0]!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors hover:opacity-80",
          current.pill,
        )}
      >
        {current.icon}
        {current.label}
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50",
                  value === opt.value && "bg-neutral-50",
                )}
              >
                <span className="mt-0.5">{opt.icon}</span>
                <div>
                  <p className="text-[12px] font-semibold text-neutral-700">
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {opt.description}
                  </p>
                </div>
                {value === opt.value && (
                  <Check className="ml-auto mt-0.5 size-3.5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   CATEGORY SELECTOR
========================================================= */

function CategorySelector({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const utils = trpc.useUtils();

  const { data: categories = [] } = trpc.blog.getCategories.useQuery();
  const createCategory = trpc.blog.createCategory.useMutation({
    onSuccess: async (cat) => {
      await utils.blog.getCategories.invalidate();
      onChange(cat.id);
      setNewName("");
      setShowCreate(false);
      toast.success(`Kategori "${cat.name}" dibuat`);
    },
    onError: (e) => toast.error(e.message || "Gagal membuat kategori"),
  });

  const selected = categories.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-[12px] transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <FolderOpen className="size-3.5 shrink-0 text-neutral-400" />
        <span className={selected ? "text-neutral-800 font-medium" : "text-neutral-400"}>
          {selected?.name ?? "Pilih kategori…"}
        </span>
        <ChevronDown
          className={cn("ml-auto size-3.5 text-neutral-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            {/* No category option */}
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] hover:bg-neutral-50",
                !value && "bg-neutral-50 font-semibold text-neutral-700",
              )}
            >
              <span className="text-neutral-400">—</span>
              <span>Tanpa kategori</span>
              {!value && <Check className="ml-auto size-3.5 text-blue-600" />}
            </button>

            <div className="mx-3 h-px bg-neutral-100" />

            {/* Existing categories */}
            <div className="max-h-44 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="px-3 py-3 text-[11px] italic text-neutral-400">
                  Belum ada kategori
                </p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { onChange(cat.id); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] hover:bg-neutral-50",
                      value === cat.id && "bg-blue-50 font-semibold text-blue-700",
                    )}
                  >
                    <FolderOpen className="size-3.5 shrink-0 text-neutral-400" />
                    {cat.name}
                    {value === cat.id && (
                      <Check className="ml-auto size-3.5 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mx-3 h-px bg-neutral-100" />

            {/* Create new */}
            {showCreate ? (
              <div className="flex items-center gap-2 p-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newName.trim()) {
                      e.preventDefault();
                      createCategory.mutate({ name: newName.trim() });
                    }
                    if (e.key === "Escape") setShowCreate(false);
                  }}
                  placeholder="Nama kategori baru…"
                  className="flex-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-[12px] focus:border-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newName.trim())
                      createCategory.mutate({ name: newName.trim() });
                  }}
                  disabled={createCategory.isPending || !newName.trim()}
                  className="rounded-lg bg-blue-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createCategory.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Buat"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-neutral-200 px-2 py-1.5 text-[11px] text-neutral-500 hover:bg-neutral-50"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus className="size-3.5" />
                Buat kategori baru
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   TAG SELECTOR
========================================================= */

function TagSelector({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: allTags = [] } = trpc.blog.getTags.useQuery();
  const createTag = trpc.blog.createTag.useMutation({
    onSuccess: async (t) => {
      await utils.blog.getTags.invalidate();
      onChange([...selectedIds, t.id]);
      setSearch("");
      toast.success(`Tag "#${t.name}" dibuat`);
    },
    onError: (e) => toast.error(e.message || "Gagal membuat tag"),
  });

  const filtered = allTags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedIds.includes(t.id),
  );
  const selected = allTags.filter((t) => selectedIds.includes(t.id));

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {selected.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
          >
            <Hash className="size-2.5" />
            {t.name}
            <button
              type="button"
              onClick={() => onChange(selectedIds.filter((id) => id !== t.id))}
              className="ml-0.5 text-blue-400 hover:text-blue-700"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="size-3" />
          Tambah tag
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-neutral-100 p-2">
              <Search className="size-3.5 text-neutral-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari atau buat tag…"
                className="flex-1 text-[12px] placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <div className="max-h-44 overflow-y-auto">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onChange([...selectedIds, t.id]);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Hash className="size-3 text-neutral-400" />
                  {t.name}
                </button>
              ))}
              {search &&
                !allTags.find(
                  (t) => t.name.toLowerCase() === search.toLowerCase(),
                ) && (
                  <button
                    type="button"
                    onClick={() => createTag.mutate({ name: search })}
                    disabled={createTag.isPending}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-blue-600 hover:bg-blue-50"
                  >
                    {createTag.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Plus className="size-3" />
                    )}
                    Buat tag "{search}"
                  </button>
                )}
              {filtered.length === 0 && !search && (
                <p className="px-3 py-4 text-center text-[11px] italic text-neutral-400">
                  Semua tag sudah dipilih
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   COVER IMAGE UPLOADER
========================================================= */

function CoverImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { upload, isUploading, progress, error, reset } =
    useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = await upload(file);
    if (url) {
      onChange(url);
      toast.success("Gambar berhasil diupload!");
    } else {
      toast.error(error ?? "Upload gagal");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <img
            src={value}
            alt="Cover"
            className="h-36 w-full object-cover"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display =
                "none";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 shadow hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw className="size-3" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => { onChange(""); reset(); }}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-red-600 transition-colors"
            >
              <Trash2 className="size-3" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            isUploading
              ? "cursor-not-allowed border-blue-300 bg-blue-50"
              : "border-neutral-200 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50",
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-blue-500" />
              <p className="text-[12px] font-medium text-blue-600">
                Mengupload… {progress ?? 0}%
              </p>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="size-7 text-neutral-400" />
              <div className="text-center">
                <p className="text-[12px] font-semibold text-neutral-600">
                  Klik atau drag & drop gambar
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400">
                  JPG, PNG, WebP · Maks 10 MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}

      {!value && !isUploading && (
        <>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-neutral-100" />
            <span className="text-[10px] text-neutral-400">atau tempel URL</span>
            <div className="h-px flex-1 bg-neutral-100" />
          </div>
          <Input
            type="url"
            placeholder="https://images.unsplash.com/…"
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v) onChange(v);
            }}
            className="text-[12px]"
          />
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

/* =========================================================
   MAIN FORM
========================================================= */

export function BlogPostForm({ mode, postId, defaultValues }: BlogPostFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postInsertSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      contentHtml: "",
      coverImage: "",
      status: "draft",
      isFeatured: false,
      categoryId: null,
      readTime: undefined,
      tagIds: [],
      authorId: "",
      ...defaultValues,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const status = watch("status");
  const isFeatured = watch("isFeatured");
  const excerpt = watch("excerpt");
  const coverImage = watch("coverImage");
  const contentHtml = watch("contentHtml");
  const readTime = watch("readTime");
  const tagIds = watch("tagIds");

  /* ── Preview modal ──────────────────────────────────── */
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: allTags = [] } = trpc.blog.getTags.useQuery();
  const previewTags = allTags.filter((t) => (tagIds ?? []).includes(t.id));

  /* ── Slug auto-gen ─────────────────────────────────── */
  const isSlugManual = useRef(false);
  useEffect(() => {
    if (mode === "create" && !isSlugManual.current && title) {
      setValue("slug", titleToSlug(title), { shouldValidate: false });
    }
  }, [title, mode, setValue]);

  /* ── authorId from session ─────────────────────────── */
  const { data: session } = useSession();
  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && mode === "create") setValue("authorId", userId);
  }, [session, mode, setValue]);

  /* ── Mutations ────────────────────────────────────── */
  const create = trpc.blog.create.useMutation({
    onSuccess: (data) => {
      toast.success("Artikel berhasil dibuat!");
      utils.blog.getFiltered.invalidate();
      utils.blog.getStats.invalidate();
      router.push(`/dashboard/blog/${data.id}`);
    },
    onError: (e) => toast.error(e.message || "Gagal membuat artikel"),
  });

  const update = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Artikel berhasil disimpan!");
      utils.blog.getFiltered.invalidate();
      utils.blog.getStats.invalidate();
    },
    onError: (e) => toast.error(e.message || "Gagal menyimpan artikel"),
  });

  const remove = trpc.blog.remove.useMutation({
    onSuccess: async () => {
      toast.success("Artikel dihapus");
      await utils.blog.getFiltered.invalidate();
      router.push("/dashboard/blog");
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus artikel"),
  });

  const isPending = create.isPending || update.isPending;

  const onSubmit = (values: PostFormValues) => {
    if (mode === "create") create.mutate(values);
    else if (postId) update.mutate({ ...values, id: postId });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-[1fr_300px]">

        {/* ── Left: main content ──────────────────────── */}
        <div className="flex flex-col gap-5">
          <Field label="Judul" required error={errors.title?.message}>
            <Input
              {...register("title")}
              placeholder="Tulis judul artikel yang menarik…"
              className="text-base font-semibold"
            />
          </Field>

          <Field
            label="Ringkasan"
            hint="Ditampilkan di list artikel dan meta SEO. Maks 500 karakter."
            error={errors.excerpt?.message}
          >
            <Textarea
              {...register("excerpt")}
              placeholder="Tulis ringkasan singkat artikel ini…"
              rows={3}
            />
          </Field>

          <Field label="Konten Artikel" error={errors.contentHtml?.message}>
            <Controller
              control={control}
              name="contentHtml"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Mulai menulis artikel kamu di sini…"
                  minHeight={480}
                />
              )}
            />
          </Field>
        </div>

        {/* ── Right: sidebar ──────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* ── Actions ─────────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Tindakan
            </p>

            {/* Status */}
            <Field label="Status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <StatusSelector
                    value={field.value as PostStatus}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => setValue("isFeatured", !isFeatured)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[12px] font-semibold transition-all",
                isFeatured
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",
              )}
            >
              <Star
                className={cn(
                  "size-4 shrink-0",
                  isFeatured ? "fill-amber-400 text-amber-400" : "text-neutral-400",
                )}
              />
              <div className="flex-1">
                <p>Artikel Unggulan</p>
                <p className="text-[10px] font-normal text-neutral-400">
                  Tampil di hero slider blog
                </p>
              </div>
              {/* Toggle indicator */}
              <div
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors",
                  isFeatured ? "bg-amber-400" : "bg-neutral-200",
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform",
                    isFeatured ? "translate-x-3" : "translate-x-0.5",
                  )}
                />
              </div>
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[12px] font-bold text-neutral-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Eye className="size-3.5" />
              Pratinjau
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[12px] font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {mode === "create" ? "Buat Artikel" : "Simpan Perubahan"}
            </button>

            {/* Delete */}
            {mode === "edit" && postId && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Hapus artikel ini? Tindakan ini tidak bisa dibatalkan.",
                    )
                  ) {
                    remove.mutate({ id: postId });
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                {remove.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Hapus Artikel
              </button>
            )}
          </div>

          {/* ── Cover Image ───────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Gambar Cover
            </p>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <CoverImageUploader
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* ── Category & Tags ───────────────────────── */}
          <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Kategori & Tag
            </p>

            <Field label="Kategori">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field label="Tag">
              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <TagSelector
                    selectedIds={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </div>

          {/* ── Metadata ──────────────────────────────── */}
          <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Metadata
            </p>

            {/* Slug */}
            <Field
              label="Slug URL"
              hint={`/blog/${slug || "…"}`}
              error={errors.slug?.message}
            >
              <div className="flex gap-2">
                <Input
                  {...register("slug", {
                    onChange: () => { isSlugManual.current = true; },
                  })}
                  placeholder="judul-artikel-anda"
                  className="flex-1 font-mono text-[12px]"
                />
                <button
                  type="button"
                  title="Generate ulang dari judul"
                  onClick={() => {
                    isSlugManual.current = false;
                    setValue("slug", titleToSlug(title || ""), {
                      shouldValidate: true,
                    });
                  }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            </Field>

            {/* Read time */}
            <Field
              label="Waktu Baca"
              hint="Menit. Biarkan kosong untuk auto."
              error={errors.readTime?.message}
            >
              <Input
                {...register("readTime")}
                type="number"
                min={1}
                placeholder="5"
              />
            </Field>
          </div>

          {/* ── Info (edit only) ──────────────────────── */}
          {mode === "edit" && (
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Info
              </p>
              <div className="space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-neutral-700">
                    {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                  </span>
                </div>
                {defaultValues?.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span>Diterbitkan</span>
                    <span className="font-semibold text-neutral-700">
                      {new Date(
                        defaultValues.publishedAt,
                      ).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BlogPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        excerpt={excerpt}
        coverImage={coverImage}
        contentHtml={contentHtml}
        readTime={readTime}
        tags={previewTags}
      />
    </form>
  );
}