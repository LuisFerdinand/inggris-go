// app/(dashboard)/dashboard/settings/footer/_modules/FooterSettingsView.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Instagram,
  LayoutTemplate,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Save,
  Share2,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type FormState = {
  tagline: string;
  description: string;

  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;

  whatsappNumber: string;
  whatsappLabel: string;
  email: string;
  contactPageHref: string;
  contactPageLabel: string;

  locationAddress: string;
  locationMapsUrl: string;

  statAlumniOverride: string;
  statProgramOverride: string;
  statYearsOverride: string;
  statRatingOverride: string;

  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;

  privacyHref: string;
  privacyLabel: string;
  termsHref: string;
  termsLabel: string;
  locationTagline: string;

  programLinksRaw: string;

  isActive: boolean;
};

const EMPTY: FormState = {
  tagline: "",
  description: "",

  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",

  whatsappNumber: "",
  whatsappLabel: "WhatsApp Admin",
  email: "",
  contactPageHref: "/contact",
  contactPageLabel: "Form Pertanyaan",

  locationAddress: "",
  locationMapsUrl: "",

  statAlumniOverride: "",
  statProgramOverride: "",
  statYearsOverride: "",
  statRatingOverride: "",

  ctaText: "Siap mulai perjalanan belajar Bahasa Inggris kamu?",
  ctaButtonLabel: "Hubungi Kami",
  ctaButtonHref: "",

  privacyHref: "/privacy",
  privacyLabel: "Privasi",
  termsHref: "/terms",
  termsLabel: "Ketentuan",
  locationTagline: "Kampung Inggris Pare, Kediri",

  programLinksRaw: "",

  isActive: true,
};

function nullToEmpty(v: string | null | undefined): string {
  return v ?? "";
}

function emptyToNull(v: string): string | null {
  return v.trim() || null;
}

function intOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return isNaN(n) || n <= 0 ? null : n;
}

/* ─────────────────────────────────────────────────────────────
   PRIMITIVES — mirrors SiteHeaderSettingsView exactly
───────────────────────────────────────────────────────────── */

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
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
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
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: React.ReactNode;
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100",
        mono && "font-mono text-[11.5px] leading-relaxed",
      )}
    />
  );
}

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
   LIVE PREVIEW — compact footer miniature
───────────────────────────────────────────────────────────── */

function FooterPreview({ form }: { form: FormState }) {
  const socials = [
    { label: "Instagram", url: form.instagramUrl, color: "bg-pink-500" },
    { label: "TikTok", url: form.tiktokUrl, color: "bg-slate-900" },
    { label: "YouTube", url: form.youtubeUrl, color: "bg-red-600" },
    { label: "Facebook", url: form.facebookUrl, color: "bg-blue-600" },
    { label: "X/Twitter", url: form.twitterUrl, color: "bg-slate-800" },
    { label: "LinkedIn", url: form.linkedinUrl, color: "bg-blue-700" },
  ].filter((s) => s.url.trim());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Footer Preview
      </p>

      <div
        className="rounded-xl px-4 py-5 text-white text-[11px] space-y-3"
        style={{ background: "var(--blue-abyss, #060f2e)" }}
      >
        {/* Brand */}
        <div>
          <p className="font-bold text-[12px]">InggrisGo</p>
          {form.tagline && (
            <p className="mt-0.5 text-white/50 text-[10px] leading-relaxed line-clamp-2">
              {form.tagline}
            </p>
          )}
        </div>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {socials.map((s) => (
              <span
                key={s.label}
                className={cn(
                  "inline-block size-5 rounded-md text-white text-[8px] font-bold flex items-center justify-center",
                  s.color,
                )}
                title={s.label}
              >
                {s.label[0]}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {form.locationAddress && (
          <p className="text-white/35 text-[10px] leading-snug">
            📍 {form.locationAddress}
          </p>
        )}

        {/* CTA */}
        {form.ctaText && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-white/50 text-[10px] mb-1 line-clamp-1">
              {form.ctaText}
            </p>
            {form.ctaButtonLabel && (
              <span
                className="inline-block rounded-md px-2 py-0.5 text-[9px] font-bold"
                style={{ background: "var(--gold-vivid, #ffc107)", color: "#3a1c00" }}
              >
                {form.ctaButtonLabel}
              </span>
            )}
          </div>
        )}

        {/* Bottom */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-white/20 text-[9px]">
          <span>© {new Date().getFullYear()} InggrisGo</span>
          <div className="flex gap-2">
            <span>{form.privacyLabel || "Privasi"}</span>
            <span>{form.termsLabel || "Ketentuan"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

export function FooterSettingsView() {
  const utils = trpc.useUtils();

  const settingsQuery = trpc.footer.getSettings.useQuery();

  const updateSettings = trpc.footer.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Footer berhasil diperbarui!");
      void utils.footer.getSettings.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui footer");
    },
  });

  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!settingsQuery.data) return;
    const d = settingsQuery.data;
    setForm({
      tagline: nullToEmpty(d.tagline),
      description: nullToEmpty(d.description),

      instagramUrl: nullToEmpty(d.instagramUrl),
      tiktokUrl: nullToEmpty(d.tiktokUrl),
      youtubeUrl: nullToEmpty(d.youtubeUrl),
      facebookUrl: nullToEmpty(d.facebookUrl),
      twitterUrl: nullToEmpty(d.twitterUrl),
      linkedinUrl: nullToEmpty(d.linkedinUrl),

      whatsappNumber: nullToEmpty(d.whatsappNumber),
      whatsappLabel: nullToEmpty(d.whatsappLabel) || "WhatsApp Admin",
      email: nullToEmpty(d.email),
      contactPageHref: nullToEmpty(d.contactPageHref) || "/contact",
      contactPageLabel: nullToEmpty(d.contactPageLabel) || "Form Pertanyaan",

      locationAddress: nullToEmpty(d.locationAddress),
      locationMapsUrl: nullToEmpty(d.locationMapsUrl),

      statAlumniOverride: d.statAlumniOverride?.toString() ?? "",
      statProgramOverride: d.statProgramOverride?.toString() ?? "",
      statYearsOverride: d.statYearsOverride?.toString() ?? "",
      statRatingOverride: nullToEmpty(d.statRatingOverride),

      ctaText: nullToEmpty(d.ctaText),
      ctaButtonLabel: nullToEmpty(d.ctaButtonLabel),
      ctaButtonHref: nullToEmpty(d.ctaButtonHref),

      privacyHref: nullToEmpty(d.privacyHref) || "/privacy",
      privacyLabel: nullToEmpty(d.privacyLabel) || "Privasi",
      termsHref: nullToEmpty(d.termsHref) || "/terms",
      termsLabel: nullToEmpty(d.termsLabel) || "Ketentuan",
      locationTagline: nullToEmpty(d.locationTagline),

      programLinksRaw: nullToEmpty(d.programLinks),

      isActive: d.isActive,
    });
  }, [settingsQuery.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    updateSettings.mutate({
      tagline: emptyToNull(form.tagline),
      description: emptyToNull(form.description),

      instagramUrl: emptyToNull(form.instagramUrl),
      tiktokUrl: emptyToNull(form.tiktokUrl),
      youtubeUrl: emptyToNull(form.youtubeUrl),
      facebookUrl: emptyToNull(form.facebookUrl),
      twitterUrl: emptyToNull(form.twitterUrl),
      linkedinUrl: emptyToNull(form.linkedinUrl),

      whatsappNumber: emptyToNull(form.whatsappNumber),
      whatsappLabel: emptyToNull(form.whatsappLabel),
      email: emptyToNull(form.email),
      contactPageHref: emptyToNull(form.contactPageHref),
      contactPageLabel: emptyToNull(form.contactPageLabel),

      locationAddress: emptyToNull(form.locationAddress),
      locationMapsUrl: emptyToNull(form.locationMapsUrl),

      statAlumniOverride: intOrNull(form.statAlumniOverride),
      statProgramOverride: intOrNull(form.statProgramOverride),
      statYearsOverride: intOrNull(form.statYearsOverride),
      statRatingOverride: emptyToNull(form.statRatingOverride),

      ctaText: emptyToNull(form.ctaText),
      ctaButtonLabel: emptyToNull(form.ctaButtonLabel),
      ctaButtonHref: emptyToNull(form.ctaButtonHref),

      privacyHref: emptyToNull(form.privacyHref),
      privacyLabel: emptyToNull(form.privacyLabel),
      termsHref: emptyToNull(form.termsHref),
      termsLabel: emptyToNull(form.termsLabel),
      locationTagline: emptyToNull(form.locationTagline),

      programLinks: emptyToNull(form.programLinksRaw),

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
              { label: "Footer", icon: <LayoutTemplate /> },
            ]}
            title="Footer CMS"
            description="Kelola konten, sosial media, kontak, dan CTA di footer website."
          />
        </PageNav>
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white mx-4 lg:mx-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="size-7 animate-spin" />
            <p className="text-[13px] font-black">Memuat pengaturan footer…</p>
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
              { label: "Footer", icon: <LayoutTemplate /> },
            ]}
            title="Footer CMS"
            description="Kelola konten, sosial media, kontak, dan CTA di footer website."
          />
        </PageNav>
        <div className="mx-4 lg:mx-6 flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-red-100">
            <AlertCircle className="size-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-black text-red-700">Gagal memuat Footer CMS</p>
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
            { label: "Footer", icon: <LayoutTemplate /> },
          ]}
          title="Footer CMS"
          description="Kelola tagline, sosial media, kontak, lokasi, stats, dan CTA di footer publik."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        {/* Status bar */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                form.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
              )}
            >
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-black text-slate-900">Footer CMS</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-black",
                    form.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {form.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500">
                Saat aktif, footer akan menampilkan data dari CMS ini.
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

        {/* Main grid */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Brand & Tagline */}
            <Section
              icon={Sparkles}
              title="Brand & Tagline"
              description="Teks di bawah logo dan deskripsi singkat tentang InggrisGo."
            >
              <Field label="Tagline" description="Baris singkat di bawah nama brand.">
                <TextInput
                  value={form.tagline}
                  onChange={(v) => set("tagline", v)}
                  placeholder="Belajar Bahasa Inggris Tanpa Takut Salah"
                />
              </Field>

              <Field
                label="Deskripsi Footer"
                description="Paragraf pendek di kolom brand. Tampil di bawah logo."
              >
                <TextArea
                  value={form.description}
                  onChange={(v) => set("description", v)}
                  rows={3}
                  placeholder="Program speaking untuk pemula dari Kampung Inggris Pare — belajar dengan cara yang sederhana, praktis, dan menyenangkan."
                />
              </Field>
            </Section>

            {/* Social Media */}
            <Section
              icon={Share2}
              title="Sosial Media"
              description="Kosongkan URL untuk menyembunyikan ikon sosial tersebut."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Instagram">
                  <TextInput
                    value={form.instagramUrl}
                    onChange={(v) => set("instagramUrl", v)}
                    placeholder="https://instagram.com/inggrisgo"
                    prefix={<Instagram className="size-3.5" />}
                  />
                </Field>

                <Field label="TikTok">
                  <TextInput
                    value={form.tiktokUrl}
                    onChange={(v) => set("tiktokUrl", v)}
                    placeholder="https://tiktok.com/@inggrisgo"
                    prefix="TK"
                  />
                </Field>

                <Field label="YouTube">
                  <TextInput
                    value={form.youtubeUrl}
                    onChange={(v) => set("youtubeUrl", v)}
                    placeholder="https://youtube.com/@inggrisgo"
                    prefix={<Youtube className="size-3.5" />}
                  />
                </Field>

                <Field label="Facebook" description="Kosong = disembunyikan.">
                  <TextInput
                    value={form.facebookUrl}
                    onChange={(v) => set("facebookUrl", v)}
                    placeholder="https://facebook.com/inggrisgo"
                    prefix="FB"
                  />
                </Field>

                <Field label="X / Twitter" description="Kosong = disembunyikan.">
                  <TextInput
                    value={form.twitterUrl}
                    onChange={(v) => set("twitterUrl", v)}
                    placeholder="https://x.com/inggrisgo"
                    prefix="𝕏"
                  />
                </Field>

                <Field label="LinkedIn" description="Kosong = disembunyikan.">
                  <TextInput
                    value={form.linkedinUrl}
                    onChange={(v) => set("linkedinUrl", v)}
                    placeholder="https://linkedin.com/company/inggrisgo"
                    prefix="in"
                  />
                </Field>
              </div>
            </Section>

            {/* Contact */}
            <Section
              icon={MessageSquare}
              title="Kontak"
              description="Nomor WhatsApp, email, dan link halaman pertanyaan."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Nomor WhatsApp"
                  description="Format internasional tanpa +, misalnya: 6281234567890"
                >
                  <TextInput
                    value={form.whatsappNumber}
                    onChange={(v) => set("whatsappNumber", v)}
                    placeholder="6281234567890"
                    prefix="WA"
                  />
                </Field>

                <Field label="Label WhatsApp">
                  <TextInput
                    value={form.whatsappLabel}
                    onChange={(v) => set("whatsappLabel", v)}
                    placeholder="WhatsApp Admin"
                  />
                </Field>

                <Field label="Email">
                  <TextInput
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    placeholder="hello@inggrisgo.com"
                    type="email"
                    prefix={<Mail className="size-3.5" />}
                  />
                </Field>

                <Field label="Halaman Kontak">
                  <TextInput
                    value={form.contactPageHref}
                    onChange={(v) => set("contactPageHref", v)}
                    placeholder="/contact"
                  />
                </Field>
              </div>
            </Section>

            {/* Location */}
            <Section
              icon={MapPin}
              title="Lokasi"
              description="Alamat yang tampil di kolom peta dan location pill."
            >
              <Field label="Alamat Lengkap">
                <TextArea
                  value={form.locationAddress}
                  onChange={(v) => set("locationAddress", v)}
                  rows={2}
                  placeholder="Kampung Inggris Pare, Kec. Pare, Kab. Kediri, Jawa Timur 64212"
                />
              </Field>

              <Field
                label="Google Maps URL"
                description='URL panjang dari tombol "Bagikan" di Google Maps.'
              >
                <TextInput
                  value={form.locationMapsUrl}
                  onChange={(v) => set("locationMapsUrl", v)}
                  placeholder="https://maps.app.goo.gl/..."
                  prefix={<ExternalLink className="size-3.5" />}
                />
              </Field>

              <Field
                label="Tagline Lokasi"
                description="Teks kecil di bottom bar, misalnya: Kampung Inggris Pare, Kediri"
              >
                <TextInput
                  value={form.locationTagline}
                  onChange={(v) => set("locationTagline", v)}
                  placeholder="Kampung Inggris Pare, Kediri"
                />
              </Field>
            </Section>

            {/* CTA strip */}
            <Section
              icon={Globe2}
              title="CTA Strip"
              description='Baris ajakan bertindak di atas bottom bar. "Siap mulai perjalanan…"'
            >
              <Field label="Teks CTA">
                <TextInput
                  value={form.ctaText}
                  onChange={(v) => set("ctaText", v)}
                  placeholder="Siap mulai perjalanan belajar Bahasa Inggris kamu?"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label Tombol CTA">
                  <TextInput
                    value={form.ctaButtonLabel}
                    onChange={(v) => set("ctaButtonLabel", v)}
                    placeholder="Hubungi Kami"
                  />
                </Field>

                <Field
                  label="URL Tombol CTA"
                  description="Biarkan kosong untuk link WhatsApp otomatis."
                >
                  <TextInput
                    value={form.ctaButtonHref}
                    onChange={(v) => set("ctaButtonHref", v)}
                    placeholder="https://wa.me/628123…"
                  />
                </Field>
              </div>
            </Section>

            {/* Stats — collapsible */}
            <Section
              icon={TrendingUp}
              title="Stats Band"
              description="Override angka di stats band. Kosongkan untuk menggunakan nilai otomatis."
              collapsible
              defaultOpen={false}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Alumni" description="Override jumlah alumni. Default: dari DB.">
                  <TextInput
                    value={form.statAlumniOverride}
                    onChange={(v) => set("statAlumniOverride", v)}
                    placeholder="1500"
                    type="number"
                  />
                </Field>

                <Field label="Program">
                  <TextInput
                    value={form.statProgramOverride}
                    onChange={(v) => set("statProgramOverride", v)}
                    placeholder="12"
                    type="number"
                  />
                </Field>

                <Field label="Tahun Berdiri">
                  <TextInput
                    value={form.statYearsOverride}
                    onChange={(v) => set("statYearsOverride", v)}
                    placeholder="8"
                    type="number"
                  />
                </Field>

                <Field label="Rating" description="Desimal, misalnya: 4.9">
                  <TextInput
                    value={form.statRatingOverride}
                    onChange={(v) => set("statRatingOverride", v)}
                    placeholder="4.9"
                  />
                </Field>
              </div>
            </Section>

            {/* Bottom bar & nav — collapsible */}
            <Section
              icon={LayoutTemplate}
              title="Bottom Bar & Navigasi Program"
              description="Link Privasi/Ketentuan dan daftar program di kolom footer."
              collapsible
              defaultOpen={false}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label Privasi">
                  <TextInput
                    value={form.privacyLabel}
                    onChange={(v) => set("privacyLabel", v)}
                    placeholder="Privasi"
                  />
                </Field>

                <Field label="URL Privasi">
                  <TextInput
                    value={form.privacyHref}
                    onChange={(v) => set("privacyHref", v)}
                    placeholder="/privacy"
                  />
                </Field>

                <Field label="Label Ketentuan">
                  <TextInput
                    value={form.termsLabel}
                    onChange={(v) => set("termsLabel", v)}
                    placeholder="Ketentuan"
                  />
                </Field>

                <Field label="URL Ketentuan">
                  <TextInput
                    value={form.termsHref}
                    onChange={(v) => set("termsHref", v)}
                    placeholder="/terms"
                  />
                </Field>
              </div>

              <Field
                label="Program Links (JSON)"
                description='Array JSON: [{ "label": "IELTS Bootcamp", "href": "/courses/ielts" }, ...]'
              >
                <TextArea
                  value={form.programLinksRaw}
                  onChange={(v) => set("programLinksRaw", v)}
                  rows={5}
                  mono
                  placeholder={`[\n  { "label": "IELTS Bootcamp", "href": "/courses/ielts" },\n  { "label": "TOEFL Intensive", "href": "/courses/toefl" }\n]`}
                />
              </Field>
            </Section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-20 space-y-4">
              {/* Preview */}
              <FooterPreview form={form} />

              {/* Save card */}
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
                  Perubahan berlaku langsung di footer publik.
                </p>

                {/* Completeness checklist */}
                <div className="mt-4 space-y-2">
                  <p className="text-[10.5px] font-black uppercase tracking-widest text-slate-400">
                    Kelengkapan
                  </p>
                  {[
                    { label: "Tagline", ok: !!form.tagline },
                    { label: "Deskripsi", ok: !!form.description },
                    { label: "Instagram / sosial", ok: !!(form.instagramUrl || form.tiktokUrl || form.youtubeUrl) },
                    { label: "WhatsApp", ok: !!form.whatsappNumber },
                    { label: "Email", ok: !!form.email },
                    { label: "Alamat", ok: !!form.locationAddress },
                    { label: "Teks CTA", ok: !!form.ctaText },
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