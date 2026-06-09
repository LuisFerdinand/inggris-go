// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/ContentTab.tsx
//
// Redesigned Content tab — improved UX + aesthetics.
//
// Key improvements:
//   • Unified left panel with collapsible "Add Section" drawer
//   • Section navigator with drag-handle aesthetic, status pills
//   • Editor slides in as an inline accordion below the selected row
//   • Sticky preview toolbar with polished segment control
//   • Bug fix: preview no longer maps visibleSections but renders once
//   • Unsaved-changes banner instead of a plain button
//   • Better empty & loading states

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Layers3,
  Loader2,
  Monitor,
  Plus,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import type { ProgramSectionInput } from "@/app/modules/program/program-content.schema";

import { SECTION_META, getSectionMeta } from "./content/registry";
import { SECTION_DEFS } from "./content/field-schema";
import { Fields } from "./content/Fields";
import { LandingPagePreview } from "./content/LandingPagePreview";

type CmsSection = ProgramSectionInput;
type Obj = Record<string, unknown>;

const COMMERCE_MANAGED_TYPES = new Set<string>(["batches"]);

/* ─────────────────────────────────────────────────────────────
   DEFAULT CONTENT
───────────────────────────────────────────────────────────── */

function defaultContent(type: string): unknown {
  switch (type) {
    case "hero":
      return { image: "", label: "Program Unggulan", tagline: "Judul utama program", taglineAccent: "yang menarik", description: "", subtitle: "", highlight: "", tags: [], cta: [] };
    case "why":
      return { title: "Kenapa program ini penting?", tagline: "Masalah yang", taglineAccent: "sering terjadi", subtitle: "", icon: "", items: [] };
    case "benefits":
      return { title: "Benefit Program", tagline: "Yang Akan", taglineAccent: "Kamu Dapatkan", subtitle: "", icon: "", images: [], items: [] };
    case "steps":
      return { title: "Cara Kerja Program", tagline: "Langkah", taglineAccent: "Belajar", subtitle: "", icon: "", items: [] };
    case "timeline":
      return { icon: "calendar", tagline: "Timeline", taglineAccent: "Program", title: "Timeline Program", subtitle: "", meta: [], weeks: [] };
    case "gallery":
      return { icon: "", tagline: "Dokumentasi", taglineAccent: "Program", title: "Galeri Kegiatan", subtitle: "", photos: [], trustSignals: [] };
    case "classes":
      return { title: "Pilihan Kelas", tagline: "Pilih", taglineAccent: "Kelas", subtitle: "", layout: "grid", info: [], items: [] };
    case "facilities":
      return { title: "Fasilitas", tagline: "Fasilitas", taglineAccent: "Tersedia", subtitle: "", visuals: [], items: [] };
    case "mentorship":
      return { tagline: "Dibimbing", taglineAccent: "Langsung", title: "Mentor Terpercaya", subtitle: "", highlight: "", items: [], visuals: [] };
    case "pricing":
      return { globalNote: "", title: "Harga Program", description: "", groups: [], bonusTitle: "", bonusNote: "", bonus: [], urgency: "" };
    case "bonus":
      return { title: "Bonus Program", items: [] };
    case "testimonials":
      return { title: "Apa Kata Alumni", items: [] };
    case "faq":
      return [];
    case "cta":
      return { title: "Siap Mulai?", titleAccent: "", subtitle: "", highlight: "", cta: { label: "Daftar Sekarang", href: "", note: "" }, urgency: "" };
    case "batches":
      return { variant: "card", tagline: "Pilih Batch", taglineAccent: "Terdekat", title: "Batch Tersedia", subtitle: "", emptyMessage: "Saat ini belum ada batch tersedia." };
    default:
      return {};
  }
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function move<T>(arr: T[], i: number, dir: "up" | "down"): T[] {
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/* ─────────────────────────────────────────────────────────────
   SECTION EDITOR
───────────────────────────────────────────────────────────── */

function SectionEditor({
  section,
  onChangeContent,
  onGoCommerce,
}: {
  section: CmsSection;
  onChangeContent: (content: unknown) => void;
  onGoCommerce: () => void;
}) {
  if (COMMERCE_MANAGED_TYPES.has(section.type)) {
    return (
      <div className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <ShoppingBag className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">Dikelola di Batch &amp; Paket</p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              Daftar batch diisi otomatis dari data Batch &amp; Paket. Di sini kamu hanya
              mengatur teks judul/tagline dan posisi section.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onGoCommerce}
              className="mt-3 h-8 gap-1.5 rounded-lg border-amber-200 bg-white px-3 text-[12px] font-semibold text-amber-700 hover:bg-amber-50"
            >
              Buka Batch &amp; Paket <ArrowRight className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const def = SECTION_DEFS[section.type];

  if (!def) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
        <p className="text-[12px] italic text-slate-400">Tipe section ini belum punya editor.</p>
      </div>
    );
  }

  if (def.rootArray) {
    const value: Obj = { content: Array.isArray(section.content) ? section.content : [] };
    return (
      <Fields
        fields={[def.rootArray]}
        value={value}
        onChange={(next) => onChangeContent((next as Obj).content ?? [])}
      />
    );
  }

  return (
    <Fields
      fields={def.fields ?? []}
      value={(section.content as Obj) ?? {}}
      onChange={(next) => onChangeContent(next)}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION ROW — navigator item with inline-expand editor
───────────────────────────────────────────────────────────── */

function SectionRow({
  section,
  index,
  total,
  isExpanded,
  onSelect,
  onReorder,
  onToggleVisible,
  onRemove,
  onChangeContent,
  onGoCommerce,
}: {
  section: CmsSection;
  index: number;
  total: number;
  isExpanded: boolean;
  onSelect: () => void;
  onReorder: (dir: "up" | "down") => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onChangeContent: (c: unknown) => void;
  onGoCommerce: () => void;
}) {
  const meta = getSectionMeta(section.type);
  const Icon = meta.icon;
  const hidden = section.visible === false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "group rounded-xl border transition-all duration-150",
        isExpanded
          ? "border-indigo-200 bg-indigo-50/30 shadow-sm"
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle aesthetic */}
        <GripVertical className="size-3.5 shrink-0 text-slate-300 group-hover:text-slate-400" />

        {/* Index badge */}
        <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold tabular-nums text-slate-400">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon + label — click to expand/collapse */}
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
              isExpanded
                ? "border-indigo-200 bg-indigo-600 text-white"
                : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300",
            )}
          >
            <Icon className="size-3.5" />
          </span>

          <div className="min-w-0">
            <span
              className={cn(
                "block truncate text-[13px] font-semibold leading-tight",
                hidden ? "text-slate-400" : isExpanded ? "text-indigo-800" : "text-slate-700",
              )}
            >
              {meta.label}
            </span>
            {hidden && (
              <span className="text-[10px] font-medium text-slate-400">Tersembunyi</span>
            )}
          </div>
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 [.expanded_&]:opacity-100">
          <IconBtn disabled={index === 0} title="Naikkan" onClick={() => onReorder("up")}>
            <ArrowUp className="size-3.5" />
          </IconBtn>
          <IconBtn disabled={index === total - 1} title="Turunkan" onClick={() => onReorder("down")}>
            <ArrowDown className="size-3.5" />
          </IconBtn>
          <IconBtn
            title={hidden ? "Tampilkan" : "Sembunyikan"}
            onClick={onToggleVisible}
            className={hidden ? "text-slate-400" : "text-emerald-600"}
          >
            {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </IconBtn>
          <IconBtn
            danger
            title="Hapus"
            onClick={() => {
              if (confirm(`Hapus section "${meta.label}"?`)) onRemove();
            }}
          >
            <Trash2 className="size-3.5" />
          </IconBtn>
        </div>

        {/* Expand chevron */}
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600",
            isExpanded && "text-indigo-500",
          )}
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform duration-200", isExpanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Inline editor panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-indigo-100 px-3 pb-3 pt-3">
              {/* Section meta header */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-100 to-transparent" />
                <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-indigo-400">
                  {meta.description || "Isi Section"}
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-indigo-100 to-transparent" />
              </div>

              <SectionEditor
                section={section}
                onChangeContent={onChangeContent}
                onGoCommerce={onGoCommerce}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD SECTION PANEL
───────────────────────────────────────────────────────────── */

function AddSectionPanel({
  available,
  onAdd,
  onClose,
}: {
  available: typeof SECTION_META;
  onAdd: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-3 shadow-sm"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-indigo-500" />
          <p className="text-[11px] font-bold uppercase tracking-[0.7px] text-indigo-600">
            Pilih Section
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {available.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.type}
              type="button"
              onClick={() => {
                onAdd(m.type);
                onClose();
              }}
              className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:shadow-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-slate-700 group-hover:text-indigo-700">
                  {m.label}
                </p>
              </div>
              <Plus className="ml-auto size-3 shrink-0 text-slate-300 group-hover:text-indigo-400" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN TAB
───────────────────────────────────────────────────────────── */

export default function ContentTab({ programId }: { programId: string }) {
  const utils = trpc.useUtils();
  const [, setActiveTab] = useQueryState("tab");

  const contentQuery = trpc.programs.getContent.useQuery(
    { programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );
  const headerQuery = trpc.programs.getHeader.useQuery(
    { id: programId },
    { staleTime: 60_000 },
  );

  const primary = headerQuery.data?.category?.themePrimary ?? "#1a52c8";
  const publicUrl = headerQuery.data?.publicUrl ?? null;

  /* ── server → working copy ─────────────────────────────── */
  const serverSections = useMemo<CmsSection[]>(
    () =>
      Array.isArray(contentQuery.data?.sections)
        ? (contentQuery.data!.sections as CmsSection[])
        : [],
    [contentQuery.data?.sections],
  );

  const [working, setWorking] = useState<CmsSection[]>([]);
  const baseline = useRef("__init__");
  const initialized = useRef(false);

  useEffect(() => {
    if (!contentQuery.data) return;
    const key = JSON.stringify(serverSections);
    const dirty = JSON.stringify(working) !== baseline.current;
    if (!initialized.current || (!dirty && key !== baseline.current)) {
      setWorking(serverSections);
      baseline.current = key;
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSections, contentQuery.data]);

  const isDirty = JSON.stringify(working) !== baseline.current;

  /* ── selection + preview ───────────────────────────────── */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [mode, setMode] = useState<"structure" | "live">("structure");
  const [iframeKey, setIframeKey] = useState(0);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // keep expanded valid
  useEffect(() => {
    if (working.length === 0) {
      setExpandedId(null);
    } else if (expandedId && !working.some((s) => s.id === expandedId)) {
      setExpandedId(working[0].id);
    }
  }, [working, expandedId]);

  // scroll preview to expanded section
  useEffect(() => {
    if (mode !== "structure" || !expandedId) return;
    const el = previewScrollRef.current?.querySelector(
      `[data-preview-id="${expandedId}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [expandedId, mode]);

  /* ── mutations ─────────────────────────────────────────── */
  const ensure = trpc.programs.ensureContent.useMutation({
    onSuccess: async () => {
      await utils.programs.getContent.invalidate({ programId });
      toast.success("Dokumen landing page dibuat");
    },
    onError: (e) => toast.error(e.message || "Gagal membuat dokumen"),
  });

  const save = trpc.programs.updateContentSections.useMutation({
    onSuccess: async () => {
      baseline.current = JSON.stringify(working);
      await Promise.all([
        utils.programs.getContent.invalidate({ programId }),
        utils.programs.getOverview.invalidate({ id: programId }),
      ]);
      toast.success("Konten tersimpan");
    },
    onError: (e) => toast.error(e.message || "Gagal menyimpan"),
  });

  const setPublished = trpc.programs.setContentPublished.useMutation({
    onSuccess: () => utils.programs.getContent.invalidate({ programId }),
    onError: (e) => toast.error(e.message || "Gagal mengubah publikasi"),
  });

  /* ── local edit ops ────────────────────────────────────── */
  const usedTypes = new Set(working.map((s) => s.type));
  const available = SECTION_META.filter((m) => !usedTypes.has(m.type));

  function addSection(type: string) {
    if (usedTypes.has(type)) return;
    const next: CmsSection = { id: type, type, visible: true, content: defaultContent(type) } as CmsSection;
    setWorking((prev) => [...prev, next]);
    setExpandedId(type);
  }

  function patchContent(id: string, content: unknown) {
    setWorking((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)));
  }
  function toggleVisible(id: string) {
    setWorking((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: s.visible === false } : s)),
    );
  }
  function reorder(id: string, dir: "up" | "down") {
    setWorking((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      return i === -1 ? prev : move(prev, i, dir);
    });
  }
  function removeSection(id: string) {
    setWorking((prev) => prev.filter((s) => s.id !== id));
  }
  function discard() {
    setWorking(serverSections);
    baseline.current = JSON.stringify(serverSections);
  }

  const isPublished = !!contentQuery.data?.isPublished;
  const hasDoc = !!contentQuery.data?.id;
  const visibleSections = working.filter((s) => s.visible !== false);

  /* ── loading ───────────────────────────────────────────── */
  if (contentQuery.isLoading && !contentQuery.data) {
    return (
      <div className="flex max-w-6xl items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-[13px]">Memuat konten…</p>
        </div>
      </div>
    );
  }

  /* ── empty (no doc) ────────────────────────────────────── */
  if (!hasDoc) {
    return (
      <div className="max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 px-6 py-16 text-center">
          {/* Background decorative */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.06),_transparent_70%)]" />
          <div className="relative">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-md shadow-indigo-100/50">
              <Layers3 className="size-6" />
            </div>
            <h3 className="mt-5 text-base font-bold text-slate-800">Landing page belum dibuat</h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-slate-500">
              Buat dokumen landing page terlebih dahulu, lalu tambahkan dan isi section
              seperti Hero, Pricing, FAQ, dan CTA.
            </p>
            <Button
              disabled={ensure.isPending}
              onClick={() => ensure.mutate({ programId })}
              className="mt-6 h-10 rounded-xl px-5 text-sm font-semibold shadow-sm"
            >
              {ensure.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" />Membuat…</>
                : <><Plus className="mr-2 size-4" />Buat Landing Page</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN ──────────────────────────────────────────────── */
  return (
    <div className="flex mx-auto flex-col gap-4">

      {/* ── TOP TOOLBAR ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Layers3 className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Konten Landing Page</h2>
            <p className="mt-0.5 text-[12px] text-slate-400">
              <span className="font-medium text-slate-600">{working.length}</span> section ·{" "}
              <span className={cn("font-medium", visibleSections.length > 0 ? "text-emerald-600" : "text-slate-400")}>
                {visibleSections.length} aktif
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Publish toggle */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors",
              isPublished
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50",
            )}
          >
            <Globe className={cn("size-3.5", isPublished ? "text-emerald-500" : "text-slate-400")} />
            <span className={cn("text-[12px] font-semibold", isPublished ? "text-emerald-700" : "text-slate-500")}>
              {isPublished ? "Publik" : "Draft"}
            </span>
            <Switch
              checked={isPublished}
              disabled={setPublished.isPending}
              onCheckedChange={(v) => setPublished.mutate({ programId, isPublished: v })}
            />
          </div>

          {/* Save actions */}
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1"
              >
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] font-semibold text-amber-700">Belum disimpan</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={discard}
              disabled={save.isPending}
              className="h-9 gap-1.5 rounded-xl px-3 text-[12px] font-medium text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="size-3.5" /> Batal
            </Button>
          )}
          <Button
            type="button"
            disabled={!isDirty || save.isPending}
            onClick={() => save.mutate({ programId, sections: working })}
            className={cn(
              "h-9 gap-1.5 rounded-xl px-4 text-[12px] font-semibold transition-all",
              isDirty ? "shadow-sm shadow-indigo-200" : "",
            )}
          >
            {save.isPending
              ? <><Loader2 className="size-3.5 animate-spin" />Menyimpan…</>
              : <><Check className="size-3.5" />Simpan</>}
          </Button>
        </div>
      </div>

      {/* ── TWO-PANE BODY ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">

        {/* LEFT — navigator */}
        <div className="flex flex-col gap-3">

          {/* Add section button + panel */}
          <div>
            <button
              type="button"
              disabled={available.length === 0}
              onClick={() => setShowAddPanel((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold transition-all",
                showAddPanel
                  ? "border-indigo-300 bg-indigo-600 text-white shadow-sm"
                  : available.length === 0
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700",
              )}
            >
              <span className="flex items-center gap-2">
                <Plus className="size-4" />
                Tambah Section
              </span>
              <span className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                showAddPanel ? "bg-indigo-500 text-indigo-100" : "bg-slate-100 text-slate-500",
              )}>
                {available.length} tersedia
              </span>
            </button>

            <AnimatePresence>
              {showAddPanel && available.length > 0 && (
                <div className="mt-2">
                  <AddSectionPanel
                    available={available}
                    onAdd={addSection}
                    onClose={() => setShowAddPanel(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Section list */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
            {working.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <Layers3 className="size-8 text-slate-300" />
                <p className="text-[13px] text-slate-400">
                  Belum ada section. Tambahkan dari tombol di atas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {working.map((s, i) => (
                    <SectionRow
                      key={s.id}
                      section={s}
                      index={i}
                      total={working.length}
                      isExpanded={expandedId === s.id}
                      onSelect={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      onReorder={(dir) => reorder(s.id, dir)}
                      onToggleVisible={() => toggleVisible(s.id)}
                      onRemove={() => removeSection(s.id)}
                      onChangeContent={(c) => patchContent(s.id, c)}
                      onGoCommerce={() => setActiveTab("commerce")}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — preview */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Preview toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
              {/* Mode tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <PreviewTab active={mode === "structure"} onClick={() => setMode("structure")}>
                  Struktur
                </PreviewTab>
                <PreviewTab active={mode === "live"} onClick={() => setMode("live")}>
                  Halaman Asli
                </PreviewTab>
              </div>

              {/* Device toggles / refresh */}
              {mode === "structure" ? (
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <IconBtn
                    title="Desktop"
                    onClick={() => setDevice("desktop")}
                    className={device === "desktop" ? "bg-slate-100 text-indigo-600" : ""}
                  >
                    <Monitor className="size-3.5" />
                  </IconBtn>
                  <IconBtn
                    title="Mobile"
                    onClick={() => setDevice("mobile")}
                    className={device === "mobile" ? "bg-slate-100 text-indigo-600" : ""}
                  >
                    <Smartphone className="size-3.5" />
                  </IconBtn>
                </div>
              ) : (
                <IconBtn title="Muat ulang" onClick={() => setIframeKey((k) => k + 1)}>
                  <RefreshCw className="size-3.5" />
                </IconBtn>
              )}
            </div>

            {/* Preview body */}
            {mode === "structure" ? (
              <div ref={previewScrollRef} className="max-h-[78vh] overflow-y-auto bg-[#f1f3f8] p-4">
                {/* Device frame */}
                <div
                  className={cn(
                    "mx-auto overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300",
                    device === "mobile" ? "max-w-[390px]" : "max-w-full",
                  )}
                >
                  {/* Mobile notch sim */}
                  {device === "mobile" && (
                    <div className="flex h-7 items-center justify-center bg-slate-900">
                      <div className="h-3 w-20 rounded-full bg-slate-700" />
                    </div>
                  )}

                  {visibleSections.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
                      <EyeOff className="size-8 text-slate-300" />
                      <p className="text-[13px] text-slate-400">
                        Tidak ada section aktif untuk ditampilkan.
                      </p>
                    </div>
                  ) : (
                    // ✅ Bug fix: render ONE LandingPagePreview, not one per section
                    <LandingPagePreview
                      sections={visibleSections}
                      primary={primary}
                      selectedId={expandedId}
                    />
                  )}
                </div>

                <p className="mx-auto mt-3 max-w-sm text-center text-[11px] leading-relaxed text-slate-400">
                  Pratinjau langsung saat kamu mengetik. Untuk tampilan persis halaman
                  asli, gunakan tab <span className="font-medium text-slate-500">"Halaman Asli"</span>.
                </p>
              </div>
            ) : (
              <div className="bg-[#f1f3f8] p-4">
                {publicUrl ? (
                  <>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
                      <iframe
                        key={iframeKey}
                        src={publicUrl}
                        title="Pratinjau halaman"
                        className="h-[74vh] w-full"
                      />
                    </div>
                    {!isPublished && (
                      <div className="mx-auto mt-3 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center">
                        <p className="text-[11px] leading-relaxed text-amber-700">
                          Program belum dipublikasikan — halaman asli masih memakai konten
                          bawaan. Publikasikan &amp; simpan untuk melihat perubahan.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
                    <Globe className="size-8 text-slate-300" />
                    <p className="text-[13px] text-slate-400">URL publik tidak tersedia.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SMALL PRIMITIVES
───────────────────────────────────────────────────────────── */

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "hover:bg-red-50 hover:text-red-500"
          : "hover:bg-slate-100 hover:text-slate-600",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PreviewTab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}