// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/field-schema.ts
//
// Declarative description of every editable section's content shape.
// A single recursive renderer (Fields.tsx) consumes these descriptors, so adding
// or removing a field is a one-line change here instead of touching form code.
//
// Shapes mirror app/[categorySlug]/data.ts (ProgramSection union).

/* ─────────────────────────────────────────────────────────────
   FIELD DESCRIPTOR TYPES
───────────────────────────────────────────────────────────── */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "switch"
  | "icon"
  | "image"
  | "select"
  | "object"
  | "array"
  | "stringArray";

interface FieldBase {
  /** key inside the value object */
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  /** show this field at half width on >=sm screens */
  half?: boolean;
}

export interface SimpleField extends FieldBase {
  type: "text" | "textarea" | "number" | "switch" | "icon" | "image";
}

export interface SelectField extends FieldBase {
  type: "select";
  options: { value: string; label: string }[];
}

export interface ObjectField extends FieldBase {
  type: "object";
  fields: Field[];
}

export interface ArrayField extends FieldBase {
  type: "array";
  /** singular noun shown on item header + Add button, e.g. "Item", "Paket" */
  itemNoun: string;
  /** which sub-field's value to echo in the collapsed item header */
  titleKey?: string;
  fields: Field[];
}

export interface StringArrayField extends FieldBase {
  type: "stringArray";
  itemNoun: string;
}

export type Field =
  | SimpleField
  | SelectField
  | ObjectField
  | ArrayField
  | StringArrayField;

/* ─────────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────────── */

export interface SectionDef {
  /**
   * Most sections store `content` as an object → use `fields`.
   * FAQ stores `content` as a bare array → use `rootArray` instead.
   */
  fields?: Field[];
  rootArray?: ArrayField;
}

/* ─────────────────────────────────────────────────────────────
   REUSABLE FIELD GROUPS
───────────────────────────────────────────────────────────── */

const taglineFields: Field[] = [
  { name: "tagline", label: "Tagline", type: "text", half: true, placeholder: "Kalimat pembuka" },
  {
    name: "taglineAccent",
    label: "Tagline Accent",
    type: "text",
    half: true,
    placeholder: "Bagian yang ditekankan",
  },
];

const headingFields: Field[] = [
  { name: "title", label: "Judul", type: "text", placeholder: "Judul section" },
  { name: "subtitle", label: "Subjudul", type: "textarea", placeholder: "Deskripsi singkat (opsional)" },
  ...taglineFields,
  { name: "icon", label: "Icon", type: "icon", half: true },
];

const benefitItem: Field[] = [
  { name: "title", label: "Judul", type: "text", placeholder: "Judul benefit" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Penjelasan (opsional)" },
  { name: "icon", label: "Icon", type: "icon" },
];

const stepItem: Field[] = [
  { name: "n", label: "Nomor", type: "text", half: true, placeholder: "01" },
  { name: "icon", label: "Icon", type: "icon", half: true },
  { name: "title", label: "Judul", type: "text" },
  { name: "description", label: "Deskripsi", type: "textarea" },
];

const labelValueItem: Field[] = [
  { name: "label", label: "Label", type: "text", half: true },
  { name: "value", label: "Value", type: "text", half: true },
];

const conclusionField: ObjectField = {
  name: "conclusion",
  label: "Kesimpulan (opsional)",
  type: "object",
  fields: taglineFields,
};

/* ─────────────────────────────────────────────────────────────
   SECTION DEFINITIONS  (keyed by section `type`)
───────────────────────────────────────────────────────────── */

export const SECTION_DEFS: Record<string, SectionDef> = {
  /* ── HERO ───────────────────────────────────────────────── */
  hero: {
    fields: [
      { name: "label", label: "Label", type: "text", placeholder: "Badge kecil di atas judul" },
      ...taglineFields,
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "highlight", label: "Highlight", type: "text" },
      { name: "image", label: "Gambar Hero", type: "image", hint: "URL gambar / path publik" },
      {
        name: "tags",
        label: "Tags",
        type: "array",
        itemNoun: "Tag",
        titleKey: "title",
        fields: [
          { name: "title", label: "Teks", type: "text", half: true },
          { name: "icon", label: "Icon", type: "icon", half: true },
        ],
      },
      {
        name: "cta",
        label: "Tombol CTA",
        type: "array",
        itemNoun: "Tombol",
        titleKey: "label",
        fields: [
          { name: "label", label: "Teks tombol", type: "text" },
          { name: "href", label: "Link", type: "text" },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
      {
        name: "socialProof",
        label: "Social Proof (opsional)",
        type: "object",
        fields: [
          { name: "text", label: "Teks", type: "text" },
          { name: "count", label: "Angka", type: "text", half: true, placeholder: "500+" },
        ],
      },
    ],
  },

  /* ── WHY / PROBLEM ──────────────────────────────────────── */
  why: {
    fields: [
      ...headingFields,
      {
        name: "items",
        label: "Poin",
        type: "array",
        itemNoun: "Poin",
        titleKey: "title",
        fields: benefitItem,
      },
      conclusionField,
    ],
  },

  /* ── BENEFITS (also used by "fit" / "solution" / "impact") ── */
  benefits: {
    fields: [
      ...headingFields,
      {
        name: "items",
        label: "Benefit",
        type: "array",
        itemNoun: "Benefit",
        titleKey: "title",
        fields: benefitItem,
      },
      {
        name: "images",
        label: "Gambar Pendukung (opsional)",
        type: "array",
        itemNoun: "Gambar",
        titleKey: "caption",
        fields: [
          { name: "src", label: "Gambar", type: "image" },
          { name: "caption", label: "Caption", type: "text", half: true },
          { name: "tag", label: "Tag", type: "text", half: true },
          { name: "highlight", label: "Highlight", type: "switch" },
        ],
      },
      conclusionField,
    ],
  },

  /* ── STEPS ──────────────────────────────────────────────── */
  steps: {
    fields: [
      ...headingFields,
      {
        name: "items",
        label: "Langkah",
        type: "array",
        itemNoun: "Langkah",
        titleKey: "title",
        fields: stepItem,
      },
    ],
  },

  /* ── TIMELINE ───────────────────────────────────────────── */
  timeline: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "subtitle", label: "Subjudul", type: "textarea" },
      ...taglineFields,
      { name: "icon", label: "Icon", type: "icon", half: true },
      {
        name: "meta",
        label: "Meta / Highlight Cards",
        type: "array",
        itemNoun: "Meta",
        titleKey: "title",
        fields: [
          { name: "title", label: "Judul", type: "text" },
          { name: "description", label: "Deskripsi", type: "textarea" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "image", label: "Gambar (opsional)", type: "image", half: true },
        ],
      },
      {
        name: "weeks",
        label: "Minggu / Blok",
        type: "array",
        itemNoun: "Blok",
        titleKey: "week",
        fields: [
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "week", label: "Label minggu", type: "text", half: true, placeholder: "Minggu 1" },
          { name: "title", label: "Judul", type: "text" },
          {
            name: "points",
            label: "Poin",
            type: "stringArray",
            itemNoun: "Poin",
          },
          {
            name: "days",
            label: "Jadwal Harian (opsional)",
            type: "array",
            itemNoun: "Jadwal",
            titleKey: "title",
            fields: [
              { name: "startTime", label: "Mulai", type: "text", half: true, placeholder: "08:00" },
              { name: "endTime", label: "Selesai", type: "text", half: true, placeholder: "09:00" },
              { name: "title", label: "Kegiatan", type: "text" },
              { name: "highlight", label: "Highlight", type: "switch" },
            ],
          },
        ],
      },
    ],
  },

  /* ── GALLERY ────────────────────────────────────────────── */
  gallery: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "subtitle", label: "Subjudul", type: "textarea" },
      ...taglineFields,
      { name: "icon", label: "Icon", type: "icon", half: true },
      {
        name: "photos",
        label: "Foto",
        type: "array",
        itemNoun: "Foto",
        titleKey: "caption",
        fields: [
          { name: "src", label: "Gambar", type: "image" },
          { name: "caption", label: "Caption", type: "text" },
          { name: "tag", label: "Tag", type: "text", half: true },
          { name: "highlight", label: "Highlight", type: "switch", half: true },
        ],
      },
      {
        name: "trustSignals",
        label: "Trust Signals",
        type: "stringArray",
        itemNoun: "Signal",
      },
    ],
  },

  /* ── CLASSES ────────────────────────────────────────────── */
  classes: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "subtitle", label: "Subjudul", type: "textarea" },
      ...taglineFields,
      {
        name: "layout",
        label: "Layout",
        type: "select",
        half: true,
        options: [
          { value: "grid", label: "Grid" },
          { value: "timeline", label: "Timeline" },
          { value: "card", label: "Card" },
        ],
      },
      {
        name: "info",
        label: "Info Umum",
        type: "array",
        itemNoun: "Info",
        titleKey: "label",
        fields: labelValueItem,
      },
      {
        name: "items",
        label: "Kelas",
        type: "array",
        itemNoun: "Kelas",
        titleKey: "title",
        fields: [
          { name: "title", label: "Judul", type: "text" },
          { name: "duration", label: "Durasi", type: "text", half: true },
          { name: "tag", label: "Tag", type: "text", half: true },
          { name: "description", label: "Deskripsi", type: "textarea" },
          { name: "highlight", label: "Highlight", type: "text" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "schedules", label: "Jadwal", type: "stringArray", itemNoun: "Jadwal" },
          {
            name: "meta",
            label: "Meta",
            type: "array",
            itemNoun: "Meta",
            titleKey: "label",
            fields: labelValueItem,
          },
        ],
      },
    ],
  },

  /* ── FACILITIES ─────────────────────────────────────────── */
  facilities: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "subtitle", label: "Subjudul", type: "textarea" },
      ...taglineFields,
      {
        name: "items",
        label: "Fasilitas",
        type: "array",
        itemNoun: "Fasilitas",
        titleKey: "title",
        fields: benefitItem,
      },
      {
        name: "visuals",
        label: "Visual",
        type: "array",
        itemNoun: "Visual",
        titleKey: "caption",
        fields: [
          {
            name: "type",
            label: "Tipe",
            type: "select",
            half: true,
            options: [
              { value: "image", label: "Gambar" },
              { value: "icon", label: "Icon" },
            ],
          },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "src", label: "Gambar", type: "image" },
          { name: "alt", label: "Alt text", type: "text", half: true },
          { name: "caption", label: "Caption", type: "text", half: true },
          { name: "tag", label: "Tag", type: "text", half: true },
        ],
      },
    ],
  },

  /* ── MENTORSHIP ─────────────────────────────────────────── */
  mentorship: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "subtitle", label: "Subjudul", type: "textarea" },
      ...taglineFields,
      { name: "highlight", label: "Highlight", type: "text" },
      {
        name: "items",
        label: "Poin Mentorship",
        type: "array",
        itemNoun: "Poin",
        titleKey: "title",
        fields: benefitItem,
      },
      {
        name: "visuals",
        label: "Visual",
        type: "array",
        itemNoun: "Visual",
        titleKey: "caption",
        fields: [
          {
            name: "type",
            label: "Tipe",
            type: "select",
            half: true,
            options: [
              { value: "image", label: "Gambar" },
              { value: "icon", label: "Icon" },
            ],
          },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "src", label: "Gambar", type: "image" },
          { name: "alt", label: "Alt text", type: "text", half: true },
          { name: "caption", label: "Caption", type: "text", half: true },
        ],
      },
    ],
  },

  /* ── PRICING ────────────────────────────────────────────── */
  pricing: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "globalNote", label: "Catatan Global", type: "textarea" },
      {
        name: "groups",
        label: "Grup Paket",
        type: "array",
        itemNoun: "Grup",
        titleKey: "title",
        fields: [
          { name: "title", label: "Nama grup", type: "text", half: true },
          { name: "subtitle", label: "Subjudul", type: "text", half: true },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "features", label: "Fitur", type: "stringArray", itemNoun: "Fitur" },
          {
            name: "packages",
            label: "Paket",
            type: "array",
            itemNoun: "Paket",
            titleKey: "label",
            fields: [
              { name: "label", label: "Nama paket", type: "text" },
              { name: "price", label: "Harga", type: "text", half: true, placeholder: "Rp 499.000" },
              { name: "originalPrice", label: "Harga coret", type: "text", half: true },
              { name: "highlight", label: "Highlight", type: "text", half: true, placeholder: "Paling Populer" },
              { name: "note", label: "Catatan", type: "text" },
            ],
          },
        ],
      },
      { name: "bonusTitle", label: "Judul Bonus", type: "text", half: true },
      { name: "bonusNote", label: "Catatan Bonus", type: "text", half: true },
      {
        name: "bonus",
        label: "Bonus",
        type: "array",
        itemNoun: "Bonus",
        titleKey: "title",
        fields: [
          { name: "title", label: "Judul", type: "text" },
          { name: "highlight", label: "Highlight", type: "text", half: true },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "description", label: "Deskripsi", type: "textarea" },
        ],
      },
      { name: "urgency", label: "Urgency", type: "text" },
    ],
  },

  /* ── BONUS (standalone) ─────────────────────────────────── */
  bonus: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      {
        name: "items",
        label: "Bonus",
        type: "array",
        itemNoun: "Bonus",
        titleKey: "title",
        fields: [
          { name: "title", label: "Judul", type: "text" },
          { name: "highlight", label: "Highlight", type: "text", half: true },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "description", label: "Deskripsi", type: "textarea" },
        ],
      },
    ],
  },

  /* ── TESTIMONIALS ───────────────────────────────────────── */
  testimonials: {
    fields: [
      { name: "title", label: "Judul", type: "text" },
      {
        name: "items",
        label: "Testimoni",
        type: "array",
        itemNoun: "Testimoni",
        titleKey: "name",
        fields: [
          { name: "quote", label: "Quote", type: "textarea" },
          { name: "name", label: "Nama", type: "text", half: true },
          { name: "role", label: "Role", type: "text", half: true },
          { name: "meta", label: "Meta", type: "text" },
        ],
      },
    ],
  },

  /* ── FAQ (content is a bare array) ──────────────────────── */
  faq: {
    rootArray: {
      name: "content",
      label: "Pertanyaan",
      type: "array",
      itemNoun: "Pertanyaan",
      titleKey: "q",
      fields: [
        { name: "q", label: "Pertanyaan", type: "text" },
        { name: "a", label: "Jawaban", type: "textarea" },
      ],
    },
  },

  /* ── CTA ────────────────────────────────────────────────── */
  cta: {
    fields: [
      { name: "title", label: "Judul", type: "text", half: true },
      { name: "titleAccent", label: "Judul Accent", type: "text", half: true },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "highlight", label: "Highlight", type: "text" },
      {
        name: "cta",
        label: "Tombol",
        type: "object",
        fields: [
          { name: "label", label: "Teks tombol", type: "text" },
          { name: "href", label: "Link", type: "text" },
          { name: "note", label: "Catatan kecil", type: "text" },
        ],
      },
      { name: "urgency", label: "Urgency", type: "text" },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   DEFAULT VALUE BUILDERS
───────────────────────────────────────────────────────────── */

export function defaultForField(field: Field): unknown {
  switch (field.type) {
    case "switch":
      return false;
    case "number":
      return undefined;
    case "array":
    case "stringArray":
      return [];
    case "object":
      return defaultForFields(field.fields);
    default:
      return "";
  }
}

export function defaultForFields(fields: Field[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) obj[f.name] = defaultForField(f);
  return obj;
}