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

export type Program = {
  title: string;
  slug: string;
  description: string;

  price: string;
  priceTiers?: PriceTier[];

  badge?: string;
  highlight?: string;
  tags: string[];
  icon: string;

  link: string;

  // NEW (important)
  benefits?: Benefit[];
  duration?: string;
  format?: string;
  level?: string;
};

export type CategoryMeta = {
  key: string;
  label: string;
  tagline: string;
  taglineAccent?: string;
  description: string;
  forWho: string;

  accent: string;
  accentLight: string;
  heroGradient: string;

  programs: Program[];

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

export const CATEGORIES: Record<string, CategoryMeta> = {
  lead: {
    key: "lead",
    label: "Starter Program",
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
        description:
          "Challenge 7 hari untuk membangun keberanian berbicara Bahasa Inggris dari nol. Fleksibel, praktis, dan langsung bisa diterapkan.",
        price: "Rp 49.000",
        badge: "Paling Populer",
        highlight: "Mulai dari nol tanpa tekanan",
        tags: ["Self-paced", "7 Hari", "Pemula"],
        icon: "target",
        link: "https://inggrisgo.my.canva.site/c4zfrede90me2ff8",
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

      {
        title: "Daily Conversation Drill",
        slug: "daily-conversation-drill",
        description:
          "Latihan percakapan harian dengan skenario real-life agar kamu terbiasa ngomong tanpa mikir lama.",
        price: "Rp 79.000",
        badge: "Best Value",
        highlight: "Latihan real conversation setiap hari",
        tags: ["Praktik", "14 Hari", "Pemula"],
        icon: "message-circle",
        link: "https://example.com/daily-conversation",
        benefits: [
          {
            title: "Simulasi nyata",
            description: "Belajar dari situasi sehari-hari",
            icon: "users",
          },
          {
            title: "Repeatable practice",
            description: "Bisa diulang kapan saja",
            icon: "refresh-cw",
          },
          {
            title: "Vocabulary relevan",
            description: "Kata-kata yang sering dipakai",
            icon: "book-open",
          },
        ],
        duration: "14 hari",
        format: "Self-paced",
        level: "Pemula",
      },

      {
        title: "Confidence Booster Class",
        slug: "confidence-booster-class",
        description:
          "Program intensif untuk menghilangkan rasa takut dan membangun kepercayaan diri saat berbicara Bahasa Inggris.",
        price: "Rp 149.000",
        badge: "Limited Class",
        highlight: "Fokus ke mindset & confidence",
        tags: ["Live Class", "Interaktif", "Pemula"],
        icon: "zap",
        link: "https://example.com/confidence-booster",
        benefits: [
          {
            title: "Live feedback",
            description: "Dibimbing langsung oleh mentor",
            icon: "video",
          },
          {
            title: "Safe environment",
            description: "Belajar tanpa takut di-judge",
            icon: "shield",
          },
          {
            title: "Confidence building",
            description: "Latihan mental + praktik",
            icon: "smile",
          },
        ],
        duration: "5 sesi",
        format: "Live",
        level: "Pemula",
      },

      {
        title: "Pronunciation Mastery",
        slug: "pronunciation-mastery",
        description:
          "Perbaiki pelafalan agar terdengar lebih natural dan mudah dipahami oleh lawan bicara.",
        price: "Rp 99.000",
        badge: "Recommended",
        highlight: "Biar ngomong lebih jelas & natural",
        tags: ["Audio Training", "Self-paced", "All Level"],
        icon: "volume-2",
        link: "https://example.com/pronunciation",
        benefits: [
          {
            title: "Audio-based learning",
            description: "Fokus ke listening & speaking",
            icon: "headphones",
          },
          {
            title: "Phonetic guide",
            description: "Belajar cara pengucapan yang benar",
            icon: "type",
          },
          {
            title: "Shadowing technique",
            description: "Latihan meniru native speaker",
            icon: "repeat",
          },
        ],
        duration: "10 hari",
        format: "Self-paced",
        level: "Semua Level",
      },

      {
        title: "Interview English Prep",
        slug: "interview-english-prep",
        description:
          "Persiapan interview kerja dalam Bahasa Inggris dengan simulasi pertanyaan HR dan jawaban terbaik.",
        price: "Rp 199.000",
        badge: "Career Boost",
        highlight: "Siap interview tanpa grogi",
        tags: ["Career", "Simulation", "Intermediate"],
        icon: "briefcase",
        link: "https://example.com/interview-prep",
        benefits: [
          {
            title: "Mock interview",
            description: "Simulasi interview nyata",
            icon: "users",
          },
          {
            title: "Answer framework",
            description: "Struktur jawaban yang profesional",
            icon: "layout",
          },
          {
            title: "Common questions",
            description: "Latihan pertanyaan yang sering keluar",
            icon: "help-circle",
          },
        ],
        duration: "7 hari",
        format: "Hybrid",
        level: "Menengah",
      },

      {
        title: "Grammar for Speaking",
        slug: "grammar-for-speaking",
        description:
          "Belajar grammar praktis yang langsung dipakai saat speaking, tanpa teori yang membingungkan.",
        price: "Rp 69.000",
        badge: "Essential",
        highlight: "Grammar tanpa ribet",
        tags: ["Grammar", "Praktis", "Pemula"],
        icon: "book",
        link: "https://example.com/grammar-speaking",
        benefits: [
          {
            title: "Practical grammar",
            description: "Langsung dipakai saat ngomong",
            icon: "check-circle",
          },
          {
            title: "No overthinking",
            description: "Fokus ke penggunaan, bukan hafalan",
            icon: "brain",
          },
          {
            title: "Simple explanation",
            description: "Penjelasan mudah dipahami",
            icon: "file-text",
          },
        ],
        duration: "5 hari",
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
      primaryHref: "/programs/lead/speaking-challenge",
      secondaryLabel: "Tanya Dulu",
      secondaryHref: "/contact",
    },
  },

  online: {
    key: "online",
    label: "Program Online",
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
        link: "/",
        price: "Rp 299.000",
        badge: "Terlaris",
        tags: ["Zoom", "10x Pertemuan", "Senin–Jumat"],
        icon: "💬",
        highlight: "10 sesi intensif Senin–Jumat",
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
        link: "https://inggrisgo.my.canva.site/c4zs04vszwkpqvdc",
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
        link: "https://inggrisgo.my.canva.site/c4zjzqdj8v0wv0jp",
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
        link: "https://inggrisgo.my.canva.site/c4zmesmhd3vfrp4q",
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
        link: "https://inggrisgo.my.canva.site/c4zp6mtyrfp2qqc3",
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

  camp: {
    key: "camp",
    label: "Holiday Camp",
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
        link: "https://inggrisgo.my.canva.site/c4zt61nx9c4kyq4d",
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
        link: "https://inggrisgo.my.canva.site/c4zsvp1db99wae9r",
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

  custom: {
    key: "school",
    label: "Program Sekolah",
    tagline: "Solusi Bahasa Inggris untuk institusi & sekolah",
    description:
      "Kami hadir untuk membantu sekolah dan institusi membangun kemampuan Bahasa Inggris siswa dengan program yang dirancang khusus sesuai kebutuhan.",
    forWho: "Sekolah, madrasah, pesantren, atau institusi pendidikan lainnya",
    accent: "#7C3AED",
    accentLight: "#F3EEFF",
    heroGradient:
      "radial-gradient(ellipse 80% 60% at 60% 0%, rgba(124,58,237,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 5% 100%, rgba(124,58,237,0.06) 0%, transparent 55%)",
    programs: [],
    benefits: [
      {
        title: "Custom kurikulum",
        description: "Disesuaikan dengan kebutuhan sekolah",
        icon: "📘",
      },
      {
        title: "Fleksibel",
        description: "Bisa online, offline, atau hybrid",
        icon: "⚙️",
      },
      {
        title: "Skala besar",
        description: "Cocok untuk banyak siswa sekaligus",
        icon: "🏫",
      },
    ],
    painPoints: [
      {
        title: "Siswa pasif",
        description: "Takut berbicara Bahasa Inggris",
      },
      {
        title: "Metode kurang engaging",
        description: "Belajar terasa membosankan",
      },
    ],

    steps: [
      {
        title: "Diskusi kebutuhan",
        description: "Kami pahami kondisi sekolah",
      },
      {
        title: "Custom program",
        description: "Kurikulum disesuaikan",
      },
      {
        title: "Implementasi",
        description: "Program dijalankan & dievaluasi",
      },
    ],

    cta: {
      title: "Butuh program khusus untuk sekolahmu?",
      description:
        "Tim kami siap membantu menyusun program terbaik untuk institusimu.",
      primaryLabel: "Ajukan Proposal",
      primaryHref: "/contact",
    },
    emptyState: {
      title: "Program disesuaikan khusus",
      description:
        "Saat ini program sekolah tidak tersedia dalam paket tetap. Semua program dirancang sesuai kebutuhan institusi.",
    },
  },
};
