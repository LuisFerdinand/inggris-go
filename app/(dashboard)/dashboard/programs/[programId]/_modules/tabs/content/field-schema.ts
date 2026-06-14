// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/field-schema.ts
//
// Declarative description of every editable section's content shape.
// A single recursive renderer (Fields.tsx) consumes these descriptors, so adding
// or removing a field is a one-line change here instead of touching form code.
//
// Shapes mirror app/[categorySlug]/data.ts (ProgramSection union) and the
// public renderer components (HeroSection, WhySection, BenefitsSection,
// StepsSection, TimelineSection, GallerySection, ClassesSection,
// FacilitiesSection, MentorshipSection, PricingSection, BonusSection,
// TestimonialsSection, FAQSection, CTASection, BatchesSection).
//
// Each section below has hand-tuned labels, hints, and placeholders so the
// editor "speaks" the language of that section instead of generic copy.

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
  {
    name: "tagline",
    label: "Judul (bagian normal)",
    type: "text",
    half: true,
    placeholder: "Contoh: Belajar coding dari",
    hint: "Bagian judul yang ditulis warna biasa.",
  },
  {
    name: "taglineAccent",
    label: "Judul (bagian ditekankan)",
    type: "text",
    half: true,
    placeholder: "Contoh: nol sampai mahir",
    hint: "Disambung setelah teks di atas dan diberi warna tema.",
  },
];

const conclusionField: ObjectField = {
  name: "conclusion",
  label: "Kesimpulan (opsional)",
  type: "object",
  hint: "Kalimat penutup yang tampil di bawah daftar poin.",
  fields: [
    {
      name: "tagline",
      label: "Kalimat penutup",
      type: "textarea",
      placeholder: "Contoh: Semua masalah ini akan kamu selesaikan satu per satu.",
    },
    {
      name: "taglineAccent",
      label: "Kata yang ditebalkan",
      type: "text",
      half: true,
      placeholder: "Contoh: satu per satu",
      hint: "Kata/frasa di awal kalimat yang ditampilkan tebal.",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────
   SECTION DEFINITIONS  (keyed by section `type`)
───────────────────────────────────────────────────────────── */

export const SECTION_DEFS: Record<string, SectionDef> = {
  /* ── HERO ───────────────────────────────────────────────────
     Big opening section. Tagline/accent = main H1. Tags = small
     badge grid on the left. CTA = up to 2 buttons. SocialProof =
     small "500+ peserta" style note.
  ──────────────────────────────────────────────────────────── */
  hero: {
    fields: [
      {
        name: "label",
        label: "Badge Kecil",
        type: "text",
        placeholder: "Contoh: Program Unggulan",
        hint: "Pil kecil di atas judul utama.",
      },
      ...taglineFields,
      {
        name: "description",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Jelaskan program ini dalam 1-2 kalimat menarik.",
        hint: "Tampil di bawah judul utama. Jika diisi, Subtitle tidak ditampilkan.",
      },
      {
        name: "subtitle",
        label: "Subtitle (cadangan)",
        type: "textarea",
        placeholder: "Hanya tampil jika Deskripsi Singkat kosong.",
      },
      {
        name: "highlight",
        label: "Highlight",
        type: "text",
        hint: "Teks penekanan tambahan (jarang dipakai pada tampilan saat ini).",
      },
      {
        name: "image",
        label: "Gambar Hero",
        type: "image",
        hint: "Foto besar di sisi kanan (desktop). Rasio landscape disarankan.",
      },
      {
        name: "tags",
        label: "Badge Singkat (grid kecil)",
        type: "array",
        itemNoun: "Badge",
        titleKey: "title",
        hint: "Maks. 6 kotak kecil ditampilkan, cocok untuk poin singkat seperti 'Sertifikat', 'Online', dll.",
        fields: [
          { name: "title", label: "Teks badge", type: "text", half: true, placeholder: "Contoh: Sertifikat Resmi" },
          { name: "icon", label: "Icon (opsional)", type: "icon", half: true },
        ],
      },
      {
        name: "cta",
        label: "Tombol Aksi",
        type: "array",
        itemNoun: "Tombol",
        titleKey: "label",
        hint: "Maks. 2 tombol ditampilkan. Tombol pertama jadi tombol utama (solid).",
        fields: [
          { name: "label", label: "Teks tombol", type: "text", placeholder: "Daftar Sekarang" },
          { name: "href", label: "Link tujuan", type: "text", placeholder: "/daftar atau #pricing" },
          { name: "icon", label: "Icon (opsional)", type: "icon" },
        ],
      },
      {
        name: "socialProof",
        label: "Social Proof (opsional)",
        type: "object",
        hint: "Catatan kecil seperti '500+ peserta sudah bergabung'.",
        fields: [
          { name: "text", label: "Teks", type: "text", placeholder: "peserta sudah bergabung" },
          { name: "count", label: "Angka", type: "text", half: true, placeholder: "500+" },
        ],
      },
    ],
  },

  /* ── WHY / PROBLEM ──────────────────────────────────────────
     "Masalah yang sering terjadi" section. Title = small pill
     label, tagline/accent = big heading, items = problem cards
     with icon + title + description.
  ──────────────────────────────────────────────────────────── */
  why: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Kenapa program ini penting?",
        hint: "Teks pendek di dalam pill kecil di atas judul.",
      },
      ...taglineFields,
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan konteks masalah secara singkat.",
      },
      {
        name: "icon",
        label: "Icon Pill",
        type: "icon",
        half: true,
        hint: "Icon kecil di sebelah label pill.",
      },
      {
        name: "items",
        label: "Daftar Masalah",
        type: "array",
        itemNoun: "Masalah",
        titleKey: "title",
        hint: "Setiap kartu menampilkan icon, judul masalah, dan penjelasan singkat.",
        fields: [
          { name: "title", label: "Judul masalah", type: "text", placeholder: "Contoh: Bingung mulai dari mana" },
          { name: "description", label: "Penjelasan", type: "textarea", placeholder: "Jelaskan masalah ini secara singkat (opsional)" },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
      conclusionField,
    ],
  },

  /* ── BENEFITS ───────────────────────────────────────────────
     "Yang akan kamu dapatkan" section. If `images` is filled,
     renderer switches to a 2-column layout with a photo collage
     on one side.
  ──────────────────────────────────────────────────────────── */
  benefits: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Benefit Program",
      },
      ...taglineFields,
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, ringkasan benefit secara umum.",
      },
      {
        name: "icon",
        label: "Icon Pill",
        type: "icon",
        half: true,
      },
      {
        name: "items",
        label: "Daftar Benefit",
        type: "array",
        itemNoun: "Benefit",
        titleKey: "title",
        hint: "Tiap kartu = 1 benefit dengan icon, judul, dan deskripsi singkat.",
        fields: [
          { name: "title", label: "Judul benefit", type: "text", placeholder: "Contoh: Belajar Langsung dari Praktisi" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Penjelasan singkat (opsional)" },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
      {
        name: "images",
        label: "Galeri Foto (opsional)",
        type: "array",
        itemNoun: "Foto",
        titleKey: "caption",
        hint: "Jika diisi, section akan tampil dengan layout 2 kolom (foto di samping daftar benefit). Maks. ~4-5 foto disarankan.",
        fields: [
          { name: "src", label: "Gambar", type: "image" },
          { name: "caption", label: "Caption", type: "text", half: true, placeholder: "Deskripsi singkat foto" },
          { name: "tag", label: "Tag kecil", type: "text", half: true, placeholder: "Contoh: Sesi Live" },
          { name: "highlight", label: "Jadikan foto utama", type: "switch" },
        ],
      },
      conclusionField,
    ],
  },

  /* ── STEPS ──────────────────────────────────────────────────
     "Cara mulai dalam N langkah". `n` is the big number badge
     shown per step (e.g. "01"); falls back to index if empty.
  ──────────────────────────────────────────────────────────── */
  steps: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Cara Kerja Program",
      },
      ...taglineFields,
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan alur secara umum.",
      },
      {
        name: "icon",
        label: "Icon Pill",
        type: "icon",
        half: true,
      },
      {
        name: "items",
        label: "Daftar Langkah",
        type: "array",
        itemNoun: "Langkah",
        titleKey: "title",
        hint: "Urutan di sini menentukan urutan tampil. Nomor akan otomatis 01, 02, ... jika kolom Nomor dikosongkan.",
        fields: [
          { name: "n", label: "Nomor (opsional)", type: "text", half: true, placeholder: "01" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "title", label: "Judul langkah", type: "text", placeholder: "Contoh: Daftar & Pilih Kelas" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Jelaskan apa yang dilakukan di langkah ini." },
        ],
      },
    ],
  },

  /* ── TIMELINE ───────────────────────────────────────────────
     Weekly/blocked schedule. `meta` = highlight cards above the
     timeline (e.g. "Total Durasi: 8 Minggu"). `weeks` = the main
     timeline blocks, each optionally with a daily schedule.
  ──────────────────────────────────────────────────────────── */
  timeline: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Timeline Program",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, ringkasan jadwal secara umum.",
      },
      ...taglineFields,
      {
        name: "icon",
        label: "Icon Pill",
        type: "icon",
        half: true,
        placeholder: "calendar",
      },
      {
        name: "meta",
        label: "Kartu Highlight (opsional)",
        type: "array",
        itemNoun: "Kartu",
        titleKey: "title",
        hint: "Kartu ringkasan di atas timeline, contoh: 'Total Durasi', 'Jumlah Sesi'.",
        fields: [
          { name: "title", label: "Judul kartu", type: "text", placeholder: "Contoh: 8 Minggu" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Contoh: Durasi belajar keseluruhan" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "image", label: "Gambar (opsional)", type: "image", half: true },
        ],
      },
      {
        name: "weeks",
        label: "Blok Minggu / Tahap",
        type: "array",
        itemNoun: "Minggu",
        titleKey: "week",
        hint: "Setiap blok mewakili 1 minggu atau 1 tahap belajar, lengkap dengan poin materi dan jadwal harian (opsional).",
        fields: [
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "week", label: "Label Minggu", type: "text", half: true, placeholder: "Minggu 1" },
          { name: "title", label: "Judul Tahap", type: "text", placeholder: "Contoh: Pengenalan Dasar" },
          {
            name: "points",
            label: "Poin Materi",
            type: "stringArray",
            itemNoun: "Poin",
            hint: "Daftar materi/poin yang dipelajari di minggu ini, ditampilkan dengan tanda centang.",
          },
          {
            name: "days",
            label: "Jadwal Harian (opsional)",
            type: "array",
            itemNoun: "Sesi",
            titleKey: "title",
            hint: "Rincian jam per sesi pada minggu ini, contoh sesi pagi/siang.",
            fields: [
              { name: "startTime", label: "Jam Mulai", type: "text", half: true, placeholder: "08:00" },
              { name: "endTime", label: "Jam Selesai (opsional)", type: "text", half: true, placeholder: "09:00" },
              { name: "title", label: "Nama Kegiatan", type: "text", placeholder: "Contoh: Sesi Materi Inti" },
              { name: "highlight", label: "Tandai sebagai sesi penting", type: "switch" },
            ],
          },
        ],
      },
    ],
  },

  /* ── GALLERY ────────────────────────────────────────────────
     Photo grid + trust signal stats row below.
  ──────────────────────────────────────────────────────────── */
  gallery: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Galeri Kegiatan",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan dokumentasi secara umum.",
      },
      ...taglineFields,
      {
        name: "icon",
        label: "Icon Pill",
        type: "icon",
        half: true,
      },
      {
        name: "photos",
        label: "Foto Dokumentasi",
        type: "array",
        itemNoun: "Foto",
        titleKey: "caption",
        hint: "Foto pertama akan ditampilkan lebih besar (2 kolom) dibanding foto lainnya.",
        fields: [
          { name: "src", label: "Gambar", type: "image" },
          { name: "caption", label: "Caption", type: "text", placeholder: "Deskripsi singkat foto" },
          { name: "tag", label: "Tag kecil", type: "text", half: true, placeholder: "Contoh: Sesi Praktik" },
          { name: "highlight", label: "Tandai sebagai foto utama", type: "switch", half: true },
        ],
      },
      {
        name: "trustSignals",
        label: "Statistik Kepercayaan (opsional)",
        type: "stringArray",
        itemNoun: "Statistik",
        hint: "Ditampilkan sebagai kotak-kotak kecil di bawah galeri, contoh: '1000+ Alumni', '4.9/5 Rating'.",
      },
    ],
  },

  /* ── CLASSES ────────────────────────────────────────────────
     Class/level picker cards. `info` = small stat bar below the
     grid (e.g. "Durasi: 3 Bulan").
  ──────────────────────────────────────────────────────────── */
  classes: {
    fields: [
      {
        name: "title",
        label: "Label Pill",
        type: "text",
        placeholder: "Contoh: Pilihan Kelas",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan pilihan kelas secara umum.",
      },
      ...taglineFields,
      {
        name: "layout",
        label: "Layout Tampilan",
        type: "select",
        half: true,
        hint: "Mengatur jumlah kolom kartu kelas.",
        options: [
          { value: "grid", label: "Grid (2-3 kolom)" },
          { value: "timeline", label: "Timeline" },
          { value: "card", label: "Card (1-2 kolom besar)" },
        ],
      },
      {
        name: "items",
        label: "Daftar Kelas",
        type: "array",
        itemNoun: "Kelas",
        titleKey: "title",
        hint: "Setiap kartu menampilkan icon, judul, durasi, jadwal, dan info tambahan.",
        fields: [
          { name: "title", label: "Nama Kelas", type: "text", placeholder: "Contoh: Kelas Pemula" },
          { name: "duration", label: "Durasi", type: "text", half: true, placeholder: "Contoh: 8 Minggu" },
          { name: "tag", label: "Badge (opsional)", type: "text", half: true, placeholder: "Contoh: Paling Diminati", hint: "Jika diisi, kartu ditandai sebagai kelas unggulan." },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Jelaskan kelas ini secara singkat." },
          { name: "highlight", label: "Highlight", type: "text", placeholder: "Contoh: Cocok untuk pemula total" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          {
            name: "schedules",
            label: "Jadwal Kelas",
            type: "stringArray",
            itemNoun: "Jadwal",
            hint: "Contoh: 'Senin & Rabu, 19:00 - 21:00'.",
          },
          {
            name: "meta",
            label: "Info Tambahan",
            type: "array",
            itemNoun: "Info",
            titleKey: "label",
            hint: "Ditampilkan sebagai kotak kecil di bagian bawah kartu, contoh 'Kapasitas: 20 Orang'.",
            fields: [
              { name: "label", label: "Label", type: "text", half: true, placeholder: "Kapasitas" },
              { name: "value", label: "Nilai", type: "text", half: true, placeholder: "20 Orang" },
            ],
          },
        ],
      },
      {
        name: "info",
        label: "Statistik Umum (opsional)",
        type: "array",
        itemNoun: "Statistik",
        titleKey: "label",
        hint: "Bar info di bawah daftar kelas, contoh 'Total Kelas: 4'.",
        fields: [
          { name: "label", label: "Label", type: "text", half: true, placeholder: "Total Kelas" },
          { name: "value", label: "Nilai", type: "text", half: true, placeholder: "4" },
        ],
      },
    ],
  },

  /* ── FACILITIES ─────────────────────────────────────────────
     2-column layout: visual grid (photos/icons) on one side,
     list of facility items on the other.
  ──────────────────────────────────────────────────────────── */
  facilities: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Fasilitas",
        hint: "Judul utama (bukan label pill) — tampil besar.",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan fasilitas secara umum.",
      },
      {
        name: "tagline",
        label: "Label Pill",
        type: "text",
        half: true,
        placeholder: "Contoh: Fasilitas",
        hint: "Teks pendek di dalam pill kecil di atas judul.",
      },
      {
        name: "taglineAccent",
        label: "Bagian Judul yang Ditekankan",
        type: "text",
        half: true,
        placeholder: "Contoh: Tersedia",
        hint: "Disambung setelah Judul Section dengan warna tema.",
      },
      {
        name: "visuals",
        label: "Galeri Visual",
        type: "array",
        itemNoun: "Visual",
        titleKey: "caption",
        hint: "Bisa berupa foto (membuka lightbox) atau kartu icon bertema. Maks. ~5 item disarankan untuk grid yang rapi.",
        fields: [
          {
            name: "type",
            label: "Tipe Visual",
            type: "select",
            half: true,
            options: [
              { value: "image", label: "Foto" },
              { value: "icon", label: "Icon" },
            ],
          },
          { name: "icon", label: "Icon (jika tipe = Icon)", type: "icon", half: true },
          { name: "src", label: "Gambar (jika tipe = Foto)", type: "image" },
          { name: "alt", label: "Caption Foto (lightbox)", type: "text", half: true, placeholder: "Deskripsi saat foto dibuka penuh" },
          { name: "caption", label: "Caption Kartu", type: "text", half: true },
          { name: "tag", label: "Tag Kecil", type: "text", half: true, placeholder: "Contoh: Ruang Kelas" },
        ],
      },
      {
        name: "items",
        label: "Daftar Fasilitas",
        type: "array",
        itemNoun: "Fasilitas",
        titleKey: "title",
        hint: "Ditampilkan sebagai baris berurutan di samping galeri visual.",
        fields: [
          { name: "title", label: "Nama Fasilitas", type: "text", placeholder: "Contoh: Ruang Kelas Ber-AC" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Penjelasan singkat (opsional)" },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
    ],
  },

  /* ── MENTORSHIP ─────────────────────────────────────────────
     Similar 2-column layout to Facilities, but with a `highlight`
     callout and visuals that support icon or image types.
  ──────────────────────────────────────────────────────────── */
  mentorship: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Mentor Terpercaya",
        hint: "Judul utama — tampil besar.",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan program mentorship secara umum.",
      },
      {
        name: "tagline",
        label: "Label Pill",
        type: "text",
        half: true,
        placeholder: "Contoh: Dibimbing",
      },
      {
        name: "taglineAccent",
        label: "Bagian Judul yang Ditekankan",
        type: "text",
        half: true,
        placeholder: "Contoh: Langsung",
        hint: "Disambung setelah Judul Section dengan warna tema.",
      },
      {
        name: "highlight",
        label: "Catatan Highlight (opsional)",
        type: "text",
        placeholder: "Contoh: Sesi konsultasi 1-on-1 setiap minggu",
        hint: "Kalimat penekanan tambahan yang tampil mencolok.",
      },
      {
        name: "items",
        label: "Poin Mentorship",
        type: "array",
        itemNoun: "Poin",
        titleKey: "title",
        hint: "Daftar manfaat/poin pendampingan, masing-masing dengan icon, judul, dan deskripsi.",
        fields: [
          { name: "title", label: "Judul Poin", type: "text", placeholder: "Contoh: Konsultasi 1-on-1" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Jelaskan poin ini secara singkat." },
          { name: "icon", label: "Icon", type: "icon" },
        ],
      },
      {
        name: "visuals",
        label: "Galeri Visual",
        type: "array",
        itemNoun: "Visual",
        titleKey: "caption",
        hint: "Bisa berupa foto mentor/sesi (membuka lightbox) atau kartu icon bertema.",
        fields: [
          {
            name: "type",
            label: "Tipe Visual",
            type: "select",
            half: true,
            options: [
              { value: "image", label: "Foto" },
              { value: "icon", label: "Icon" },
            ],
          },
          { name: "icon", label: "Icon (jika tipe = Icon)", type: "icon", half: true },
          { name: "src", label: "Gambar (jika tipe = Foto)", type: "image" },
          { name: "alt", label: "Caption Foto (lightbox)", type: "text", half: true },
          { name: "caption", label: "Caption Kartu", type: "text", half: true },
        ],
      },
    ],
  },

  /* ── PRICING ────────────────────────────────────────────────
     Up to 2 pricing groups side-by-side, each with a feature list
     and one or more package cards. Bonus block + footer notes.
  ──────────────────────────────────────────────────────────── */
  pricing: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Investasi Terbaik untuk Masa Depanmu",
      },
      {
        name: "description",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan penawaran harga secara umum.",
      },
      {
        name: "groups",
        label: "Grup Paket Harga",
        type: "array",
        itemNoun: "Grup",
        titleKey: "title",
        hint: "Maksimal 2 grup tampil berdampingan (misalnya 'Online' dan 'Offline'). Tiap grup punya daftar fitur dan satu atau lebih paket.",
        fields: [
          { name: "title", label: "Nama Grup", type: "text", half: true, placeholder: "Contoh: Kelas Online" },
          { name: "subtitle", label: "Subjudul Grup", type: "text", half: true, placeholder: "Contoh: Belajar fleksibel dari mana saja" },
          { name: "icon", label: "Icon Grup", type: "icon", half: true },
          {
            name: "features",
            label: "Fitur yang Didapat",
            type: "stringArray",
            itemNoun: "Fitur",
            hint: "Daftar fitur yang berlaku untuk semua paket di grup ini.",
          },
          {
            name: "packages",
            label: "Paket Harga",
            type: "array",
            itemNoun: "Paket",
            titleKey: "label",
            hint: "Setiap paket = satu opsi harga yang bisa dipilih peserta.",
            fields: [
              { name: "label", label: "Nama Paket", type: "text", placeholder: "Contoh: Paket Reguler" },
              { name: "price", label: "Harga", type: "text", half: true, placeholder: "Rp 499.000" },
              { name: "originalPrice", label: "Harga Coret (opsional)", type: "text", half: true, placeholder: "Rp 699.000", hint: "Harga sebelum diskon, akan ditampilkan dicoret." },
              { name: "highlight", label: "Badge (opsional)", type: "text", half: true, placeholder: "Contoh: Paling Populer", hint: "Jika diisi, paket ini ditonjolkan." },
              { name: "note", label: "Catatan Paket", type: "text", placeholder: "Contoh: Termasuk sertifikat & akses selamanya" },
            ],
          },
        ],
      },
      {
        name: "bonusTitle",
        label: "Judul Bonus",
        type: "text",
        half: true,
        placeholder: "Contoh: Bonus yang Kamu Dapat",
        hint: "Hanya tampil jika daftar Bonus di bawah diisi.",
      },
      {
        name: "bonusNote",
        label: "Catatan Bonus",
        type: "text",
        half: true,
        placeholder: "Contoh: Bonus berlaku untuk semua paket",
      },
      {
        name: "bonus",
        label: "Daftar Bonus",
        type: "array",
        itemNoun: "Bonus",
        titleKey: "title",
        hint: "Item tambahan gratis yang ditawarkan bersama paket.",
        fields: [
          { name: "title", label: "Nama Bonus", type: "text", placeholder: "Contoh: E-book Panduan Belajar" },
          { name: "highlight", label: "Badge (opsional)", type: "text", half: true, placeholder: "Contoh: Senilai Rp 150.000" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Jelaskan bonus ini secara singkat." },
        ],
      },
      {
        name: "globalNote",
        label: "Catatan Kaki",
        type: "textarea",
        placeholder: "Contoh: Harga belum termasuk biaya admin pembayaran.",
        hint: "Tampil di pojok kiri bawah, biasanya untuk syarat & ketentuan singkat.",
      },
      {
        name: "urgency",
        label: "Pesan Urgensi (opsional)",
        type: "text",
        placeholder: "Contoh: Diskon berakhir dalam 3 hari!",
        hint: "Tampil di pojok kanan bawah dengan indikator berkedip merah.",
      },
    ],
  },

  /* ── BONUS (standalone section) ─────────────────────────────
     Rarely used standalone (bonus is usually part of Pricing),
     but kept for sections that need bonus items without pricing.
  ──────────────────────────────────────────────────────────── */
  bonus: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Bonus Program",
      },
      {
        name: "items",
        label: "Daftar Bonus",
        type: "array",
        itemNoun: "Bonus",
        titleKey: "title",
        fields: [
          { name: "title", label: "Nama Bonus", type: "text", placeholder: "Contoh: Sertifikat Resmi" },
          { name: "highlight", label: "Badge (opsional)", type: "text", half: true, placeholder: "Contoh: Gratis" },
          { name: "icon", label: "Icon", type: "icon", half: true },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Jelaskan bonus ini secara singkat." },
        ],
      },
    ],
  },

  /* ── TESTIMONIALS ───────────────────────────────────────────
     Alumni/participant quote cards with star rating display.
  ──────────────────────────────────────────────────────────── */
  testimonials: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Apa Kata Alumni",
      },
      {
        name: "items",
        label: "Daftar Testimoni",
        type: "array",
        itemNoun: "Testimoni",
        titleKey: "name",
        hint: "Setiap kartu menampilkan 5 bintang, kutipan, nama, dan peran/role.",
        fields: [
          { name: "quote", label: "Kutipan Testimoni", type: "textarea", placeholder: "Tulis testimoni dalam kata-kata peserta." },
          { name: "name", label: "Nama Peserta", type: "text", half: true, placeholder: "Contoh: Sarah" },
          { name: "role", label: "Peran / Asal", type: "text", half: true, placeholder: "Contoh: Mahasiswa, Jakarta" },
          { name: "meta", label: "Info Tambahan (opsional)", type: "text", placeholder: "Contoh: Batch Januari 2026" },
        ],
      },
    ],
  },

  /* ── FAQ (content is a bare array) ──────────────────────────
     Accordion list, first item open by default.
  ──────────────────────────────────────────────────────────── */
  faq: {
    rootArray: {
      name: "content",
      label: "Daftar Pertanyaan",
      type: "array",
      itemNoun: "Pertanyaan",
      titleKey: "q",
      hint: "Pertanyaan pertama akan tampil terbuka secara default.",
      fields: [
        { name: "q", label: "Pertanyaan", type: "text", placeholder: "Contoh: Apakah ada sertifikat?" },
        { name: "a", label: "Jawaban", type: "textarea", placeholder: "Tulis jawaban lengkap di sini." },
      ],
    },
  },

  /* ── CTA ────────────────────────────────────────────────────
     Final call-to-action banner with a single button.
  ──────────────────────────────────────────────────────────── */
  cta: {
    fields: [
      {
        name: "title",
        label: "Judul Utama",
        type: "text",
        half: true,
        placeholder: "Contoh: Siap Mulai Belajar?",
      },
      {
        name: "titleAccent",
        label: "Judul (bagian ditekankan)",
        type: "text",
        half: true,
        placeholder: "Contoh: Sekarang Juga",
        hint: "Disambung setelah Judul Utama dengan warna tema.",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Jelaskan ajakan ini dalam 1-2 kalimat.",
      },
      {
        name: "highlight",
        label: "Highlight (tidak tampil saat ini)",
        type: "text",
        hint: "Disimpan untuk kompatibilitas, belum dirender di tampilan publik.",
      },
      {
        name: "cta",
        label: "Tombol Aksi",
        type: "object",
        fields: [
          { name: "label", label: "Teks Tombol", type: "text", placeholder: "Daftar Sekarang" },
          { name: "href", label: "Link Tujuan", type: "text", placeholder: "/daftar" },
          { name: "note", label: "Catatan Kecil (tidak tampil saat ini)", type: "text", hint: "Disimpan untuk kompatibilitas." },
        ],
      },
      {
        name: "urgency",
        label: "Pesan Urgensi (opsional)",
        type: "text",
        placeholder: "Contoh: Kuota terbatas, daftar sebelum penuh!",
        hint: "Tampil di bawah tombol aksi.",
      },
    ],
  },

  /* ── BATCHES ────────────────────────────────────────────────
     Data-driven section — batch list is pulled from the Batch &
     Paket tab. Only heading text + empty-state message are
     editable here.
  ──────────────────────────────────────────────────────────── */
  batches: {
    fields: [
      {
        name: "title",
        label: "Judul Section",
        type: "text",
        placeholder: "Contoh: Batch Tersedia",
        hint: "Daftar batch ditarik otomatis dari tab Batch & Paket.",
      },
      {
        name: "subtitle",
        label: "Deskripsi Singkat",
        type: "textarea",
        placeholder: "Opsional, jelaskan jadwal batch secara umum.",
      },
      ...taglineFields,
      {
        name: "emptyMessage",
        label: "Pesan Saat Belum Ada Batch",
        type: "textarea",
        placeholder: "Contoh: Saat ini belum ada batch tersedia. Hubungi admin untuk info berikutnya.",
        hint: "Ditampilkan jika belum ada batch yang dibuat/dipublikasikan.",
      },
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