// app/(dashboard)/dashboard/settings/header/_modules/SiteHeaderSettingsView.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Braces,
  CheckCircle2,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  Globe2,
  ImageIcon,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

/* ─────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────── */
type FormState = {
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  canonicalUrl: string;
  themeColor: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  customHeadScript: string;
  customBodyStartHtml: string;
  customBodyEndScript: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  siteName: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  faviconUrl: "",
  appleTouchIconUrl: "",
  canonicalUrl: "",
  themeColor: "#1a52c8",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  customHeadScript: "",
  customBodyStartHtml: "",
  customBodyEndScript: "",
  isActive: true,
};

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/* ─────────────────────────────────────────────────────────────
 * PRIMITIVES
 * ───────────────────────────────────────────────────────────── */
function Field({
  label,
  description,
  hint,
  children,
}: {
  label: string;
  description?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-[12.5px] font-black text-slate-800">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  if (prefix) {
    return (
      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold text-slate-400 select-none">
          {prefix}
        </span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100",
          mono && "font-mono text-[11.5px] leading-relaxed",
          maxLength && "pb-6",
        )}
      />
      {maxLength && (
        <span className="absolute bottom-2 right-3 text-[10.5px] font-semibold text-slate-400 pointer-events-none">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * CLOUDINARY IMAGE UPLOADER
 * ───────────────────────────────────────────────────────────── */
function ImageUploader({
  value,
  onChange,
  label,
  description,
  accept = "image/*",
  previewShape = "rect",
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  accept?: string;
  previewShape?: "rect" | "square" | "circle";
}) {
  const { upload, isUploading, progress, error, reset } = useCloudinaryUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const url = await upload(file);
      if (url) onChange(url);
    },
    [upload, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const shapeClass =
    previewShape === "circle"
      ? "rounded-full aspect-square w-16"
      : previewShape === "square"
        ? "rounded-xl aspect-square w-20"
        : "rounded-xl aspect-video w-full";

  return (
    <Field label={label} description={description}>
      <div className="space-y-2">
        {/* URL input row */}
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... atau unggah gambar"
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-[12.5px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload
          </button>
        </div>

        {/* Drop zone — shown when no image or uploading */}
        {!value && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-center transition-colors",
              dragOver
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50",
            )}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
              <ImageIcon className="size-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[12px] font-black text-slate-600">
                {dragOver ? "Lepas untuk upload" : "Drag & drop atau klik untuk pilih"}
              </p>
              <p className="text-[11px] text-slate-400">PNG, JPG, WEBP · maks 10 MB</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Mengunggah… {progress ?? 0}%
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
            <AlertCircle className="size-3.5 shrink-0 text-red-500" />
            <p className="text-[11.5px] font-semibold text-red-600">{error}</p>
            <button type="button" onClick={reset} className="ml-auto">
              <X className="size-3.5 text-red-400" />
            </button>
          </div>
        )}

        {/* Image preview */}
        {value && !isUploading && (
          <div className="flex items-start gap-3">
            <div className={cn("overflow-hidden border border-slate-200 bg-slate-50", shapeClass)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <p className="text-[11px] font-black text-slate-700 max-w-[200px] break-all line-clamp-2">
                {value.split("/").pop()}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-600 hover:bg-slate-50"
                >
                  <Upload className="size-3" /> Ganti
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-black text-red-600 hover:bg-red-100"
                >
                  <X className="size-3" /> Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </Field>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION CARD
 * ───────────────────────────────────────────────────────────── */
function Section({
  icon: Icon,
  title,
  description,
  badge,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        className={cn(
          "flex items-start gap-3 border-b border-slate-100 p-5",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-black text-slate-900">{title}</h2>
            {badge && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
        {collapsible && (
          <ChevronRight
            className={cn(
              "mt-0.5 size-4 shrink-0 text-slate-400 transition-transform",
              open && "rotate-90",
            )}
          />
        )}
      </div>

      {(!collapsible || open) && (
        <div className="grid gap-4 p-5">{children}</div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * CHAR COUNTER BADGE
 * ───────────────────────────────────────────────────────────── */
function CharBadge({
  value,
  ideal,
  max,
}: {
  value: string;
  ideal: [number, number];
  max: number;
}) {
  const len = value.length;
  const good = len >= ideal[0] && len <= ideal[1];
  const over = len > max;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-black",
        over
          ? "bg-red-100 text-red-700"
          : good
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-500",
      )}
    >
      {len}/{max}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * GOOGLE SERP PREVIEW
 * ───────────────────────────────────────────────────────────── */
function SerpPreview({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Google Preview
      </p>
      <div className="space-y-0.5">
        <p className="line-clamp-1 text-[15px] font-semibold text-[#1a0dab]">
          {title || "Meta title belum diisi"}
        </p>
        <p className="text-[12px] text-[#006621]">
          {url || "https://your-domain.com"} ›
        </p>
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">
          {description || "Meta description belum diisi."}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * OG CARD PREVIEW
 * ───────────────────────────────────────────────────────────── */
function OgPreview({
  title,
  description,
  imageUrl,
  url,
}: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Social Share Preview
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="OG preview"
            className="aspect-[1200/630] w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex aspect-[1200/630] w-full items-center justify-center bg-slate-100">
            <ImageIcon className="size-8 text-slate-300" />
          </div>
        )}
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "your-domain.com"}
          </p>
          <p className="line-clamp-1 text-[12.5px] font-black text-slate-800">
            {title || "Open Graph title belum diisi"}
          </p>
          <p className="line-clamp-1 text-[11.5px] text-slate-500">
            {description || "Open Graph description belum diisi."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * FAVICON PREVIEW
 * ───────────────────────────────────────────────────────────── */
function FaviconPreview({
  faviconUrl,
  siteName,
  metaTitle,
}: {
  faviconUrl: string;
  siteName: string;
  metaTitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Browser Tab Preview
      </p>
      {/* Fake browser chrome */}
      <div className="rounded-xl border border-slate-200 bg-slate-100 p-1.5">
        <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-sm">
          {faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt="Favicon"
              className="size-4 shrink-0 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Globe2 className="size-4 shrink-0 text-slate-400" />
          )}
          <p className="truncate text-[12px] font-semibold text-slate-700">
            {metaTitle || siteName || "Judul Halaman"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * MAIN VIEW
 * ───────────────────────────────────────────────────────────── */
export function SiteHeaderSettingsView() {
  const utils = trpc.useUtils();

  const settingsQuery = trpc.siteHeader.getSettings.useQuery();

  const updateSettings = trpc.siteHeader.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Site Header berhasil diperbarui!");
      void utils.siteHeader.getSettings.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui Site Header");
    },
  });

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data) return;
    const d = settingsQuery.data;
    setForm({
      siteName: d.siteName ?? "",
      metaTitle: d.metaTitle ?? "",
      metaDescription: d.metaDescription ?? "",
      metaKeywords: d.metaKeywords ?? "",
      ogTitle: d.ogTitle ?? "",
      ogDescription: d.ogDescription ?? "",
      ogImageUrl: d.ogImageUrl ?? "",
      faviconUrl: d.faviconUrl ?? "",
      appleTouchIconUrl: d.appleTouchIconUrl ?? "",
      canonicalUrl: d.canonicalUrl ?? "",
      themeColor: d.themeColor ?? "#1a52c8",
      googleAnalyticsId: d.googleAnalyticsId ?? "",
      googleTagManagerId: d.googleTagManagerId ?? "",
      metaPixelId: d.metaPixelId ?? "",
      customHeadScript: d.customHeadScript ?? "",
      customBodyStartHtml: d.customBodyStartHtml ?? "",
      customBodyEndScript: d.customBodyEndScript ?? "",
      isActive: d.isActive,
    });
  }, [settingsQuery.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    updateSettings.mutate({
      siteName: form.siteName,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      metaKeywords: emptyToNull(form.metaKeywords),
      ogTitle: emptyToNull(form.ogTitle),
      ogDescription: emptyToNull(form.ogDescription),
      ogImageUrl: emptyToNull(form.ogImageUrl),
      faviconUrl: emptyToNull(form.faviconUrl),
      appleTouchIconUrl: emptyToNull(form.appleTouchIconUrl),
      canonicalUrl: emptyToNull(form.canonicalUrl),
      themeColor: emptyToNull(form.themeColor),
      googleAnalyticsId: emptyToNull(form.googleAnalyticsId),
      googleTagManagerId: emptyToNull(form.googleTagManagerId),
      metaPixelId: emptyToNull(form.metaPixelId),
      customHeadScript: emptyToNull(form.customHeadScript),
      customBodyStartHtml: emptyToNull(form.customBodyStartHtml),
      customBodyEndScript: emptyToNull(form.customBodyEndScript),
      isActive: form.isActive,
    });
  }

  const isSaving = updateSettings.isPending;

  /* ── Loading ── */
  if (settingsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Pengaturan", href: "/dashboard/settings" },
              { label: "Site Header", icon: <Globe2 /> },
            ]}
            title="Site Header CMS"
            description="Kelola title, meta, favicon, Open Graph, dan integrasi third-party."
          />
        </PageNav>
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white mx-4 lg:mx-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="size-7 animate-spin" />
            <p className="text-[13px] font-black">Memuat pengaturan…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (settingsQuery.isError) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Pengaturan", href: "/dashboard/settings" },
              { label: "Site Header", icon: <Globe2 /> },
            ]}
            title="Site Header CMS"
            description="Kelola title, meta, favicon, Open Graph, dan integrasi third-party."
          />
        </PageNav>
        <div className="mx-4 lg:mx-6 flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-red-100">
            <AlertCircle className="size-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-black text-red-700">Gagal memuat Site Header</p>
            <p className="mt-1 max-w-md text-[12px] font-medium text-red-500">
              {settingsQuery.error.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => settingsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-red-700"
          >
            <RefreshCcw className="size-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Pengaturan", href: "/dashboard/settings" },
            { label: "Site Header", icon: <Globe2 /> },
          ]}
          title="Site Header CMS"
          description="Kelola title, meta description, favicon, Open Graph, dan integrasi third-party dari dashboard."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        {/* ── Status bar ── */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                form.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
              )}
            >
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-black text-slate-900">
                  Header Injection
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-black",
                    form.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {form.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500">
                Favicon, metadata, dan script akan diterapkan di seluruh halaman.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-black transition-colors",
              form.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <CheckCircle2 className="size-3.5" />
            {form.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>

        {/* ── Main grid ── */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* SEO */}
            <Section
              icon={Search}
              title="SEO Metadata"
              description="Data utama yang tampil di browser tab dan hasil pencarian Google."
            >
              <Field label="Site Name" description="Nama singkat website untuk internal referensi.">
                <TextInput
                  value={form.siteName}
                  onChange={(v) => set("siteName", v)}
                  placeholder="Inggris Go"
                />
              </Field>

              <Field label="Canonical URL" description="Domain utama website kamu.">
                <TextInput
                  value={form.canonicalUrl}
                  onChange={(v) => set("canonicalUrl", v)}
                  placeholder="https://inggrisgo.com"
                />
              </Field>

              <Field label="Meta Title">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <TextInput
                      value={form.metaTitle}
                      onChange={(v) => set("metaTitle", v)}
                      placeholder="Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah"
                    />
                  </div>
                  <CharBadge value={form.metaTitle} ideal={[50, 60]} max={70} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Idealnya 50–60 karakter untuk tampil sempurna di Google.</p>
              </Field>

              <Field label="Meta Description">
                <TextArea
                  value={form.metaDescription}
                  onChange={(v) => set("metaDescription", v)}
                  rows={3}
                  placeholder="Program speaking, English camp, dan kelas privat di Kampung Inggris Pare…"
                  maxLength={160}
                />
                <p className="text-[11px] text-slate-400 mt-1">Idealnya 120–155 karakter.</p>
              </Field>

              <Field
                label="Meta Keywords"
                description="Pisahkan dengan koma. Tidak berdampak besar pada ranking, tapi tetap berguna."
              >
                <TextArea
                  value={form.metaKeywords}
                  onChange={(v) => set("metaKeywords", v)}
                  rows={2}
                  placeholder="english course, kampung inggris pare, belajar speaking"
                />
              </Field>

              <Field label="Theme Color" description="Warna browser address bar di mobile.">
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={form.themeColor}
                      onChange={(e) => set("themeColor", e.target.value)}
                      className="size-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                    />
                  </div>
                  <TextInput
                    value={form.themeColor}
                    onChange={(v) => set("themeColor", v)}
                    placeholder="#1a52c8"
                  />
                </div>
              </Field>
            </Section>

            {/* Favicon & Social */}
            <Section
              icon={ImageIcon}
              title="Favicon & Open Graph"
              description="Icon website dan tampilan saat link dibagikan ke WhatsApp, Instagram, Twitter, dll."
            >
              <ImageUploader
                label="Favicon"
                description="File .ico, .png, atau .svg · disarankan 32×32 atau 64×64 px"
                value={form.faviconUrl}
                onChange={(url) => set("faviconUrl", url)}
                accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                previewShape="circle"
              />

              <ImageUploader
                label="Apple Touch Icon"
                description="PNG 180×180 px · dipakai saat website di-pin ke homescreen iOS"
                value={form.appleTouchIconUrl}
                onChange={(url) => set("appleTouchIconUrl", url)}
                accept="image/png"
                previewShape="square"
              />

              <div className="border-t border-slate-100 pt-2">
                <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Open Graph
                </p>
                <div className="grid gap-4">
                  <Field
                    label="OG Title"
                    description="Judul saat link dibagikan. Default ke Meta Title jika kosong."
                  >
                    <TextInput
                      value={form.ogTitle}
                      onChange={(v) => set("ogTitle", v)}
                      placeholder="Sama seperti Meta Title jika kosong"
                    />
                  </Field>

                  <Field
                    label="OG Description"
                    description="Deskripsi saat link dibagikan."
                  >
                    <TextArea
                      value={form.ogDescription}
                      onChange={(v) => set("ogDescription", v)}
                      rows={2}
                      placeholder="Sama seperti Meta Description jika kosong"
                    />
                  </Field>

                  <ImageUploader
                    label="OG Image"
                    description="Gambar pratinjau saat link dibagikan · disarankan 1200×630 px"
                    value={form.ogImageUrl}
                    onChange={(url) => set("ogImageUrl", url)}
                    previewShape="rect"
                  />
                </div>
              </div>
            </Section>

            {/* Third-party */}
            <Section
              icon={Sparkles}
              title="Integrasi Third-party"
              description="Masukkan ID tanpa perlu paste full script secara manual."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Google Analytics"
                  description="Format: G-XXXXXXXXXX"
                >
                  <TextInput
                    value={form.googleAnalyticsId}
                    onChange={(v) => set("googleAnalyticsId", v)}
                    placeholder="G-XXXXXXXXXX"
                    prefix="GA4"
                  />
                </Field>

                <Field
                  label="Google Tag Manager"
                  description="Format: GTM-XXXXXXX"
                >
                  <TextInput
                    value={form.googleTagManagerId}
                    onChange={(v) => set("googleTagManagerId", v)}
                    placeholder="GTM-XXXXXXX"
                    prefix="GTM"
                  />
                </Field>

                <Field label="Meta Pixel" description="ID numerik dari Facebook.">
                  <TextInput
                    value={form.metaPixelId}
                    onChange={(v) => set("metaPixelId", v)}
                    placeholder="1234567890"
                    prefix="FB"
                  />
                </Field>
              </div>
            </Section>

            {/* Advanced code */}
            <Section
              icon={Code2}
              title="Custom Code"
              description="Untuk integrasi khusus. JavaScript only, tanpa tag <script>."
              badge="Advanced"
              collapsible
              defaultOpen={false}
            >
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Braces className="size-4 shrink-0 text-amber-600" />
                <p className="text-[12px] font-semibold text-amber-700">
                  Custom code memengaruhi seluruh website. Gunakan hanya script dari platform terpercaya.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCode((s) => !s)}
                  className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-[11.5px] font-black text-amber-700 hover:bg-amber-200"
                >
                  {showCode ? (
                    <><EyeOff className="size-3" /> Sembunyikan</>
                  ) : (
                    <><Eye className="size-3" /> Tampilkan Editor</>
                  )}
                </button>
              </div>

              {showCode && (
                <>
                  <Field
                    label="Custom Head Script"
                    description="Dijalankan di dalam <head>. JavaScript saja — tanpa tag <script>."
                  >
                    <TextArea
                      value={form.customHeadScript}
                      onChange={(v) => set("customHeadScript", v)}
                      rows={6}
                      mono
                      placeholder={`// contoh: custom event tracking\nconsole.log("head script ready")`}
                    />
                  </Field>

                  <Field
                    label="Custom Body Start HTML"
                    description="Untuk <noscript> iframe GTM atau snippet HTML lain di awal <body>."
                  >
                    <TextArea
                      value={form.customBodyStartHtml}
                      onChange={(v) => set("customBodyStartHtml", v)}
                      rows={5}
                      mono
                      placeholder={`<noscript><iframe src="..."></iframe></noscript>`}
                    />
                  </Field>

                  <Field
                    label="Custom Body End Script"
                    description="JavaScript dijalankan afterInteractive di akhir <body>."
                  >
                    <TextArea
                      value={form.customBodyEndScript}
                      onChange={(v) => set("customBodyEndScript", v)}
                      rows={6}
                      mono
                      placeholder={`console.log("body end script")`}
                    />
                  </Field>
                </>
              )}
            </Section>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="space-y-4">
            <div className="sticky top-20 space-y-4">
              {/* Previews */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Settings2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-black text-slate-900">Live Preview</p>
                    <p className="text-[11.5px] text-slate-500">Pratinjau otomatis saat kamu mengetik.</p>
                  </div>
                </div>

                <FaviconPreview
                  faviconUrl={form.faviconUrl}
                  siteName={form.siteName}
                  metaTitle={form.metaTitle}
                />

                <SerpPreview
                  title={form.metaTitle}
                  url={form.canonicalUrl}
                  description={form.metaDescription}
                />

                <OgPreview
                  title={form.ogTitle || form.metaTitle}
                  description={form.ogDescription || form.metaDescription}
                  imageUrl={form.ogImageUrl}
                  url={form.canonicalUrl}
                />
              </div>

              {/* Save button */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-[13.5px] font-black text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Perubahan langsung berlaku di seluruh halaman website.
                </p>

                {/* Completeness checklist */}
                <div className="mt-4 space-y-2">
                  <p className="text-[10.5px] font-black uppercase tracking-widest text-slate-400">
                    Kelengkapan
                  </p>
                  {[
                    { label: "Site Name", ok: !!form.siteName },
                    { label: "Meta Title", ok: !!form.metaTitle },
                    { label: "Meta Description", ok: !!form.metaDescription },
                    { label: "Favicon", ok: !!form.faviconUrl },
                    { label: "OG Image", ok: !!form.ogImageUrl },
                    { label: "Canonical URL", ok: !!form.canonicalUrl },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full",
                          item.ok ? "bg-emerald-100" : "bg-slate-100",
                        )}
                      >
                        {item.ok ? (
                          <CheckCircle2 className="size-3 text-emerald-600" />
                        ) : (
                          <div className="size-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[12px] font-semibold",
                          item.ok ? "text-slate-700" : "text-slate-400",
                        )}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}