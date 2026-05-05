import { db } from "@/app/db/db";
import { programs } from "../schema/programs";

type ProgramInsert = typeof programs.$inferInsert;
export async function seedPrograms() {
  console.log("2. Seeding Programs...");

  const THUMBNAIL_DEFAULT = "/images/categories/online-hero.png";

  const data: ProgramInsert[] = [
    {
      id: "prog-speaking-challenge",
      title: "Speaking Challenge",
      slug: "speaking-challenge",
      description:
        "Program 14 hari via WhatsApp untuk kamu yang ngerti bahasa Inggris tapi masih belum bisa ngomong. Fokus latihan speaking setiap hari dengan feedback langsung.",
      categoryId: "cat-lead",

      originalPrice: 49000,
      basePrice: 49000,
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
      id: "prog-daily-conversation",
      title: "Daily Conversation",
      slug: "daily-conversation",
      description:
        "Program intensif 2 minggu untuk kamu yang masih suka ngeblank saat diajak ngomong bahasa Inggris. Fokus full praktik speaking, bukan teori.",
      categoryId: "cat-online",

      originalPrice: 449000,
      basePrice: 249000,
      badge: "Terlaris",
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
      id: "prog-english-for-kids",
      title: "English for Kids",
      slug: "english-for-kids",
      description:
        "Kelas bahasa Inggris online yang menyenangkan untuk anak usia 6–12 tahun. Fokus membangun kepercayaan diri, kosakata, dan kemampuan komunikasi sehari-hari.",
      categoryId: "cat-online",

      originalPrice: 349000,
      basePrice: 349000,
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
      id: "prog-private-class",
      title: "Private Class",
      slug: "private-class",
      description:
        "Kelas private 1-on-1 dengan jadwal fleksibel dan materi 100% disesuaikan. Cocok untuk kamu yang ingin belajar lebih fokus dan progress lebih cepat.",

      categoryId: "cat-online",
      priceTiers: [
        { label: "Exclusive 10x", price: "Rp 1.399.000" },
        { label: "Exclusive 20x", price: "Rp 2.499.000" },
        { label: "Exclusive 30x", price: "Rp 3.799.000" },
        { label: "Intensive 5x", price: "Rp 499.000" },
        { label: "Intensive 10x", price: "Rp 799.000" },
        { label: "Intensive 15x", price: "Rp 1.099.000" },
      ],
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
      id: "prog-private-class-kids",
      title: "Private Class for Kids",
      slug: "private-class-kids",
      description:
        "Kelas private 1-on-1 untuk anak usia 4+ dengan tutor berpengalaman. Jadwal fleksibel, materi fun & interaktif, dan fokus membangun kepercayaan diri sejak dini.",

      categoryId: "cat-online",
      priceTiers: [
        { label: "10x Meeting", price: "Rp 1.199.000" },
        { label: "20x Meeting", price: "Rp 2.199.000" },
        { label: "30x Meeting", price: "Rp 3.199.000" },
      ],
      badge: "Favorit Orang Tua",

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
      id: "prog-vip-kids",
      title: "VIP English for Kids",
      slug: "vip-kids",
      description:
        "Program liburan intensif eksklusif khusus anak-anak langsung di Kampung Inggris Pare. Penuh aktivitas seru, speaking practice, permainan edukatif, dan teman baru dari seluruh Indonesia.",
      badge: "Full Immersion",

      categoryId: "cat-offline",
      originalPrice: 1250000,
      basePrice: 1250000,

      highlight:
        "Lingkungan English-speaking 24 jam selama program berlangsung",
      tags: ["Offline", "Anak-anak", "Kampung Inggris", "Intensif"],
      icon: "tent",
      order: 0,

      format: "offline",
      level: "beginner",
      status: "published",
      shortDesc:
        "Program liburan seru di Kampung Inggris dengan full aktivitas Bahasa Inggris & pengalaman belajar 24 jam",
      thumbnail: THUMBNAIL_DEFAULT,
    },
    {
      id: "prog-rombongan",
      title: "Kelas Rombongan",
      slug: "rombongan",
      description:
        "Bawa kelompokmu — kelas, komunitas, atau keluarga besar — ke Kampung Inggris. Program dirancang khusus untuk grup dengan aktivitas kolaboratif yang intens dan menyenangkan.",
      badge: "Program Kustom",

      categoryId: "cat-offline",

      highlight: "Kuota terbatas — cocok untuk sekolah, kampus & komunitas",
      tags: ["Offline", "Grup", "Custom", "Kampung Inggris"],
      icon: "handshake",
      order: 1,

      format: "offline",
      level: "beginner",
      status: "published",
      shortDesc:
        "Program khusus grup ke Kampung Inggris dengan materi fleksibel & aktivitas kolaboratif",
      thumbnail: THUMBNAIL_DEFAULT,
    },
  ];
  await db.insert(programs).values(data);
}
