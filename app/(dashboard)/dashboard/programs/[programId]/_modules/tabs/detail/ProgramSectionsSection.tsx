// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/ProgramSectionsSection.tsx
"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Layers3,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type ProgramSectionPreset = {
  id: string;
  type: string;
  label: string;
  description: string;
};

type CmsSection = {
  id?: string;
  type?: string;
  visible?: boolean;
  content?: unknown;
};

/* ─────────────────────────────────────────────────────────────
   SECTION PRESETS
───────────────────────────────────────────────────────────── */

const SECTION_PRESETS: ProgramSectionPreset[] = [
  {
    id: "hero",
    type: "hero",
    label: "Hero",
    description: "Section pembuka utama untuk landing page program.",
  },
  {
    id: "why",
    type: "why",
    label: "Why / Problem",
    description: "Masalah utama yang dialami calon peserta.",
  },
  {
    id: "benefits",
    type: "benefits",
    label: "Benefits",
    description: "Manfaat dan hasil yang akan didapat peserta.",
  },
  {
    id: "steps",
    type: "steps",
    label: "Steps",
    description: "Cara kerja atau proses belajar program.",
  },
  {
    id: "timeline",
    type: "timeline",
    label: "Timeline",
    description: "Jadwal belajar, minggu belajar, atau rutinitas harian.",
  },
  {
    id: "gallery",
    type: "gallery",
    label: "Gallery",
    description: "Dokumentasi foto kegiatan atau suasana kelas.",
  },
  {
    id: "classes",
    type: "classes",
    label: "Classes",
    description: "Pilihan kelas, level, atau kelompok belajar.",
  },
  {
    id: "facilities",
    type: "facilities",
    label: "Facilities",
    description: "Fasilitas program, cocok untuk offline/camp.",
  },
  {
    id: "mentorship",
    type: "mentorship",
    label: "Mentorship",
    description: "Pendampingan, tutor, mentor, atau pembimbing program.",
  },
  {
    id: "pricing",
    type: "pricing",
    label: "Pricing",
    description: "Harga, paket, bonus, dan urgency program.",
  },
  {
    id: "testimonials",
    type: "testimonials",
    label: "Testimonials",
    description: "Testimoni peserta, alumni, atau orang tua.",
  },
  {
    id: "faq",
    type: "faq",
    label: "FAQ",
    description: "Pertanyaan umum tentang program.",
  },
  {
    id: "cta",
    type: "cta",
    label: "CTA",
    description: "Section penutup untuk mengarahkan calon peserta daftar.",
  },
];

/* ─────────────────────────────────────────────────────────────
   LOCAL DETAIL-STYLE UI
───────────────────────────────────────────────────────────── */

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white shadow-badge",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] bg-neutral-50/40 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-white text-neutral-500 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[var(--text-main)]">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-faint)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function StatusPill({
  active,
  created,
}: {
  active: boolean;
  created: boolean;
}) {
  if (!created) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-[var(--border-soft)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--text-faint)]">
        Belum dibuat
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-500",
      )}
    >
      {active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

interface ProgramSectionsSectionProps {
  programId: string;
}

export function ProgramSectionsSection({
  programId,
}: ProgramSectionsSectionProps) {
  const utils = trpc.useUtils();

  const contentQuery = trpc.programs.getContent.useQuery(
    { programId },
    {
      staleTime: 30_000,
      placeholderData: (prev) => prev,
    },
  );

  const ensureMutation = trpc.programs.ensureContent.useMutation({
    onSuccess: async () => {
      await utils.programs.getContent.invalidate({ programId });
      toast.success("Dokumen landing page dibuat");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal membuat dokumen landing page");
    },
  });

  const activateMutation = trpc.programs.activateContentSection.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getContent.invalidate({ programId }),
        utils.programs.getOverview.invalidate({ id: programId }),
      ]);

      toast.success("Section berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan section");
    },
  });

  const toggleMutation = trpc.programs.toggleSectionVisibility.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getContent.invalidate({ programId }),
        utils.programs.getOverview.invalidate({ id: programId }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengubah status section");
    },
  });

  const sections = Array.isArray(contentQuery.data?.sections)
    ? (contentQuery.data.sections as CmsSection[])
    : [];

  const sectionMap = new Map(
    sections
      .filter((section) => section?.id)
      .map((section) => [section.id as string, section]),
  );

  const activeCount = sections.filter(
    (section) => section?.visible !== false,
  ).length;

  const isPending =
    ensureMutation.isPending ||
    activateMutation.isPending ||
    toggleMutation.isPending;

  const hasContentDocument = !!contentQuery.data?.id;

  return (
    <SectionCard>
      <SectionHeader
        icon={<Layers3 className="size-4" />}
        title="Landing Page Sections"
        description="Aktifkan atau tambahkan section detail program untuk halaman publik."
        action={
          contentQuery.isFetching ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-faint)]">
              <Loader2 className="size-3.5 animate-spin" />
              Sync
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 sm:inline-flex">
              <Sparkles className="size-3.5" />
              {activeCount} aktif
            </div>
          )
        }
      />

      <div className="space-y-3 p-5">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-neutral-600" />
            <div>
              <p className="text-xs font-semibold text-neutral-800">
                Missing section bisa dibuat langsung dari sini.
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">
                Jika section belum ada di database, klik “Tambahkan & Aktifkan”.
                Sistem akan membuat template kosong yang nanti bisa kamu isi atau edit.
              </p>
            </div>
          </div>
        </div>

        {contentQuery.isLoading && !contentQuery.data ? (
          <div className="flex items-center justify-center py-14 text-[var(--text-faint)]">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : !hasContentDocument ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-neutral-50/60 px-4 py-8 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-white text-neutral-500 shadow-sm">
              <Layers3 className="size-5" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-[var(--text-main)]">
              Detail landing page belum dibuat
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[var(--text-faint)]">
              Buat dokumen landing page terlebih dahulu, lalu kamu bisa mengaktifkan section seperti Hero, Pricing, FAQ, dan CTA.
            </p>

            <Button
              type="button"
              disabled={isPending}
              onClick={() => ensureMutation.mutate({ programId })}
              className="mt-4 h-9 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm"
            >
              {ensureMutation.isPending ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Plus className="mr-1.5 size-3.5" />
              )}
              Buat Detail Landing Page
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {SECTION_PRESETS.map((preset, index) => {
              const existing = sectionMap.get(preset.id);
              const created = !!existing;
              const active = existing?.visible !== false;

              return (
                <div
                  key={preset.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    created
                      ? "border-[var(--border-soft)] bg-white"
                      : "border-dashed border-[var(--border-soft)] bg-neutral-50/50",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                        created
                          ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                          : "border-[var(--border-soft)] bg-white text-[var(--text-faint)]",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[var(--text-main)]">
                          {preset.label}
                        </h3>
                        <StatusPill active={active} created={created} />
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-faint)]">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                    {created ? (
                      <div className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-neutral-50 px-3 py-2">
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                          {active ? "Aktif" : "Nonaktif"}
                        </span>
                        <Switch
                          checked={active}
                          disabled={isPending}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              programId,
                              sectionId: preset.id,
                              visible: checked,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          activateMutation.mutate({
                            programId,
                            sectionId: preset.id,
                            sectionType: preset.type,
                          })
                        }
                        className="h-9 rounded-xl border-[var(--border-soft)] text-xs font-semibold"
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <Plus className="mr-1.5 size-3.5" />
                        )}
                        Tambahkan & Aktifkan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
