// app/modules/site-content/site-content.defaults.ts
//
// Verbatim fallback content for the landing-page CMS, lifted out of the
// original hard-coded section components:
//   components/sections/home/{HeroAnimated,ProblemSection,MethodSection,WhyUsSection}.tsx
//   components/sections/about/{HeroSection,CompanySection,VisionMissionSection}.tsx
//   app/(home)/contact/page.tsx
//   components/sections/home/CTASection.tsx
//
// Used both as the service-level merge fallback and as the seed payload.
import { DEFAULT_PROGRAM_SHOWCASE } from "./program-showcase.templates";

import type {
  AboutPageSettingsInsert,
  ContactPageSettingsInsert,
  HomePageSettingsInsert,
  SiteCtaSettingsInsert,
} from "@/app/db/schema/site-content";
import type {
  ProgramShowcase,
} from "./site-content.types";

/* =========================================================
   HOME
========================================================= */

export const DEFAULT_HOME = {
  id: "default",

  heroBadgeText: "Kampung Inggris Pare, Indonesia",
  heroTitle: "Belajar Bahasa Inggris",
  heroTitleAccent: "Tanpa Takut Salah",
  heroSubtitle:
    "Mulai berbicara bahasa Inggris dengan percaya diri bersama Inggris Go dari Kampung Inggris Pare.",
  heroSubtitleHighlight: "Inggris Go",
  heroDescription:
    "Program online, privat, dan English camp — dirancang khusus agar pemula bisa speaking dengan cara yang sederhana, praktis, dan menyenangkan.",
  heroImageUrl: "/images/categories/online-hero.png",
  heroImageAlt: "Siswa Inggris Go berbicara dengan percaya diri",
  heroPrimaryCtaLabel: "Mulai Speaking Challenge",
  heroPrimaryCtaHref: "/programs/lead/speaking-challenge",
  heroSecondaryCtaLabel: "Lihat Semua Program",
  heroSecondaryCtaHref: "#programs",
  heroFloatingText: {
    speechName: "Rina, Surabaya",
    speechLocation: "Surabaya",
    speechQuote: "Sekarang aku udah berani ngomong di depan bule!",
    speechInitials: "R",
    liveTitle: "Live Speaking Now",
    activeText: "Active",
    chatHeader: "SPEAKING PRACTICE",
    chatMsg1: "Hello! How are you?",
    chatMsg2: "I'm fine, thank you!",
  },
  heroStatLabels: [
    { key: "alumni", label: "Siswa Bergabung" },
    { key: "rating", label: "Rating Kepuasan" },
    { key: "years", label: "Tahun Pengalaman" },
  ],

  problemEyebrow: "Masalah Umum",
  problemTitle: "Mengapa Banyak Orang",
  problemTitleAccent: "Tidak Pernah Berani Speaking?",
  problemDescription:
    "Banyak orang sudah belajar bahasa Inggris bertahun-tahun tetapi masih merasa takut berbicara.",
  problemCards: [
    {
      number: "01",
      title: "Takut Salah Grammar",
      body: "Terlalu fokus pada kesempurnaan membuat kamu bungkam sebelum mulai bicara.",
      icon: "alert-circle",
      colorKey: "orange",
    },
    {
      number: "02",
      title: "Tidak Ada Partner Latihan",
      body: "Tanpa lawan bicara, speaking terasa seperti latihan renang di darat — tidak ada gunanya.",
      icon: "users",
      colorKey: "teal",
    },
    {
      number: "03",
      title: "Bingung Harus Mulai dari Mana",
      body: "Banyak metode, banyak aplikasi, banyak kursus — justru bikin makin stuck di titik nol.",
      icon: "help-circle",
      colorKey: "amber",
    },
    {
      number: "04",
      title: "Kurang Percaya Diri",
      body: "Sudah belajar bertahun-tahun, tapi saat diminta bicara — semua kata seakan lenyap begitu saja.",
      icon: "heart",
      colorKey: "purple",
    },
  ],
  problemCalloutText: "Belajar bahasa Inggris seharusnya",
  problemCalloutHighlight: "tidak membuat kamu merasa takut!",
  problemCalloutIcon: "lightbulb",

  methodEyebrow: "Metode kami",
  methodTitle: "Metode Belajar",
  methodTitleAccent: "Inggris Go",
  methodDescription:
    "4 langkah sederhana untuk berbicara bahasa Inggris dengan percaya diri",
  methodSteps: [
    {
      num: "1",
      title: "Understand",
      subtitle: "Pahami Dasarnya",
      body: "Memahami kalimat sederhana dan struktur dasar bahasa Inggris dengan metode yang mudah dicerna.",
      tags: ["Kosakata dasar", "Pola kalimat", "Listening"],
      icon: "eye",
    },
    {
      num: "2",
      title: "Imitate",
      subtitle: "Tiru & Rasakan",
      body: "Meniru cara bicara tutor berpengalaman — intonasi, ritme, dan ekspresi yang natural.",
      tags: ["Shadowing", "Pronunciation", "Intonasi"],
      icon: "copy",
    },
    {
      num: "3",
      title: "Practice",
      subtitle: "Latihan Rutin",
      body: "Latihan berbicara secara konsisten dengan feedback langsung dari tutor yang supportif.",
      tags: ["Feedback tutor", "Speaking drill", "Koreksi langsung"],
      icon: "plus-square",
    },
    {
      num: "4",
      title: "Speak",
      subtitle: "Berani Bicara!",
      body: "Gunakan bahasa Inggris dengan percaya diri di situasi nyata — tanpa rasa takut salah.",
      tags: ["Percaya diri", "Situasi nyata", "No fear!"],
      icon: "mic",
    },
  ],
  methodFootnotePrefix: "Sudah terbukti membantu",
  methodFootnoteHighlight: "2000+",
  methodFootnoteSuffix: "siswa dari nol jadi berani speaking",

  advantageEyebrow: "Keunggulan Kami",
  advantageTitle: "Mengapa Belajar di",
  advantageTitleAccent: "Inggris Go",
  advantageDescription:
    "Bukan sekadar kursus biasa — kami membangun kepercayaan diri berbicara bahasa Inggris dari nol.",
  advantageFeatures: [
    {
      title: "Metode Praktis",
      desc: "Dirancang khusus untuk pemula — langsung speaking dari hari pertama, tanpa basa-basi teori.",
      icon: "lightbulb",
      gradientKey: "blue",
    },
    {
      title: "Tutor Berpengalaman",
      desc: "Tim tutor profesional dari Kampung Inggris Pare dengan jam terbang tinggi dan dedikasi penuh.",
      icon: "users",
      gradientKey: "navy",
    },
    {
      title: "Online & Offline",
      desc: "Belajar dari rumah secara online, atau datang langsung ke Pare untuk pengalaman belajar imersif.",
      icon: "monitor",
      gradientKey: "gold",
    },
    {
      title: "Kampung Inggris Pare",
      desc: "Lingkungan belajar autentik di pusat bahasa Inggris terbesar Indonesia — ekosistem terbaik untuk berkembang.",
      icon: "map-pin",
      gradientKey: "sky",
    },
    {
      title: "Fokus Speaking",
      desc: "Setiap program kami punya satu tujuan: membuatmu berani dan lancar bicara bahasa Inggris.",
      icon: "mic",
      gradientKey: "blue",
    },
    {
      title: "Garansi Belajar",
      desc: "Komitmen kualitas penuh — pendampingan berkelanjutan hingga kamu mencapai target yang ditetapkan.",
      icon: "shield-check",
      gradientKey: "navy",
    },
  ],

  programShowcase: DEFAULT_PROGRAM_SHOWCASE as ProgramShowcase,

  isActive: true as boolean,
} satisfies HomePageSettingsInsert;

/* =========================================================
   ABOUT
========================================================= */

export const DEFAULT_ABOUT = {
  id: "default",

  heroLocationBadge: "Kampung Inggris Pare, Kediri",
  heroSectionBadge: "Tentang Kami",
  heroOverline: "Kisah kami",
  heroTitle: "Membangun Kepercayaan Diri",
  heroTitleAccent: "Berbahasa Inggris",
  heroDescription:
    "Inggris Go hadir untuk membuktikan bahwa siapa pun bisa berbicara bahasa Inggris dengan percaya diri — dari Kampung Inggris untuk seluruh Indonesia.",
  heroStatLabels: [
    { key: "alumni", label: "Siswa Aktif" },
    { key: "years", label: "Tahun Berdiri" },
    { key: "programs", label: "Jenis Program" },
  ],
  heroTeamStripLabel: "Tim Inggris Go",
  heroEditorial: {
    quote: "Speak First, Perfect Later.",
    authorName: "Nina Rokhmawati, S.Pd",
    authorRole: "CEO & Founder · Inggris Go",
    authorInitials: "NR",
    fact1Label: "Berbasis di",
    fact1Value: "Kampung Inggris Pare",
    fact2Label: "Program tersedia",
    fact2Value: "Online & Offline",
  },

  whoEyebrow: "Profil Perusahaan",
  whoTitle: "Siapa Kami?",
  whoParagraphs: [
    "Inggris Go adalah lembaga belajar bahasa Inggris berbasis di Kampung Inggris Pare, Kediri — pusat bahasa Inggris terbesar di Indonesia. Kami didirikan dengan satu keyakinan: rasa takut salah ngomong adalah hambatan terbesar, bukan kemampuan.",
    "Kami menyediakan program online yang terjangkau untuk pemula, kelas intensif dengan kelas kecil untuk hasil maksimal, program camp di Pare untuk pengalaman imersif, hingga program khusus untuk sekolah dan pesantren di seluruh Indonesia.",
    "Dengan tim tutor berpengalaman dan metode yang berfokus pada speaking aktif sejak hari pertama, siswa telah membuktikan bahwa bahasa Inggris bukan sesuatu yang sulit — hanya butuh tempat yang tepat untuk berlatih.",
  ],
  whoTags: [
    { icon: "map-pin", text: "Kampung Inggris Pare, Kediri" },
    { icon: "users", text: "2000+ alumni" },
    { icon: "award", text: "Tutor berpengalaman" },
  ],
  whoImageUrl: "/logo.png",
  whoFilosofiQuote: "Speak First, Perfect Later.",
  whoFilosofiDescription:
    "Filosofi kami — mulailah berbicara dari hari pertama. Kesempurnaan datang seiring latihan.",
  whoFounderName: "Nina Rokhmawati, S.Pd",
  whoFounderRole: "CEO & Founder · Inggris Go",
  whoFounderInitials: "NR",
  whoFounderImageUrl: "",
  whoLocationLine: "Kampung Inggris Pare, Kediri · Indonesia",

  vmEyebrow: "Visi & Misi",
  vmTitle: "Arah & Tujuan Kami",
  vmTitleAccent: "Tujuan",
  visionBadge: "Inggris Go · Est. 2022",
  visionStatement:
    "Menjadi platform pembelajaran bahasa Inggris terdepan yang melahirkan generasi Indonesia yang percaya diri berkomunikasi secara global —",
  visionStatementAccent: "tanpa rasa takut, tanpa hambatan.",
  visionFooterNote: "Membangun Indonesia yang berbicara dunia",
  missions: [
    {
      num: "01",
      text: "Menyediakan program belajar bahasa Inggris yang terjangkau, praktis, dan berdampak nyata.",
    },
    {
      num: "02",
      text: "Menciptakan lingkungan belajar yang mendorong peserta berbicara aktif sejak hari pertama.",
    },
    {
      num: "03",
      text: "Menghadirkan tutor berkualitas yang tidak hanya mengajar, tetapi menginspirasi.",
    },
    {
      num: "04",
      text: "Memperluas akses pendidikan bahasa Inggris berkualitas ke seluruh Indonesia.",
    },
  ],

  teamMemberOverrides: {},

  isActive: true as boolean,
} satisfies AboutPageSettingsInsert;

/* =========================================================
   CONTACT
========================================================= */

export const DEFAULT_CONTACT = {
  id: "default",

  heroBadgeText: "Hubungi InggrisGo",
  heroTitle: "Hubungi Kami —",
  heroTitleAccent: "Kami Siap Membantu",
  heroDescription:
    "Punya pertanyaan tentang belajar English? Tim InggrisGo siap membantu kamu menemukan cara terbaik untuk berkembang.",
  heroTrustPills: [
    { icon: "clock", text: "Balas dalam 24 jam" },
    { icon: "users", text: "Tim asli, bukan bot" },
    { icon: "shield", text: "Data kamu aman" },
  ],
  heroStats: [
    {
      icon: "clock",
      title: "Waktu Respons",
      subtitle: "Rata-rata < 4 jam kerja",
    },
    {
      icon: "heart",
      title: "1.200+ Pelajar",
      subtitle: "Sudah dipercaya ribuan orang",
    },
    {
      icon: "star",
      title: "Rating 4.9/5",
      subtitle: "Dari ulasan pelajar aktif",
    },
  ],
  heroImageUrl: "/images/categories/online-hero.png",

  methodsEyebrow: "Pilih Cara Kontak",
  methodsTitle: "Bagaimana Kamu Bisa Menghubungi Kami",
  methodsSubtitle: "Pilih yang paling nyaman dan sesuai kebutuhanmu",
  methods: [
    {
      icon: "message-circle",
      label: "WhatsApp",
      whenToUse: "Butuh jawaban cepat sekarang",
      detail: "Biasanya dibalas dalam hitungan menit",
      actionLabel: "Chat Sekarang",
      actionHref:
        "https://wa.me/6281234567890?text=Halo%20InggrisGo%2C%20saya%20ingin%20bertanya%20tentang...",
      external: true,
      badge: "Tercepat",
      colorKey: "green",
    },
    {
      icon: "mail",
      label: "Email / Formulir",
      whenToUse: "Pertanyaan detail atau lampiran",
      detail: "support@inggrisgo.com · balas dalam 24 jam",
      actionLabel: "Isi Formulir",
      actionHref: "#contact-form",
      external: false,
      badge: "",
      colorKey: "blue",
    },
    {
      icon: "graduation-cap",
      label: "Konsultasi Program",
      whenToUse: "Pilih kelas atau camp yang tepat",
      detail: "Gratis, tanpa syarat, tanpa tekanan",
      actionLabel: "Lihat Program",
      actionHref: "/courses",
      external: false,
      badge: "",
      colorKey: "violet",
    },
  ],

  formRecipientEmail: "support@inggrisgo.com",
  formEyebrow: "Formulir Kontak",
  formTitle: "Ceritakan Kebutuhanmu",
  formSubtitle: "Semakin detail pesanmu, semakin tepat jawaban kami.",
  formCategories: [
    { value: "general", label: "Pertanyaan Umum" },
    { value: "speaking", label: "Kelas Speaking" },
    { value: "camp", label: "English Camp" },
    { value: "partnership", label: "Kerjasama / Kolaborasi" },
  ],
  infoItems: [
    {
      icon: "mail",
      label: "Email",
      value: "support@inggrisgo.com",
      href: "mailto:support@inggrisgo.com",
      sub: "Balas dalam 24 jam",
    },
    {
      icon: "phone",
      label: "WhatsApp",
      value: "+62 812-3456-7890",
      href: "https://wa.me/6281234567890",
      sub: "Biasanya lebih cepat",
    },
    {
      icon: "map-pin",
      label: "Lokasi",
      value: "Online & Offline (Indonesia)",
      href: "",
      sub: "",
    },
    {
      icon: "clock",
      label: "Jam Operasional",
      value: "Senin–Sabtu, 08.00–20.00 WIB",
      href: "",
      sub: "",
    },
  ],
  faqItems: [
    {
      q: "Berapa biaya program speaking InggrisGo?",
      a: "Biaya bervariasi tergantung program yang dipilih. Kelas speaking online mulai dari Rp 150.000/sesi, sementara English Camp memiliki paket tersendiri. Kami juga menyediakan sesi percobaan gratis agar kamu bisa merasakan dulu sebelum komitmen.",
    },
    {
      q: "Apakah ada kelas untuk pemula yang belum lancar sama sekali?",
      a: "Tentu! Kami punya jalur belajar dari level dasar (A1) hingga mahir (C1). Setiap pendaftar akan menjalani placement test singkat agar masuk ke kelas yang sesuai levelnya, bukan yang terlalu mudah atau terlalu sulit.",
    },
    {
      q: "Bagaimana sistem belajarnya — online atau offline?",
      a: "InggrisGo menyediakan keduanya. Kelas online via Zoom berlangsung setiap minggu dengan jadwal fleksibel. English Camp diadakan secara offline di beberapa kota besar. Kamu juga bisa gabungkan keduanya untuk hasil yang lebih optimal.",
    },
    {
      q: "Berapa lama sampai saya bisa melihat perkembangan nyata?",
      a: "Sebagian besar pelajar mulai terasa perbedaannya setelah 4–6 sesi. Tentu bergantung pada konsistensi belajar kamu. Kami juga menyediakan progress report bulanan supaya perkembanganmu bisa dipantau secara konkret.",
    },
    {
      q: "Apakah ada garansi uang kembali jika tidak puas?",
      a: "Kami percaya diri dengan kualitas program kami. Jika setelah sesi pertama kamu merasa tidak cocok, kami akan refund penuh tanpa pertanyaan. Kepuasan pelajar adalah prioritas utama kami.",
    },
  ],
  // No public /faq page exists; the "Lihat semua FAQ" link only shows when an
  // admin fills this in via the CMS.
  faqSeeAllHref: "",
  sidebarCtaTitle: "Mau langsung mulai belajar?",
  sidebarCtaText:
    "Lihat program speaking dan English camp yang sudah diikuti lebih dari 1.200 pelajar.",
  sidebarCtaButtonLabel: "Lihat Semua Program",
  sidebarCtaButtonHref: "/courses",

  whyChooseEyebrow: "",
  whyChooseBadgeText: "Kenapa kamu bisa percaya kami?",
  whyChooseTitle: "Kami Tidak Sekadar Menjawab — Kami Peduli",
  whyChooseDescription:
    "Setiap pesan yang masuk dibaca oleh manusia asli yang ingin membantumu berkembang.",
  whyChooseItems: [
    {
      icon: "clock",
      title: "Respons rata-rata < 4 jam",
      desc: "Bukan 24 jam yang terasa lama — sebagian besar pesan kami balas pada hari yang sama, bahkan di akhir pekan.",
      colorKey: "blue",
    },
    {
      icon: "users",
      title: "Manusia, bukan template otomatis",
      desc: "Kamu akan berbicara dengan tim pengajar dan staf asli yang memahami kebutuhan belajarmu secara personal.",
      colorKey: "violet",
    },
    {
      icon: "shield",
      title: "Datamu tidak kami jual",
      desc: "Email dan pesanmu hanya digunakan untuk membalasmu. Tidak ada iklan, tidak ada daftar mailing tersembunyi.",
      colorKey: "teal",
    },
  ],

  isActive: true as boolean,
} satisfies ContactPageSettingsInsert;

/* =========================================================
   SHARED CTA
========================================================= */

export const DEFAULT_CTA = {
  id: "default",

  eyebrow: "🚀 Mulai Perjalanan Bahasa Inggrismu Sekarang!",
  title: "Siap Berani Bicara",
  titleAccent: "Bahasa Inggris?",
  description:
    "Jangan biarkan rasa takut menghalangi impianmu. Mulai belajar speaking bersama Inggris Go hari ini!",
  primaryLabel: "Lihat Program",
  primaryHref: "/programs",
  secondaryLabel: "Hubungi Admin",
  secondaryHref: "",
  secondaryIsWhatsapp: true,
  trustPoints: [
    "Tanpa syarat khusus",
    "Cocok untuk pemula absolut",
    "Respon admin cepat",
  ],

  isActive: true as boolean,
} satisfies SiteCtaSettingsInsert;
