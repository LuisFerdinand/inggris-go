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

export type ProgramDetail = {
  slug: string;

  hero: {
    title: string;
    subtitle: string;
    highlight?: string;
    image?: string;
  };

  why: {
    title: string;
    items: Benefit[];
  };

  steps?: Step[];
  benefits: Benefit[];

  timeline: {
    label: string;
    value: string;
  }[];

  gallery?: string[];

  pricing: {
    price: string;
    tiers?: PriceTier[];
    note?: string;
  };

  promo?: {
    title: string;
    description: string;
  };

  bonus?: Benefit[];

  faq: {
    q: string;
    a: string;
  }[];

  testimonials?: SocialProof[];

  cta: CategoryCTA;
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  lead: {
    key: "lead",
    label: "Starter Program",
    shortLabel: "Starter",
    href: "/programs/lead",

    icon: "zap",
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
        tags: ["Self-paced", "7 Hari", "WhatsApp", "Pemula"],
        icon: "target",
        href: "/programs/lead",
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
      primaryHref: "/speaking-challenge",
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
    theme: { primary: "#2db8b0" },

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
        href: "/daily-conversation",
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
        href: "/english-for-kids",
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
        href: "/basic-toefl",
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
        href: "/grammar-for-speaking",
      },
      {
        title: "Private Class",
        slug: "private-class",
        price: "Rp 499.000",
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
        href: "https://inggrisgo.my.canva.site/c4zp6mtyrfp2qqc3",
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
      secondaryHref: "/contact",
    },
  },

  offline: {
    key: "offline",
    label: "Program Offline",
    shortLabel: "Offline",
    href: "/programs/offline",

    icon: "tent",
    theme: { primary: "#8b5cf6" },

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
        href: "/vip-kids",
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
        href: "/rombongan",
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
