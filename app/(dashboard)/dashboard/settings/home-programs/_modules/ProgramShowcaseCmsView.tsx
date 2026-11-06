// app/(dashboard)/dashboard/settings/home-programs/_modules/ProgramShowcaseCmsView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  LayoutGrid,
  ListOrdered,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Type,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";
import {
  Field,
  Section,
  SaveCard,
  StickyPanel,
  TextArea,
  TextInput,
} from "@/components/cms/CmsForm";
import ProgramShowcase from "@/components/sections/home/program-showcase/ProgramShowcase";
import {
  describeTabProblem,
  resolveTab,
} from "@/components/sections/home/program-showcase/resolve";
import {
  DEFAULT_PROGRAM_SHOWCASE,
  SHOWCASE_TEMPLATES,
  createShowcaseId,
  createShowcaseTab,
  emptyShowcaseTab,
} from "@/app/modules/site-content/program-showcase.templates";
import type {
  ProgramShowcase as ProgramShowcaseConfig,
  ShowcaseTab,
  ShowcaseTemplate,
} from "@/app/modules/site-content/site-content.types";

import { TabEditor } from "./TabEditor";
import { TemplatePicker } from "./fields";

const templateTitle = (t: ShowcaseTemplate) =>
  SHOWCASE_TEMPLATES.find((x) => x.value === t)?.title ?? t;

/** Fill in fields that older saved data might not have. */
function normalize(section: ProgramShowcaseConfig): ProgramShowcaseConfig {
  const blank = emptyShowcaseTab();
  return {
    ...section,
    display: section.display === "stacked" ? "stacked" : "tabs",
    tabs: (section.tabs ?? []).map((tab) => ({
      ...blank,
      ...tab,
      chips: tab.chips ?? [],
      tiles: tab.tiles ?? [],
      priceNotes: tab.priceNotes ?? [],
      cards: tab.cards ?? [],
      helpItems: tab.helpItems ?? [],
    })),
  };
}

export function ProgramShowcaseCmsView() {
  const utils = trpc.useUtils();
  const query = trpc.siteContent.getHome.useQuery();
  const catalogQuery = trpc.publicPrograms.homeCatalog.useQuery();
  const catalog = catalogQuery.data;

  const mutation = trpc.siteContent.updateProgramShowcase.useMutation({
    onSuccess: () => {
      toast.success("Section Program diperbarui!");
      void utils.siteContent.getHome.invalidate();
    },
    onError: (err) => toast.error(err.message || "Gagal menyimpan"),
  });

  const [section, setSection] = useState<ProgramShowcaseConfig>(
    DEFAULT_PROGRAM_SHOWCASE,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    const saved = query.data.programShowcase ?? DEFAULT_PROGRAM_SHOWCASE;
    setSection(normalize(saved));
    setDirty(false);
  }, [query.data]);

  function update(next: ProgramShowcaseConfig) {
    setSection(next);
    setDirty(true);
  }

  function setField<K extends keyof ProgramShowcaseConfig>(
    key: K,
    value: ProgramShowcaseConfig[K],
  ) {
    update({ ...section, [key]: value });
  }

  function patchTab(id: string, patch: Partial<ShowcaseTab>) {
    update({
      ...section,
      tabs: section.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function moveTab(index: number, to: number) {
    if (to < 0 || to >= section.tabs.length) return;
    const tabs = [...section.tabs];
    const [row] = tabs.splice(index, 1);
    tabs.splice(to, 0, row);
    update({ ...section, tabs });
  }

  function removeTab(id: string) {
    if (!window.confirm("Hapus bagian ini dari section Program?")) return;
    update({ ...section, tabs: section.tabs.filter((t) => t.id !== id) });
  }

  function duplicateTab(index: number) {
    const source = section.tabs[index];
    const copy: ShowcaseTab = {
      ...structuredClone(source),
      id: createShowcaseId(),
      label: source.label.trim() ? `${source.label} (salinan)` : "",
    };
    const tabs = [...section.tabs];
    tabs.splice(index + 1, 0, copy);
    update({ ...section, tabs });
    setOpenId(copy.id);
  }

  function addTab(template: ShowcaseTemplate) {
    if (section.tabs.length >= 8) {
      toast.error("Maksimal 8 bagian.");
      return;
    }
    const tab = createShowcaseTab(template);
    update({ ...section, tabs: [...section.tabs, tab] });
    setOpenId(tab.id);
    setAdding(false);
  }

  function resetToDefault() {
    if (!window.confirm("Kembalikan section Program ke tampilan bawaan? Perubahan belum tersimpan sampai Anda menekan Simpan.")) return;
    update(normalize(structuredClone(DEFAULT_PROGRAM_SHOWCASE)));
    setOpenId(null);
  }

  function handleSave() {
    mutation.mutate(section, { onSuccess: () => setDirty(false) });
  }

  const problems = useMemo(
    () =>
      Object.fromEntries(
        section.tabs.map((t) => [t.id, describeTabProblem(t, catalog)]),
      ) as Record<string, string | null>,
    [section.tabs, catalog],
  );
  const problemCount = Object.values(problems).filter(Boolean).length;

  // Name shown on each tab button: the typed text, else the real program name.
  const tabNames = useMemo(
    () =>
      Object.fromEntries(
        section.tabs.map((t) => [
          t.id,
          t.label.trim() ||
            (catalog ? (resolveTab(t, catalog)?.label ?? "") : ""),
        ]),
      ) as Record<string, string>,
    [section.tabs, catalog],
  );

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "CMS Halaman", href: "/dashboard/settings/home" },
    { label: "Program Beranda", icon: <LayoutGrid /> },
  ];

  const header = (
    <PageNav sticky>
      <PageHeader
        breadcrumbs={crumbs}
        title="CMS Program Beranda"
        description="Atur program yang tampil, tampilan, dan urutan section “Program Kami” di halaman utama."
      />
    </PageNav>
  );

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        {header}
        <div className="mx-4 flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm lg:mx-6">
          <Loader2 className="size-7 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      {header}

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        {/* Guide for new admins */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-[12.5px] leading-relaxed text-indigo-900">
          <p className="font-black">Cara kerja singkat</p>
          <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
            <li>Setiap <strong>bagian</strong> menampilkan satu program atau kategori. Semua bagian tampil berurutan dari atas ke bawah — makin banyak bagian, makin panjang section-nya.</li>
            <li>Pilih <strong>tampilan</strong> bagian: blok program tunggal (Unggulan, Sorotan, Banner) atau deretan kartu.</li>
            <li>
              Pilih <strong>programnya</strong> — nama, deskripsi, poin unggulan, paket, harga,
              jadwal, dan link pendaftaran diambil <strong>otomatis</strong> dari data program.
              Teks hanya perlu diketik jika ingin menggantinya.
            </li>
            <li>Lihat hasilnya di bagian Pratinjau, lalu tekan <strong>Simpan</strong>.</li>
          </ol>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            {/* HEADER */}
            <Section
              icon={Type}
              title="Judul Section"
              description="Teks besar di atas daftar program."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label kecil">
                  <TextInput
                    value={section.eyebrow}
                    onChange={(v) => setField("eyebrow", v)}
                    placeholder="Program Kami"
                  />
                </Field>
                <Field label="Judul">
                  <TextInput
                    value={section.title}
                    onChange={(v) => setField("title", v)}
                    placeholder="Pilih Program Sesuai"
                  />
                </Field>
                <Field label="Judul (bagian emas)">
                  <TextInput
                    value={section.titleAccent}
                    onChange={(v) => setField("titleAccent", v)}
                    placeholder="Kebutuhan Ananda"
                  />
                </Field>
              </div>
              <Field label="Deskripsi">
                <TextArea
                  value={section.description}
                  onChange={(v) => setField("description", v)}
                  rows={2}
                />
              </Field>
            </Section>

            {/* TABS */}
            <Section
              icon={ListOrdered}
              title="Bagian Program"
              description="Urutan di sini = urutan dari atas ke bawah di Beranda."
              badge={`${section.tabs.length} tab`}
            >
              <div className="space-y-3">
                {section.tabs.map((tab, index) => {
                  const open = openId === tab.id;
                  const problem = problems[tab.id];
                  return (
                    <div
                      key={tab.id}
                      className={cn(
                        "overflow-hidden rounded-2xl border bg-white",
                        problem ? "border-amber-300" : "border-slate-200",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 px-3.5 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : tab.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-700 text-[12px] font-black text-white">
                            {index + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-black text-slate-800">
                              {tabNames[tab.id] || "(pilih program)"}
                            </span>
                            <span className="block text-[11.5px] text-slate-400">
                              {templateTitle(tab.template)}
                              {tab.label.trim() === "" && tabNames[tab.id]
                                ? " · nama dari program"
                                : ""}
                            </span>
                          </span>
                          {problem && (
                            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                          )}
                          {open ? (
                            <ChevronUp className="ml-auto size-4 shrink-0 text-slate-400" />
                          ) : (
                            <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <IconBtn
                            label="Naik"
                            disabled={index === 0}
                            onClick={() => moveTab(index, index - 1)}
                          >
                            <ChevronUp className="size-3.5" />
                          </IconBtn>
                          <IconBtn
                            label="Turun"
                            disabled={index === section.tabs.length - 1}
                            onClick={() => moveTab(index, index + 1)}
                          >
                            <ChevronDown className="size-3.5" />
                          </IconBtn>
                          <IconBtn label="Duplikat" onClick={() => duplicateTab(index)}>
                            <Copy className="size-3.5" />
                          </IconBtn>
                          <IconBtn
                            label="Hapus"
                            danger
                            onClick={() => removeTab(tab.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </IconBtn>
                        </div>
                      </div>

                      {problem && (
                        <p className="border-t border-amber-200 bg-amber-50 px-3.5 py-2 text-[12px] font-semibold text-amber-800">
                          {problem}
                        </p>
                      )}

                      {open && (
                        <div className="border-t border-slate-100 bg-slate-50/40 p-4">
                          <TabEditor
                            tab={tab}
                            catalog={catalog}
                            onChange={(patch) => patchTab(tab.id, patch)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {section.tabs.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-[13px] text-slate-500">
                    Belum ada tab. Section Program tidak tampil di Beranda sampai ada
                    minimal satu tab.
                  </p>
                )}

                {adding ? (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[13px] font-black text-slate-800">
                        Pilih tampilan untuk bagian baru
                      </p>
                      <button
                        type="button"
                        onClick={() => setAdding(false)}
                        className="text-[12px] font-bold text-slate-500 hover:text-slate-700"
                      >
                        Batal
                      </button>
                    </div>
                    <TemplatePicker value={null} onChange={addTab} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    disabled={section.tabs.length >= 8}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-[13px] font-black text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                    Tambah Bagian
                  </button>
                )}
              </div>
            </Section>

            {/* PREVIEW */}
            <Section
              icon={Eye}
              title="Pratinjau"
              description="Tampilan langsung dari pengaturan di atas (belum disimpan). Tampilan HP bisa dicek di Beranda setelah disimpan."
            >
              <div
                className="overflow-hidden rounded-2xl border border-slate-200 p-5 sm:p-6"
                style={{ background: "var(--bg-soft)" }}
              >
                {section.tabs.length > 0 ? (
                  <ProgramShowcase section={section} catalog={catalog} />
                ) : (
                  <p className="py-8 text-center text-[13px] text-slate-400">
                    Tambahkan bagian untuk melihat pratinjau.
                  </p>
                )}
              </div>
            </Section>
          </div>

          <div>
            <StickyPanel>
              <SaveCard
                onSave={handleSave}
                isSaving={mutation.isPending}
                note={
                  dirty
                    ? "Ada perubahan yang belum disimpan."
                    : "Perubahan langsung berlaku di Beranda."
                }
                checklist={[
                  { label: "Judul section terisi", ok: !!section.title.trim() },
                  { label: "Minimal 1 bagian", ok: section.tabs.length > 0 },
                  { label: "Semua bagian siap tampil", ok: problemCount === 0 },
                ]}
              />

              <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <Link
                  href="/#programs"
                  target="_blank"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Lihat di Beranda
                  <ExternalLink className="size-3.5" />
                </Link>
                <Link
                  href="/dashboard/programs"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Kelola program & harga
                  <ExternalLink className="size-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Kembalikan ke bawaan
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </StickyPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border bg-white transition-colors disabled:opacity-30",
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-slate-200 text-slate-500 hover:bg-slate-100",
      )}
    >
      {children}
    </button>
  );
}
