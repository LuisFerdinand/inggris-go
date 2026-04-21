import { SOCIAL_PROOF } from "@/constants";
import { buildWhatsAppUrl } from "@/lib/config";

export type PriceTier = { label: string; price: string };

type ComparisonItem = {
  label: string;
  value: string;
};

type PainPoint = {
  title: string;
  description: string;
  icon?: string;
};

type Step = {
  n?: string;
  title: string;
  description: string;
  icon?: string;
};

type ExperienceItem = {
  title: string;
  description: string;
  icon?: string;
};

type SocialProof = {
  quote: string;
  name?: string;
  role?: string;
  meta?: string;
};

type CategoryCTA = {
  title: string;
  titleAccent?: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};
type HeroCTA = {
  label: string;
  href?: string;
  icon?: string;
};

type Tag = {
  title: string;
  icon?: string;
};

export type ProgramMeta = {
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;

  price: string;
  priceTiers?: PriceTier[];

  badge?: string;
  highlight?: string;
  tags: string[];
  icon: string;

  href: string;

  benefits?: Benefit[];
  duration?: string;
  format?: string;
  level?: string;
};

export type CategoryMeta = {
  key: string;
  label: string;
  shortLabel?: string;
  href: string;

  icon?: string;
  heroImage?: string;

  /** Single source-of-truth primary color — feed into generateTheme() */
  theme: {
    primary: string;
  };

  quickDecisionLabel: string;
  quickDecisionDesc: string;

  tagline: string;
  taglineAccent?: string;
  description: string;
  forWho: string;

  programs: ProgramMeta[];

  painPoints?: PainPoint[];
  benefits?: Benefit[];
  steps?: Step[];
  experience?: ExperienceItem[];
  comparison?: ComparisonItem[];
  socialProof?: SocialProof[];
  cta: CategoryCTA;

  emptyState?: {
    title: string;
    description: string;
  };
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  lead: {
    key: "lead",
    label: "Starter Program",
    shortLabel: "Starter",
    href: "/programs/lead",

    icon: "zap",
    heroImage: "/images/categories/lead-hero.png",
    theme: { primary: "#ff6b35" },

    tagline: "Mulai ngomong Bahasa Inggris",
    taglineAccent: "tanpa takut salah",

    description:
      "Program ringan untuk kamu yang ingin mulai belajar Bahasa Inggris tanpa tekanan. Cocok untuk pemula yang ingin coba dulu sebelum komitmen lebih besar.",
    forWho: "Pemula, orang sibuk, atau kamu yang masih ragu untuk mulai",

    quickDecisionLabel: "Saya tidak punya banyak waktu",
    quickDecisionDesc: "Mulai dengan komitmen ringan, hasil nyata",

    programs: [
      {
        title: "Speaking Challenge",
        slug: "speaking-challenge",
        description:
          "Program 7 hari via WhatsApp yang dirancang untuk membantu kamu mulai berbicara Bahasa Inggris tanpa rasa takut. Tidak ada jadwal kelas — belajar sepenuhnya sesuai ritme kamu.",
        price: "Rp 49.000",
        badge: "Paling Populer",
        highlight: "Mulai dari nol, tanpa tekanan, tanpa jadwal kaku",
        tags: ["Self-paced", "2 Minggu", "Online", "Pemula"],
        icon: "target",
        href: "/programs/lead/speaking-challenge",
        benefits: [
          {
            title: "Latihan langsung",
            description: "Fokus ke speaking, bukan teori",
            icon: "mic",
          },
          {
            title: "Fleksibel penuh",
            description: "Belajar kapan saja sesuai waktu kamu",
            icon: "clock",
          },
          {
            title: "Mulai dari nol",
            description: "Tidak perlu pengalaman sebelumnya",
            icon: "sprout",
          },
        ],
        duration: "7 hari",
        format: "Self-paced",
        level: "Pemula",
      },
    ],

    painPoints: [
      {
        title: "Takut salah ngomong",
        description:
          "Selalu berpikir panjang tentang grammar sebelum berani membuka mulut",
        icon: "alert-circle",
      },
      {
        title: "Kurang percaya diri",
        description: "Takut dinilai atau ditertawakan ketika mencoba berbicara",
        icon: "users",
      },
      {
        title: "Tidak punya waktu",
        description:
          "Jadwal padat membuat kelas rutin terasa mustahil untuk diikuti",
        icon: "clock",
      },
    ],

    benefits: [
      {
        title: "Tanpa tekanan",
        description:
          "Belajar santai tanpa jadwal kaku, tanpa paksaan, tanpa nilai",
        icon: "smile",
      },
      {
        title: "Langsung praktik",
        description: "Fokus ke speaking dan percakapan nyata, bukan teori",
        icon: "mic",
      },
      {
        title: "Aman untuk pemula",
        description:
          "Dirancang dari nol — kamu tidak perlu tahu apa-apa untuk mulai",
        icon: "shield",
      },
    ],

    steps: [
      {
        n: "01",
        title: "Daftar",
        description: "Akses langsung setelah pembayaran selesai",
      },
      {
        n: "02",
        title: "Ikuti Challenge",
        description: "Latihan speaking ringan setiap hari via WhatsApp",
      },
      {
        n: "03",
        title: "Naik Percaya Diri",
        description: "Dalam 7 hari mulai berani bicara tanpa rasa takut",
      },
    ],

    socialProof: [
      {
        quote:
          "Baru 3 hari ikut, sudah mulai berani ngomong! Ternyata kuncinya cuma butuh lingkungan yang supportif.",
        name: "Aulia",
        role: "Mahasiswi",
      },
      {
        quote:
          "Akhirnya nemu cara belajar yang nggak bikin stres. Cocok banget buat aku yang super sibuk.",
        name: "Rizky",
        role: "Karyawan Swasta",
      },
      {
        quote:
          "Harganya terjangkau banget tapi hasilnya luar biasa. Sekarang aku nggak grogi lagi kalau harus ngomong Inggris.",
        name: "Fajar",
        role: "Fresh Graduate",
      },
    ],

    cta: {
      title: "Mulai sekarang,",
      titleAccent: "tanpa takut salah",
      description:
        "Tidak perlu menunggu sampai siap. Mulai dari langkah kecil yang tepat hari ini.",
      primaryLabel: "Mulai Speaking Challenge",
      primaryHref: "/programs/lead/speaking-challenge",
      secondaryLabel: "Tanya Admin Dulu",
      secondaryHref: "/contact",
    },
  },

  online: {
    key: "online",
    label: "Program Online",
    shortLabel: "Online",
    href: "/programs/online",

    icon: "book-open",

    heroImage: "/images/categories/online-hero.png",
    theme: { primary: "#4da3ff" },

    quickDecisionLabel: "Saya ingin progress yang jelas",
    quickDecisionDesc: "Belajar terstruktur dengan mentor berpengalaman",

    tagline: "Kelas Zoom terstruktur —",
    taglineAccent: "mentor nyata, hasil terukur",
    description:
      "Program online kami dirancang untuk kamu yang ingin berkembang secara konsisten dengan jadwal tetap, mentor berpengalaman, dan komunitas yang suportif — semua dari kenyamanan rumahmu.",
    forWho:
      "Kamu yang ingin belajar terstruktur dari rumah dengan bimbingan mentor nyata",

    programs: [
      {
        title: "Daily Conversation",
        slug: "daily-conversation",
        description:
          "Latihan percakapan sehari-hari via Zoom selama 2 minggu. Fokus pada kelancaran bicara, kepercayaan diri, dan kosakata praktis.",
        href: "/programs/online/daily-conversation",
        price: "Rp 299.000",
        badge: "Terlaris",
        highlight: "10 sesi intensif, Senin–Jumat jam 19.00 WIB",
        tags: ["Zoom", "10x Pertemuan", "Senin–Jumat", "Speaking"],
        icon: "message-circle",
        format: "Zoom",
      },
      {
        title: "English for Kids",
        slug: "english-for-kids",
        description:
          "Kelas Bahasa Inggris yang menyenangkan dan interaktif khusus untuk anak-anak usia 6–12 tahun. Metode bermain sambil belajar.",
        price: "Rp 349.000",
        badge: "Disukai Anak",
        highlight: "Belajar lewat game, lagu, dan cerita interaktif",
        tags: ["Anak-anak", "Interaktif", "Menyenangkan", "Zoom"],
        icon: "star",
        href: "/programs/online/english-for-kids",
      },
      {
        title: "Basic TOEFL",
        slug: "basic-toefl",
        description:
          "Persiapan TOEFL dari dasar via Zoom. Setiap sesi fokus pada strategi dan latihan soal nyata.",
        price: "Rp 399.000",
        badge: "Bonus 2x TOEFL Test",
        highlight: "Free 2x simulasi TOEFL penuh (awal & akhir program)",
        tags: ["Zoom", "10x Pertemuan", "Jam 20.00", "TOEFL"],
        icon: "bar-chart",
        href: "/programs/online/basic-toefl",
      },
      {
        title: "Grammar for Speaking",
        slug: "grammar-for-speaking",
        description:
          "Grammar yang dipelajari bukan untuk ujian — melainkan langsung diterapkan dalam percakapan nyata.",
        price: "Rp 299.000",
        highlight: "Grammar yang langsung kamu pakai saat ngobrol",
        tags: ["Zoom", "10x Pertemuan", "Praktis", "Grammar"],
        icon: "pen-line",
        href: "/programs/online/grammar-for-speaking",
      },
      {
        title: "Private Class",
        slug: "private-class",
        price: "Rp 499.000",
        href: "/programs/online/private-class",
        description:
          "Kelas 1-on-1 eksklusif dengan mentor berdedikasi. Jadwal sepenuhnya fleksibel, materi disesuaikan 100% dengan kebutuhan kamu.",
        priceTiers: [
          { label: "Exclusive 5x", price: "Rp 699.000" },
          { label: "Exclusive 8x", price: "Rp 999.000" },
          { label: "Exclusive 10x", price: "Rp 1.199.000" },
          { label: "Intensive 5x", price: "Rp 499.000" },
          { label: "Intensive 10x", price: "Rp 799.000" },
        ],
        badge: "Paling Fleksibel",
        highlight: "Jadwal & materi 100% disesuaikan khusus untukmu",
        tags: ["1-on-1", "Jadwal Bebas", "Custom Materi", "Zoom"],
        icon: "user",
      },
    ],

    benefits: [
      {
        title: "Live Interaction",
        description:
          "Berlatih langsung dengan mentor, bukan rekaman. Koreksi real-time membuat progress lebih cepat.",
        icon: "video",
      },
      {
        title: "Kurikulum Jelas",
        description:
          "Setiap sesi punya tujuan terstruktur. Kamu selalu tahu posisi dan progress-mu.",
        icon: "layout",
      },
      {
        title: "Komunitas Suportif",
        description:
          "Belajar bersama teman-teman yang punya tujuan sama. Lebih seru, lebih semangat.",
        icon: "users",
      },
    ],

    steps: [
      {
        title: "Pilih Program",
        description: "Pilih kelas yang sesuai dengan level dan tujuanmu",
      },
      {
        title: "Join Zoom",
        description: "Ikuti kelas sesuai jadwal yang sudah ditentukan",
      },
      {
        title: "Praktik & Feedback",
        description:
          "Latihan langsung dan dapatkan koreksi dari mentor di setiap sesi",
      },
    ],

    comparison: [
      { label: "Format", value: "Live via Zoom" },
      { label: "Durasi", value: "2 minggu (10 sesi)" },
      { label: "Jadwal", value: "Senin – Jumat" },
      { label: "Mentor", value: "Berpengalaman & terlatih" },
      { label: "Sertifikat", value: "Tersedia" },
    ],

    socialProof: [
      {
        quote:
          "Mentor-nya sabar banget, nggak pernah bikin aku malu kalau salah. Sekarang udah berani presentasi di depan tim kantor!",
        name: "Sari",
        role: "Staff Administrasi",
      },
      {
        quote:
          "Dalam 2 minggu Daily Conversation, vocabulary dan kelancaran ngomong aku meningkat drastis. Nggak nyangka bisa secepat ini.",
        name: "Budi",
        role: "Mahasiswa S2",
      },
      {
        quote:
          "Kelas Basic TOEFL-nya sangat strategis. Skor aku naik 40 poin setelah ikut program ini.",
        name: "Maya",
        role: "Pelamar Beasiswa LPDP",
      },
      {
        quote:
          "Private class-nya luar biasa fleksibel. Bisa jadwal ulang kapan saja, materi pun disesuaikan penuh sama kebutuhan pekerjaan aku.",
        name: "Hendra",
        role: "Manajer Pemasaran",
      },
    ],

    cta: {
      title: "Masih bingung pilih kelas?",
      description:
        "Kami bantu rekomendasikan program yang paling pas untuk level dan tujuanmu. Gratis, tanpa tekanan.",
      primaryLabel: "Lihat Semua Program Online",
      primaryHref: "#program-list",
      secondaryLabel: "Konsultasi Gratis",
      secondaryHref: buildWhatsAppUrl({
        title: "Konsultasi",
        intent: "consultation",
      }),
    },
  },

  offline: {
    key: "offline",
    label: "Program Offline",
    shortLabel: "Offline",
    heroImage: "/images/categories/offline-hero.png",
    href: "/programs/offline",

    icon: "tent",
    theme: { primary: "#f7b500" },

    quickDecisionLabel: "Saya ingin perubahan cepat",
    quickDecisionDesc: "Immersive full di Kampung Inggris Pare",

    tagline: "Belajar langsung di Pare —",
    taglineAccent: "pengalaman yang tak terlupakan",
    description:
      "Rasakan pengalaman belajar Bahasa Inggris secara intensif dan penuh immersion langsung di Kampung Inggris Pare. Bukan sekadar kursus biasa — ini adalah petualangan yang mengubah cara kamu berbicara.",
    forWho:
      "Kamu yang ingin perubahan drastis dan siap belajar full-immersion di lingkungan English-only",

    programs: [
      {
        title: "VIP English for Kids",
        slug: "vip-kids",
        price: "Rp 1.250.000",
        description:
          "Program liburan intensif eksklusif khusus anak-anak langsung di Kampung Inggris Pare. Penuh aktivitas seru, speaking practice, permainan edukatif, dan teman baru dari seluruh Indonesia.",
        badge: "Full Immersion",
        highlight:
          "Lingkungan English-speaking 24 jam selama program berlangsung",
        tags: ["Offline", "Anak-anak", "Kampung Inggris", "Intensif"],
        icon: "tent",
        href: "/programs/offline/vip-kids",
        benefits: [
          {
            title: "Immersive 24 Jam",
            description: "Setiap aktivitas menggunakan Bahasa Inggris",
            icon: "globe",
          },
          {
            title: "Teman Baru",
            description: "Bergaul dengan anak-anak dari seluruh Indonesia",
            icon: "users",
          },
          {
            title: "Fun Activities",
            description: "Game, cerita, dan aktivitas seru setiap hari",
            icon: "star",
          },
        ],
      },
      {
        title: "Kelas Rombongan",
        slug: "rombongan",
        price: "Hubungi Admin",
        description:
          "Bawa kelompokmu — kelas, komunitas, atau keluarga besar — ke Kampung Inggris. Program dirancang khusus untuk grup dengan aktivitas kolaboratif yang intens dan menyenangkan.",
        badge: "Group Program",
        highlight: "Kuota terbatas — cocok untuk sekolah, kampus & komunitas",
        tags: ["Offline", "Grup", "Custom", "Kampung Inggris"],
        icon: "handshake",
        href: "/programs/offline/rombongan",
      },
    ],

    experience: [
      {
        title: "English Area 24 Jam",
        description:
          "Seluruh area dideklarasikan sebagai zona Bahasa Inggris. Kamu dipaksa terbiasa secara alami.",
        icon: "globe",
      },
      {
        title: "Daily Speaking Activities",
        description:
          "Game, debate, storytelling, dan role play setiap hari untuk melatih fluency.",
        icon: "flame",
      },
      {
        title: "Teman dari Seluruh Indonesia",
        description:
          "Belajar bersama teman-teman baru dengan background beragam dari seluruh nusantara.",
        icon: "users",
      },
    ],

    benefits: [
      {
        title: "Progress Kilat",
        description:
          "1 minggu full immersion setara berbulan-bulan belajar konvensional",
        icon: "trending-up",
      },
      {
        title: "Lingkungan Suportif",
        description:
          "Semua orang di sana punya tujuan yang sama — tidak ada yang akan menghakimi",
        icon: "users",
      },
      {
        title: "Full Immersion 24/7",
        description:
          "Bahasa Inggris bukan hanya di kelas — tapi di setiap momen sepanjang hari",
        icon: "globe",
      },
    ],

    comparison: [
      { label: "Format", value: "Offline di Pare, Kediri" },
      { label: "Durasi", value: "Intensif (1–2 minggu)" },
      { label: "Level", value: "Semua level diterima" },
      { label: "Peserta", value: "Anak-anak & Grup" },
      { label: "Fasilitas", value: "Akomodasi termasuk" },
    ],

    socialProof: [
      {
        quote:
          "Seminggu di Pare rasanya beda banget. Sekarang aku nggak takut lagi kalau harus ngomong sama orang asing di mana pun.",
        name: "Rina",
        role: "Pelajar SMA",
      },
      {
        quote:
          "Anakku yang pemalu banget tiba-tiba berani ngomong English ke semua orang setelah camp ini. Transformasinya nyata!",
        name: "Pak Agus",
        role: "Orang tua peserta",
      },
      {
        quote:
          "Investasi terbaik yang pernah aku lakukan. Lingkungannya yang bikin kamu tidak punya pilihan selain pakai English.",
        name: "Tono",
        role: "Mahasiswa Semester 5",
      },
    ],

    cta: {
      title: "Siap merasakan",
      titleAccent: "pengalaman belajar berbeda?",
      description:
        "Gabung program camp di Kampung Inggris Pare dan rasakan sendiri perubahan drastis dalam fluency-mu.",
      primaryLabel: "Lihat Program Camp",
      primaryHref: "#program-list",
      secondaryLabel: "Tanya Admin",
      secondaryHref: "/contact",
    },
  },
};

type ProgramCTA = {
  title: string;
  titleAccent?: string;
  subtitle?: string;

  highlight?: string; // key sentence (pain/reframe)

  cta: {
    label: string;
    href: string;
    note?: string;
  };

  urgency?: string;
};

type ProgramSectionType =
  | "hero"
  | "why"
  | "fit"
  | "steps"
  | "benefits"
  | "timeline"
  | "gallery"
  | "pricing"
  | "faq"
  | "testimonials"
  | "classes"
  | "cta";

type MetaData = {
  title: string;
  description?: string;
  icon?: string;
};
type Benefit = {
  title: string;
  description?: string;
  icon: string;
};
type Bonus = {
  title: string;
  description?: string;
  highlight?: string;
  icon: string;
};

type BaseSection = {
  id: string;
  type: ProgramSectionType;
  visible?: boolean;

  theme?: {
    variant?: "light" | "dark" | "primary" | "accent";
    background?: string;
  };
};

export type HeroContent = {
  label: string;
  tagline: string;
  taglineAccent?: string;
  description?: string;
  subtitle: string;
  highlight?: string;
  tags?: Tag[];
  cta: HeroCTA[];
  socialProof?: { text: string; count?: string };
  image?: string;
};

type HeroSection = BaseSection & {
  type: "hero";
  content: HeroContent;
};

type WhySection = BaseSection & {
  type: "why";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Benefit[];
  };
};

type ClassItem = {
  title: string;
  description?: string;

  highlight?: string; // date, age, label
  icon?: string;

  meta?: {
    label: string; // e.g. "Usia", "Jadwal", "Durasi"
    value: string;
  }[];

  tag?: string; // e.g. "Recommended", "Popular"
};

type ClassesSection = BaseSection & {
  type: "classes";
  content: {
    title: string;
    subtitle?: string;

    tagline?: string;
    taglineAccent?: string;

    layout?: "grid" | "timeline" | "card"; // optional UI control

    items: ClassItem[];
  };
};

type StepsSection = BaseSection & {
  type: "steps";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Step[];
  };
};

type PricingPackage = {
  label: string; // e.g. "5x Pertemuan"
  price: string;
  originalPrice?: string;
  highlight?: string; // e.g. "Paling Populer"
  note?: string;
};

type PricingGroup = {
  title: string; // "Exclusive" | "Intensive"
  subtitle?: string; // "Flexible & Personal"
  icon?: string; // 💎 or ⚡

  features: string[];
  packages: PricingPackage[];
};

type PricingSection = BaseSection & {
  type: "pricing";
  content: {
    globalNote?: string;
    title?: string;
    description?: string;

    groups: PricingGroup[];

    bonus?: Bonus[]; // 👈 MOVE BONUS HERE

    urgency?: string; // limited slots
  };
};

type FAQSection = BaseSection & {
  type: "faq";
  content: {
    q: string;
    a: string;
  }[];
};

type CTASection = BaseSection & {
  type: "cta";
  content: ProgramCTA;
};

type BenefitsSection = BaseSection & {
  type: "benefits";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Benefit[];
  };
};

type TimelineDay = {
  range: string;
  title: string;
  highlight?: boolean;
};

type TimelineWeek = {
  icon: string;
  week: string;
  title: string;
  points?: string[];
  days?: TimelineDay[];
};

type TimelineSection = BaseSection & {
  type: "timeline";
  content: {
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    title: string;
    subtitle?: string;
    meta?: Benefit[];
    weeks: TimelineWeek[];
  };
};

type GallerySection = BaseSection & {
  type: "gallery";
  content: {
    title?: string;
    images: string[];
  };
};

type BonusSection = BaseSection & {
  type: "bonus";
  content: {
    title?: string;

    items: Bonus[];
  };
};

type TestimonialSection = BaseSection & {
  type: "testimonials";
  content: {
    title?: string;
    items: SocialProof[];
  };
};

export type ProgramSection =
  | HeroSection
  | WhySection
  | StepsSection
  | BenefitsSection
  | TimelineSection
  | ClassesSection
  | GallerySection
  | PricingSection
  | BonusSection
  | FAQSection
  | TestimonialSection
  | CTASection;

type ProgramBatch = {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  status: "open" | "full" | "coming_soon" | "closed";
  isOpen: boolean;
  capacity?: number;
  enrolled?: number;
  ctaLabel?: string;
  ctaHref?: string;
};

export type ProgramDetail = {
  slug: string;

  theme?: {
    primary?: string;
    accent?: string;
    background?: string;
  };
  hasBatch?: boolean;
  batches?: ProgramBatch[];

  sections: ProgramSection[];
};

export const PROGRAM_DETAILS: Record<string, ProgramDetail> = {
  "speaking-challenge": {
    slug: "speaking-challenge",
    theme: { primary: "#ff6b35" },
    hasBatch: false,

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Kuota terbatas – kelas cepat penuh",
          tagline: "Masih Takut Ngomong",
          taglineAccent: "Bahasa Inggris?",
          description:
            "Mulai dari nol, latihan speaking setiap hari hanya lewat WhatsApp. Tanpa Zoom. Tanpa ribet.",
          subtitle: "Belajar speaking tanpa tekanan, dari rumah",

          tags: [
            { title: "2 Minggu Program", icon: "calendar" },
            { title: "Cocok untuk Pemula", icon: "target" },
            { title: "Via WhatsApp", icon: "smartphone" },
          ],

          socialProof: {
            text: "Peserta aktif bulan ini",
            count: "247+",
          },

          cta: [
            {
              label: "Daftar Sekarang – Cuma 49K",
              href: buildWhatsAppUrl({
                title: "Speaking Challenge",
                price: "Rp 49.000",
                duration: "2 minggu",
                format: "WhatsApp",
              }),
              icon: "message-circle",
            },
          ],
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Cocok Buat Kamu",
          icon: "square-check-big",
          tagline: "Kenapa Program Ini",
          taglineAccent: "Cocok untuk Pemula?",
          items: [
            {
              title: "Dari Nol",
              description:
                "Dirancang khusus untuk yang mulai dari nol, belajar speaking bahasa Inggris dari nol",
              icon: "target",
            },
            {
              title: "Tanpa Tekanan",
              description:
                "Nggak ada kelas live yang bikin nervous. Belajar di comfort zone kamu",
              icon: "smile",
            },
            {
              title: "Fleksibel",
              description:
                "Belajar dari rumah, dari kantor, dari mana aja yang kamu mau",
              icon: "home",
            },
            {
              title: "Via WhatsApp",
              description:
                "Cukup pakai HP & WhatsApp. Nggak perlu laptop atau app tambahan",
              icon: "smartphone",
            },
          ],
        },
      },

      {
        id: "steps",
        type: "steps",
        content: {
          title: "Alur",
          icon: "recycle",
          tagline: "Cara Belajarnya",
          taglineAccent: "Simple Banget",
          items: [
            {
              n: "01",
              title: "Tutor Kirim Video",
              description:
                "Setiap hari, tutor kirim video contoh speaking yang mudah diikuti",
              icon: "video",
            },
            {
              n: "02",
              title: "Kamu Latihan",
              description: "Tiru dan latihan speaking sesuai contoh dari tutor",
              icon: "mic",
            },
            {
              n: "03",
              title: "Kirim Voice Note",
              description:
                "Rekam dan kirim voice note / video ke grup WhatsApp",
              icon: "send",
            },
            {
              n: "04",
              title: "Dapat Feedback",
              description:
                "Tutor memberikan feedback langsung untuk perbaikan kamu",
              icon: "message-circle",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Benefit",
          icon: "gift",
          tagline: "Yang Akan Kamu",
          taglineAccent: "Dapatkan",
          items: [
            {
              title: "Latihan speaking setiap hari (real practice)",
              icon: "volume-2",
            },
            {
              title: "Video contoh dari tutor berpengalaman",
              icon: "play-circle",
            },
            {
              title: "Feedback langsung dari tutor",
              icon: "message-square",
            },
            {
              title: "Materi super basic & mudah dipahami",
              icon: "book-open",
            },
            {
              title: "Belajar fleksibel tanpa Zoom",
              icon: "smartphone",
            },
            {
              title: "Lingkungan belajar yang supportive",
              icon: "heart",
            },
          ],
        },
      },

      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "Program 2 Minggu yang",
          taglineAccent: "Terarah",
          title: "Timeline",
          subtitle: "Senin – Jumat selama 2 minggu • Total 10 hari challenge",
          weeks: [
            {
              icon: "sprout",
              week: "Minggu 1",
              title: "Bangun Kepercayaan Diri",
              days: [
                {
                  range: "Day 1-2",
                  title: "Perkenalan & greeting dasar",
                },
                {
                  range: "Day 3-4",
                  title: "Cerita tentang diri sendiri",
                },
                {
                  range: "Day 5",
                  title: "Review & mini challenge",
                },
              ],
            },
            {
              icon: "target",
              week: "Minggu 2",
              title: "Makin Percaya Diri",
              days: [
                {
                  range: "Day 6-7",
                  title: "Opini & pendapat sederhana",
                },
                {
                  range: "Day 8-9",
                  title: "Percakapan sehari-hari",
                },
                {
                  range: "Day 10",
                  title: "🎉 Final challenge & celebration!",
                  highlight: true,
                },
              ],
            },
          ],
        },
      },

      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Investasi Kecil, Dampak Besar",
          description: "Mulai sekarang tanpa mikir panjang",

          groups: [
            {
              title: "Speaking Challenge",
              subtitle: "Program 2 Minggu",
              icon: "zap",

              features: [
                "10 hari challenge speaking",
                "Video contoh dari tutor",
                "Feedback langsung setiap latihan",
                "Grup WhatsApp supportif",
                "Materi step-by-step untuk pemula",
              ],

              packages: [
                {
                  label: "Full Challenge Access",
                  price: "Rp 49.000",
                  originalPrice: "Rp 250.000",
                  note: "Program Speaking Challenge 2 Minggu",
                  highlight: "Kurang dari harga 1x ngopi ☕",
                },
              ],
            },
          ],

          urgency: "Kuota terbatas – kelas cepat penuh",
        },
      },

      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah cocok untuk pemula?",
            a: "Ya, dirancang dari nol.",
          },
        ],
      },

      {
        id: "cta",
        type: "cta",
        content: {
          title: "Kalau Bukan Sekarang,",
          titleAccent: "Kapan Lagi?",
          subtitle:
            "Semakin lama kamu menunda, semakin lama kamu nggak akan mulai bisa ngomong.",

          highlight:
            "Mulai dari langkah kecil hari ini. Nggak perlu sempurna, yang penting mulai.",

          cta: {
            label: "Daftar Sekarang – Cuma 49K",
            href: buildWhatsAppUrl({
              title: "Speaking Challenge",
              price: "Rp 49.000",
              format: "WhatsApp",
            }),
            note: "Kuota terbatas setiap batch",
          },

          urgency: "Tempat terbatas • Batch cepat penuh",
        },
      },
    ],
  },
  "grammar-for-speaking": {
    slug: "grammar-for-speaking",
    theme: { primary: "#4da3ff" },
    hasBatch: true,

    batches: [
      {
        id: "batch-1",
        label: "Batch April 2026",
        startDate: "2026-04-22",
        endDate: "2026-05-03",
        schedule: "Senin – Jumat, 19.00 WIB",
        isOpen: true,
        status: "open",

        capacity: 50,
        enrolled: 32,

        ctaLabel: "Daftar Batch Ini",
        ctaHref: buildWhatsAppUrl({
          title: "Grammar for Speaking Batch 1",
          price: "Rp 299.000",
          format: "Zoom",
        }),
      },
    ],

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Batch Baru Segera Dibuka",
          tagline: "Takut Salah Grammar Saat",
          taglineAccent: "Ngomong?",
          description:
            "Belajar grammar bahasa Inggris yang langsung dipakai untuk speaking - tanpa hafalan rumus yang bikin pusing.",
          subtitle: "Kuota terbatas - kelas cepat penuh",
          // highlight: "Tanpa Grammar Ribet",
          tags: [
            { title: "10x Live Meeting", icon: "video" },
            { title: "Fokus Speaking", icon: "mic" },
            { title: "Cocok untuk Pemula", icon: "heart" },
          ],
          cta: [
            {
              label: "Perbaiki Speaking Kamu Sekarang",
              href: buildWhatsAppUrl({
                title: "Daily Conversation",
                price: "Rp 299.000",
                format: "Zoom",
              }),
              icon: "message-circle",
            },
          ],
          socialProof: {
            text: "Alumni sudah lebih pede ngomong Inggris",
            count: "200+",
          },
        },
      },
      {
        id: "why",
        type: "why",
        content: {
          title: "Kenapa Kamu Masih Ragu Ngomong?",
          tagline: "Masalah yang Sering",
          taglineAccent: "Terjadi",
          subtitle: "Masalahnya bukan kamu tidak bisa, tapi kamu tidak yakin",
          items: [
            {
              title: "Takut grammar salah",
              description:
                'Setiap mau ngomong, langsung mikir "ini bener nggak ya?"',
              icon: "alert-circle",
            },
            {
              title: "Mikir terlalu lama",
              description:
                "Mau bilang sesuatu tapi keburu lupa karena terlalu lama menyusun kalimat",
              icon: "brain",
            },
            {
              title: "Tidak yakin kalimat benar",
              description: "Selalu ragu apakah susunan kata sudah tepat",
              icon: "help-circle",
            },
            {
              title: "Akhirnya memilih diam",
              description:
                "Daripada salah, lebih baik tidak ngomong sama sekali",
              icon: "volume-x",
            },
          ],
        },
      },
      {
        id: "steps",
        type: "steps",
        content: {
          title: "Cara Kerja",
          icon: "recycle",
          tagline: "Cara Belajarnya",
          taglineAccent: "Simple & Praktis",
          subtitle: "Bukan hafalan, tapi penggunaan",
          items: [
            {
              n: "01",
              title: "Penjelasan Sederhana",
              description:
                "Materi disampaikan dengan bahasa yang mudah dipahami",
              icon: "lightbulb",
            },
            {
              n: "02",
              title: "Contoh dalam Speaking",
              description:
                "Setiap grammar langsung dikasih contoh percakapan nyata",
              icon: "message-square",
            },
            {
              n: "03",
              title: "Latihan Langsung",
              description: "Bukan nulis di kertas, tapi langsung dipraktikkan",
              icon: "repeat",
            },
            {
              n: "04",
              title: "Speaking Practice",
              description: "Ngomong pakai grammar yang baru dipelajari",
              icon: "mic",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Benefit",
          icon: "gift",
          tagline: "Perubahan yang Akan",
          taglineAccent: "Kamu Rasakan",
          items: [
            {
              title: "Lebih percaya diri saat berbicara",
              icon: "shield-check",
            },
            {
              title: "Tidak lagi takut salah",
              icon: "smile",
            },
            {
              title: "Bisa menyusun kalimat dengan benar",
              icon: "check-circle",
            },
            {
              title: "Ngomong lebih lancar",
              icon: "zap",
            },
            {
              title: "Tidak overthinking lagi",
              icon: "brain",
            },
            {
              title: "Ngomong lebih rapi & percaya diri",
              icon: "star",
            },
          ],
        },
      },
      {
        id: "fit",
        type: "benefits",
        content: {
          title: "Cocok Untuk Kamu",
          tagline: "Program Ini Cocok Untuk",
          taglineAccent: "Kamu yang...",
          icon: "target",
          items: [
            {
              title: "Sudah ikut Speaking Challenge",
              description: "Dan ingin speaking lebih terstruktur",
              icon: "trending-up",
            },
            {
              title: "Sedang belajar conversation",
              description: "Dan butuh grammar untuk lebih lancar",
              icon: "message-circle",
            },
            {
              title: "Ingin lebih percaya diri",
              description: "Berbicara dengan grammar yang benar",
              icon: "shield-check",
            },
          ],
        },
      },

      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "Program 2 Minggu",
          taglineAccent: "yang Terarah",
          title: "Timeline",
          meta: [
            {
              icon: "calendar",
              title: "10 Meeting",
              description: "Senin – Jumat, 2 minggu",
            },
            {
              icon: "clock",
              title: "60 Menit / Sesi",
              description: "Jam 19.00 WIB",
            },
            {
              icon: "video",
              title: "Live via Zoom",
              description: "Interaktif, bukan rekaman",
            },
            {
              icon: "mic",
              title: "Fokus Speaking",
              description: "Belajar grammar praktis bahasa Inggris",
            },
          ],
          weeks: [
            {
              icon: "sprout",
              week: "Minggu 1: Foundation",
              title: "Meeting 1-5 • Dasar grammar untuk speaking sehari-hari",
              points: ["Tenses Dasar", "Questions", "Practice"],
            },
            {
              icon: "target",
              week: "Minggu 2: Application",
              title: "Meeting 6-10 • Grammar langsung dipakai dalam speaking",
              points: ["Conversation", "Role Play", "Speaking"],
            },
          ],
        },
      },

      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Grammar Tidak Harus Rumit",
          description:
            "Selama ini kamu belajar grammar dengan cara yang salah...",

          groups: [
            {
              title: "Daily Conversation Program",
              subtitle: "2 Minggu Intensive",
              icon: "book",

              features: [
                "10x Live Meeting via Zoom",
                "Speaking practice setiap sesi",
                "Materi grammar praktis",
                "Komunitas belajar supportif",
              ],

              packages: [
                {
                  label: "Full Program (10 Sesi)",
                  price: "Rp 299.000",
                  originalPrice: "Rp 500.000",
                  note: "Untuk 10 sesi live meeting",
                  highlight: "Best Value",
                },
              ],
            },
          ],

          bonus: [
            {
              title: "Speaking Challenge (3 Hari Intensif)",
              description:
                "Program tambahan untuk melatih keberanian berbicara sejak awal",
              highlight: "Gratis senilai Rp49.000",
              icon: "gift",
            },
          ],

          urgency: "Bonus terbatas hanya untuk 50 pendaftar hari ini",
        },
      },

      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Apa Kata Alumni Kami",
          items: [
            {
              quote:
                "Sekarang saya lebih percaya diri ngomong tanpa mikir grammar terlalu lama.",
              name: "Adit",
              role: "Software Engineer",
              meta: "24 tahun, Jakarta",
            },
            {
              quote: "Materinya praktis dan langsung bisa dipakai sehari-hari.",
              name: "Sarah",
              role: "Marketing Manager",
              meta: "28 tahun, Surabaya",
            },
            {
              quote:
                "Pas interview kerja jadi lebih lancar tanpa overthinking.",
              name: "Rizki",
              role: "Fresh Graduate",
              meta: "22 tahun, Bandung",
            },
          ],
        },
      },
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah program ini cocok untuk pemula total?",
            a: "Ya, program ini memang dirancang khusus untuk pemula, bahkan dari nol. Materi disusun step-by-step dengan penjelasan sederhana dan langsung dipraktikkan dalam speaking, jadi kamu nggak perlu punya dasar grammar sebelumnya.",
          },
          {
            q: "Berapa jam per minggu yang harus saya dedikasikan?",
            a: "Kelas berlangsung 5x seminggu dengan durasi sekitar 60 menit per sesi. Selain itu, kamu hanya perlu sedikit waktu tambahan untuk latihan ringan agar hasilnya lebih maksimal.",
          },
          {
            q: "Apa beda Grammar for Speaking dengan kursus grammar lainnya?",
            a: "Di program ini, kamu nggak fokus menghafal rumus. Semua materi langsung dipakai untuk speaking. Jadi bukan sekadar paham teori, tapi benar-benar bisa digunakan saat kamu ngomong.",
          },
          {
            q: "Apa yang terjadi kalau saya ketinggalan sesi?",
            a: "Kalau kamu tidak bisa hadir, kamu bisa koordinasi dengan admin untuk solusi terbaik. Selain itu, kamu tetap bisa mengikuti materi berikutnya karena pembelajaran disusun bertahap dan praktis.",
          },
          {
            q: "Apakah ada sertifikat setelah selesai?",
            a: "Ya, peserta yang mengikuti program sampai selesai akan mendapatkan sertifikat sebagai bukti partisipasi.",
          },
          {
            q: "Bagaimana kalau saya masih ragu untuk memulai?",
            a: "Wajar banget merasa ragu di awal. Tapi justru program ini dibuat untuk bantu kamu mulai tanpa tekanan. Kamu nggak perlu sempurna — yang penting mulai dulu, dan kami akan bantu kamu sampai bisa lebih percaya diri.",
          },
        ],
      },
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Masalahnya Bukan",
          titleAccent: "Kamu Tidak Bisa",
          subtitle: "Tapi kamu terlalu takut salah saat ngomong",

          highlight: "Dan itu bisa diperbaiki dengan cara belajar yang tepat",

          cta: {
            label: "Ambil Kelasnya Sekarang",
            href: buildWhatsAppUrl({
              title: "Daily Conversation",
              price: "Rp 299.000",
              format: "Zoom",
            }),
            note: "Mulai dari sekarang, tanpa harus nunggu siap",
          },

          urgency: "Kuota terbatas – kelas cepat penuh",
        },
      },
    ],
  },
  "private-class": {
    slug: "private-class",
    theme: { primary: "#4da3ff" },
    hasBatch: false,

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Batch Baru Segera Dimulai",
          tagline: "Belajar Lebih Cepat",
          taglineAccent: "Dengan Cara yang Lebih Personal",
          description:
            "Private class yang disesuaikan dengan kamu, bukan kamu yang menyesuaikan kelas.",
          subtitle:
            "1-on-1 dengan tutor, materi sesuai kebutuhan, dan progress lebih cepat",

          tags: [
            { title: "1-on-1 Learning", icon: "user" },
            { title: "Custom Material", icon: "edit" },
            { title: "Fast Progress", icon: "zap" },
          ],

          cta: [
            {
              label: "Mulai Private Class Sekarang",
              href: buildWhatsAppUrl({
                title: "Private Class",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Ribuan peserta sudah berkembang",
          },
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Kenapa Kamu Tidak Berkembang?",
          tagline: "Masalah dari",
          taglineAccent: "Kelas Biasa",
          items: [
            {
              title: "Belajar di kelas ramai",
              description: "Kurang fokus & minim perhatian personal",
              icon: "users",
            },
            {
              title: "Materi tidak sesuai",
              description: "Belajar hal yang tidak relevan dengan kebutuhanmu",
              icon: "book",
            },
            {
              title: "Tidak ada bimbingan",
              description: "Tidak ada yang memantau progress kamu",
              icon: "user-x",
            },
            {
              title: "Progress terasa lambat",
              description: "Sudah lama belajar tapi hasil tidak terasa",
              icon: "clock",
            },
          ],
        },
      },
      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Kenapa Private Class Lebih Cepat?",
          tagline: "Keunggulan",
          taglineAccent: "Private Class",
          items: [
            {
              title: "Fokus 100% ke kamu",
              icon: "target",
            },
            {
              title: "Tidak terganggu peserta lain",
              icon: "slash",
            },
            {
              title: "Materi custom sesuai kebutuhan",
              icon: "edit",
            },
            {
              title: "Feedback langsung dari tutor",
              icon: "message-circle",
            },
            {
              title: "Progress lebih cepat terasa",
              icon: "trending-up",
            },
            {
              title: "Bisa langsung dipraktikkan",
              icon: "zap",
            },
          ],
        },
      },
      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Pilih Program Sesuai Kebutuhanmu",

          groups: [
            {
              title: "Exclusive",
              subtitle: "Flexible & Personal",
              icon: "diamond",

              features: [
                "Jadwal fleksibel (bebas pilih hari & jam)",
                "Materi 100% custom sesuai kebutuhan",
                "Bisa reschedule hingga 2x per bulan",
                "Maksimal durasi 60 hari",
              ],

              packages: [
                { label: "5x Pertemuan", price: "Rp 699.000" },
                { label: "8x Pertemuan", price: "Rp 999.000" },
                {
                  label: "10x Pertemuan",
                  price: "Rp 1.199.000",
                  highlight: "Paling Populer",
                },
              ],
            },

            {
              title: "Intensive",
              subtitle: "Fokus & Cepat",
              icon: "zap",

              features: [
                "Jadwal tetap Senin – Jumat",
                "Jam tetap setiap sesi",
                "Modul disiapkan oleh tutor",
                "Tanpa reschedule (fokus maksimal)",
              ],

              packages: [
                { label: "5x Pertemuan", price: "Rp 499.000" },
                { label: "10x Pertemuan", price: "Rp 799.000" },
                { label: "15x Pertemuan", price: "Rp 1.099.000" },
              ],
            },
          ],

          globalNote:
            "Semua paket termasuk free placement test & analisis kebutuhan",

          urgency: "Kuota terbatas — prioritas untuk peserta serius",
        },
      },
      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Hasil Nyata dari Peserta",
          items: [
            {
              quote:
                "Dalam 2 bulan, speaking saya meningkat drastis. Tutor sangat fokus dan memahami kebutuhan saya!",
              name: "Rara Wijaya",
              role: "Sales Executive",
            },
            {
              quote:
                "Program Intensive sangat disiplin. Skor IELTS saya naik signifikan dalam waktu singkat.",
              name: "Budi Santoso",
              role: "Mahasiswa",
            },
            {
              quote:
                "Private class Exclusive sangat fleksibel dengan jadwal saya. Hasilnya sangat worth it.",
              name: "Dina Kusuma",
              role: "Software Engineer",
            },
          ],
        },
      },
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah private class cocok untuk pemula?",
            a: "Ya, sangat cocok. Justru private class dirancang agar kamu bisa mulai dari level berapa pun, termasuk pemula total, karena materi dan pace belajar sepenuhnya disesuaikan dengan kemampuanmu.",
          },
          {
            q: "Apa bedanya program Exclusive dan Intensive?",
            a: "Exclusive lebih fleksibel — kamu bebas pilih jadwal dan materi 100% disesuaikan dengan kebutuhanmu. Sedangkan Intensive lebih terstruktur dengan jadwal tetap, cocok untuk kamu yang ingin progress lebih cepat dan disiplin.",
          },
          {
            q: "Apakah saya bisa pilih jadwal sendiri?",
            a: "Bisa. Untuk program Exclusive, kamu bebas menentukan hari dan jam belajar sesuai jadwalmu. Ini cocok untuk kamu yang punya kesibukan tinggi.",
          },
          {
            q: "Berapa durasi satu sesi?",
            a: "Setiap sesi berlangsung selama ±60 menit. Waktu ini sudah optimal untuk belajar efektif tanpa terasa terlalu berat.",
          },
          {
            q: "Berapa lama sampai terlihat hasilnya?",
            a: "Sebagian besar peserta mulai merasakan peningkatan dalam beberapa minggu, terutama dalam kepercayaan diri saat speaking. Hasil akan lebih cepat terasa jika kamu konsisten mengikuti sesi dan latihan.",
          },
          {
            q: "Bagaimana jika level saya masih pemula?",
            a: "Tidak masalah. Tutor akan menyesuaikan materi dari dasar dan membimbing kamu step-by-step sampai lebih percaya diri. Kamu tidak perlu merasa ‘harus sudah bisa’ untuk mulai.",
          },
          {
            q: "Apakah ada garansi uang kembali?",
            a: "Saat ini belum tersedia garansi uang kembali. Namun sebelum mulai, kamu bisa konsultasi terlebih dahulu dengan tim kami untuk memastikan program ini benar-benar sesuai dengan kebutuhanmu.",
          },
        ],
      },
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Ini Bukan Tentang Belajar Lebih Lama",
          titleAccent: "Tapi Lebih Tepat",
          subtitle:
            "Dengan pendekatan yang benar, progress bisa jauh lebih cepat",

          highlight:
            "Private class membantu kamu fokus ke hal yang benar-benar kamu butuhkan",

          cta: {
            label: "Mulai Private Class Sekarang",
            href: buildWhatsAppUrl({
              title: "Private Class",
            }),
            note: "Diskusi kebutuhanmu dulu, tanpa komitmen",
          },

          urgency: "Kuota terbatas — prioritas untuk peserta serius",
        },
      },
    ],
  },

  "basic-toefl": {
    slug: "basic-toefl",
    theme: { primary: "#4da3ff" },
    hasBatch: true,

    batches: [
      {
        id: "batch-1",
        label: "Batch April 2026",
        startDate: "2026-04-22",
        endDate: "2026-05-03",
        schedule: "Senin – Jumat, 20.00 WIB",
        isOpen: true,
        status: "open",

        capacity: 50,
        enrolled: 28,

        ctaLabel: "Daftar Batch Ini",
        ctaHref: buildWhatsAppUrl({
          title: "Basic TOEFL Batch 1",
          price: "Rp 399.000",
          format: "Zoom",
        }),
      },
      {
        id: "batch-2",
        label: "Batch April 2026",
        startDate: "2026-04-22",
        endDate: "2026-05-03",
        schedule: "Senin – Jumat, 20.00 WIB",
        isOpen: true,
        status: "open",

        capacity: 50,
        enrolled: 28,

        ctaLabel: "Daftar Batch Ini",
        ctaHref: buildWhatsAppUrl({
          title: "Basic TOEFL Batch 2",
          price: "Rp 399.000",
          format: "Zoom",
        }),
      },
    ],

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Batch Baru Segera Dimulai",
          tagline: "Mau Ikut TOEFL Tapi",
          taglineAccent: "Nggak Paham Soalnya?",
          description:
            "Belajar TOEFL dari nol sampai paham cara menjawab soal — tanpa bingung, tanpa stres.",
          subtitle: "Kursus TOEFL online pemula yang terarah & mudah dipahami",

          tags: [
            { title: "10x Live Meeting", icon: "video" },
            { title: "Cocok untuk Pemula", icon: "target" },
            { title: "Free Pre & Post Test", icon: "file-text" },
          ],

          cta: [
            {
              label: "Mulai Belajar TOEFL Sekarang",
              href: buildWhatsAppUrl({
                title: "Basic TOEFL",
                price: "Rp 399.000",
                format: "Zoom",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Alumni sudah merasakan peningkatan skor",
            count: `${SOCIAL_PROOF.totalStudents}+`,
          },
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Masalah yang Sering Terjadi",
          tagline: "Kenapa TOEFL Terasa",
          taglineAccent: "Sulit Dipahami?",
          subtitle: "Masalahnya bukan di kamu, tapi kamu belum tahu caranya",
          items: [
            {
              title: "Soal terasa membingungkan",
              description:
                "Sudah baca berkali-kali tapi tetap tidak paham maksud pertanyaannya",
              icon: "help-circle",
            },
            {
              title: "Grammar terasa rumit",
              description:
                "Banyak aturan yang membingungkan dan sulit dipahami",
              icon: "book-open",
            },
            {
              title: "Sering asal menebak",
              description: "Memilih jawaban tanpa strategi yang jelas",
              icon: "shuffle",
            },
            {
              title: "Nilai tidak meningkat",
              description: "Sudah belajar tapi hasil tetap stagnan",
              icon: "trending-down",
            },
          ],
        },
      },

      {
        id: "steps",
        type: "steps",
        content: {
          title: "Metode Belajar",
          tagline: "Belajarnya",
          taglineAccent: "Simple & Terarah",
          subtitle: "Fokus ke praktik, bukan teori panjang",
          items: [
            {
              n: "01",
              title: "Penjelasan Konsep",
              description: "Materi disampaikan sederhana & mudah dipahami",
              icon: "lightbulb",
            },
            {
              n: "02",
              title: "Contoh Soal Nyata",
              description: "Langsung belajar dari soal TOEFL asli",
              icon: "file-text",
            },
            {
              n: "03",
              title: "Latihan Bersama",
              description: "Praktik langsung dengan bimbingan tutor",
              icon: "users",
            },
            {
              n: "04",
              title: "Strategi Menjawab",
              description: "Pelajari cara menjawab cepat & tepat",
              icon: "zap",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Perubahan yang Akan Kamu Rasakan",
          tagline: "Dari Bingung Jadi",
          taglineAccent: "Paham",
          items: [
            {
              title: "Lebih paham soal TOEFL",
              icon: "check-circle",
            },
            {
              title: "Tidak lagi asal menebak",
              icon: "shield-check",
            },
            {
              title: "Lebih percaya diri saat tes",
              icon: "smile",
            },
            {
              title: "Punya strategi menjawab",
              icon: "target",
            },
            {
              title: "Lebih siap menghadapi TOEFL",
              icon: "award",
            },
          ],
        },
      },

      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "Program 2 Minggu",
          taglineAccent: "yang Terarah",
          title: "Timeline Belajar",
          subtitle: "10 meeting live • 60 menit per sesi • via Zoom",

          meta: [
            {
              icon: "video",
              title: "10 Live Meeting",
            },
            {
              icon: "clock",
              title: "60 Menit / Sesi",
            },
            {
              icon: "monitor",
              title: "Live via Zoom",
            },
          ],

          weeks: [
            {
              icon: "sprout",
              week: "Minggu 1",
              title: "Fondasi TOEFL",
              points: ["Dasar Structure", "Pola Soal Umum", "Listening Dasar"],
            },
            {
              icon: "target",
              week: "Minggu 2",
              title: "Strategi & Latihan",
              points: [
                "Strategi menjawab",
                "Latihan intensif",
                "Review & post-test",
              ],
            },
          ],
        },
      },

      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Investasi untuk Masa Depanmu",
          description:
            "Belajar TOEFL dengan cara yang benar jauh lebih hemat dibanding trial & error sendiri",

          groups: [
            {
              title: "Basic TOEFL Program",
              icon: "graduation-cap",

              features: [
                "10x Live Meeting",
                "Tutor expert",
                "Materi lengkap",
                "Strategi TOEFL",
                "E-Certificate",
              ],

              packages: [
                {
                  label: "Full Program (2 Minggu)",
                  price: "Rp 399.000",
                  originalPrice: "Rp 750.000",
                  highlight: "Best Value",
                },
              ],
            },
          ],

          bonus: [
            {
              title: "Pre-Test",
              description: "Mengetahui level awal sebelum program dimulai",
              highlight: "Gratis",
              icon: "file-search",
            },
            {
              title: "Post-Test",
              description: "Melihat progress setelah program selesai",
              highlight: "Gratis",
              icon: "bar-chart",
            },
          ],

          urgency: "Kuota terbatas – kelas cepat penuh",
        },
      },

      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Hasil Nyata Alumni",
          items: [
            {
              quote:
                "Awalnya benar-benar nol. Setelah ikut, skor saya naik signifikan dan lebih paham soal TOEFL.",
              name: "Rina",
              role: "Mahasiswa",
            },
            {
              quote: "Materinya mudah dipahami dan langsung bisa dipraktikkan.",
              name: "Budi",
              role: "Fresh Graduate",
            },
            {
              quote:
                "Step-by-step dan tidak membingungkan. Cocok untuk pemula.",
              name: "Dewi",
              role: "Guru",
            },
          ],
        },
      },

      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah program ini cocok untuk pemula?",
            a: "Ya, program ini dirancang khusus untuk pemula yang belum pernah belajar TOEFL sama sekali. Semua materi dimulai dari dasar.",
          },
          {
            q: "Bagaimana cara mendaftar?",
            a: "Klik tombol daftar, lalu kamu akan diarahkan ke WhatsApp admin untuk proses pendaftaran yang cepat dan mudah.",
          },
          {
            q: "Bagaimana jika saya tidak bisa hadir?",
            a: "Setiap sesi akan direkam, jadi kamu tetap bisa menonton ulang kapan saja jika berhalangan hadir.",
          },
        ],
      },

      {
        id: "cta",
        type: "cta",
        content: {
          title: "Kalau Bukan Sekarang",
          titleAccent: "Kapan Lagi?",
          subtitle:
            "Semakin lama kamu menunda, semakin lama kamu tidak siap menghadapi TOEFL",

          highlight:
            "Mulai dari nol hari ini, dan lihat perubahan dalam 2 minggu",

          cta: {
            label: "Ambil Kelas TOEFL Sekarang",
            href: buildWhatsAppUrl({
              title: "Basic TOEFL",
              price: "Rp 399.000",
              format: "Zoom",
            }),
            note: "Batch terbatas — jangan sampai kehabisan",
          },

          urgency: "Kuota terbatas – kelas cepat penuh",
        },
      },
    ],
  },

  "english-for-kids": {
    slug: "english-for-kids",
    theme: { primary: "#4da3ff" },
    hasBatch: true,

    batches: [
      {
        id: "batch-1",
        label: "Batch April 2026",
        schedule: "Selasa & Jumat, 16.00 WIB",
        isOpen: true,
        status: "open",

        capacity: 8,
        enrolled: 5,

        ctaLabel: "Daftarkan Sekarang",
        ctaHref: buildWhatsAppUrl({
          title: "English for Kids Batch 1",
          price: "Rp 349.000",
          format: "Zoom",
        }),
      },
    ],

    sections: [
      // ───────────────── HERO ─────────────────
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Kursus Bahasa Inggris Anak Online",
          tagline: "Si Kecil Masih Malu",
          taglineAccent: "Bicara Bahasa Inggris?",
          description:
            "Di sini, anak belajar dengan cara yang menyenangkan sampai berani bicara dengan percaya diri.",
          subtitle: "Belajar fun, interaktif, dan tanpa tekanan",

          tags: [
            { title: "Max 8 Anak", icon: "users" },
            { title: "Fun & Interactive", icon: "sparkles" },
            { title: "Tutor Sabar", icon: "heart" },
          ],

          cta: [
            {
              label: "Daftarkan Sekarang",
              href: buildWhatsAppUrl({
                title: "English for Kids",
                price: "Rp 349.000",
                format: "Zoom",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Ribuan orang tua sudah mempercayai Inggris Go",
          },
        },
      },

      // ───────────────── WHY (PAIN PARENT) ─────────────────
      {
        id: "why",
        type: "why",
        content: {
          title: "Banyak Anak Sebenarnya Bisa",
          tagline: "Tapi Tidak",
          taglineAccent: "Berani",
          subtitle:
            "Masalahnya bukan di kemampuan, tapi di kepercayaan diri anak",
          items: [
            {
              title: "Takut salah",
              description: "Anak takut ditertawakan saat mencoba berbicara",
              icon: "alert-circle",
            },
            {
              title: "Malu bicara",
              description: "Bisa mengerti, tapi tidak berani mengucapkan",
              icon: "eye-off",
            },
            {
              title: "Tidak percaya diri",
              description: "Merasa dirinya tidak bisa bahasa Inggris",
              icon: "user-x",
            },
            {
              title: "Bosan belajar",
              description: "Metode terlalu monoton dan tidak menarik",
              icon: "moon",
            },
          ],
        },
      },

      // ───────────────── BENEFITS (SOLUTION) ─────────────────
      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Belajar dengan Cara yang Berbeda",
          tagline: "Fokus Kami Bukan Hanya Pintar",
          taglineAccent: "Tapi Berani",
          items: [
            {
              title: "Lingkungan aman & supportif",
              description: "Anak bebas mencoba tanpa takut salah",
              icon: "shield-check",
            },
            {
              title: "Fokus berbicara",
              description: "Bukan hafalan, tapi praktik nyata setiap pertemuan",
              icon: "mic",
            },
            {
              title: "Meningkatkan kepercayaan diri",
              description: "Anak jadi lebih aktif dan berani",
              icon: "trending-up",
            },
            {
              title: "Belajar dengan cara menyenangkan",
              description: "Games, interaksi, dan aktivitas seru",
              icon: "gamepad",
            },
          ],
        },
      },

      // ───────────────── STEPS (LEARNING EXPERIENCE) ─────────────────
      {
        id: "steps",
        type: "steps",
        content: {
          title: "Pengalaman Belajar",
          tagline: "Kelas yang",
          taglineAccent: "Tidak Membosankan",
          items: [
            {
              n: "01",
              title: "Games Interaktif",
              description:
                "Belajar lewat permainan seru yang membuat anak engaged",
              icon: "gamepad",
            },
            {
              n: "02",
              title: "Speaking Practice",
              description: "Anak dilatih berbicara di setiap sesi",
              icon: "mic",
            },
            {
              n: "03",
              title: "Interaksi Aktif",
              description: "Diskusi & kolaborasi dengan teman",
              icon: "users",
            },
            {
              n: "04",
              title: "Tutor Supportif",
              description: "Tutor sabar yang membangun kepercayaan diri anak",
              icon: "heart",
            },
          ],
        },
      },

      // ───────────────── TIMELINE ─────────────────
      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "Program Belajar",
          taglineAccent: "Terstruktur",
          title: "Detail Kelas",
          subtitle: "Program rutin dengan sistem kecil & fokus",

          meta: [
            {
              icon: "video",
              title: "10 Meeting",
              description: "via Zoom",
            },
            {
              icon: "calendar",
              title: "2x per minggu",
              description: "Selasa & Jumat",
            },
            {
              icon: "clock",
              title: "16.00 WIB",
            },
            {
              icon: "users",
              title: "Max 8 Anak",
            },
          ],

          weeks: [],
        },
      },

      // ───────────────── FIT (LEVEL SYSTEM) ─────────────────
      {
        id: "fit",
        type: "benefits",
        content: {
          title: "Belajar Sesuai Level Anak",
          tagline: "Bukan Sekadar Ikut Kelas",
          taglineAccent: "Tapi Berkembang",
          items: [
            {
              title: "Placement test di awal",
              description: "Menentukan level yang sesuai",
              icon: "file-search",
            },
            {
              title: "Progress naik level",
              description: "Anak berkembang sesuai kemampuan",
              icon: "trending-up",
            },
            {
              title: "Materi selalu berkembang",
              description: "Tidak mengulang, selalu bertahap",
              icon: "layers",
            },
          ],
        },
      },
      {
        id: "classes",
        type: "classes",
        content: {
          title: "Kelompok Belajar Sesuai Usia",
          tagline: "Pilihan",
          taglineAccent: "Kelas",

          items: [
            {
              title: "Little Star Class",
              description:
                "Belajar sambil bermain dan mengenal bahasa Inggris dari nol dengan cara yang menyenangkan.",
              highlight: "Usia 4–6 tahun",
              icon: "baby",
            },
            {
              title: "Smart Explorer Class",
              description:
                "Mulai berani berbicara dan menggunakan bahasa Inggris dalam percakapan sehari-hari.",
              highlight: "Usia 7–11 tahun",
              icon: "star",
            },
            {
              title: "Confident Speaker Class",
              description:
                "Meningkatkan kelancaran dan kepercayaan diri dalam berbicara bahasa Inggris.",
              highlight: "Usia 12–15 tahun",
              icon: "rocket",
            },
          ],
        },
      },

      // ───────────────── PRICING ─────────────────
      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Investasi untuk Masa Depan Anak",
          description:
            "Bukan hanya belajar bahasa Inggris, tapi membangun kepercayaan diri anak sejak dini",

          groups: [
            {
              title: "English for Kids Program",
              icon: "smile",

              features: [
                "10x pertemuan interaktif",
                "Kelas kecil max 8 anak",
                "Tutor profesional & sabar",
                "Materi sesuai level anak",
                "Fun & engaging learning",
              ],

              packages: [
                {
                  label: "Full Program",
                  price: "Rp 349.000",
                  highlight: "Best Value",
                },
              ],
            },
          ],

          urgency: "Kuota terbatas setiap kelas",
        },
      },

      // ───────────────── TESTIMONIAL ─────────────────
      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Apa Kata Orang Tua",
          items: [
            {
              quote:
                "Awalnya anak saya sangat malu, sekarang sudah berani bicara di depan kelas.",
              name: "Siti",
              role: "Ibu dari anak 7 tahun",
            },
            {
              quote:
                "Kelasnya fun dan anak jadi semangat belajar setiap minggu.",
              name: "Ahmad",
              role: "Ayah dari anak 9 tahun",
            },
            {
              quote:
                "Perkembangannya sangat terasa, terutama kepercayaan dirinya.",
              name: "Dwi",
              role: "Ibu dari anak 11 tahun",
            },
          ],
        },
      },

      // ───────────────── FAQ ─────────────────
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah program ini cocok untuk pemula?",
            a: "Ya, program ini dirancang dari nol dan disesuaikan dengan level masing-masing anak melalui placement test.",
          },
          {
            q: "Berapa jumlah anak dalam satu kelas?",
            a: "Maksimal 8 anak per kelas agar tutor bisa fokus ke setiap peserta.",
          },
          {
            q: "Apakah anak harus sudah bisa bahasa Inggris?",
            a: "Tidak. Anak bisa mulai dari nol karena materi disesuaikan dengan levelnya.",
          },
          {
            q: "Bagaimana jika anak saya pemalu?",
            a: "Justru program ini dirancang untuk membantu anak pemalu menjadi lebih percaya diri secara bertahap.",
          },
        ],
      },

      // ───────────────── CTA ─────────────────
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Kalau Bukan Sekarang",
          titleAccent: "Kapan Lagi?",
          subtitle:
            "Semakin lama ditunda, semakin lama anak tidak percaya diri",

          highlight:
            "Mulai dari langkah kecil hari ini untuk masa depan yang lebih besar",

          cta: {
            label: "Daftarkan Anak Sekarang",
            href: buildWhatsAppUrl({
              title: "English for Kids",
              price: "Rp 349.000",
              format: "Zoom",
            }),
            note: "Amankan slot sebelum penuh",
          },

          urgency: "Kuota terbatas setiap kelas",
        },
      },
    ],
  },

  "daily-conversation": {
    slug: "daily-conversation",
    theme: { primary: "#4da3ff" }, // fresh, conversational, confident
    hasBatch: true,

    batches: [
      {
        id: "batch-1",
        label: "Batch April 2026",
        startDate: "2026-04-22",
        endDate: "2026-05-03",
        schedule: "Senin – Jumat, 19.00 WIB",
        isOpen: true,
        status: "open",

        capacity: 40,
        enrolled: 26,

        ctaLabel: "Gabung Batch Ini",
        ctaHref: buildWhatsAppUrl({
          title: "Daily Conversation Batch 1",
          price: "Rp 299.000",
          format: "Zoom",
        }),
      },
    ],

    sections: [
      // ───────────────── HERO ─────────────────
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Kelas Conversation Paling Praktis",
          tagline: "Masih Kaku Saat",
          taglineAccent: "Ngobrol Bahasa Inggris?",
          description:
            "Latihan percakapan sehari-hari secara langsung bareng tutor. Bukan teori, tapi langsung praktik ngomong.",
          subtitle:
            "Fokus kelancaran, kepercayaan diri, dan kosakata yang benar-benar dipakai",

          tags: [
            { title: "10x Live Zoom", icon: "video" },
            { title: "Full Speaking Practice", icon: "mic" },
            { title: "Small Group", icon: "users" },
          ],

          cta: [
            {
              label: "Mulai Ngomong Sekarang",
              href: buildWhatsAppUrl({
                title: "Daily Conversation",
                price: "Rp 299.000",
                format: "Zoom",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Peserta sudah lebih lancar ngobrol Inggris",
            count: "300+",
          },
        },
      },

      // ───────────────── WHY ─────────────────
      {
        id: "why",
        type: "why",
        content: {
          title: "Kenapa Kamu Masih Kaku Saat Ngomong?",
          tagline: "Masalah Utama Saat",
          taglineAccent: "Conversation",
          subtitle:
            "Bukan karena kamu tidak bisa, tapi karena jarang praktik real conversation",
          items: [
            {
              title: "Jarang praktik langsung",
              description:
                "Lebih sering belajar teori daripada benar-benar ngomong",
              icon: "book-open",
            },
            {
              title: "Bingung mau respon apa",
              description:
                "Saat diajak ngobrol, sering stuck dan tidak tahu harus jawab apa",
              icon: "help-circle",
            },
            {
              title: "Kosakata terbatas",
              description:
                "Tahu sedikit, tapi tidak cukup untuk sustain conversation",
              icon: "layers",
            },
            {
              title: "Takut awkward",
              description:
                "Takut salah, jadi akhirnya malah diam dan tidak mencoba",
              icon: "user-x",
            },
          ],
        },
      },

      // ───────────────── STEPS ─────────────────
      {
        id: "steps",
        type: "steps",
        content: {
          title: "Cara Belajarnya",
          tagline: "Langsung Praktik",
          taglineAccent: "Setiap Sesi",
          subtitle: "Bukan duduk dengerin, tapi aktif ngomong",
          items: [
            {
              n: "01",
              title: "Topik Harian",
              description:
                "Setiap sesi punya topik real-life (daily conversation)",
              icon: "message-circle",
            },
            {
              n: "02",
              title: "Contoh & Guidance",
              description: "Tutor kasih contoh cara ngobrol yang natural",
              icon: "lightbulb",
            },
            {
              n: "03",
              title: "Practice Bareng",
              description: "Langsung latihan conversation dengan peserta lain",
              icon: "users",
            },
            {
              n: "04",
              title: "Feedback Langsung",
              description: "Tutor bantu koreksi & improve cara bicara kamu",
              icon: "message-square",
            },
          ],
        },
      },

      // ───────────────── BENEFITS ─────────────────
      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Perubahan yang Akan Kamu Rasakan",
          tagline: "Dari Kaku Jadi",
          taglineAccent: "Lancar",
          items: [
            {
              title: "Lebih lancar ngobrol tanpa mikir lama",
              icon: "zap",
            },
            {
              title: "Lebih percaya diri saat speaking",
              icon: "shield-check",
            },
            {
              title: "Punya banyak kosakata praktis",
              icon: "book",
            },
            {
              title: "Tidak lagi awkward saat conversation",
              icon: "smile",
            },
            {
              title: "Terbiasa respon cepat",
              icon: "clock",
            },
            {
              title: "Ngomong lebih natural & santai",
              icon: "sparkles",
            },
          ],
        },
      },

      // ───────────────── TIMELINE ─────────────────
      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "Program 2 Minggu",
          taglineAccent: "Intensif",
          title: "Timeline Belajar",
          subtitle: "10 sesi • Senin–Jumat • 60 menit per sesi",

          meta: [
            {
              icon: "video",
              title: "Live Zoom",
              description: "Interaktif & real-time",
            },
            {
              icon: "clock",
              title: "60 Menit",
              description: "Per sesi",
            },
            {
              icon: "users",
              title: "Small Group",
              description: "Lebih banyak kesempatan ngomong",
            },
          ],

          weeks: [
            {
              icon: "sprout",
              week: "Minggu 1",
              title: "Basic Conversation",
              points: [
                "Daily introduction",
                "Simple response",
                "Basic interaction",
              ],
            },
            {
              icon: "target",
              week: "Minggu 2",
              title: "Fluency Building",
              points: [
                "Longer conversation",
                "Opinion sharing",
                "Real-life simulation",
              ],
            },
          ],
        },
      },

      // ───────────────── PRICING ─────────────────
      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Latihan Ngomong yang Benar",
          description:
            "Kalau mau lancar, kamu butuh praktik — bukan cuma belajar",

          groups: [
            {
              title: "Daily Conversation Program",
              subtitle: "2 Minggu Intensive",
              icon: "message-circle",

              features: [
                "10x Live Conversation Session",
                "Practice langsung setiap sesi",
                "Feedback dari tutor",
                "Topik real-life conversation",
                "Small group discussion",
              ],

              packages: [
                {
                  label: "Full Program (10 Sesi)",
                  price: "Rp 299.000",
                  originalPrice: "Rp 500.000",
                  highlight: "Best Seller",
                },
              ],
            },
          ],

          urgency: "Kuota terbatas – batch cepat penuh",
        },
      },

      // ───────────────── TESTIMONIALS ─────────────────
      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Apa Kata Peserta",
          items: [
            {
              quote:
                "Sekarang saya lebih spontan jawab saat diajak ngomong Inggris.",
              name: "Dina",
              role: "Mahasiswa",
            },
            {
              quote:
                "Latihannya real banget, bukan teori doang. Jadi lebih kepake.",
              name: "Rafi",
              role: "Karyawan",
            },
            {
              quote:
                "Awalnya awkward, sekarang lebih santai ngobrol pakai Inggris.",
              name: "Salsa",
              role: "Fresh Graduate",
            },
          ],
        },
      },

      // ───────────────── FAQ ─────────────────
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah cocok untuk pemula?",
            a: "Ya, cocok untuk pemula yang sudah punya basic sedikit dan ingin mulai praktik conversation.",
          },
          {
            q: "Apakah harus sudah lancar?",
            a: "Tidak. Justru program ini membantu kamu jadi lebih lancar secara bertahap.",
          },
          {
            q: "Apakah banyak praktik?",
            a: "Ya, fokus utama program ini adalah praktik speaking, bukan teori.",
          },
        ],
      },

      // ───────────────── CTA ─────────────────
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Kalau Kamu Tidak Mulai",
          titleAccent: "Ngomong Sekarang",
          subtitle: "Kamu akan terus stuck di level yang sama",

          highlight:
            "Lancar itu bukan karena belajar lama, tapi karena sering latihan",

          cta: {
            label: "Gabung Sekarang",
            href: buildWhatsAppUrl({
              title: "Daily Conversation",
              price: "Rp 299.000",
              format: "Zoom",
            }),
            note: "Mulai dari batch terdekat",
          },

          urgency: "Slot terbatas • cepat penuh",
        },
      },
    ],
  },
  "vip-kids": {
    slug: "vip-kids",
    hasBatch: true,

    theme: {
      primary: "#f7b500", // warm, premium, kid-friendly
    },

    batches: [
      {
        id: "batch-june-1",
        label: "21 – 28 Juni 2026",
        startDate: "2026-06-21",
        endDate: "2026-06-28",
        status: "open",
        isOpen: true,
      },
      {
        id: "batch-june-2",
        label: "28 Juni – 5 Juli 2026",
        startDate: "2026-06-28",
        endDate: "2026-07-05",
        status: "open",
        isOpen: true,
      },
      {
        id: "batch-june-full",
        label: "21 Juni – 5 Juli 2026 (2 Minggu)",
        startDate: "2026-06-21",
        endDate: "2026-07-05",
        status: "open",
        isOpen: true,
      },
    ],

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Program Terbukti Efektif",
          tagline: "Bukan Sekadar Liburan",
          taglineAccent: "Tapi Pengalaman yang Mengubah Anak Anda",
          description:
            "English Camp di Kampung Inggris Pare untuk membangun kepercayaan diri, kemandirian, dan kemampuan speaking anak.",

          subtitle:
            "Belajar 24 jam dalam lingkungan English dengan pendampingan penuh",

          tags: [
            { title: "Full Service Camp", icon: "home" },
            { title: "Pendampingan 24 Jam", icon: "shield" },
            { title: "Lingkungan English", icon: "globe" },
          ],

          cta: [
            {
              label: "Konsultasi & Daftar Sekarang",
              href: buildWhatsAppUrl({ title: "English Camp" }),
            },
          ],

          socialProof: {
            text: `${SOCIAL_PROOF.parentsTrusted}+ orang tua mempercayai program ini`,
          },
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Anak Sebenarnya Bisa",
          tagline: "Tapi",
          taglineAccent: "Tidak Berani",
          items: [
            {
              title: "Malu & takut salah",
              description: "Takut ditertawakan saat berbicara",
              icon: "alert-circle",
            },
            {
              title: "Kurang percaya diri",
              description: "Tidak berani menunjukkan kemampuan",
              icon: "user-x",
            },
            {
              title: "Terlalu bergantung",
              description: "Sulit mandiri tanpa bantuan orang tua",
              icon: "users",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Perubahan Nyata dalam Waktu Singkat",
          tagline: "Yang Akan Anak Anda",
          taglineAccent: "Rasakan",
          items: [
            {
              title: "Berani berbicara",
              icon: "mic",
            },
            {
              title: "Lebih percaya diri",
              icon: "sparkles",
            },
            {
              title: "Lebih mandiri",
              icon: "user",
            },
            {
              title: "Terbiasa bahasa Inggris",
              icon: "globe",
            },
          ],
        },
      },
      {
        id: "steps",
        type: "steps",
        content: {
          title: "Kegiatan Seru Setiap Hari",
          tagline: "Belajar Tidak",
          taglineAccent: "Membosankan",
          items: [
            {
              title: "Kelas Interaktif",
              description: "5x kelas per hari dengan metode menyenangkan",
            },
            {
              title: "Speaking Practice",
              description: "Latihan berbicara dalam berbagai situasi",
            },
            {
              title: "Games & Activity",
              description: "Permainan edukatif & aktivitas outdoor",
            },
            {
              title: "Evening Program",
              description: "Talent show, movie night, dan bonding",
            },
          ],
        },
      },
      {
        id: "timeline",
        type: "timeline",
        content: {
          title: "Rutinitas Harian",
          tagline: "Sehari Penuh",
          taglineAccent: "Belajar & Aktivitas",

          weeks: [
            {
              icon: "sun",
              week: "Daily Schedule",
              title: "Kegiatan Harian",
              days: [
                { range: "06:00", title: "Morning Meeting" },
                { range: "07:00 - 09:00", title: "Kelas 1 & 2" },
                { range: "09:00 - 11:00", title: "Kelas & Activity" },
                { range: "13:00 - 15:00", title: "Kelas 4 & 5" },
                { range: "15:00 - 16:30", title: "Outdoor Activity" },
                { range: "19:00 - 21:00", title: "Evening Program" },
              ],
            },
          ],
        },
      },
      {
        id: "classes",
        type: "classes",
        content: {
          title: "Pilihan Program",
          tagline: "Pilih Durasi",
          taglineAccent: "Sesuai Kebutuhan",

          items: [
            {
              title: "1 Minggu",
              description:
                "Cocok untuk trial dan adaptasi awal dengan lingkungan camp",
              highlight: "21 – 28 Juni / 28 Juni – 5 Juli",
            },
            {
              title: "2 Minggu",
              description:
                "Transformasi lebih dalam dengan hasil yang lebih signifikan",
              highlight: "21 Juni – 5 Juli",
              tag: "Rekomendasi",
            },
          ],
        },
      },
      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Investasi untuk Perubahan Anak",
          description: "Pengalaman belajar + pembentukan karakter",

          groups: [
            {
              title: "English Camp Program",
              subtitle: "All-in Package",
              icon: "star",

              features: [
                "Akomodasi & kamar AC",
                "Makan 3x sehari",
                "5x kelas per hari",
                "Semua aktivitas & games",
                "Laundry harian",
                "Asuransi dasar",
              ],

              packages: [
                {
                  label: "Program Camp",
                  price: "Rp 1.975.000",
                  highlight: "All Inclusive",
                },
              ],
            },
          ],

          bonus: [
            {
              title: "Diskon Alumni",
              highlight: "Potongan Rp100.000",
              icon: "gift",
            },
            {
              title: "Daftar 2 Anak",
              highlight: "Potongan Rp50.000 / anak",
              icon: "users",
            },
          ],

          urgency: "Kuota terbatas setiap batch",
        },
      },
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Berapa usia anak yang bisa ikut?",
            a: "Program untuk anak usia 8–15 tahun (SD–SMP) dan akan dikelompokkan berdasarkan level kemampuan.",
          },
          {
            q: "Apakah anak pemalu cocok?",
            a: "Sangat cocok. Program ini dirancang khusus untuk membantu anak pemalu menjadi lebih percaya diri.",
          },
          {
            q: "Bagaimana keamanan selama camp?",
            a: "Pendampingan 24 jam, lingkungan terkontrol, serta update harian ke orang tua.",
          },
          {
            q: "Apakah bisa cicilan?",
            a: "Bisa. Tersedia opsi cicilan hingga beberapa tahap pembayaran.",
          },
        ],
      },
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Ini Bukan Sekadar Kursus",
          titleAccent: "Ini Transformasi Anak Anda",

          subtitle:
            "Kesempatan untuk membentuk kepercayaan diri, kemandirian, dan masa depan anak",

          highlight: "Perubahan nyata bisa mulai hanya dalam beberapa hari",

          cta: {
            label: "Konsultasi Sekarang",
            href: buildWhatsAppUrl({ title: "English Camp" }),
            note: "Tanyakan detail & cek ketersediaan batch",
          },

          urgency: "Slot terbatas — cepat penuh setiap batch",
        },
      },
    ],
  },
  rombongan: {
    slug: "kelas-rombongan",
    theme: { primary: "#f7b500" }, // more institutional blue
    hasBatch: false,

    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          label: "Program untuk Sekolah & Institusi",
          tagline: "Program English Camp & Training",
          taglineAccent: "untuk Sekolah Anda",
          description:
            "Program pembelajaran bahasa Inggris intensif yang dirancang untuk meningkatkan kepercayaan diri dan kemampuan berbicara siswa.",

          subtitle:
            "Fleksibel (1 hari – 2 minggu) • Bisa di sekolah atau Kampung Inggris Pare",

          tags: [
            { title: "Custom Program", icon: "settings" },
            { title: "Fleksibel Durasi", icon: "calendar" },
            { title: "Fokus Speaking", icon: "mic" },
          ],

          cta: [
            {
              label: "Konsultasi Program Sekarang",
              href: buildWhatsAppUrl({
                title: "Kelas Rombongan",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Dipercaya oleh sekolah & institusi",
          },
        },
      },
      {
        id: "why",
        type: "why",
        content: {
          title: "Tantangan yang Sering Terjadi",
          tagline: "Kenapa Siswa Sulit",
          taglineAccent: "Berbicara Inggris?",
          items: [
            {
              title: "Kurang percaya diri",
              description:
                "Siswa takut salah dan jarang berkesempatan praktik speaking",
              icon: "alert-circle",
            },
            {
              title: "Pembelajaran terlalu teoritis",
              description: "Fokus pada grammar, minim praktik nyata",
              icon: "book",
            },
            {
              title: "Minim praktik speaking",
              description:
                "Lingkungan sekolah belum mendukung penggunaan bahasa Inggris",
              icon: "volume-x",
            },
          ],
        },
      },
      {
        id: "solution",
        type: "benefits",
        content: {
          title: "Solusi Pembelajaran Lebih Efektif",
          tagline: "Belajar dengan Cara",
          taglineAccent: "yang Berbeda",
          items: [
            {
              title: "Learning by Doing",
              description:
                "Belajar melalui praktik langsung, bukan hanya teori",
              icon: "activity",
            },
            {
              title: "Interaktif & menyenangkan",
              description:
                "Games, aktivitas, dan project membuat siswa engaged",
              icon: "gamepad",
            },
            {
              title: "Fokus speaking",
              description: "Membiasakan siswa berbicara dalam situasi nyata",
              icon: "mic",
            },
          ],
        },
      },
      {
        id: "program-options",
        type: "classes",
        content: {
          title: "Pilihan Program untuk Sekolah",
          tagline: "Program yang Bisa",
          taglineAccent: "Disesuaikan",

          items: [
            {
              title: "In-House Training",
              description: "Program langsung di sekolah Anda",
              icon: "school",
              meta: [
                { label: "Lokasi", value: "Sekolah" },
                { label: "Durasi", value: "Fleksibel" },
              ],
              highlight: "Tanpa biaya akomodasi",
            },
            {
              title: "English Camp Pare",
              description: "Program intensif di Kampung Inggris",
              icon: "home",
              meta: [
                { label: "Lingkungan", value: "Full English" },
                { label: "Durasi", value: "1–2 minggu" },
              ],
              highlight: "Immersive learning 24 jam",
              tag: "Rekomendasi",
            },
            {
              title: "Custom Program",
              description: "Program sesuai kebutuhan sekolah",
              icon: "settings",
              meta: [
                { label: "Fleksibilitas", value: "Tinggi" },
                { label: "Peserta", value: "Bebas" },
              ],
              highlight: "Konsultasi gratis",
            },
          ],
        },
      },
      {
        id: "method",
        type: "steps",
        content: {
          title: "Metode Pembelajaran",
          tagline: "Belajar dengan",
          taglineAccent: "Cara Modern",
          items: [
            {
              n: "01",
              title: "Speaking Practice",
              description: "Latihan berbicara langsung setiap sesi",
              icon: "mic",
            },
            {
              n: "02",
              title: "Games & Activity",
              description: "Belajar melalui permainan interaktif",
              icon: "gamepad",
            },
            {
              n: "03",
              title: "Project-Based Learning",
              description: "Belajar lewat project nyata",
              icon: "layers",
            },
            {
              n: "04",
              title: "Interactive Class",
              description: "Diskusi dan kolaborasi aktif",
              icon: "users",
            },
          ],
        },
      },
      {
        id: "impact",
        type: "benefits",
        content: {
          title: "Manfaat untuk Siswa & Sekolah",
          tagline: "Hasil yang Akan",
          taglineAccent: "Didapatkan",
          items: [
            {
              title: "Percaya diri berbicara",
              icon: "shield-check",
            },
            {
              title: "Kemampuan speaking meningkat",
              icon: "trending-up",
            },
            {
              title: "Siswa lebih aktif",
              icon: "zap",
            },
            {
              title: "Pengalaman belajar berbeda",
              icon: "sparkles",
            },
          ],
        },
      },
      {
        id: "gallery",
        type: "gallery",
        content: {
          title: "Kegiatan Program",
          images: [
            "/images/categories/offline/rombongan/rombongan-1.jpg",
            "/images/categories/offline/rombongan/rombongan-2.jpg",
            "/images/categories/offline/rombongan/rombongan-3.jpg",
          ],
        },
      },
      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah program bisa disesuaikan dengan sekolah?",
            a: "Ya, program sepenuhnya fleksibel dan bisa disesuaikan kebutuhan sekolah.",
          },
          {
            q: "Berapa minimal peserta?",
            a: "Kami fleksibel, bisa mulai dari 1 kelas hingga seluruh angkatan.",
          },
        ],
      },
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Diskusikan Program",
          titleAccent: "untuk Sekolah Anda",
          subtitle:
            "Kami siap membantu merancang program terbaik sesuai kebutuhan sekolah Anda",

          highlight:
            "Setiap sekolah berbeda — program kami juga disesuaikan khusus untuk Anda",

          cta: {
            label: "Konsultasi Gratis Sekarang",
            href: buildWhatsAppUrl({
              title: "Kelas Rombongan",
            }),
            note: "Gratis konsultasi & proposal program",
          },

          urgency: "Respon cepat dalam 24 jam",
        },
      },
    ],
  },
};
