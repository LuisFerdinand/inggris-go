// app/(dashboard)/dashboard/settings/home/_modules/HomePageCmsView.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Home,
  LayoutGrid,
  Loader2,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Star,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { PageHeader, PageNav } from "@/components/PageHeader";
import { IconPicker } from "@/components/IconPicker";
import {
  ActiveToggle,
  ColorKeyPicker,
  Field,
  ImageUploader,
  RepeatableList,
  SaveCard,
  Section,
  StickyPanel,
  TextArea,
  TextInput,
  emptyToNull,
  nullToEmpty,
} from "@/components/cms/CmsForm";
import type {
  AdvantageFeature,
  HeroFloatingText,
  MethodStep,
  ProblemCard,
} from "@/app/modules/site-content/site-content.types";

const PROBLEM_COLORS = ["orange", "teal", "amber", "purple"] as const;
const GRADIENT_KEYS = ["blue", "navy", "gold", "sky"] as const;

type FormState = {
  heroBadgeText: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroSubtitleHighlight: string;
  heroDescription: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroFloatingText: HeroFloatingText;

  problemEyebrow: string;
  problemTitle: string;
  problemTitleAccent: string;
  problemDescription: string;
  problemCards: ProblemCard[];
  problemCalloutText: string;
  problemCalloutHighlight: string;
  problemCalloutIcon: string;

  methodEyebrow: string;
  methodTitle: string;
  methodTitleAccent: string;
  methodDescription: string;
  methodSteps: MethodStep[];
  methodFootnotePrefix: string;
  methodFootnoteHighlight: string;
  methodFootnoteSuffix: string;

  advantageEyebrow: string;
  advantageTitle: string;
  advantageTitleAccent: string;
  advantageDescription: string;
  advantageFeatures: AdvantageFeature[];

  isActive: boolean;
};

const EMPTY_FLOATING: HeroFloatingText = {
  speechName: "",
  speechLocation: "",
  speechQuote: "",
  speechInitials: "",
  liveTitle: "",
  activeText: "",
  chatHeader: "",
  chatMsg1: "",
  chatMsg2: "",
};

const EMPTY: FormState = {
  heroBadgeText: "",
  heroTitle: "",
  heroTitleAccent: "",
  heroSubtitle: "",
  heroSubtitleHighlight: "",
  heroDescription: "",
  heroImageUrl: "",
  heroImageAlt: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaHref: "",
  heroSecondaryCtaLabel: "",
  heroSecondaryCtaHref: "",
  heroFloatingText: EMPTY_FLOATING,
  problemEyebrow: "",
  problemTitle: "",
  problemTitleAccent: "",
  problemDescription: "",
  problemCards: [],
  problemCalloutText: "",
  problemCalloutHighlight: "",
  problemCalloutIcon: "",
  methodEyebrow: "",
  methodTitle: "",
  methodTitleAccent: "",
  methodDescription: "",
  methodSteps: [],
  methodFootnotePrefix: "",
  methodFootnoteHighlight: "",
  methodFootnoteSuffix: "",
  advantageEyebrow: "",
  advantageTitle: "",
  advantageTitleAccent: "",
  advantageDescription: "",
  advantageFeatures: [],
  isActive: true,
};

export function HomePageCmsView() {
  const utils = trpc.useUtils();
  const query = trpc.siteContent.getHome.useQuery();
  const mutation = trpc.siteContent.updateHome.useMutation({
    onSuccess: () => {
      toast.success("Halaman Beranda diperbarui!");
      void utils.siteContent.getHome.invalidate();
    },
    onError: (err) => toast.error(err.message || "Gagal menyimpan"),
  });

  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!query.data) return;
    const d = query.data;
    setForm({
      heroBadgeText: nullToEmpty(d.heroBadgeText),
      heroTitle: nullToEmpty(d.heroTitle),
      heroTitleAccent: nullToEmpty(d.heroTitleAccent),
      heroSubtitle: nullToEmpty(d.heroSubtitle),
      heroSubtitleHighlight: nullToEmpty(d.heroSubtitleHighlight),
      heroDescription: nullToEmpty(d.heroDescription),
      heroImageUrl: nullToEmpty(d.heroImageUrl),
      heroImageAlt: nullToEmpty(d.heroImageAlt),
      heroPrimaryCtaLabel: nullToEmpty(d.heroPrimaryCtaLabel),
      heroPrimaryCtaHref: nullToEmpty(d.heroPrimaryCtaHref),
      heroSecondaryCtaLabel: nullToEmpty(d.heroSecondaryCtaLabel),
      heroSecondaryCtaHref: nullToEmpty(d.heroSecondaryCtaHref),
      heroFloatingText: { ...EMPTY_FLOATING, ...(d.heroFloatingText ?? {}) },
      problemEyebrow: nullToEmpty(d.problemEyebrow),
      problemTitle: nullToEmpty(d.problemTitle),
      problemTitleAccent: nullToEmpty(d.problemTitleAccent),
      problemDescription: nullToEmpty(d.problemDescription),
      problemCards: d.problemCards ?? [],
      problemCalloutText: nullToEmpty(d.problemCalloutText),
      problemCalloutHighlight: nullToEmpty(d.problemCalloutHighlight),
      problemCalloutIcon: nullToEmpty(d.problemCalloutIcon),
      methodEyebrow: nullToEmpty(d.methodEyebrow),
      methodTitle: nullToEmpty(d.methodTitle),
      methodTitleAccent: nullToEmpty(d.methodTitleAccent),
      methodDescription: nullToEmpty(d.methodDescription),
      methodSteps: d.methodSteps ?? [],
      methodFootnotePrefix: nullToEmpty(d.methodFootnotePrefix),
      methodFootnoteHighlight: nullToEmpty(d.methodFootnoteHighlight),
      methodFootnoteSuffix: nullToEmpty(d.methodFootnoteSuffix),
      advantageEyebrow: nullToEmpty(d.advantageEyebrow),
      advantageTitle: nullToEmpty(d.advantageTitle),
      advantageTitleAccent: nullToEmpty(d.advantageTitleAccent),
      advantageDescription: nullToEmpty(d.advantageDescription),
      advantageFeatures: d.advantageFeatures ?? [],
      isActive: d.isActive,
    });
  }, [query.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setFloating<K extends keyof HeroFloatingText>(
    key: K,
    value: string,
  ) {
    setForm((f) => ({
      ...f,
      heroFloatingText: { ...f.heroFloatingText, [key]: value },
    }));
  }

  function handleSave() {
    mutation.mutate({
      heroBadgeText: emptyToNull(form.heroBadgeText),
      heroTitle: emptyToNull(form.heroTitle),
      heroTitleAccent: emptyToNull(form.heroTitleAccent),
      heroSubtitle: emptyToNull(form.heroSubtitle),
      heroSubtitleHighlight: emptyToNull(form.heroSubtitleHighlight),
      heroDescription: emptyToNull(form.heroDescription),
      heroImageUrl: emptyToNull(form.heroImageUrl),
      heroImageAlt: emptyToNull(form.heroImageAlt),
      heroPrimaryCtaLabel: emptyToNull(form.heroPrimaryCtaLabel),
      heroPrimaryCtaHref: emptyToNull(form.heroPrimaryCtaHref),
      heroSecondaryCtaLabel: emptyToNull(form.heroSecondaryCtaLabel),
      heroSecondaryCtaHref: emptyToNull(form.heroSecondaryCtaHref),
      heroFloatingText: form.heroFloatingText,
      problemEyebrow: emptyToNull(form.problemEyebrow),
      problemTitle: emptyToNull(form.problemTitle),
      problemTitleAccent: emptyToNull(form.problemTitleAccent),
      problemDescription: emptyToNull(form.problemDescription),
      problemCards: form.problemCards,
      problemCalloutText: emptyToNull(form.problemCalloutText),
      problemCalloutHighlight: emptyToNull(form.problemCalloutHighlight),
      problemCalloutIcon: emptyToNull(form.problemCalloutIcon),
      methodEyebrow: emptyToNull(form.methodEyebrow),
      methodTitle: emptyToNull(form.methodTitle),
      methodTitleAccent: emptyToNull(form.methodTitleAccent),
      methodDescription: emptyToNull(form.methodDescription),
      methodSteps: form.methodSteps,
      methodFootnotePrefix: emptyToNull(form.methodFootnotePrefix),
      methodFootnoteHighlight: emptyToNull(form.methodFootnoteHighlight),
      methodFootnoteSuffix: emptyToNull(form.methodFootnoteSuffix),
      advantageEyebrow: emptyToNull(form.advantageEyebrow),
      advantageTitle: emptyToNull(form.advantageTitle),
      advantageTitleAccent: emptyToNull(form.advantageTitleAccent),
      advantageDescription: emptyToNull(form.advantageDescription),
      advantageFeatures: form.advantageFeatures,
      isActive: form.isActive,
    });
  }

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "CMS Halaman", href: "/dashboard/settings/home" },
    { label: "Beranda", icon: <Home /> },
  ];

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={crumbs}
            title="CMS Beranda"
            description="Kelola Hero, Masalah Umum, Metode, Program Kami, dan Keunggulan."
          />
        </PageNav>
        <div className="mx-4 flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm lg:mx-6">
          <Loader2 className="size-7 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={crumbs}
          title="CMS Beranda"
          description="Kelola Hero, Masalah Umum, Metode, dan Keunggulan halaman utama."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        <ActiveToggle
          active={form.isActive}
          onToggle={() => set("isActive", !form.isActive)}
          icon={Home}
          label="CMS Beranda"
          hint="Saat aktif, halaman Beranda memakai konten dari sini."
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            {/* HERO */}
            <Section
              icon={Sparkles}
              title="Hero"
              description="Bagian paling atas. Statistik mengikuti angka di Footer CMS."
            >
              <Field label="Badge">
                <TextInput
                  value={form.heroBadgeText}
                  onChange={(v) => set("heroBadgeText", v)}
                  placeholder="Kampung Inggris Pare, Indonesia"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Judul">
                  <TextInput
                    value={form.heroTitle}
                    onChange={(v) => set("heroTitle", v)}
                    placeholder="Belajar Bahasa Inggris"
                  />
                </Field>
                <Field label="Aksen Judul" description="Bagian berwarna emas.">
                  <TextInput
                    value={form.heroTitleAccent}
                    onChange={(v) => set("heroTitleAccent", v)}
                    placeholder="Tanpa Takut Salah"
                  />
                </Field>
              </div>
              <Field label="Sub-judul">
                <TextArea
                  value={form.heroSubtitle}
                  onChange={(v) => set("heroSubtitle", v)}
                  rows={2}
                  placeholder="Mulai berbicara bahasa Inggris dengan percaya diri…"
                />
              </Field>
              <Field
                label="Kata yang ditebalkan di sub-judul"
                description="Kata/frasa ini akan tampil tebal & berwarna."
              >
                <TextInput
                  value={form.heroSubtitleHighlight}
                  onChange={(v) => set("heroSubtitleHighlight", v)}
                  placeholder="Inggris Go"
                />
              </Field>
              <Field label="Deskripsi">
                <TextArea
                  value={form.heroDescription}
                  onChange={(v) => set("heroDescription", v)}
                  rows={2}
                  placeholder="Program online, privat, dan English camp…"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Gambar Hero">
                  <ImageUploader
                    value={form.heroImageUrl}
                    onChange={(v) => set("heroImageUrl", v)}
                  />
                </Field>
                <Field label="Alt Gambar" description="Deskripsi untuk aksesibilitas.">
                  <TextInput
                    value={form.heroImageAlt}
                    onChange={(v) => set("heroImageAlt", v)}
                    placeholder="Siswa Inggris Go berbicara…"
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tombol Utama — Label">
                  <TextInput
                    value={form.heroPrimaryCtaLabel}
                    onChange={(v) => set("heroPrimaryCtaLabel", v)}
                    placeholder="Mulai Speaking Challenge"
                  />
                </Field>
                <Field label="Tombol Utama — URL">
                  <TextInput
                    value={form.heroPrimaryCtaHref}
                    onChange={(v) => set("heroPrimaryCtaHref", v)}
                    placeholder="/programs/lead/speaking-challenge"
                  />
                </Field>
                <Field label="Tombol Kedua — Label">
                  <TextInput
                    value={form.heroSecondaryCtaLabel}
                    onChange={(v) => set("heroSecondaryCtaLabel", v)}
                    placeholder="Lihat Semua Program"
                  />
                </Field>
                <Field label="Tombol Kedua — URL">
                  <TextInput
                    value={form.heroSecondaryCtaHref}
                    onChange={(v) => set("heroSecondaryCtaHref", v)}
                    placeholder="#programs"
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Teks 4 Komponen Melayang
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Bubble — Nama">
                    <TextInput
                      value={form.heroFloatingText.speechName}
                      onChange={(v) => setFloating("speechName", v)}
                      placeholder="Rina, Surabaya"
                    />
                  </Field>
                  <Field label="Bubble — Inisial">
                    <TextInput
                      value={form.heroFloatingText.speechInitials}
                      onChange={(v) => setFloating("speechInitials", v)}
                      placeholder="R"
                    />
                  </Field>
                  <Field label="Bubble — Kutipan">
                    <TextInput
                      value={form.heroFloatingText.speechQuote}
                      onChange={(v) => setFloating("speechQuote", v)}
                      placeholder="Sekarang aku udah berani…"
                    />
                  </Field>
                  <Field label="Badge Live — Judul">
                    <TextInput
                      value={form.heroFloatingText.liveTitle}
                      onChange={(v) => setFloating("liveTitle", v)}
                      placeholder="Live Speaking Now"
                    />
                  </Field>
                  <Field label="Pill Aktif — Teks" description="Angka di depannya otomatis.">
                    <TextInput
                      value={form.heroFloatingText.activeText}
                      onChange={(v) => setFloating("activeText", v)}
                      placeholder="Active"
                    />
                  </Field>
                  <Field label="Kartu Chat — Header">
                    <TextInput
                      value={form.heroFloatingText.chatHeader}
                      onChange={(v) => setFloating("chatHeader", v)}
                      placeholder="SPEAKING PRACTICE"
                    />
                  </Field>
                  <Field label="Kartu Chat — Pesan 1">
                    <TextInput
                      value={form.heroFloatingText.chatMsg1}
                      onChange={(v) => setFloating("chatMsg1", v)}
                      placeholder="Hello! How are you?"
                    />
                  </Field>
                  <Field label="Kartu Chat — Pesan 2">
                    <TextInput
                      value={form.heroFloatingText.chatMsg2}
                      onChange={(v) => setFloating("chatMsg2", v)}
                      placeholder="I'm fine, thank you!"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* MASALAH UMUM */}
            <Section
              icon={MessageCircleQuestion}
              title="Masalah Umum"
              description="Judul, deskripsi, kartu (warna + ikon + teks), dan kata kunci di bawah."
            >
              <Field label="Eyebrow">
                <TextInput
                  value={form.problemEyebrow}
                  onChange={(v) => set("problemEyebrow", v)}
                  placeholder="Masalah Umum"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Judul">
                  <TextInput
                    value={form.problemTitle}
                    onChange={(v) => set("problemTitle", v)}
                    placeholder="Mengapa Banyak Orang"
                  />
                </Field>
                <Field label="Aksen Judul">
                  <TextInput
                    value={form.problemTitleAccent}
                    onChange={(v) => set("problemTitleAccent", v)}
                    placeholder="Tidak Pernah Berani Speaking?"
                  />
                </Field>
              </div>
              <Field label="Deskripsi">
                <TextArea
                  value={form.problemDescription}
                  onChange={(v) => set("problemDescription", v)}
                  rows={2}
                />
              </Field>

              <Field label="Kartu Masalah">
                <RepeatableList<ProblemCard>
                  items={form.problemCards}
                  onChange={(next) => set("problemCards", next)}
                  itemLabel="Kartu"
                  max={8}
                  makeNew={() => ({
                    number: String(form.problemCards.length + 1).padStart(2, "0"),
                    title: "",
                    body: "",
                    icon: "circle",
                    colorKey: "orange",
                  })}
                  renderItem={(item, update) => (
                    <>
                      <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                        <Field label="No.">
                          <TextInput
                            value={item.number}
                            onChange={(v) => update({ number: v })}
                            placeholder="01"
                          />
                        </Field>
                        <Field label="Judul">
                          <TextInput
                            value={item.title}
                            onChange={(v) => update({ title: v })}
                            placeholder="Takut Salah Grammar"
                          />
                        </Field>
                      </div>
                      <Field label="Isi">
                        <TextArea
                          value={item.body}
                          onChange={(v) => update({ body: v })}
                          rows={2}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Ikon">
                          <IconPicker
                            value={item.icon || undefined}
                            onChange={(name) => update({ icon: name ?? "" })}
                          />
                        </Field>
                        <Field label="Warna Kartu">
                          <ColorKeyPicker
                            value={item.colorKey}
                            options={PROBLEM_COLORS}
                            onChange={(c) => update({ colorKey: c })}
                          />
                        </Field>
                      </div>
                    </>
                  )}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
                <Field label="Callout — Teks">
                  <TextInput
                    value={form.problemCalloutText}
                    onChange={(v) => set("problemCalloutText", v)}
                    placeholder="Belajar bahasa Inggris seharusnya"
                  />
                </Field>
                <Field label="Callout — Bagian Ditebalkan">
                  <TextInput
                    value={form.problemCalloutHighlight}
                    onChange={(v) => set("problemCalloutHighlight", v)}
                    placeholder="tidak membuat kamu merasa takut!"
                  />
                </Field>
                <Field label="Callout — Ikon">
                  <IconPicker
                    value={form.problemCalloutIcon || undefined}
                    onChange={(name) => set("problemCalloutIcon", name ?? "")}
                  />
                </Field>
              </div>
            </Section>

            {/* METHODS */}
            <Section
              icon={Route}
              title="Metode"
              description="Judul, deskripsi, langkah-langkah, dan catatan kaki."
            >
              <Field label="Eyebrow">
                <TextInput
                  value={form.methodEyebrow}
                  onChange={(v) => set("methodEyebrow", v)}
                  placeholder="Metode kami"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Judul">
                  <TextInput
                    value={form.methodTitle}
                    onChange={(v) => set("methodTitle", v)}
                    placeholder="Metode Belajar"
                  />
                </Field>
                <Field label="Aksen Judul">
                  <TextInput
                    value={form.methodTitleAccent}
                    onChange={(v) => set("methodTitleAccent", v)}
                    placeholder="Inggris Go"
                  />
                </Field>
              </div>
              <Field label="Deskripsi">
                <TextArea
                  value={form.methodDescription}
                  onChange={(v) => set("methodDescription", v)}
                  rows={2}
                />
              </Field>

              <Field label="Langkah">
                <RepeatableList<MethodStep>
                  items={form.methodSteps}
                  onChange={(next) => set("methodSteps", next)}
                  itemLabel="Langkah"
                  max={8}
                  makeNew={() => ({
                    num: String(form.methodSteps.length + 1),
                    title: "",
                    subtitle: "",
                    body: "",
                    tags: [],
                    icon: "circle",
                  })}
                  renderItem={(item, update) => (
                    <>
                      <div className="grid gap-3 sm:grid-cols-[70px_1fr_1fr]">
                        <Field label="No.">
                          <TextInput
                            value={item.num}
                            onChange={(v) => update({ num: v })}
                          />
                        </Field>
                        <Field label="Judul">
                          <TextInput
                            value={item.title}
                            onChange={(v) => update({ title: v })}
                            placeholder="Understand"
                          />
                        </Field>
                        <Field label="Sub-judul">
                          <TextInput
                            value={item.subtitle}
                            onChange={(v) => update({ subtitle: v })}
                            placeholder="Pahami Dasarnya"
                          />
                        </Field>
                      </div>
                      <Field label="Isi">
                        <TextArea
                          value={item.body}
                          onChange={(v) => update({ body: v })}
                          rows={2}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Ikon">
                          <IconPicker
                            value={item.icon || undefined}
                            onChange={(name) => update({ icon: name ?? "" })}
                          />
                        </Field>
                        <Field
                          label="Tag"
                          hint="Pisahkan dengan koma."
                        >
                          <TextInput
                            value={item.tags.join(", ")}
                            onChange={(v) =>
                              update({
                                tags: v
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Kosakata dasar, Pola kalimat"
                          />
                        </Field>
                      </div>
                    </>
                  )}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Catatan Kaki — Awal">
                  <TextInput
                    value={form.methodFootnotePrefix}
                    onChange={(v) => set("methodFootnotePrefix", v)}
                    placeholder="Sudah terbukti membantu"
                  />
                </Field>
                <Field label="Catatan Kaki — Angka">
                  <TextInput
                    value={form.methodFootnoteHighlight}
                    onChange={(v) => set("methodFootnoteHighlight", v)}
                    placeholder="2000+"
                  />
                </Field>
                <Field label="Catatan Kaki — Akhir">
                  <TextInput
                    value={form.methodFootnoteSuffix}
                    onChange={(v) => set("methodFootnoteSuffix", v)}
                    placeholder="siswa dari nol jadi berani speaking"
                  />
                </Field>
              </div>
            </Section>

            {/* PROGRAMS → dedicated CMS page */}
            <Section
              icon={LayoutGrid}
              title="Program Kami"
              description="Bagian “Program Kami” (tab filter, kartu program, banner) kini punya halaman CMS sendiri agar lebih mudah dikelola."
            >
              <Link
                href="/dashboard/settings/home-programs"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-bold text-white transition-colors hover:bg-indigo-700"
              >
                Buka CMS Program Beranda
                <ArrowRight className="size-4" />
              </Link>
            </Section>

            {/* ADVANTAGES */}
            <Section
              icon={Star}
              title="Keunggulan"
              description="Judul, deskripsi, dan kartu keunggulan. (Blok CTA di bawahnya tetap statis.)"
            >
              <Field label="Eyebrow">
                <TextInput
                  value={form.advantageEyebrow}
                  onChange={(v) => set("advantageEyebrow", v)}
                  placeholder="Keunggulan Kami"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Judul">
                  <TextInput
                    value={form.advantageTitle}
                    onChange={(v) => set("advantageTitle", v)}
                    placeholder="Mengapa Belajar di"
                  />
                </Field>
                <Field label="Aksen Judul">
                  <TextInput
                    value={form.advantageTitleAccent}
                    onChange={(v) => set("advantageTitleAccent", v)}
                    placeholder="Inggris Go"
                  />
                </Field>
              </div>
              <Field label="Deskripsi">
                <TextArea
                  value={form.advantageDescription}
                  onChange={(v) => set("advantageDescription", v)}
                  rows={2}
                />
              </Field>

              <Field label="Kartu Keunggulan">
                <RepeatableList<AdvantageFeature>
                  items={form.advantageFeatures}
                  onChange={(next) => set("advantageFeatures", next)}
                  itemLabel="Kartu"
                  max={12}
                  makeNew={() => ({
                    title: "",
                    desc: "",
                    icon: "circle",
                    gradientKey: "blue",
                  })}
                  renderItem={(item, update) => (
                    <>
                      <Field label="Judul">
                        <TextInput
                          value={item.title}
                          onChange={(v) => update({ title: v })}
                          placeholder="Metode Praktis"
                        />
                      </Field>
                      <Field label="Deskripsi">
                        <TextArea
                          value={item.desc}
                          onChange={(v) => update({ desc: v })}
                          rows={2}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Ikon">
                          <IconPicker
                            value={item.icon || undefined}
                            onChange={(name) => update({ icon: name ?? "" })}
                          />
                        </Field>
                        <Field label="Gradasi Ikon">
                          <ColorKeyPicker
                            value={item.gradientKey}
                            options={GRADIENT_KEYS}
                            onChange={(g) => update({ gradientKey: g })}
                          />
                        </Field>
                      </div>
                    </>
                  )}
                />
              </Field>
            </Section>
          </div>

          <aside>
            <StickyPanel>
              <SaveCard
                onSave={handleSave}
                isSaving={mutation.isPending}
                note="Perubahan langsung berlaku di halaman Beranda."
                checklist={[
                  { label: "Judul Hero", ok: !!form.heroTitle },
                  { label: "Gambar Hero", ok: !!form.heroImageUrl },
                  { label: "Kartu Masalah", ok: form.problemCards.length > 0 },
                  { label: "Langkah Metode", ok: form.methodSteps.length > 0 },
                  {
                    label: "Kartu Keunggulan",
                    ok: form.advantageFeatures.length > 0,
                  },
                ]}
              />
            </StickyPanel>
          </aside>
        </div>
      </div>
    </div>
  );
}
