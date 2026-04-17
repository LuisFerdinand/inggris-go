export type PriceTier = { label: string; price: string };

type Benefit = {
  title: string;
  description: string;
  icon: string;
};

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

  // NEW (important)
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
  color?: string;
  iconBg?: string;

  tagline: string;
  taglineAccent?: string;
  description: string;
  forWho: string;

  accent: string;
  accentLight: string;
  heroGradient: string;

  programs: ProgramMeta[];

  painPoints?: PainPoint[];
  benefits?: Benefit[];
  steps?: Step[];
  experience?: ExperienceItem[];
  comparison?: ComparisonItem[];
  socialProof?: SocialProof[];
  cta: CategoryCTA;

  // Optional UX enhancer
  emptyState?: {
    title: string;
    description: string;
  };
};

export type ProgramDetail = {
  slug: string;

  // HERO
  hero: {
    title: string;
    subtitle: string;
    highlight?: string;
    image?: string;
  };

  // WHY CHOOSE
  why: {
    title: string;
    items: Benefit[];
  };

  // STEPS (optional)
  steps?: Step[];

  // BENEFITS (main selling)
  benefits: Benefit[];

  // TIMELINE
  timeline: {
    label: string;
    value: string;
  }[];

  // GALLERY (optional)
  gallery?: string[];

  // PRICING
  pricing: {
    price: string;
    tiers?: PriceTier[];
    note?: string;
  };

  // PROMO (optional)
  promo?: {
    title: string;
    description: string;
  };

  // BONUS (optional)
  bonus?: Benefit[];

  // FAQ
  faq: {
    q: string;
    a: string;
  }[];

  // TESTIMONIAL (optional)
  testimonials?: SocialProof[];

  // CTA
  cta: CategoryCTA;
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  lead: {
    key: "lead",
    label: "Starter Program",
    shortLabel: "Starter",
    href: "/programs/lead",

    icon: "zap",
    color: "#FF6B35",
    iconBg: "rgba(255,107,53,0.12)",

    tagline: "Mulai ngomong Bahasa Inggris",
    taglineAccent: "tanpa takut salah",
    description:
      "Program ringan untuk kamu yang ingin mulai belajar Bahasa Inggris tanpa tekanan. Cocok untuk pemula yang ingin coba dulu sebelum komitmen lebih besar.",
    forWho: "Pemula, sibuk, atau kamu yang masih ragu mulai",

    accent: "#FF6B35",
    accentLight: "#FFF0E8",
    heroGradient:
      "radial-gradient(ellipse 80% 60% at 60% 0%, rgba(255,107,53,0.18) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 5% 100%, rgba(255,107,53,0.08) 0%, transparent 55%)",

    programs: [
      {
        title: "Speaking Challenge",
        slug: "speaking-challenge",
        // description:
        // "Challenge 7 hari untuk membangun keberanian berbicara Bahasa Inggris dari nol. Fleksibel, praktis, dan langsung bisa diterapkan.",
        description: "Belajar fleksible via WhatsApp",
        price: "Rp 49.000",
        badge: "Paling Populer",
        highlight: "Mulai dari nol tanpa tekanan",
        tags: ["Self-paced", "7 Hari", "Pemula"],
        icon: "target",
        href: "/speaking-challenge",
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
        description: "Selalu mikir grammar sebelum berani bicara",
        icon: "alert-circle",
      },
      {
        title: "Kurang percaya diri",
        description: "Takut dinilai atau diketawain orang",
        icon: "users",
      },
      {
        title: "Tidak punya waktu",
        description: "Jadwal padat bikin susah ikut kelas",
        icon: "clock",
      },
    ],

    benefits: [
      {
        title: "Tanpa tekanan",
        description: "Belajar santai tanpa jadwal dan tanpa paksaan",
        icon: "smile",
      },
      {
        title: "Langsung praktik",
        description: "Fokus ke speaking, bukan hafalan teori",
        icon: "mic",
      },
      {
        title: "Aman untuk pemula",
        description: "Dirancang khusus dari nol",
        icon: "shield",
      },
    ],

    steps: [
      {
        n: "01",
        title: "Daftar",
        description: "Akses langsung setelah pembayaran",
      },
      {
        n: "02",
        title: "Ikuti challenge",
        description: "Latihan speaking setiap hari",
      },
      {
        n: "03",
        title: "Naik percaya diri",
        description: "Mulai berani bicara tanpa takut",
      },
    ],

    socialProof: [
      {
        quote: "Baru 3 hari ikut, sudah mulai berani ngomong!",
        name: "Aulia",
        role: "Mahasiswa",
      },
      {
        quote: "Akhirnya nemu cara belajar yang nggak bikin stres.",
        name: "Rizky, Karyawan",
      },
    ],

    cta: {
      title: "Mulai sekarang,",
      titleAccent: "tanpa takut salah",
      description:
        "Tidak perlu nunggu siap. Mulai dulu dari langkah kecil yang tepat.",
      primaryLabel: "Mulai Challenge",
      primaryHref: "/speaking-challenge",
      secondaryLabel: "Tanya Dulu",
      secondaryHref: "/contact",
    },
  },

  online: {
    key: "online",
    label: "Program Online",
    shortLabel: "Online",
    href: "/programs/online",

    icon: "book-open",
    color: "#2DB8B0",
    iconBg: "rgba(45,184,176,0.12)",

    tagline: "Kelas Zoom terstruktur — mentor nyata, hasil terukur",
    description:
      "Program online kami dirancang untuk membantu kamu berkembang secara konsisten dengan jadwal yang tetap, mentor berpengalaman, dan komunitas yang suportif.",
    forWho: "Kamu yang ingin belajar terstruktur dari rumah dengan mentor",
    accent: "#2DB8B0",
    accentLight: "#E0F7F6",
    heroGradient:
      "radial-gradient(ellipse 80% 60% at 60% 0%, rgba(45,184,176,0.15) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 5% 100%, rgba(45,184,176,0.07) 0%, transparent 55%)",
    programs: [
      {
        title: "Daily Conversation",
        slug: "daily-conversation",
        description:
          "Latihan percakapan sehari-hari via Zoom selama 2 minggu. Fokus pada kelancaran bicara, bukan hafalan teori.",
        href: "/daily-conversation",
        price: "Rp 299.000",
        badge: "Terlaris",
        tags: ["Zoom", "10x Pertemuan", "Senin–Jumat"],
        icon: "💬",
        highlight: "10 sesi intensif Senin–Jumat",
        format: "Zoom",
      },
      {
        title: "English for Kids",
        slug: "english-for-kids",
        description:
          "Kelas Bahasa Inggris yang menyenangkan dan interaktif khusus untuk anak-anak. Metode bermain sambil belajar yang terbukti efektif.",
        price: "Rp 349.000",
        tags: ["Anak-anak", "Interaktif", "Menyenangkan"],
        icon: "🌟",
        highlight: "Belajar lewat game & cerita",
        href: "/english-for-kids",
      },
      {
        title: "Basic TOEFL",
        slug: "basic-toefl",
        description:
          "Persiapan TOEFL dari dasar via Zoom. Setiap sesi fokus pada strategi dan latihan soal, bukan sekadar teori.",
        price: "Rp 399.000",
        badge: "Bonus 2x TOEFL Test",
        tags: ["Zoom", "10x Pertemuan", "Jam 20.00", "TOEFL"],
        icon: "📊",
        highlight: "Free 2x simulasi TOEFL (awal & akhir)",
        href: "/basic-toefl",
      },
      {
        title: "Grammar for Speaking",
        slug: "grammar-for-speaking",
        description:
          "Grammar yang dipelajari bukan untuk ujian — tapi langsung diterapkan dalam percakapan nyata.",
        price: "Rp 299.000",
        tags: ["Zoom", "10x Pertemuan", "Praktis"],
        icon: "✍️",
        highlight: "Grammar yang langsung dipakai ngobrol",
        href: "/grammar-for-speaking",
      },
      {
        title: "Private Class",
        slug: "private-class",
        price: "Rp 50.000",
        description:
          "Kelas 1-on-1 dengan mentor berdedikasi. Jadwal fleksibel, materi disesuaikan kebutuhan kamu sepenuhnya.",
        priceTiers: [
          { label: "Exclusive 5x", price: "Rp 699.000" },
          { label: "Exclusive 8x", price: "Rp 999.000" },
          { label: "Exclusive 10x", price: "Rp 1.199.000" },
          { label: "Intensive 5x", price: "Rp 499.000" },
          { label: "Intensive 10x", price: "Rp 799.000" },
        ],
        badge: "Paling Fleksibel",
        tags: ["1-on-1", "Jadwal Bebas", "Custom Materi"],
        icon: "👤",
        highlight: "Jadwal & materi 100% sesuai kamu",
        href: "https://inggrisgo.my.canva.site/c4zp6mtyrfp2qqc3",
      },
    ],
    benefits: [
      {
        title: "Live interaction",
        description: "Belajar langsung dengan mentor",
        icon: "book",
      },
      {
        title: "Kurikulum jelas",
        description: "Progress terarah setiap sesi",
        icon: "book",
      },
    ],

    steps: [
      {
        title: "Pilih program",
        description: "Sesuai kebutuhan kamu",
      },
      {
        title: "Join Zoom",
        description: "Ikuti kelas sesuai jadwal",
      },
      {
        title: "Practice & feedback",
        description: "Dapat koreksi langsung",
      },
    ],

    comparison: [
      { label: "Daily", value: "Speaking fokus" },
      { label: "TOEFL", value: "Test preparation" },
      { label: "Kids", value: "Fun learning" },
    ],

    cta: {
      title: "Masih bingung pilih kelas?",
      description:
        "Kami bantu rekomendasikan program terbaik sesuai kebutuhanmu.",
      primaryLabel: "Lihat Semua Program",
      primaryHref: "#program-list",
      secondaryLabel: "Konsultasi Gratis",
      secondaryHref: "/contact",
    },
  },

  offline: {
    key: "offline",
    label: "Program Offline",
    shortLabel: "Offline",

    href: "/programs/offline",

    icon: "tent",
    color: "#0F2340",
    iconBg: "rgba(15,35,64,0.08)",

    tagline: "Belajar langsung di Pare — pengalaman yang tak terlupakan",
    description:
      "Rasakan pengalaman belajar Bahasa Inggris secara intensif dan immersive langsung di Kampung Inggris Pare. Bukan sekadar kursus — ini petualangan.",
    forWho: "Kamu yang ingin belajar intensif dengan pengalaman offline penuh",
    accent: "#0F2340",
    accentLight: "#EEF2F8",
    heroGradient:
      "radial-gradient(ellipse 80% 60% at 60% 0%, rgba(15,35,64,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 5% 100%, rgba(255,107,53,0.08) 0%, transparent 55%)",
    programs: [
      {
        title: "VIP English for Kids",
        slug: "vip-kids",
        price: "Rp 50.000",
        description:
          "Program liburan intensif khusus anak-anak langsung di Kampung Inggris Pare. Penuh aktivitas seru, speaking practice, dan teman baru dari seluruh Indonesia.",
        badge: "Immersive",
        tags: ["Offline", "Anak-anak", "Kampung Inggris", "Intensif"],
        icon: "🏕️",
        highlight: "Full immersion di lingkungan English-speaking",
        href: "/vip-kids",
      },
      {
        title: "Kelas Rombongan",
        slug: "rombongan",
        price: "Rp 50.000",
        description:
          "Bawa kelompokmu — kelas, komunitas, atau keluarga besar — ke Kampung Inggris. Program dirancang khusus untuk grup dengan aktivitas kolaboratif.",
        badge: "Group",
        tags: ["Offline", "Grup", "Custom", "Kampung Inggris"],
        icon: "🤝",
        highlight: "Kuota terbatas — cocok untuk sekolah & komunitas",
        href: "/rombongan",
      },
    ],
    experience: [
      {
        title: "English Area 24 Jam",
        description: "Dipaksa terbiasa pakai English",
        icon: "🌍",
      },
      {
        title: "Daily Activities",
        description: "Games, speaking, practice",
        icon: "🔥",
      },
    ],

    benefits: [
      {
        title: "Progress cepat",
        description: "1 minggu terasa beda drastis",
        icon: "book",
      },
      {
        title: "Lingkungan supportif",
        description: "Semua belajar bareng",
        icon: "book",
      },
    ],

    comparison: [
      { label: "Format", value: "Offline (Pare)" },
      { label: "Durasi", value: "Intensif" },
      { label: "Level", value: "Semua level" },
    ],

    cta: {
      title: "Siap merasakan pengalaman belajar yang berbeda?",
      description:
        "Gabung program camp dan rasakan perubahan drastis dalam speaking kamu.",
      primaryLabel: "Lihat Program Camp",
      primaryHref: "#program-list",
      secondaryLabel: "Tanya Admin",
      secondaryHref: "/contact",
    },
  },
};
