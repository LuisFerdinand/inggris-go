// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/ContentTab.tsx
"use client";

import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Layers3,
  Loader2,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { SECTION_META, getSectionMeta } from "./content/registry";
import {
  SectionEditorCard,
  type CmsSection,
} from "./content/SectionEditorCard";

/* ─────────────────────────────────────────────────────────────
   ANIMATION
───────────────────────────────────────────────────────────── */

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Section types whose data is source-managed in the Batch & Paket (commerce)
 * tab. We don't let them be hand-edited in the CMS — opening one sends the user
 * to the commerce tab instead.
 *
 * NOTE: this matches against `section.type`. Make sure the string below is the
 * exact `type` your batches section is stored under. Add more types if needed.
 */
const COMMERCE_MANAGED_TYPES = new Set<string>(["batches"]);

/* ─────────────────────────────────────────────────────────────
   TAB
───────────────────────────────────────────────────────────── */

interface ContentTabProps {
  programId: string;
}

export default function ContentTab({ programId }: ContentTabProps) {
  const utils = trpc.useUtils();

  // Shares the `?tab=` param with ProgramDetailView so we can switch tabs.
  const [, setActiveTab] = useQueryState("tab");

  // Accordion: which section ids are expanded (collapsed by default).
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const contentQuery = trpc.programs.getContent.useQuery(
    { programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  const invalidate = () =>
    Promise.all([
      utils.programs.getContent.invalidate({ programId }),
      utils.programs.getOverview.invalidate({ id: programId }),
    ]);

  const ensure = trpc.programs.ensureContent.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Dokumen landing page dibuat");
    },
    onError: (e) => toast.error(e.message || "Gagal membuat dokumen"),
  });

  const activate = trpc.programs.activateContentSection.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Section ditambahkan");
    },
    onError: (e) => toast.error(e.message || "Gagal menambahkan section"),
  });

  const toggle = trpc.programs.toggleSectionVisibility.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Gagal mengubah status"),
  });

  const move = trpc.programs.moveSection.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Gagal memindahkan section"),
  });

  // NOTE: add `removeContentSection` to your router (see program.router.patch.md).
  const remove = trpc.programs.removeContentSection.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Section dihapus");
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus section"),
  });

  const setPublished = trpc.programs.setContentPublished.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Gagal mengubah publikasi"),
  });

  const sections = useMemo<CmsSection[]>(() => {
    const raw = contentQuery.data?.sections;
    return Array.isArray(raw) ? (raw as CmsSection[]) : [];
  }, [contentQuery.data?.sections]);

  const usedTypes = new Set(sections.map((s) => s.type));
  const available = SECTION_META.filter((m) => !usedTypes.has(m.type));

  const activeCount = sections.filter((s) => s.visible !== false).length;
  const hasDoc = !!contentQuery.data?.id;
  const isPublished = !!contentQuery.data?.isPublished;

  const isBusy =
    activate.isPending ||
    toggle.isPending ||
    move.isPending ||
    remove.isPending;

  /* ── Loading ─────────────────────────────────────────── */
  if (contentQuery.isLoading && !contentQuery.data) {
    return (
      <div className="flex max-w-5xl items-center justify-center py-24 text-slate-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  /* ── Empty (no content document yet) ─────────────────── */
  if (!hasDoc) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-sm">
            <Layers3 className="size-5" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Landing page belum dibuat
          </h3>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500">
            Buat dokumen landing page terlebih dahulu, lalu tambahkan dan isi
            section seperti Hero, Pricing, FAQ, dan CTA.
          </p>
          <Button
            disabled={ensure.isPending}
            onClick={() => ensure.mutate({ programId })}
            className="mt-5 h-9 rounded-xl px-4 text-xs font-semibold"
          >
            {ensure.isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1.5 size-3.5" />
            )}
            Buat Landing Page
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main ────────────────────────────────────────────── */
  return (
    <div className="flex max-w-5xl flex-col gap-4">
      {/* Header / publish bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-sm">
            <Layers3 className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Konten Landing Page
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-400">
              {sections.length} section · {activeCount} aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
          <Globe
            className={cn(
              "size-4",
              isPublished ? "text-emerald-500" : "text-slate-400",
            )}
          />
          <span className="text-[12px] font-semibold text-slate-600">
            {isPublished ? "Dipublikasikan" : "Draft"}
          </span>
          <Switch
            checked={isPublished}
            disabled={setPublished.isPending}
            onCheckedChange={(checked) =>
              setPublished.mutate({ programId, isPublished: checked })
            }
          />
        </div>
      </div>

      {/* Add section picker */}
      {available.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.7px] text-slate-400">
            Tambah Section
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {available.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.type}
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    activate.mutate({
                      programId,
                      sectionId: m.type,
                      sectionType: m.type,
                    })
                  }
                  className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-3 py-2.5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
                >
                  <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-slate-700">
                      {m.label}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {m.description}
                    </p>
                  </div>
                  <Plus className="size-4 flex-shrink-0 text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section list */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-12 text-center text-[13px] text-slate-400">
          Belum ada section. Tambahkan section dari daftar di atas.
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {sections.map((section, index) => {
            const meta = getSectionMeta(section.type);
            const active = section.visible !== false;
            const isOpen = openIds.has(section.id);
            const SectionIcon = meta.icon;

            return (
              <motion.div
                key={section.id ?? `${section.type}-${index}`}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {/* Accordion header row */}
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition-colors",
                    isOpen ? "border-slate-300" : "border-slate-200",
                    !active && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleOpen(section.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 flex-shrink-0 text-slate-400 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                    <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                      <SectionIcon className="size-3.5" />
                    </span>
                    <span className="truncate text-[13px] font-bold text-slate-800">
                      {meta.label}
                    </span>
                    <span
                      className={cn(
                        "hidden flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex",
                        active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                      )}
                    >
                      {active ? (
                        <Eye className="size-3" />
                      ) : (
                        <EyeOff className="size-3" />
                      )}
                      {active ? "Aktif" : "Nonaktif"}
                    </span>
                  </button>

                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <CtrlBtn
                      disabled={index === 0 || isBusy}
                      title="Naikkan"
                      onClick={() =>
                        move.mutate({
                          programId,
                          sectionId: section.id,
                          direction: "up",
                        })
                      }
                    >
                      <ArrowUp className="size-3.5" />
                    </CtrlBtn>
                    <CtrlBtn
                      disabled={index === sections.length - 1 || isBusy}
                      title="Turunkan"
                      onClick={() =>
                        move.mutate({
                          programId,
                          sectionId: section.id,
                          direction: "down",
                        })
                      }
                    >
                      <ArrowDown className="size-3.5" />
                    </CtrlBtn>

                    <CtrlBtn
                      disabled={isBusy}
                      title={active ? "Sembunyikan" : "Tampilkan"}
                      onClick={() =>
                        toggle.mutate({
                          programId,
                          sectionId: section.id,
                          visible: !active,
                        })
                      }
                      className={cn(
                        active
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-slate-400 hover:bg-slate-50",
                      )}
                    >
                      {active ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </CtrlBtn>

                    <CtrlBtn
                      disabled={isBusy}
                      danger
                      title="Hapus"
                      onClick={() => {
                        if (
                          confirm(
                            `Hapus section "${meta.label}"? Tindakan ini tidak bisa dibatalkan.`,
                          )
                        ) {
                          remove.mutate({ programId, sectionId: section.id });
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </CtrlBtn>
                  </div>
                </div>

                {/* Accordion body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className={cn(!active && "opacity-60")}>
                        {COMMERCE_MANAGED_TYPES.has(section.type) ? (
                          <CommerceRedirectCard
                            label={meta.label}
                            onGo={() => setActiveTab("commerce")}
                          />
                        ) : (
                          <SectionEditorCard
                            programId={programId}
                            section={section}
                            allSections={sections}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMMERCE-MANAGED REDIRECT CARD
───────────────────────────────────────────────────────────── */

function CommerceRedirectCard({
  label,
  onGo,
}: {
  label: string;
  onGo: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">
              {label} dikelola di Batch & Paket
            </h3>
            <p className="mt-0.5 max-w-md text-[12px] leading-relaxed text-slate-400">
              Harga dan paket diambil langsung dari data Batch & Paket agar tidak
              ada duplikasi. Section ini tetap bisa kamu atur urutan dan
              tampil/sembunyikannya di sini.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onGo}
          className="h-9 flex-shrink-0 gap-1.5 rounded-xl px-4 text-xs font-semibold"
        >
          Kelola di Batch & Paket
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONTROL BUTTON
───────────────────────────────────────────────────────────── */

function CtrlBtn({
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
        "flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          : "hover:border-slate-300 hover:text-slate-600",
        className,
      )}
    >
      {children}
    </button>
  );
}