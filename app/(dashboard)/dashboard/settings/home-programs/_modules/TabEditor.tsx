// app/(dashboard)/dashboard/settings/home-programs/_modules/TabEditor.tsx
//
// Editor for one tab of the Beranda "Program Kami" section.
//
// The website reads everything from the program in the system (title, short
// description, highlights, benefits, packages, prices, next batch, sign-up
// method). So the editor is built around that:
//   1. choose what the tab shows (a program / a category / its packages)
//   2. see the real data that will be used ("Data dari program")
//   3. optionally override a text — every field shows the real value as its
//      placeholder, and blank means "follow the program".
"use client";

import { useMemo } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";

import { IconPicker } from "@/components/IconPicker";
import {
  Field,
  ImageUploader,
  RepeatableList,
  TextArea,
  TextInput,
} from "@/components/cms/CmsForm";
import { cn } from "@/lib/utils";
import type {
  HomeCatalog,
  HomeCatalogProgram,
} from "@/app/modules/program/home-catalog.types";
import type {
  ShowcaseCard,
  ShowcaseTab,
} from "@/app/modules/site-content/site-content.types";
import {
  emptyShowcaseCard,
  emptyShowcaseTab,
} from "@/app/modules/site-content/program-showcase.templates";
import {
  formatDate,
  formatRupiah,
  resolveTab,
  withoutOverrides,
  type TabView,
} from "@/components/sections/home/program-showcase/resolve";

import { LinesField, SelectInput, TemplatePicker } from "./fields";

type AutoView = TabView["view"] | null;

type Props = {
  tab: ShowcaseTab;
  catalog: HomeCatalog | undefined;
  onChange: (patch: Partial<ShowcaseTab>) => void;
};

type FieldProps = Props & { auto: AutoView };

const two = "grid gap-3 sm:grid-cols-2";

function programOptions(catalog: HomeCatalog | undefined) {
  return (catalog?.programs ?? []).map((p) => ({
    value: p.slug,
    label: p.title,
  }));
}

/* ── what counts as "typed by the admin" ───────────────────── */

const OVERRIDE_KEYS: Record<ShowcaseTab["template"], (keyof ShowcaseTab)[]> = {
  feature: [
    "label", "eyebrow", "heading", "description", "kicker", "badge", "headline",
    "body", "chips", "priceLabel", "priceNotes", "price", "originalPrice",
    "ctaLabel", "ctaHref",
  ],
  spotlight: [
    "label", "eyebrow", "heading", "description", "headline", "body", "tiles",
    "ctaLabel", "ctaHref", "secondaryCtaLabel", "secondaryCtaHref",
  ],
  banner: [
    "label", "eyebrow", "heading", "description", "headline", "body", "tiles",
    "chips", "ctaLabel", "ctaHref",
  ],
  cards: ["label", "eyebrow", "heading", "description", "helpTitle", "helpItems"],
};

function isFilled(value: unknown) {
  return Array.isArray(value) ? value.length > 0 : String(value ?? "").trim() !== "";
}

function countOverrides(tab: ShowcaseTab) {
  return OVERRIDE_KEYS[tab.template].filter((k) => isFilled(tab[k])).length;
}

function resetPatch(tab: ShowcaseTab): Partial<ShowcaseTab> {
  const blank = withoutOverrides(tab);
  const patch: Partial<ShowcaseTab> = {};
  for (const key of OVERRIDE_KEYS[tab.template]) {
    (patch as Record<string, unknown>)[key] = blank[key];
  }
  return patch;
}

/* ── small pieces ──────────────────────────────────────────── */

function packageSummary(program: HomeCatalogProgram) {
  const seen = new Set<string>();
  return program.packages
    .filter((p) => {
      const key = p.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({
      title: p.title,
      price: p.price > 0 ? formatRupiah(p.price) : "Hubungi Admin",
      original:
        p.originalPrice && p.originalPrice > p.price
          ? formatRupiah(p.originalPrice)
          : null,
    }));
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[112px_1fr] sm:gap-3">
      <dt className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-[12.5px] font-medium text-slate-700">
        {children}
      </dd>
    </div>
  );
}

const Missing = ({ text }: { text: string }) => (
  <span className="font-semibold text-amber-600">{text}</span>
);

/** Read-only summary of the real data the website uses for a program. */
function ProgramDataPanel({ program }: { program: HomeCatalogProgram }) {
  const packages = packageSummary(program);
  const nextBatch = formatDate(program.nextBatchStart);

  const missing: string[] = [];
  if (!program.shortDesc) missing.push("deskripsi singkat");
  if (!program.description) missing.push("deskripsi lengkap");
  if (program.highlights.length === 0) missing.push("poin unggulan");
  if (program.benefits.length === 0) missing.push("manfaat di halaman program");

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-black uppercase tracking-wider text-emerald-700">
          Data dari program
        </p>
        <a
          href="/dashboard/programs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-indigo-600 hover:underline"
        >
          Ubah di menu Program
          <ExternalLink className="size-3" />
        </a>
      </div>

      <dl className="mt-1.5 divide-y divide-emerald-100">
        <DataRow label="Program">
          <strong>{program.title}</strong>
          <span className="text-slate-500">
            {" "}
            · {[program.categoryLabel, program.formatLabel].filter(Boolean).join(" · ")}
          </span>
        </DataRow>
        <DataRow label="Ringkasan">
          {program.shortDesc || <Missing text="Belum diisi" />}
        </DataRow>
        <DataRow label="Harga">
          {packages.length === 0 ? (
            <Missing text="Belum ada paket — tampil “Hubungi Admin”" />
          ) : (
            <ul className="space-y-0.5">
              {packages.map((p) => (
                <li key={p.title}>
                  {p.title} —{" "}
                  <strong>{p.price}</strong>
                  {p.original && (
                    <span className="text-slate-400 line-through"> {p.original}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DataRow>
        <DataRow label="Poin unggulan">
          {program.highlights.length > 0 ? (
            program.highlights.map((h) => h.text).join(" · ")
          ) : (
            <Missing text="Belum ada" />
          )}
        </DataRow>
        <DataRow label="Manfaat">
          {program.benefits.length > 0 ? (
            program.benefits
              .slice(0, 4)
              .map((b) => b.title)
              .join(" · ")
          ) : (
            <Missing text="Belum ada" />
          )}
        </DataRow>
        {nextBatch && <DataRow label="Batch berikutnya">{nextBatch}</DataRow>}
        <DataRow label="Pendaftaran">
          {program.register.label}
          {program.register.external && (
            <span className="text-slate-500"> (link luar)</span>
          )}
        </DataRow>
      </dl>

      {missing.length > 0 && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-800">
          Data program belum lengkap: {missing.join(", ")}. Lengkapi di menu
          Program agar website terisi otomatis, atau ketik teks sendiri di
          bagian “Ubah teks”.
        </p>
      )}
    </div>
  );
}

/** Cards the website will show for a category / a program's packages. */
function AutoCardsList({ view }: { view: AutoView }) {
  if (!view || view.template !== "cards") return null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
      <p className="text-[12px] font-black uppercase tracking-wider text-emerald-700">
        Kartu yang tampil di website
      </p>
      <ul className="mt-2 divide-y divide-emerald-100">
        {view.cards.map((card) => (
          <li
            key={card.key}
            className="flex items-baseline justify-between gap-3 py-1.5 text-[12.5px]"
          >
            <span className="min-w-0 font-semibold text-slate-700">
              {card.title}
              {card.eyebrow && (
                <span className="font-medium text-slate-400"> · {card.eyebrow}</span>
              )}
            </span>
            <span className="shrink-0 font-bold text-slate-800">
              {card.price.text}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11.5px] leading-snug text-slate-500">
        Program atau paket baru otomatis muncul di sini. Harga, nama, dan
        deskripsi mengikuti data program.
      </p>
    </div>
  );
}

/** Shows the real list while the admin has not typed their own. */
function AutoNote({
  items,
  onCopy,
}: {
  items: string[];
  onCopy?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2">
      <p className="text-[11px] font-bold text-emerald-700">
        Otomatis dari program
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-slate-600">
        {items.join(" · ")}
      </p>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="mt-1 text-[11.5px] font-bold text-indigo-600 hover:underline"
        >
          Salin untuk diedit
        </button>
      )}
    </div>
  );
}

function ProgramPicker({
  value,
  onChange,
  catalog,
  hint,
}: {
  value: string;
  onChange: (slug: string) => void;
  catalog: HomeCatalog | undefined;
  hint?: string;
}) {
  return (
    <Field
      label="Program"
      description="Hanya program yang sudah dipublikasikan. Teks, harga, paket, dan link pendaftaran diambil dari program ini."
      hint={hint}
    >
      <SelectInput
        value={value}
        onChange={onChange}
        placeholder="Pilih program…"
        options={programOptions(catalog)}
      />
    </Field>
  );
}

/* ── manual card editor ───────────────────────────────────── */

function CardEditor({
  card,
  update,
  catalog,
}: {
  card: ShowcaseCard;
  update: (patch: Partial<ShowcaseCard>) => void;
  catalog: HomeCatalog | undefined;
}) {
  const program = catalog?.programs.find((p) => p.slug === card.programSlug);
  const packageOptions = Array.from(
    new Map((program?.packages ?? []).map((p) => [p.title, p])).values(),
  ).map((p) => ({
    value: p.title,
    label: `${p.title} — ${p.price > 0 ? formatRupiah(p.price) : "Hubungi Admin"}`,
  }));

  // What this card shows when every text field is left blank.
  const auto = useMemo(() => {
    if (!catalog || !card.programSlug) return null;
    const view = resolveTab(
      {
        ...emptyShowcaseTab("cards"),
        cardSource: "manual",
        cards: [
          {
            ...emptyShowcaseCard(),
            programSlug: card.programSlug,
            packageTitle: card.packageTitle,
          },
        ],
      },
      catalog,
    )?.view;
    return view && view.template === "cards" ? (view.cards[0] ?? null) : null;
  }, [catalog, card.programSlug, card.packageTitle]);

  return (
    <>
      <div className={two}>
        <Field label="Program">
          <SelectInput
            value={card.programSlug}
            onChange={(v) => update({ programSlug: v, packageTitle: "" })}
            placeholder="Pilih program…"
            options={programOptions(catalog)}
          />
        </Field>
        <Field
          label="Paket (opsional)"
          hint="Pilih paket jika kartu ini mewakili satu paket, mis. Private Fleksibel."
        >
          <SelectInput
            value={card.packageTitle}
            onChange={(v) => update({ packageTitle: v })}
            placeholder="Seluruh program"
            options={packageOptions}
          />
        </Field>
      </div>

      {auto && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11.5px] leading-snug text-emerald-800">
          Otomatis: <strong>{auto.title}</strong> — {auto.price.text}
          {auto.price.original ? ` (coret ${auto.price.original})` : ""}. Isi
          kolom di bawah hanya jika ingin mengganti.
        </p>
      )}

      <div className={two}>
        <Field label="Judul kartu">
          <TextInput
            value={card.title}
            onChange={(v) => update({ title: v })}
            placeholder={auto?.title}
          />
        </Field>
        <Field label="Label kecil di atas judul">
          <TextInput
            value={card.eyebrow}
            onChange={(v) => update({ eyebrow: v })}
            placeholder={auto?.eyebrow}
          />
        </Field>
      </div>

      <div className={two}>
        <Field label="Badge (opsional)">
          <TextInput
            value={card.badge}
            onChange={(v) => update({ badge: v })}
            placeholder={auto?.badge}
          />
        </Field>
        <Field label="Info singkat di bawah harga">
          <TextInput
            value={card.meta}
            onChange={(v) => update({ meta: v })}
            placeholder={auto?.meta}
          />
        </Field>
      </div>

      <Field label="Deskripsi">
        <TextArea
          value={card.desc}
          onChange={(v) => update({ desc: v })}
          rows={2}
          placeholder={auto?.desc}
        />
      </Field>

      <Field label="Daftar fitur" hint="Satu fitur per baris. Tampil dengan tanda centang.">
        <LinesField
          value={card.features}
          onChange={(v) => update({ features: v })}
          placeholder={auto?.features.join("\n")}
        />
      </Field>

      <div className={two}>
        <Field label="Judul kelompok chip (opsional)">
          <TextInput
            value={card.chipsLabel}
            onChange={(v) => update({ chipsLabel: v })}
          />
        </Field>
        <Field label="Chip (satu per baris)">
          <LinesField
            value={card.chips}
            onChange={(v) => update({ chips: v })}
            rows={2}
            placeholder={auto?.chips.join("\n")}
          />
        </Field>
      </div>

      <div className={two}>
        <Field label="Teks tombol">
          <TextInput
            value={card.ctaLabel}
            onChange={(v) => update({ ctaLabel: v })}
            placeholder={auto?.cta.label}
          />
        </Field>
        <Field label="Link tombol" hint="Kosong = cara pendaftaran program.">
          <TextInput
            value={card.ctaHref}
            onChange={(v) => update({ ctaHref: v })}
            placeholder="https://…"
          />
        </Field>
      </div>

      <details className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <summary className="cursor-pointer text-[12px] font-bold text-slate-600">
          Ubah harga secara manual (tidak disarankan)
        </summary>
        <div className={cn(two, "mt-3")}>
          <Field label="Harga" hint="Kosong = harga live dari program / paket.">
            <TextInput
              value={card.price}
              onChange={(v) => update({ price: v })}
              placeholder={auto?.price.text}
            />
          </Field>
          <Field label="Harga coret">
            <TextInput
              value={card.originalPrice}
              onChange={(v) => update({ originalPrice: v })}
              placeholder={auto?.price.original ?? ""}
            />
          </Field>
        </div>
      </details>

      <label className="flex items-center gap-2 text-[12.5px] font-bold text-slate-700">
        <input
          type="checkbox"
          checked={card.featured}
          onChange={(e) => update({ featured: e.target.checked })}
          className="size-4 rounded border-slate-300"
        />
        Jadikan kartu utama (diberi bingkai biru & tombol biru)
      </label>
    </>
  );
}

/* ── per-template override fields ─────────────────────────── */

function FeatureFields({ tab, auto, onChange }: FieldProps) {
  const a = auto?.template === "feature" ? auto : null;
  return (
    <>
      <div className={two}>
        <Field label="Label program (kuning)">
          <TextInput
            value={tab.kicker}
            onChange={(v) => onChange({ kicker: v })}
            placeholder={a?.kicker}
          />
        </Field>
        <Field label="Badge">
          <TextInput
            value={tab.badge}
            onChange={(v) => onChange({ badge: v })}
            placeholder={a?.badge}
          />
        </Field>
      </div>
      <Field label="Kalimat utama">
        <TextInput
          value={tab.headline}
          onChange={(v) => onChange({ headline: v })}
          placeholder={a?.headline}
        />
      </Field>
      <Field label="Penjelasan">
        <TextArea
          value={tab.body}
          onChange={(v) => onChange({ body: v })}
          rows={4}
          placeholder={a?.body}
        />
      </Field>
      <Field label="Poin unggulan (maks. 4)" description="Pilih ikon lalu tulis poinnya.">
        {tab.chips.length === 0 && a && (
          <AutoNote
            items={a.chips.map((c) => c.text)}
            onCopy={() => onChange({ chips: a.chips.map((c) => ({ ...c })) })}
          />
        )}
        <RepeatableList
          items={tab.chips}
          onChange={(chips) => onChange({ chips })}
          itemLabel="Poin"
          max={4}
          makeNew={() => ({ icon: "check", text: "" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <IconPicker
                value={item.icon || undefined}
                onChange={(name) => update({ icon: name ?? "" })}
              />
              <TextInput value={item.text} onChange={(v) => update({ text: v })} />
            </div>
          )}
        />
      </Field>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
        <p className="mb-3 text-[12px] font-black uppercase tracking-wider text-slate-400">
          Kartu harga
        </p>
        <div className="grid gap-3">
          <Field label="Judul harga">
            <TextInput
              value={tab.priceLabel}
              onChange={(v) => onChange({ priceLabel: v })}
              placeholder={a?.priceLabel}
            />
          </Field>
          <Field label="Catatan di bawah harga" hint="Satu baris = satu catatan (maks. 4).">
            {tab.priceNotes.length === 0 && a && (
              <AutoNote items={a.priceNotes} />
            )}
            <LinesField
              value={tab.priceNotes}
              onChange={(v) => onChange({ priceNotes: v })}
              rows={2}
            />
          </Field>
          <div className={two}>
            <Field
              label="Harga manual"
              hint="Tidak disarankan — harga otomatis dari paket program."
            >
              <TextInput
                value={tab.price}
                onChange={(v) => onChange({ price: v })}
                placeholder={a?.price.text}
              />
            </Field>
            <Field label="Harga coret manual">
              <TextInput
                value={tab.originalPrice}
                onChange={(v) => onChange({ originalPrice: v })}
                placeholder={a?.price.original ?? ""}
              />
            </Field>
          </div>
          <div className={two}>
            <Field label="Teks tombol">
              <TextInput
                value={tab.ctaLabel}
                onChange={(v) => onChange({ ctaLabel: v })}
                placeholder={a?.cta.label}
              />
            </Field>
            <Field label="Link tombol" hint="Kosong = cara pendaftaran program (form / WhatsApp / link).">
              <TextInput
                value={tab.ctaHref}
                onChange={(v) => onChange({ ctaHref: v })}
                placeholder="https://…"
              />
            </Field>
          </div>
        </div>
      </div>
    </>
  );
}

function SpotlightFields({ tab, auto, onChange }: FieldProps) {
  const a = auto?.template === "spotlight" ? auto : null;
  return (
    <>
      <Field label="Kalimat utama">
        <TextInput
          value={tab.headline}
          onChange={(v) => onChange({ headline: v })}
          placeholder={a?.headline}
        />
      </Field>
      <Field label="Penjelasan">
        <TextArea
          value={tab.body}
          onChange={(v) => onChange({ body: v })}
          rows={3}
          placeholder={a?.body}
        />
      </Field>
      <Field label="Keunggulan (maks. 3)">
        {tab.tiles.length === 0 && a && (
          <AutoNote
            items={a.tiles.map((t) => t.title)}
            onCopy={() => onChange({ tiles: a.tiles.map((t) => ({ ...t })) })}
          />
        )}
        <RepeatableList
          items={tab.tiles}
          onChange={(tiles) => onChange({ tiles })}
          itemLabel="Keunggulan"
          max={3}
          makeNew={() => ({ title: "", desc: "" })}
          renderItem={(item, update) => (
            <div className={two}>
              <TextInput
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder="Judul"
              />
              <TextInput
                value={item.desc}
                onChange={(v) => update({ desc: v })}
                placeholder="Keterangan singkat"
              />
            </div>
          )}
        />
      </Field>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
        <Field
          label="Foto"
          description="Foto tidak ada di data program, jadi diunggah di sini."
          hint="Disarankan landscape. Tanpa foto, tampil kotak placeholder abu-abu."
        >
          <ImageUploader value={tab.image} onChange={(url) => onChange({ image: url })} />
        </Field>
      </div>
      <div className={two}>
        <Field label="Tombol utama — teks">
          <TextInput
            value={tab.ctaLabel}
            onChange={(v) => onChange({ ctaLabel: v })}
            placeholder={a?.cta?.label}
          />
        </Field>
        <Field label="Tombol utama — link" hint="Kosong = halaman detail program.">
          <TextInput
            value={tab.ctaHref}
            onChange={(v) => onChange({ ctaHref: v })}
          />
        </Field>
        <Field label="Tombol kedua — teks" hint="Kosong = tombol kedua disembunyikan.">
          <TextInput
            value={tab.secondaryCtaLabel}
            onChange={(v) => onChange({ secondaryCtaLabel: v })}
            placeholder="Tanya Admin"
          />
        </Field>
        <Field label="Tombol kedua — link" hint="Kosong = buka WhatsApp admin.">
          <TextInput
            value={tab.secondaryCtaHref}
            onChange={(v) => onChange({ secondaryCtaHref: v })}
          />
        </Field>
      </div>
    </>
  );
}

function BannerFields({ tab, auto, onChange }: FieldProps) {
  const a = auto?.template === "banner" ? auto : null;
  return (
    <>
      <Field label="Kalimat utama (kuning)">
        <TextInput
          value={tab.headline}
          onChange={(v) => onChange({ headline: v })}
          placeholder={a?.headline}
        />
      </Field>
      <Field label="Penjelasan">
        <TextArea
          value={tab.body}
          onChange={(v) => onChange({ body: v })}
          rows={3}
          placeholder={a?.body}
        />
      </Field>
      <Field label="Layanan (maks. 4)">
        {tab.tiles.length === 0 && a && (
          <AutoNote
            items={a.tiles.map((t) => t.title)}
            onCopy={() => onChange({ tiles: a.tiles.map((t) => ({ ...t })) })}
          />
        )}
        <RepeatableList
          items={tab.tiles}
          onChange={(tiles) => onChange({ tiles })}
          itemLabel="Layanan"
          max={4}
          makeNew={() => ({ title: "", desc: "" })}
          renderItem={(item, update) => (
            <div className={two}>
              <TextInput
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder="Judul"
              />
              <TextInput
                value={item.desc}
                onChange={(v) => update({ desc: v })}
                placeholder="Keterangan singkat"
              />
            </div>
          )}
        />
      </Field>
      <Field label="Keunggulan (satu per baris)" hint="Tampil sebagai label bulat di bawah layanan.">
        <LinesField
          value={tab.chips.map((c) => c.text)}
          onChange={(lines) =>
            onChange({ chips: lines.map((text) => ({ icon: "", text })) })
          }
          rows={4}
          placeholder={a?.chips.map((c) => c.text).join("\n")}
        />
      </Field>
      <div className={two}>
        <Field label="Teks tombol">
          <TextInput
            value={tab.ctaLabel}
            onChange={(v) => onChange({ ctaLabel: v })}
            placeholder={a?.cta?.label}
          />
        </Field>
        <Field label="Link tombol" hint="Kosong = buka WhatsApp admin.">
          <TextInput
            value={tab.ctaHref}
            onChange={(v) => onChange({ ctaHref: v })}
          />
        </Field>
      </div>
    </>
  );
}

function CardsHelp({ tab, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
      <p className="mb-3 text-[12px] font-black uppercase tracking-wider text-slate-400">
        Panduan memilih (opsional)
      </p>
      <div className="grid gap-3">
        <Field label="Judul">
          <TextInput
            value={tab.helpTitle}
            onChange={(v) => onChange({ helpTitle: v })}
            placeholder="Bingung memilih?"
          />
        </Field>
        <RepeatableList
          items={tab.helpItems}
          onChange={(helpItems) => onChange({ helpItems })}
          itemLabel="Penjelasan"
          max={6}
          makeNew={() => ({ label: "", text: "" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <TextInput
                value={item.label}
                onChange={(v) => update({ label: v })}
                placeholder="Label"
              />
              <TextInput
                value={item.text}
                onChange={(v) => update({ text: v })}
                placeholder="Penjelasan singkat"
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── data source (what the tab shows) ─────────────────────── */

function CardsSource({ tab, catalog, onChange }: Props) {
  const categoryOptions = (catalog?.categories ?? []).map((c) => ({
    value: c.slug,
    label: c.label,
  }));

  const sources: { value: ShowcaseTab["cardSource"]; title: string; desc: string }[] = [
    { value: "category", title: "Satu kategori", desc: "Semua program di kategori tampil sebagai kartu." },
    { value: "program", title: "Paket sebuah program", desc: "Setiap paket program tampil sebagai kartu." },
    { value: "manual", title: "Pilih sendiri", desc: "Pilih program / paket satu per satu." },
  ];

  return (
    <>
      <Field label="Kartu berisi">
        <div className="grid gap-2 sm:grid-cols-3">
          {sources.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ cardSource: s.value })}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                tab.cardSource === s.value
                  ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                  : "border-slate-200 bg-white/70 hover:bg-white",
              )}
            >
              <p className="text-[12.5px] font-black text-slate-800">{s.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{s.desc}</p>
            </button>
          ))}
        </div>
      </Field>

      {tab.cardSource === "category" && (
        <Field
          label="Kategori"
          hint="Program baru di kategori ini otomatis muncul. Program yang dijual dalam beberapa paket tampil satu kartu per paket."
        >
          <SelectInput
            value={tab.categorySlug}
            onChange={(v) => onChange({ categorySlug: v })}
            placeholder="Pilih kategori…"
            options={categoryOptions}
          />
        </Field>
      )}

      {tab.cardSource === "program" && (
        <ProgramPicker
          value={tab.programSlug}
          onChange={(v) => onChange({ programSlug: v })}
          catalog={catalog}
          hint="Paket baru di program ini otomatis muncul."
        />
      )}

      {tab.cardSource === "manual" && (
        <Field label="Kartu (maks. 8)">
          <RepeatableList<ShowcaseCard>
            items={tab.cards}
            onChange={(cards) => onChange({ cards })}
            itemLabel="Kartu"
            max={8}
            makeNew={emptyShowcaseCard}
            renderItem={(card, update) => (
              <CardEditor card={card} update={update} catalog={catalog} />
            )}
          />
        </Field>
      )}
    </>
  );
}

/* ── overrides wrapper ────────────────────────────────────── */

function OverridesPanel({
  count,
  onReset,
  children,
}: {
  count: number;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <details
      open={count > 0}
      className="group rounded-2xl border border-slate-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
        <span className="min-w-0">
          <span className="block text-[12.5px] font-black text-slate-800">
            Ubah teks (opsional)
          </span>
          <span className="block text-[11.5px] leading-snug text-slate-500">
            Semua teks sudah terisi otomatis dari program. Isi kolom hanya jika
            ingin menggantinya.
          </span>
        </span>
        {count > 0 && (
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
            {count} diubah
          </span>
        )}
      </summary>

      <div className="grid gap-4 border-t border-slate-100 p-3.5">
        {count > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 justify-self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="size-3.5" />
            Kembalikan semua ke data program
          </button>
        )}
        {children}
      </div>
    </details>
  );
}

/* ── main ─────────────────────────────────────────────────── */

export function TabEditor(props: Props) {
  const { tab, catalog, onChange } = props;

  // The tab exactly as the website shows it with every override removed.
  const auto = useMemo<AutoView>(
    () => (catalog ? (resolveTab(withoutOverrides(tab), catalog)?.view ?? null) : null),
    [tab, catalog],
  );
  const autoLabel = useMemo(
    () => (catalog ? (resolveTab(withoutOverrides(tab), catalog)?.label ?? "") : ""),
    [tab, catalog],
  );

  const program = catalog?.programs.find((p) => p.slug === tab.programSlug);
  const overrides = countOverrides(tab);
  const fieldProps: FieldProps = { ...props, auto };

  const sourceHint: Partial<Record<ShowcaseTab["template"], string>> = {
    spotlight: "Tanggal batch berikutnya dan harga “Mulai dari” tampil otomatis jika ada.",
    banner: "Banner tidak menampilkan harga; program dipakai untuk mengisi teksnya.",
  };

  return (
    <div className="grid gap-4">
      <Field
        label="Tampilan"
        description="Ganti tampilan kapan saja — isian yang cocok tetap tersimpan."
      >
        <TemplatePicker
          compact
          value={tab.template}
          onChange={(template) => onChange({ template })}
        />
      </Field>

      {/* 1 · what the tab shows */}
      <div className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5">
        <p className="text-[12px] font-black uppercase tracking-wider text-indigo-500">
          1 · Pilih data
        </p>
        {tab.template === "cards" ? (
          <CardsSource {...props} />
        ) : (
          <ProgramPicker
            value={tab.programSlug}
            onChange={(v) => onChange({ programSlug: v })}
            catalog={catalog}
            hint={sourceHint[tab.template]}
          />
        )}
      </div>

      {/* 2 · the real data behind it */}
      {tab.template === "cards" ? (
        <>
          <AutoCardsList view={auto} />
          {tab.cardSource === "program" && program && (
            <ProgramDataPanel program={program} />
          )}
        </>
      ) : (
        program && <ProgramDataPanel program={program} />
      )}

      {/* 3 · optional text overrides */}
      <OverridesPanel
        count={overrides}
        onReset={() => onChange(resetPatch(tab))}
      >
        <div className={two}>
          <Field label="Label kecil di atas judul">
            <TextInput
              value={tab.eyebrow}
              onChange={(v) => onChange({ eyebrow: v })}
              placeholder={auto?.eyebrow}
            />
          </Field>
        </div>

        <Field label="Judul grup">
          <TextInput
            value={tab.heading}
            onChange={(v) => onChange({ heading: v })}
            placeholder={auto?.heading}
          />
        </Field>

        {tab.template === "cards" && (
          <Field label="Deskripsi grup">
            <TextArea
              value={tab.description}
              onChange={(v) => onChange({ description: v })}
              rows={2}
              placeholder={auto?.description}
            />
          </Field>
        )}

        {tab.template === "feature" && <FeatureFields {...fieldProps} />}
        {tab.template === "spotlight" && <SpotlightFields {...fieldProps} />}
        {tab.template === "banner" && <BannerFields {...fieldProps} />}
        {tab.template === "cards" && <CardsHelp {...props} />}
      </OverridesPanel>
    </div>
  );
}
