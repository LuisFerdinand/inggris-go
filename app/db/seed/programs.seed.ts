//
// Seed order: Categories → Programs → Batches → Packages → syncStartingPrice
//
// ─── ARCHITECTURE ────────────────────────────────────────────────────────────
//
//  permanent  → Program owns packages directly (batchId = null)
//               No batches needed. Good for: self-paced, rolling, custom-quote.
//
//  scheduled  → Program owns batches, each batch owns packages.
//               Good for: cohort classes, camps, fixed-date programs.
//
// ─── HOW TO EDIT THIS FILE ───────────────────────────────────────────────────
//
//  • Add/remove a CATEGORY        → edit CATEGORY_DATA
//  • Add/remove a PROGRAM         → edit PROGRAM_DATA
//      - Set scheduleType: "permanent" or "scheduled"
//      - permanent programs stop here — add their packages in PACKAGE_DATA
//  • Add/remove a BATCH           → edit BATCH_DATA (scheduled programs only)
//      - slugSuffix must be unique per program (used as batch key)
//  • Add/remove a PACKAGE         → edit PACKAGE_DATA
//      - global package (permanent program) → omit batchSlugSuffix
//      - batch-specific package             → set batchSlugSuffix to match BATCH_DATA
//
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/app/db/db";
import {
  programBatches,
  programCategories,
  programPackages,
  programs,
} from "../schema/programs";
import { excludedColumns, generateId, generateSlug } from "@/lib/utils";
import { CATEGORIES } from "@/app/(home)/programs/[categorySlug]/data";
import { eq } from "drizzle-orm";

// ─── Infer types ──────────────────────────────────────────────────────────────

type ProgramInsert = typeof programs.$inferInsert;
type BatchInsert = typeof programBatches.$inferInsert;
type PackageInsert = typeof programPackages.$inferInsert;
type CategoryInsert = typeof programCategories.$inferInsert;

// ─── Slug helper ──────────────────────────────────────────────────────────────

const sl = (str: string) => generateSlug(str);

// ─────────────────────────────────────────────────────────────────────────────
// ██████████████████████████████████████████████████████████████████████████
//
//   EDIT YOUR DATA BELOW
//   Each section is clearly separated and independently editable.
//
// ██████████████████████████████████████████████████████████████████████████
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — CATEGORIES
// ───────────────────────────────────────────────────────────────────────────────
// Categories are sourced from CATEGORIES (your existing data file).
// If you need to add a category, add it there instead.
// ═══════════════════════════════════════════════════════════════════════════════

// (no raw data here — pulled from CATEGORIES import below)

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — PROGRAMS
// ───────────────────────────────────────────────────────────────────────────────
// Each program needs:
//   - categorySlug  : matches a key in CATEGORIES
//   - scheduleType  : "permanent" | "scheduled"
//                     permanent → packages belong directly to the program
//                     scheduled → packages belong to a batch under the program
// ═══════════════════════════════════════════════════════════════════════════════

const THUMB = "/images/categories/online-hero.png";

type RawProgram = Omit<
  ProgramInsert,
  "id" | "slug" | "categoryId" | "startingPrice" | "startingOriginalPrice"
> & { categorySlug: string };

const PROGRAM_DATA: RawProgram[] = [
  // ── LEAD ────────────────────────────────────────────────────────────────────
  {
    categorySlug: "lead",
    scheduleType: "permanent", // self-paced WhatsApp program, no cohorts
    title: "Speaking Challenge",
    shortDesc:
      "Berani ngomong Inggris dalam 14 hari lewat latihan harian & feedback langsung",
    description:
      "Program 14 hari via WhatsApp untuk kamu yang ngerti bahasa Inggris tapi masih belum bisa ngomong. " +
      "Setiap hari kamu dapat prompt speaking, kamu rekam & kirim, lalu dapat feedback langsung dari coach. " +
      "Tidak ada Zoom, tidak ada jadwal kaku — cukup HP dan 15 menit sehari.",
    format: "online",
    level: "beginner",
    status: "published",
    registrationType: "online",
    order: 0,
    badge: "Paling Populer",
    highlight:
      "14 Hari Challenge • Latihan tiap hari • Feedback langsung • Via WhatsApp",
    tags: ["WhatsApp", "14 Hari", "Pemula", "Speaking"],
    icon: "target",
    thumbnail: THUMB,
    duration: 14,
  },

  // ── ONLINE ───────────────────────────────────────────────────────────────────
  {
    categorySlug: "online",
    scheduleType: "scheduled", // real monthly cohort batches
    title: "Daily Conversation",
    shortDesc:
      "Latihan speaking intensif 2 minggu biar nggak ngeblank saat ngobrol Inggris",
    description:
      "Program intensif 2 minggu untuk kamu yang masih suka ngeblank saat diajak ngobrol bahasa Inggris. " +
      "10 sesi live Zoom berdurasi 60 menit, maksimal 8 siswa per kelas agar setiap orang punya cukup waktu bicara. " +
      "Materi mencakup small talk, opini, cerita sehari-hari, hingga situasi kerja informal.",
    format: "online",
    level: "beginner",
    status: "published",
    registrationType: "online",
    order: 0,
    badge: "Terlaris",
    highlight:
      "10x Live Zoom • 60 menit • Max 8 siswa • Full speaking practice",
    tags: ["Zoom", "10x Pertemuan", "2 Minggu", "Speaking"],
    icon: "message-circle",
    thumbnail: THUMB,
    duration: 14,
  },
  {
    categorySlug: "online",
    scheduleType: "scheduled", // real monthly cohort batches
    title: "English for Kids",
    shortDesc:
      "Kelas fun untuk anak 6–12 tahun agar percaya diri ngomong Inggris sehari-hari",
    description:
      "Kelas bahasa Inggris online yang menyenangkan untuk anak usia 6–12 tahun. " +
      "Fokus membangun kepercayaan diri, kosakata, dan kemampuan komunikasi sehari-hari lewat games, lagu, dan storytelling. " +
      "10 sesi Zoom, maksimal 6 anak per kelas, diajar oleh tutor terlatih yang berpengalaman dengan anak-anak.",
    format: "online",
    level: "beginner",
    status: "published",
    registrationType: "online",
    order: 1,
    badge: "Favorit Anak & Orang Tua",
    highlight:
      "10x Zoom • Max 6 siswa • Fun & interactive • Fokus percaya diri",
    tags: ["Anak 6–12", "Zoom", "Fun Learning", "Speaking"],
    icon: "star",
    thumbnail: THUMB,
    duration: 14,
  },
  {
    categorySlug: "online",
    scheduleType: "permanent", // rolling 1-on-1, no fixed cohort
    title: "Private Class",
    shortDesc:
      "Kelas 1-on-1 fleksibel dengan materi custom untuk progress lebih cepat",
    description:
      "Kelas private 1-on-1 dengan jadwal fleksibel dan materi 100% disesuaikan dengan kebutuhanmu. " +
      "Cocok untuk kamu yang ingin belajar lebih fokus, punya target spesifik (IELTS, job interview, presentasi), " +
      "atau tidak bisa mengikuti kelas jadwal tetap. Tersedia paket 5x hingga 30x pertemuan.",
    format: "online",
    level: "beginner",
    status: "published",
    registrationType: "online",
    order: 2,
    badge: "Paling Fleksibel",
    highlight: "1-on-1 • Jadwal bebas • Materi custom • Fokus hasil",
    tags: ["1-on-1", "Flexible Schedule", "Custom Material", "Zoom"],
    icon: "user",
    thumbnail: THUMB,
    duration: null,
  },
  {
    categorySlug: "online",
    scheduleType: "permanent", // rolling 1-on-1, no fixed cohort
    title: "Private Class for Kids",
    shortDesc:
      "Kelas private fun untuk anak 4+ agar lebih percaya diri sejak dini",
    description:
      "Kelas private 1-on-1 untuk anak usia 4+ dengan tutor berpengalaman. " +
      "Jadwal fleksibel menyesuaikan rutinitas keluarga, materi fun & interaktif dirancang sesuai usia, " +
      "dan fokus membangun kepercayaan diri berbicara bahasa Inggris sejak dini. " +
      "Tersedia paket 10x, 20x, dan 30x pertemuan.",
    format: "online",
    level: "beginner",
    status: "published",
    registrationType: "online",
    order: 3,
    badge: "Paling Fleksibel",
    highlight: "1-on-1 • Jadwal bebas • Fun learning • Fokus perkembangan anak",
    tags: ["Usia 4+", "1-on-1", "Flexible Schedule", "Zoom", "Fun Learning"],
    icon: "sparkles",
    thumbnail: THUMB,
    duration: null,
  },

  // ── OFFLINE ──────────────────────────────────────────────────────────────────
  {
    categorySlug: "offline",
    scheduleType: "scheduled", // real camp batches with dates
    title: "VIP English for Kids",
    shortDesc:
      "English camp intensif untuk anak dengan aktivitas seru, speaking practice, dan lingkungan English-speaking 24 jam di Kampung Inggris Pare.",
    description:
      "Program liburan intensif eksklusif khusus anak-anak langsung di Kampung Inggris Pare, Kediri. " +
      "Selama 7 hari anak-anak tinggal di lingkungan English-speaking penuh, mengikuti aktivitas seru, " +
      "speaking practice, permainan edukatif, outbound, dan bertemu teman baru dari seluruh Indonesia. " +
      "Tersedia juga paket 2 minggu untuk immersion yang lebih dalam.",
    format: "offline",
    level: "beginner",
    status: "published",
    registrationType: "offline",
    order: 0,
    badge: "Full Immersion",
    highlight: "Lingkungan English-speaking 24 jam selama program berlangsung",
    tags: ["Offline", "Anak-anak", "Kampung Inggris", "Intensif", "Camp"],
    icon: "tent",
    thumbnail: THUMB,
    duration: 7,
  },
  {
    categorySlug: "offline",
    scheduleType: "permanent", // custom group quote, no fixed schedule
    title: "Kelas Rombongan",
    shortDesc:
      "Program grup custom untuk sekolah, komunitas, atau keluarga dengan pengalaman belajar kolaboratif langsung di Kampung Inggris Pare.",
    description:
      "Bawa kelompokmu — kelas, komunitas, atau keluarga besar — ke Kampung Inggris. " +
      "Program dirancang khusus untuk grup dengan aktivitas kolaboratif yang intens dan menyenangkan. " +
      "Tim kami menyusun rundown, fasilitator, dan akomodasi sesuai kebutuhan grup kamu. " +
      "Minimum 10 peserta, jadwal bisa disesuaikan.",
    format: "offline",
    level: "beginner",
    status: "published",
    registrationType: "offline",
    order: 1,
    badge: "Group Program",
    highlight: "Kuota terbatas — cocok untuk sekolah, kampus & komunitas",
    tags: ["Offline", "Grup", "Custom", "Kampung Inggris"],
    icon: "handshake",
    thumbnail: THUMB,
    duration: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — BATCHES  (scheduled programs only)
// ───────────────────────────────────────────────────────────────────────────────
// Only define batches for programs with scheduleType: "scheduled".
// Fields here: schedule, capacity, location, mode, notes, teacher.
// Fields NOT here: price, originalPrice — those live in packages.
//
// slugSuffix  : short unique key per batch within the same program.
//               Used to link packages to this batch — keep it stable!
// ═══════════════════════════════════════════════════════════════════════════════

type RawBatch = Omit<BatchInsert, "id" | "slug" | "programId"> & {
  programTitle: string;
  slugSuffix: string; // stable key — used by packages to reference this batch
};

const BATCH_DATA: RawBatch[] = [
  // ── Daily Conversation ──────────────────────────────────────────────────────
  {
    programTitle: "Daily Conversation",
    slugSuffix: "mei-2026",
    title: "Daily Conversation — Mei 2026",
    mode: "online",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-05-05T19:00:00+07:00"),
    endDate: new Date("2026-05-22T21:00:00+07:00"),
    capacity: 8,
    enrolledCount: 3,
    meetingDays: ["Mon", "Wed", "Fri"],
    meetingTime: "19:00 – 21:00 WIB",
    notes: "Sesi via Zoom. Link dikirim H-1 setelah konfirmasi pembayaran.",
  },
  {
    programTitle: "Daily Conversation",
    slugSuffix: "juni-2026",
    title: "Daily Conversation — Juni 2026",
    mode: "online",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-06-02T19:00:00+07:00"),
    endDate: new Date("2026-06-20T21:00:00+07:00"),
    capacity: 8,
    enrolledCount: 0,
    meetingDays: ["Mon", "Wed", "Fri"],
    meetingTime: "19:00 – 21:00 WIB",
    notes: "Pendaftaran dibuka mulai 10 Mei 2026.",
  },

  // ── English for Kids ────────────────────────────────────────────────────────
  {
    programTitle: "English for Kids",
    slugSuffix: "mei-2026",
    title: "English for Kids — Mei 2026",
    mode: "online",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-05-10T09:00:00+07:00"),
    endDate: new Date("2026-05-28T10:30:00+07:00"),
    capacity: 6,
    enrolledCount: 2,
    meetingDays: ["Sat", "Sun"],
    meetingTime: "09:00 – 10:30 WIB",
    notes:
      "Cocok untuk anak usia 6–12 tahun. Orang tua dipersilakan mendampingi sesi pertama.",
  },
  {
    programTitle: "English for Kids",
    slugSuffix: "juni-2026",
    title: "English for Kids — Juni 2026",
    mode: "online",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-06-07T09:00:00+07:00"),
    endDate: new Date("2026-06-29T10:30:00+07:00"),
    capacity: 6,
    enrolledCount: 0,
    meetingDays: ["Sat", "Sun"],
    meetingTime: "09:00 – 10:30 WIB",
  },

  // ── VIP English for Kids ────────────────────────────────────────────────────
  {
    programTitle: "VIP English for Kids",
    slugSuffix: "jun-2026-b1",
    title: "VIP Camp — Juni 2026 Batch 1",
    mode: "offline",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-06-21"),
    endDate: new Date("2026-06-27"),
    location: "Kampung Inggris Pare, Kediri, Jawa Timur",
    capacity: 30,
    enrolledCount: 12,
    meetingTime: "Senin – Minggu, 07:00 – 21:00 WIB",
    notes:
      "Termasuk akomodasi asrama putra/putri. Brosur tersedia di halaman program.",
  },
  {
    programTitle: "VIP English for Kids",
    slugSuffix: "jun-2026-b2",
    title: "VIP Camp — Juni 2026 Batch 2",
    mode: "offline",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-06-28"),
    endDate: new Date("2026-07-04"),
    location: "Kampung Inggris Pare, Kediri, Jawa Timur",
    capacity: 30,
    enrolledCount: 7,
    meetingTime: "Senin – Minggu, 07:00 – 21:00 WIB",
    notes: "Termasuk akomodasi asrama putra/putri.",
  },
  {
    programTitle: "VIP English for Kids",
    slugSuffix: "jul-2026-2wk-b1",
    title: "VIP Camp 2 Weeks — Juli 2026 Batch 1",
    mode: "offline",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-07-05"),
    endDate: new Date("2026-07-18"),
    location: "Kampung Inggris Pare, Kediri, Jawa Timur",
    capacity: 25,
    enrolledCount: 4,
    meetingTime: "Senin – Minggu, 07:00 – 21:00 WIB",
    notes:
      "Paket 2 minggu untuk immersion lebih dalam. Termasuk akomodasi & aktivitas akhir pekan.",
  },
  {
    programTitle: "VIP English for Kids",
    slugSuffix: "aug-2026-b1",
    title: "VIP Camp — Agustus 2026 Batch 1",
    mode: "offline",
    status: "open",
    isOpen: true,
    startDate: new Date("2026-08-10"),
    endDate: new Date("2026-08-16"),
    location: "Kampung Inggris Pare, Kediri, Jawa Timur",
    capacity: 30,
    enrolledCount: 0,
    meetingTime: "Senin – Minggu, 07:00 – 21:00 WIB",
    notes: "Batch liburan Agustus. Pendaftaran dibuka mulai 1 Juli 2026.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — PACKAGES  (all pricing lives here)
// ───────────────────────────────────────────────────────────────────────────────
//
//  permanent program  → omit batchSlugSuffix entirely (batchId will be null)
//  scheduled program  → set batchSlugSuffix to match a slugSuffix in BATCH_DATA
//
//  price: 0 is valid — UI can render it as "Hubungi Kami"
// ═══════════════════════════════════════════════════════════════════════════════

type RawPackage = Omit<
  PackageInsert,
  "id" | "slug" | "programId" | "batchId"
> & {
  programTitle: string;
  batchSlugSuffix?: string; // omit for permanent programs
};

const PACKAGE_DATA: RawPackage[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // Speaking Challenge — permanent, 1 flat-price package
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "Speaking Challenge",
    title: "14-Day WhatsApp Challenge",
    description:
      "Akses penuh 14 hari: prompt harian, rekam & kirim, feedback dari coach.",
    price: 49_000,
    originalPrice: 99_000,
    isDefault: true,
    order: 0,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Daily Conversation — scheduled, 1 package per batch (same price for all)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "Daily Conversation",
    batchSlugSuffix: "mei-2026",
    title: "Regular",
    description: "10x sesi Zoom 60 menit, max 8 siswa per kelas.",
    price: 249_000,
    originalPrice: 449_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "Daily Conversation",
    batchSlugSuffix: "juni-2026",
    title: "Regular",
    description: "10x sesi Zoom 60 menit, max 8 siswa per kelas.",
    price: 249_000,
    originalPrice: 449_000,
    isDefault: true,
    order: 0,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // English for Kids — scheduled, 1 package per batch (same price for all)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "English for Kids",
    batchSlugSuffix: "mei-2026",
    title: "Regular",
    description: "10x sesi Zoom fun & interaktif, max 6 anak per kelas.",
    price: 349_000,
    originalPrice: 549_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "English for Kids",
    batchSlugSuffix: "juni-2026",
    title: "Regular",
    description: "10x sesi Zoom fun & interaktif, max 6 anak per kelas.",
    price: 349_000,
    originalPrice: 549_000,
    isDefault: true,
    order: 0,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Class — permanent, 6 packages (Intensive & Exclusive tiers)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "Private Class",
    title: "Intensive 5x",
    description: "5 sesi 60 menit. Cocok untuk coba dulu atau fokus 1 topik.",
    price: 499_000,
    originalPrice: 599_000,
    isDefault: false,
    order: 0,
  },
  {
    programTitle: "Private Class",
    title: "Intensive 10x",
    description: "10 sesi 60 menit. Progress signifikan dalam 2–3 minggu.",
    price: 799_000,
    originalPrice: 999_000,
    isDefault: false,
    order: 1,
  },
  {
    programTitle: "Private Class",
    title: "Intensive 15x",
    description:
      "15 sesi 60 menit. Paling populer untuk target speaking & vocabulary.",
    price: 1_099_000,
    originalPrice: 1_399_000,
    isDefault: true,
    order: 2,
  },
  {
    programTitle: "Private Class",
    title: "Exclusive 10x",
    description: "10 sesi 75 menit dengan senior tutor. Kurikulum 100% custom.",
    price: 1_399_000,
    originalPrice: 2_490_000,
    isDefault: false,
    order: 3,
  },
  {
    programTitle: "Private Class",
    title: "Exclusive 20x",
    description:
      "20 sesi 75 menit. Ideal untuk IELTS prep atau kebutuhan profesional.",
    price: 2_499_000,
    originalPrice: 3_690_000,
    isDefault: false,
    order: 4,
  },
  {
    programTitle: "Private Class",
    title: "Exclusive 30x",
    description:
      "30 sesi 75 menit. Transformasi terlengkap — dari percaya diri hingga fasih.",
    price: 3_799_000,
    originalPrice: 5_999_000,
    isDefault: false,
    order: 5,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Class for Kids — permanent, 3 packages
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "Private Class for Kids",
    title: "Starter 10x",
    description:
      "10 sesi 45 menit. Kenalan & bangun fondasi kosakata & percaya diri.",
    price: 1_199_000,
    originalPrice: 1_799_000,
    isDefault: false,
    order: 0,
  },
  {
    programTitle: "Private Class for Kids",
    title: "Progress 20x",
    description:
      "20 sesi 45 menit. Paling direkomendasikan untuk progress nyata.",
    price: 2_199_000,
    originalPrice: 2_999_000,
    isDefault: true,
    order: 1,
  },
  {
    programTitle: "Private Class for Kids",
    title: "Fluency 30x",
    description:
      "30 sesi 45 menit. Untuk anak yang ingin benar-benar lancar sehari-hari.",
    price: 3_199_000,
    originalPrice: 4_999_000,
    isDefault: false,
    order: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VIP English for Kids — scheduled, batch-specific packages
  // 1-week batches: Jun B1, Jun B2, Aug B1 share the same room prices
  // 2-week batch:   Jul 2wk B1 has higher prices
  // ─────────────────────────────────────────────────────────────────────────────

  // Jun B1
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jun-2026-b1",
    title: "1 Week Package",
    description: "Paket 1 Minggu",
    price: 1_975_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jul-2026-2wk-b1",
    title: "Paket 2 Minggu",
    description: "Paket 2 Minggu",
    price: 3_375_000,
    isDefault: false,
    order: 1,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jun-2026-b2",
    title: "1 Week Package",
    description: "Paket 1 Minggu",
    price: 1_975_000,
    isDefault: false,
    order: 2,
  },

  // Jun B2
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jun-2026-b2",
    title: "Regular Room",
    description: "Kamar asrama standar, max 4 anak per kamar.",
    price: 1_975_000,
    originalPrice: 2_300_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jun-2026-b2",
    title: "VIP Room",
    description: "Kamar semi-privat max 2 anak, AC, lebih tenang.",
    price: 2_475_000,
    originalPrice: 2_800_000,
    isDefault: false,
    order: 1,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jun-2026-b2",
    title: "Private Room",
    description: "Kamar privat 1 anak, AC, kamar mandi dalam.",
    price: 2_975_000,
    originalPrice: 3_300_000,
    isDefault: false,
    order: 2,
  },

  // Jul 2-week B1 (higher prices)
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jul-2026-2wk-b1",
    title: "Regular Room",
    description: "Kamar asrama standar, max 4 anak per kamar. Paket 2 minggu.",
    price: 3_750_000,
    originalPrice: 4_300_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jul-2026-2wk-b1",
    title: "VIP Room",
    description: "Kamar semi-privat max 2 anak, AC. Paket 2 minggu.",
    price: 4_500_000,
    originalPrice: 5_100_000,
    isDefault: false,
    order: 1,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "jul-2026-2wk-b1",
    title: "Private Room",
    description: "Kamar privat 1 anak, AC, kamar mandi dalam. Paket 2 minggu.",
    price: 5_500_000,
    originalPrice: 6_200_000,
    isDefault: false,
    order: 2,
  },

  // Aug B1
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "aug-2026-b1",
    title: "Regular Room",
    description: "Kamar asrama standar, max 4 anak per kamar.",
    price: 1_975_000,
    originalPrice: 2_300_000,
    isDefault: true,
    order: 0,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "aug-2026-b1",
    title: "VIP Room",
    description: "Kamar semi-privat max 2 anak, AC.",
    price: 2_475_000,
    originalPrice: 2_800_000,
    isDefault: false,
    order: 1,
  },
  {
    programTitle: "VIP English for Kids",
    batchSlugSuffix: "aug-2026-b1",
    title: "Private Room",
    description: "Kamar privat 1 anak, AC, kamar mandi dalam.",
    price: 2_975_000,
    originalPrice: 3_300_000,
    isDefault: false,
    order: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Kelas Rombongan — permanent, custom-quote placeholder
  // price: 0 → UI should render "Hubungi Kami" instead of a price
  // ─────────────────────────────────────────────────────────────────────────────
  {
    programTitle: "Kelas Rombongan",
    title: "Custom Group Quote",
    description:
      "Harga disesuaikan berdasarkan jumlah peserta, durasi, dan rundown yang diinginkan. " +
      "Hubungi admin untuk penawaran terbaik.",
    price: 0,
    originalPrice: null,
    isDefault: true,
    order: 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ██████████████████████████████████████████████████████████████████████████
//
//   SEED FUNCTIONS  (no need to edit below unless changing DB logic)
//
// ██████████████████████████████████████████████████████████████████████████
// ─────────────────────────────────────────────────────────────────────────────

// ─── 1. Categories ────────────────────────────────────────────────────────────

export async function seedCategories() {
  console.log("1. Seeding Program Categories…");
  await db.delete(programCategories);

  for (const cat of Object.values(CATEGORIES)) {
    const data: CategoryInsert = {
      id: generateId("prog-cat"),
      slug: sl(cat.key),
      label: cat.label,
      shortLabel: cat.shortLabel,
      order: 0,
      status: "published",
      icon: cat.icon,
      heroImage: cat.heroImage,
      tagline: cat.tagline,
      taglineAccent: cat.taglineAccent,
      description: cat.description,
      forWho: cat.forWho,
      themePrimary: cat.theme.primary,
      painPoints: cat.painPoints ?? [],
      benefits: cat.benefits ?? [],
      steps: cat.steps ?? [],
      experience: cat.experience ?? [],
      comparison: cat.comparison ?? [],
      socialProof: cat.socialProof ?? [],
      cta: cat.cta ?? null,
      emptyState: {
        title: "Belum ada program tersedia",
        description: "Silakan cek kembali nanti atau hubungi admin.",
      },
      quickDecisionLabel: cat.quickDecisionLabel,
      quickDecisionDesc: cat.quickDecisionDesc,
      updatedAt: new Date(),
    };

    await db
      .insert(programCategories)
      .values(data)
      .onConflictDoUpdate({
        target: programCategories.slug,
        set: {
          label: data.label,
          shortLabel: data.shortLabel,
          order: data.order ?? 0,
          status: data.status,
          icon: data.icon,
          heroImage: data.heroImage,
          tagline: data.tagline,
          taglineAccent: data.taglineAccent,
          description: data.description,
          forWho: data.forWho,
          themePrimary: data.themePrimary,
          painPoints: data.painPoints,
          benefits: data.benefits,
          steps: data.steps,
          experience: data.experience,
          comparison: data.comparison,
          socialProof: data.socialProof,
          cta: data.cta,
          emptyState: data.emptyState,
          quickDecisionLabel: data.quickDecisionLabel,
          quickDecisionDesc: data.quickDecisionDesc,
          updatedAt: new Date(),
        },
      });
  }
  console.log("   ✓ Categories done");
}

// ─── 2. Programs ──────────────────────────────────────────────────────────────

export async function seedPrograms() {
  console.log("2. Seeding Programs…");
  await db.delete(programs);

  const categories = await db.query.programCategories.findMany();
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  function catId(slug: string): string {
    const id = catMap.get(sl(slug));
    if (!id)
      throw new Error(
        `Category not found: "${slug}". Did you seed categories first?`,
      );
    return id;
  }

  const data: ProgramInsert[] = PROGRAM_DATA.map((p) => ({
    ...p,
    id: generateId("prog"),
    slug: sl(p.title),
    categoryId: catId(p.categorySlug),
    startingPrice: null, // derived after packages are seeded
    startingOriginalPrice: null,
  }));

  await db
    .insert(programs)
    .values(data)
    .onConflictDoUpdate({
      target: programs.slug,
      set: {
        ...excludedColumns([
          "title",
          "description",
          "short_desc",
          "category_id",
          "schedule_type",
          "badge",
          "highlight",
          "tags",
          "icon",
          "thumbnail",
          "duration",
          "level",
          "format",
          "status",
          "order",
        ]),
        updatedAt: new Date(),
      },
    });

  console.log(`   ✓ ${data.length} programs inserted`);
}

// ─── 3. Batches ───────────────────────────────────────────────────────────────

export async function seedProgramBatches() {
  console.log("3. Seeding Program Batches…");
  await db.delete(programBatches);

  const programList = await db.select().from(programs);
  const progMap = new Map(
    programList.map((p) => [
      p.slug,
      { id: p.id, scheduleType: p.scheduleType },
    ]),
  );

  function getProgram(title: string) {
    const prog = progMap.get(sl(title));
    if (!prog) throw new Error(`Program not found for batch: "${title}"`);
    if (prog.scheduleType !== "scheduled") {
      throw new Error(
        `Program "${title}" is "permanent" — it cannot have batches. ` +
          `Change its scheduleType to "scheduled" or remove the batch.`,
      );
    }
    return prog.id;
  }

  const data: BatchInsert[] = BATCH_DATA.map(
    ({ programTitle, slugSuffix, ...b }) => ({
      ...b,
      id: generateId("prog-batch"),
      slug: sl(`${programTitle}-${slugSuffix}`),
      programId: getProgram(programTitle),
    }),
  );

  await db
    .insert(programBatches)
    .values(data)
    .onConflictDoUpdate({
      target: programBatches.slug,
      set: {
        ...excludedColumns([
          "program_id",
          "teacher_id",
          "title",
          "start_date",
          "end_date",
          "capacity",
          "enrolled_count",
          "mode",
          "location",
          "meeting_days",
          "meeting_time",
          "status",
          "is_open",
          "notes",
        ]),
        updatedAt: new Date(),
      },
    });

  console.log(`   ✓ ${data.length} batches inserted`);
}

// ─── 4. Packages ──────────────────────────────────────────────────────────────

export async function seedProgramPackages() {
  console.log("4. Seeding Program Packages…");
  await db.delete(programPackages);

  const programList = await db.select().from(programs);
  const batchList = await db.select().from(programBatches);

  const progMap = new Map(
    programList.map((p) => [
      p.slug,
      { id: p.id, scheduleType: p.scheduleType },
    ]),
  );
  const batchMap = new Map(batchList.map((b) => [b.slug, b.id]));

  function getProgram(title: string) {
    const prog = progMap.get(sl(title));
    if (!prog) throw new Error(`Program not found for package: "${title}"`);
    return prog;
  }

  function getBatchId(programTitle: string, suffix: string): string {
    const key = sl(`${programTitle}-${suffix}`);
    const id = batchMap.get(key);
    if (!id)
      throw new Error(
        `Batch not found for package: "${key}". Check slugSuffix in BATCH_DATA.`,
      );
    return id;
  }

  const data: PackageInsert[] = PACKAGE_DATA.map(
    ({ programTitle, batchSlugSuffix, ...p }) => {
      const prog = getProgram(programTitle);

      // Guard: permanent programs must NOT have batch-specific packages
      if (prog.scheduleType === "permanent" && batchSlugSuffix) {
        throw new Error(
          `Program "${programTitle}" is "permanent" but package "${p.title}" has a batchSlugSuffix. ` +
            `Remove batchSlugSuffix or change the program to "scheduled".`,
        );
      }

      // Guard: scheduled programs must NOT have global packages (batchId = null)
      if (prog.scheduleType === "scheduled" && !batchSlugSuffix) {
        throw new Error(
          `Program "${programTitle}" is "scheduled" but package "${p.title}" has no batchSlugSuffix. ` +
            `Assign it to a batch or change the program to "permanent".`,
        );
      }

      const batchId = batchSlugSuffix
        ? getBatchId(programTitle, batchSlugSuffix)
        : null;

      const slugParts = [sl(programTitle)];
      if (batchSlugSuffix) slugParts.push(batchSlugSuffix);
      slugParts.push(sl(p.title));

      return {
        ...p,
        id: generateId("prog-pkg"),
        programId: prog.id,
        batchId,
        slug: slugParts.join("-"),
        originalPrice: p.originalPrice ?? null,
      };
    },
  );

  await db.insert(programPackages).values(data);

  console.log(`   ✓ ${data.length} packages inserted`);
}

// ─── 5. Sync startingPrice ────────────────────────────────────────────────────

export async function syncProgramStartingPrices() {
  console.log("5. Syncing programs.startingPrice…");

  const programList = await db
    .select({ id: programs.id, scheduleType: programs.scheduleType })
    .from(programs);

  for (const { id: programId, scheduleType } of programList) {
    const pkgs = await db.query.programPackages.findMany({
      where: (t, { eq }) => eq(t.programId, programId),
      columns: { price: true, originalPrice: true, batchId: true },
    });

    if (pkgs.length === 0) continue;

    // permanent → all packages are global (batchId = null), pick cheapest
    // scheduled → packages are batch-specific, pick cheapest across all batches
    const sorted = [...pkgs].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0]!;

    await db
      .update(programs)
      .set({
        startingPrice: cheapest.price,
        startingOriginalPrice: cheapest.originalPrice ?? null,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, programId));
  }

  console.log("   ✓ startingPrice synced for all programs");
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function seedAllPrograms() {
  await seedCategories();
  await seedPrograms();
  await seedProgramBatches();
  await seedProgramPackages();
  await syncProgramStartingPrices();
  console.log("\n✅ All program data seeded successfully.");
}
