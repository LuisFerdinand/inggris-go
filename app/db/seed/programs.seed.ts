import { db } from "@/app/db/db";
import {
  programBatches,
  programCategories,
  programs,
} from "../schema/programs";
import { excludedColumns, generateId, generateSlug } from "@/lib/utils";
import { CATEGORIES } from "@/app/(home)/programs/[categorySlug]/data";
import { sql } from "drizzle-orm";
import { buildWhatsAppUrl } from "@/lib/config";

type ProgramInsert = typeof programs.$inferInsert;
type BatchInsert = typeof programBatches.$inferInsert;
type CategoryInsert = typeof programCategories.$inferInsert;

export async function seedCategories() {
  console.log("1. Seeding Program Categories...");

  await db.delete(programCategories);

  for (const cat of Object.values(CATEGORIES)) {
    const data: CategoryInsert = {
      id: generateId("prog-cat"),

      slug: generateSlug(cat.key),

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
}
export async function seedPrograms() {
  console.log("2. Seeding Programs...");
  await db.delete(programs);
  const THUMBNAIL_DEFAULT = "/images/categories/online-hero.png";

  // =====================================
  // CATEGORY LOOKUP
  // =====================================

  const categories = await db.query.programCategories.findMany();

  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.id]));

  // =====================================
  // RAW PROGRAMS
  // =====================================

  const rawPrograms = [
    {
      title: "Speaking Challenge",

      categorySlug: "lead",

      description:
        "Program 14 hari via WhatsApp untuk kamu yang ngerti bahasa Inggris tapi masih belum bisa ngomong.",

      startingPrice: 49000,
      startingOriginalPrice: 49000,

      badge: "Paling Populer",

      highlight:
        "14 Hari Challenge • Latihan tiap hari • Feedback langsung • Via WhatsApp",

      tags: ["WhatsApp", "14 Hari", "Pemula", "Speaking"],

      icon: "target",

      duration: 14,
      order: 0,

      format: "online",
      level: "beginner",
      status: "published",

      shortDesc:
        "Berani ngomong Inggris dalam 14 hari lewat latihan harian & feedback langsung",

      thumbnail: THUMBNAIL_DEFAULT,
    },

    {
      title: "Daily Conversation",

      categorySlug: "online",

      description:
        "Program intensif 2 minggu untuk kamu yang masih suka ngeblank saat diajak ngomong bahasa Inggris.",

      startingOriginalPrice: 449000,
      startingPrice: 249000,

      badge: "Terlaris",

      registrationType: "online",

      highlight:
        "10x Live Zoom • 60 menit • Max 8 siswa • Full speaking practice",

      tags: ["Zoom", "10x Pertemuan", "2 Minggu", "Speaking"],

      icon: "message-circle",

      duration: 14,
      order: 0,

      format: "online",
      level: "beginner",
      status: "published",

      shortDesc:
        "Latihan speaking intensif 2 minggu biar nggak ngeblank saat ngobrol Inggris",

      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      title: "English for Kids",

      description:
        "Kelas bahasa Inggris online yang menyenangkan untuk anak usia 6–12 tahun. Fokus membangun kepercayaan diri, kosakata, dan kemampuan komunikasi sehari-hari.",
      categorySlug: "online",

      registrationType: "online",

      startingOriginalPrice: 549000,
      startingPrice: 349000,

      badge: "Favorit Anak & Orang Tua",

      highlight:
        "10x Zoom • Max 6 siswa • Fun & interactive • Fokus percaya diri",

      tags: ["Anak 6–12", "Zoom", "Fun Learning", "Speaking"],

      icon: "star",

      duration: 14,
      order: 1,

      format: "online",
      level: "beginner",
      status: "published",

      shortDesc:
        "Kelas fun untuk anak 6–12 tahun agar percaya diri ngomong Inggris sehari-hari",

      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      title: "Private Class",

      description:
        "Kelas private 1-on-1 dengan jadwal fleksibel dan materi 100% disesuaikan. Cocok untuk kamu yang ingin belajar lebih fokus dan progress lebih cepat.",
      categorySlug: "online",

      registrationType: "online",
      startingPrice: 399000,
      startingOriginalPrice: 399000,

      badge: "Paling Fleksibel",

      highlight: "1-on-1 • Jadwal bebas • Materi custom • Fokus hasil",

      tags: ["1-on-1", "Flexible Schedule", "Custom Material", "Zoom"],
      icon: "user",

      order: 2,

      format: "online",
      level: "beginner",
      status: "published",

      shortDesc:
        "Kelas 1-on-1 fleksibel dengan materi custom untuk progress lebih cepat",

      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      title: "Private Class for Kids",

      description:
        "Kelas private 1-on-1 untuk anak usia 4+ dengan tutor berpengalaman. Jadwal fleksibel, materi fun & interaktif, dan fokus membangun kepercayaan diri sejak dini.",
      categorySlug: "online",

      registrationType: "online",
      startingOriginalPrice: 1199000,
      startingPrice: 1199000,

      badge: "Paling Fleksibel",

      highlight:
        "1-on-1 • Jadwal bebas • Fun learning • Fokus perkembangan anak",

      tags: ["Usia 4+", "1-on-1", "Flexible Schedule", "Zoom", "Fun Learning"],

      icon: "sparkles",

      order: 3,
      format: "online",
      level: "beginner",
      status: "published",

      shortDesc:
        "Kelas private fun untuk anak 4+ agar lebih percaya diri sejak dini",

      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      title: "VIP English for Kids",
      registrationType: "offline",

      description:
        "Program liburan intensif eksklusif khusus anak-anak langsung di Kampung Inggris Pare. Penuh aktivitas seru, speaking practice, permainan edukatif, dan teman baru dari seluruh Indonesia.",
      categorySlug: "offline",

      startingPrice: 1975000,
      startingOriginalPrice: 1975000,

      badge: "Full Immersion",

      highlight:
        "Lingkungan English-speaking 24 jam selama program berlangsung",
      tags: ["Offline", "Anak-anak", "Kampung Inggris", "Intensif"],
      icon: "tent",

      order: 0,
      format: "offline",
      level: "beginner",
      status: "published",

      shortDesc:
        "English camp intensif untuk anak dengan aktivitas seru, speaking practice, dan lingkungan English-speaking 24 jam di Kampung Inggris Pare.",

      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      title: "Kelas Rombongan",

      registrationType: "offline",
      description:
        "Bawa kelompokmu — kelas, komunitas, atau keluarga besar — ke Kampung Inggris. Program dirancang khusus untuk grup dengan aktivitas kolaboratif yang intens dan menyenangkan.",
      badge: "Group Program",
      categorySlug: "offline",

      highlight: "Kuota terbatas — cocok untuk sekolah, kampus & komunitas",
      tags: ["Offline", "Grup", "Custom", "Kampung Inggris"],
      icon: "handshake",

      order: 1,
      format: "offline",
      level: "beginner",
      status: "published",

      shortDesc:
        "Program grup custom untuk sekolah, komunitas, atau keluarga dengan pengalaman belajar kolaboratif langsung di Kampung Inggris Pare.",

      thumbnail: THUMBNAIL_DEFAULT,
    },
  ] satisfies Array<
    Omit<ProgramInsert, "id" | "slug" | "categoryId"> & {
      categorySlug: string;
    }
  >;

  // =====================================
  // FINAL DATA
  // =====================================

  const data: ProgramInsert[] = rawPrograms.map((program) => {
    const categoryId = categoryMap.get(generateSlug(program.categorySlug));

    if (!categoryId) {
      throw new Error(`Category not found: ${program.categorySlug}`);
    }

    return {
      ...program,

      categoryId,

      id: generateId("prog"),

      slug: generateSlug(program.title),
    };
  });

  // =====================================
  // INSERT
  // =====================================

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
          "base_price",
          "original_price",
          "price_tiers",
          "badge",
          "highlight",
          "tags",
          "icon",
          "thumbnail",
          "duration",
          "level",
          "format",
          "status",
        ]),

        updatedAt: new Date(),
      },
    });
}
export async function seedProgramBatches() {
  console.log("3. Seeding Program Batches...");
  const DEFAULT_VIP_KIDS = generateSlug("VIP English for Kids");
  const DEFAULT_PRIVATE_CLASS = generateSlug("Private Class");
  const DEFAULT_SPEAKING_CHALLENGE = generateSlug("Speaking Challenge");
  const DEFAULT_DAILY_CONVERSATION = generateSlug("Daily Conversation");
  const DEFAULT_ENGLISH_FOR_KIDS = generateSlug("English for Kids");
  const DEFAULT_PRIVATE_CLASS_KIDS = generateSlug("Private Class for Kids");
  await db.delete(programBatches);
  const programList = await db.select().from(programs);

  const programMap = new Map(
    programList.map((program) => [program.slug, program.id]),
  );

  function getProgramId(slug: string) {
    const id = programMap.get(slug);

    if (!id) {
      throw new Error(`Program '${slug}' not found`);
    }

    return id;
  }

  const rawBatches = [
    {
      programSlug: DEFAULT_SPEAKING_CHALLENGE,

      title: "Speaking Challenge",
      isUnlimited: true,

      mode: "online",
      status: "open",
      isOpen: true,
      originalPrice: 49000,
      price: 49000,

      type: "package",
      primaryCta: {
        href: `register?category=lead&program=${generateSlug("Speaking Challenge")}&batch=${generateSlug("Speaking Challenge")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Speaking Challenge",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Speaking Challenge*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_DAILY_CONVERSATION,

      title: "Daily Conversation Batch Mei 2026",
      isUnlimited: false,

      mode: "online",
      type: "scheduled",

      status: "open",
      isOpen: true,
      originalPrice: 449000,
      price: 249000,

      primaryCta: {
        href: `register?category=online&program=${generateSlug("Daily Conversation")}&batch=${generateSlug("Daily Conversation Batch Mei 2026")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Daily Conversation Batch Mei 2026",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Daily Conversation Batch Mei 2026*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_ENGLISH_FOR_KIDS,

      title: "English for Kids Batch Mei 2026",
      isUnlimited: false,

      mode: "online",
      type: "scheduled",

      status: "open",
      isOpen: true,
      originalPrice: 549000,
      price: 349000,

      primaryCta: {
        href: `register?category=online&program=${generateSlug("English for Kids")}&batch=${generateSlug("English for Kids Batch Mei 2026")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "English for Kids Batch Mei 2026",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *English for Kids Batch Mei 2026*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS_KIDS,

      title: "Private Class for Kids 10x Meeting",
      isUnlimited: true,

      mode: "online",
      type: "package",

      status: "open",
      isOpen: true,
      originalPrice: 1199000,
      price: 1199000,

      primaryCta: {
        href: `register?category=online&program=${generateSlug("Private Class for Kids")}&program=${generateSlug("Private Class for Kids 10x Meeting")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class for Kids 10x Meeting",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class for Kids 10x Meeting*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS_KIDS,

      title: "Private Class for Kids 20x Meeting",
      isUnlimited: true,

      mode: "online",
      type: "package",

      status: "open",
      isOpen: true,
      originalPrice: 2199000,
      price: 2199000,

      primaryCta: {
        href: `register?category=online&program=${generateSlug("Private Class for Kids")}&program=${generateSlug("Private Class for Kids 20x Meeting")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class for Kids 20x Meeting",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class for Kids 20x Meeting*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS_KIDS,

      title: "Private Class for Kids 30x Meeting",
      isUnlimited: true,

      mode: "online",
      type: "package",

      status: "open",
      isOpen: true,
      originalPrice: 3199000,
      price: 3199000,

      primaryCta: {
        href: `register?category=online&program=${generateSlug("Private Class for Kids")}&program=${generateSlug("Private Class for Kids 30x Meeting")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class for Kids 30x Meeting",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class for Kids 30x Meeting*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },

    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Exclusive 10x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 1399000,
      price: 1399000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Exclusive 10x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Exclusive 10x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Exclusive 10x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Exclusive 20x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 2499000,
      price: 2499000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Exclusive 20x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Exclusive 20x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Exclusive 20x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Exclusive 30x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 3799000,
      price: 3799000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Exclusive 30x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Exclusive 30x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Exclusive 30x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Intensive 5x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 499000,
      price: 499000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Intensive 5x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Intensive 5x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Intensive 5x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Intensive 10x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 799000,
      price: 799000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Intensive 10x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Intensive 10x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Intensive 10x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_PRIVATE_CLASS,

      title: "Private Class Intensive 15x",
      isUnlimited: true,

      mode: "online",

      status: "open",
      isOpen: true,
      originalPrice: 1099000,
      price: 1099000,

      type: "package",
      primaryCta: {
        href: `register?category=online&program=private-class&batch=${generateSlug("Private Class Intensive 15x")}`,
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "Private Class Intensive 15x",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *Private Class Intensive 15x*.
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },
    {
      programSlug: DEFAULT_VIP_KIDS,

      title: "VIP Camp - June 2026 Batch 1",
      isUnlimited: false,

      startDate: new Date("2026-06-21"),
      endDate: new Date("2026-06-27"),

      mode: "offline",

      location: "Kampung Inggris Pare, Kediri",

      status: "open",
      isOpen: true,

      materials: [
        {
          type: "brochure",
          label: "Brosur",
          url: "/pdf/brochure/vip-kids/vip-kids-june-july-2026.pdf",
        },
      ],
      primaryCta: {
        href: "https://forms.gle/zGnAkSHjbKLcTVoe8",
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "VIP Kids English Camp",
          duration: "21 – 27 Juni 2026",
          intent: "consultation",
          message: `
        Halo Inggris Go! 👋
        
        Saya tertarik dengan program *VIP Kids English Camp Batch 1*.
        
        - Jadwal: 21 – 27 Juni 2026
        
        Saya ingin konsultasi terlebih dahulu sebelum mendaftar.
        
        Mohon dibantu ya 😊
        `,
        }),
        label: "Konsultasi",
        icon: "message-circle",
      },
    },

    {
      programSlug: DEFAULT_VIP_KIDS,

      title: "VIP Camp - June 2026 Batch 2",
      isUnlimited: false,
      type: "scheduled",

      startDate: new Date("2026-06-28"),
      endDate: new Date("2026-07-04"),

      mode: "offline",

      location: "Kampung Inggris Pare, Kediri",

      status: "open",
      isOpen: true,
      materials: [
        {
          label: "Brosur",
          type: "brochure",
          url: "/pdf/brochure/vip-kids/vip-kids-june-july-2026.pdf",
        },
      ],
      primaryCta: {
        href: "https://forms.gle/zGnAkSHjbKLcTVoe8",
        label: "Daftar",
        icon: "arrow-right",
      },
      secondaryCta: {
        href: buildWhatsAppUrl({
          title: "VIP Kids English Camp",
          duration: "28 Juni - 4 Juli 2026",
          intent: "consultation",
          message: `
Halo Inggris Go! 👋

Saya tertarik dengan program *VIP Kids English Camp Batch 2*.

- Jadwal: 28 Juni - 4 Juli 2026

Saya ingin konsultasi terlebih dahulu sebelum mendaftar.

Mohon dibantu ya 😊
`,
        }),
        label: "konsultasi",
        icon: "message-circle",
      },
    },

    {
      programSlug: DEFAULT_VIP_KIDS,
      isUnlimited: false,
      type: "scheduled",

      title: "VIP Camp 2 Weeks - July 2026 Batch 1",

      startDate: new Date("2026-07-21"),
      endDate: new Date("2026-07-04"),

      mode: "offline",
      location: "Kampung Inggris Pare, Kediri",
      status: "open",
      isOpen: true,
      materials: [
        {
          label: "Brosur",
          type: "brochure",
          url: "/pdf/brochure/vip-kids/vip-kids-june-july-2026.pdf",
        },
      ],
      primaryCta: {
        label: "Daftar",
        href: "https://forms.gle/zGnAkSHjbKLcTVoe8",
        icon: "arrow-right",
      },
      secondaryCta: {
        label: "Konsultasi",
        href: buildWhatsAppUrl({
          title: "VIP Kids English Camp",
          duration: "21 Juni – 4 Juli 2026",
          intent: "consultation",
          message: `
Halo Inggris Go! 👋

Saya tertarik dengan program *VIP Kids English Camp 2 Weeks*.

- Jadwal: 21 Juni – 4 Juli 2026

Saya ingin konsultasi terlebih dahulu sebelum mendaftar.

Mohon dibantu ya 😊
`,
        }),
        icon: "message-circle",
      },
    },
  ] satisfies Array<
    Omit<BatchInsert, "id" | "slug" | "programId"> & {
      programSlug: string;
    }
  >;

  const data: BatchInsert[] = rawBatches.map(({ programSlug, ...batch }) => ({
    ...batch,

    id: generateId("prog-batch"),

    slug: generateSlug(batch.title),

    programId: getProgramId(programSlug),
  }));

  await db
    .insert(programBatches)
    .values(data)
    .onConflictDoUpdate({
      target: programBatches.slug,

      set: {
        ...excludedColumns([
          "teacher_id",
          "program_id",
          "title",
          "start_date",
          "end_date",
          "capacity",
          "mode",
          "location",
          "meeting_days",
          "meeting_time",
          "status",
        ]),

        updatedAt: new Date(),
      },
    });
}
