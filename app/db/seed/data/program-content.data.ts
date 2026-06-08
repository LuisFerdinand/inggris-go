import {
  ProgramSection,
  ProgramTheme,
} from "@/app/modules/program/program.types";
import { buildWhatsAppUrl } from "@/lib/config";
import { generateSlug } from "@/lib/utils";
import { SOCIAL_PROOF } from "@/constants";

type ProgramContentSeed = {
  programSlug: string;
  theme: ProgramTheme;
  sections: ProgramSection[];
};

export const PROGRAM_CONTENT_DATA: ProgramContentSeed[] = [
  {
    programSlug: generateSlug("Speaking Challenge"),
    theme: { primary: "#ff6b35" },
    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
          label: "Speaking Challenge 14 Hari",

          tagline: "Kamu Ngerti Inggris...",
          taglineAccent: "Tapi Nggak Bisa Ngomong?",

          description:
            "Bukan karena kamu bodoh. Tapi karena kamu belum pernah dilatih.",

          subtitle:
            "Mulai latihan speaking setiap hari lewat WhatsApp. Tanpa Zoom. Tanpa ribet.",

          tags: [
            { title: "14 Hari Challenge", icon: "calendar" },
            { title: "Via WhatsApp", icon: "smartphone" },
            { title: "Cocok untuk Pemula", icon: "target" },
          ],

          socialProof: {
            text: "500+ peserta sudah mulai berani ngomong",
            count: "500+",
          },

          cta: [
            {
              label: "Ikut Challenge – Cuma 49K",
              href: buildWhatsAppUrl({
                title: "Speaking Challenge",
                price: "Rp 49.000",
                duration: "14 hari",
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
          title: "Kenapa Kamu Belum Bisa Ngomong?",
          tagline: "Bukan Karena Kamu Nggak Bisa",
          taglineAccent: "Tapi Karena...",
          subtitle: "Masalahnya bukan di grammar. Tapi di kebiasaan.",

          items: [
            {
              title: "Jarang latihan speaking",
              description:
                "Lebih sering baca & nonton daripada benar-benar ngomong",
              icon: "book-open",
            },
            {
              title: "Nggak pernah dipaksa praktik",
              description: "Tanpa tekanan, kamu akan terus menunda latihan",
              icon: "zap",
            },
            {
              title: "Takut salah",
              description: "Akhirnya diam dan tidak pernah mulai",
              icon: "user-x",
            },
            {
              title: "Tidak ada feedback",
              description: "Tidak tahu mana yang benar & harus diperbaiki",
              icon: "message-circle",
            },
          ],
        },
      },

      {
        id: "steps",
        type: "steps",
        content: {
          title: "Cara Challenge Ini Bekerja",
          tagline: "Simple, Tapi",
          taglineAccent: "Efektif",
          subtitle: "Fokus: praktik setiap hari",

          items: [
            {
              n: "01",
              title: "Tutor Kirim Video",
              description: "Setiap hari ada contoh speaking dari tutor",
              icon: "video",
            },
            {
              n: "02",
              title: "Kamu Tiru & Latihan",
              description: "Ikuti contoh dan mulai ngomong",
              icon: "mic",
            },
            {
              n: "03",
              title: "Kirim Voice Note",
              description: "Rekam & kirim ke grup WhatsApp",
              icon: "send",
            },
            {
              n: "04",
              title: "Dapat Feedback",
              description: "Tutor koreksi & bantu improve speaking kamu",
              icon: "message-square",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Yang Akan Kamu Dapatkan",
          tagline: "Bukan Cuma Belajar",
          taglineAccent: "Tapi Berubah",
          items: [
            { title: "Latihan speaking setiap hari", icon: "volume-2" },
            { title: "Dipaksa berani ngomong", icon: "zap" },
            { title: "Video contoh dari tutor", icon: "play-circle" },
            { title: "Feedback langsung setiap hari", icon: "message-square" },
            { title: "Materi super basic & mudah dipahami", icon: "book-open" },
            { title: "Belajar fleksibel via WhatsApp", icon: "smartphone" },
          ],
        },
      },

      {
        id: "timeline",
        type: "timeline",
        content: {
          icon: "calendar",
          tagline: "14 Hari Challenge",
          taglineAccent: "Konsisten",
          title: "Perjalanan Kamu",
          subtitle: "Latihan setiap hari selama 14 hari",

          weeks: [
            {
              icon: "sprout",
              week: "Minggu 1",
              title: "Mulai Berani Ngomong",
              points: [
                "Basic speaking",
                "Perkenalan & daily phrases",
                "Mulai percaya diri",
              ],
            },
            {
              icon: "target",
              week: "Minggu 2",
              title: "Lebih Lancar & Spontan",
              points: [
                "Kalimat lebih panjang",
                "Daily conversation",
                "Final challenge",
              ],
            },
          ],
        },
      },

      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Mulai dari Langkah Kecil",
          description: "Nggak perlu nunggu siap. Mulai aja dulu.",

          groups: [
            {
              title: "Speaking Challenge",
              subtitle: "Program 14 Hari",
              icon: "zap",

              features: [
                "14 hari speaking challenge",
                "Latihan setiap hari",
                "Video contoh dari tutor",
                "Feedback langsung",
                "Grup WhatsApp supportif",
                "Cocok untuk pemula banget",
              ],

              packages: [
                {
                  label: "Full Challenge Access",
                  price: "Rp 49.000",
                  highlight: "Cuma 49K",
                },
              ],
            },
          ],

          urgency: "Kuota terbatas • batch cepat penuh",
        },
      },

      {
        id: "faq",
        type: "faq",
        content: [
          {
            q: "Apakah cocok untuk pemula banget?",
            a: "Ya, ini dirancang khusus untuk pemula dari nol.",
          },
          {
            q: "Apakah harus ikut live?",
            a: "Tidak. Semua dilakukan via WhatsApp, fleksibel.",
          },
          {
            q: "Apakah benar ada feedback?",
            a: "Ya, setiap latihan kamu akan dapat feedback dari tutor.",
          },
        ],
      },

      {
        id: "cta",
        type: "cta",
        content: {
          title: "Kalau Kamu Terus Nunda,",
          titleAccent: "Kamu Nggak Akan Pernah Mulai",
          subtitle: "Kemampuan speaking itu bukan dipelajari. Tapi dilatih.",

          highlight:
            "Mulai dari challenge kecil ini dulu. 14 hari yang bisa mengubah kebiasaan kamu.",

          cta: {
            label: "Ikut Challenge Sekarang – 49K",
            href: buildWhatsAppUrl({
              title: "Speaking Challenge",
              price: "Rp 49.000",
              format: "WhatsApp",
            }),
            note: "Mulai kapan saja",
          },

          urgency: "Slot terbatas • cepat penuh",
        },
      },
    ],
  },
  {
    programSlug: generateSlug("Daily Conversation"),
    theme: { primary: "#4da3ff" },
    sections: [
      // ───────────────── HERO ─────────────────
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
          label: "Kelas Conversation Paling Praktis",
          tagline: "Masih Suka Ngeblank Saat",
          taglineAccent: "Diajak Ngomong Bahasa Inggris?",
          description:
            "Latihan speaking langsung bareng tutor lewat Zoom. Fokus praktik, bukan teori.",
          subtitle:
            "Cocok untuk kamu yang ingin lebih lancar, percaya diri, dan tidak lagi stuck saat conversation",
          tags: [
            { title: "10x Live Zoom", icon: "video" },
            { title: "60 Menit / Sesi", icon: "clock" },
            { title: "Max 8 Siswa", icon: "users" },
          ],

          cta: [
            {
              label: "Gabung Sekarang",
              href: buildWhatsAppUrl({
                title: "Daily Conversation",
                price: "Rp 249.000",
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
      {
        id: "batches",
        type: "batches",
        content: {
          variant: "card",
          tagline: "Pilih Batch",
          taglineAccent: "Terdekat",

          title: "Mulai Latihan Speaking Bareng Batch Aktif",

          subtitle:
            "Setiap batch dibatasi agar peserta punya lebih banyak kesempatan praktik speaking langsung.",

          emptyMessage:
            "Saat ini belum ada batch tersedia. Hubungi admin untuk informasi batch berikutnya.",
        },
      },

      {
        id: "gallery",
        type: "gallery",
        content: {
          tagline: "Dokumentasi",
          taglineAccent: "Kelas",
          title: "Latihan Speaking yang Real & Praktis",
          subtitle:
            "Peserta langsung praktik berbicara dalam situasi sehari-hari",

          trustSignals: [
            "Simulasi percakapan nyata",
            "Latihan speaking aktif",
            "Lingkungan suportif",
          ],

          photos: [
            {
              src: "/images/categories/online/daily-conversation/daily-conversation-1.png",
              caption: "Peserta latihan percakapan langsung dengan tutor.",
              tag: "Live Speaking",
              highlight: true,
            },
            {
              src: "/images/categories/online/daily-conversation/daily-conversation-2.png",
              caption:
                "Simulasi situasi sehari-hari seperti kerja dan pertemanan.",
              tag: "Real-life Practice",
            },
          ],
        },
      },

      // ───────────────── WHY ─────────────────
      {
        id: "why",
        type: "why",
        content: {
          title: "Kenapa Kamu Sering Ngeblank?",
          tagline: "Masalah Umum Saat",
          taglineAccent: "Ngomong Inggris",
          subtitle:
            "Bukan karena kamu tidak bisa, tapi karena kurang praktik real conversation",
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
          tagline: "Dari Ngeblank Jadi",
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
            { title: "Dapat E-Certificate", icon: "award" },
            { title: "Progress Report personal", icon: "bar-chart" },
            { title: "E-Module standar internasional", icon: "book-open" },
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
                "Perkenalan & daily interaction",
                "Simple response",
                "Basic conversation",
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
          title: "Investasi untuk Skill Speaking Kamu",
          description:
            "Kalau mau lancar, kamu butuh praktik — bukan cuma belajar teori",

          groups: [
            {
              title: "Daily Conversation Program",
              subtitle: "Program 2 Minggu Intensive",
              icon: "message-circle",

              features: [
                "10x Live Zoom Meeting",
                "Durasi 60 menit / sesi",
                "Full speaking practice",
                "Topik daily conversation",
                "Feedback langsung dari tutor",
                "E-Module standar internasional",
                "Progress Report personal",
                "E-Certificate",
                "Max 8 siswa per kelas",
              ],

              packages: [
                {
                  label: "Full Program (10 Sesi)",
                  price: "Rp 249.000",
                  originalPrice: "Rp 449.000",
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
          {
            q: "Berapa jumlah siswa per kelas?",
            a: "Maksimal 8 siswa per kelas agar lebih efektif.",
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
          subtitle: "Kamu akan terus ngeblank saat diajak conversation",

          highlight:
            "Lancar itu bukan karena belajar lama, tapi karena sering latihan",

          cta: {
            label: "Gabung Sekarang",
            href: buildWhatsAppUrl({
              title: "Daily Conversation",
              price: "Rp 249.000",
              format: "Zoom",
            }),
            note: "Mulai dari batch terdekat",
          },

          urgency: "Slot terbatas • cepat penuh",
        },
      },
    ],
  },
  {
    programSlug: generateSlug("English for Kids"),
    theme: { primary: "#4da3ff" },
    sections: [
      // ───────────────── HERO ─────────────────
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
          label: "English Class for Kids (6–12 Tahun)",

          tagline: "Anak Sudah Belajar Inggris...",
          taglineAccent: "Tapi Masih Malu Bicara?",

          description:
            "Bukan karena tidak bisa, tapi karena belum terbiasa dan belum percaya diri.",

          subtitle:
            "Di sini, anak belajar dengan cara fun, interaktif, dan didukung lingkungan yang positif",

          tags: [
            { title: "Max 6 Anak", icon: "users" },
            { title: "Fun & Interactive", icon: "sparkles" },
            { title: "Tutor Menyenangkan", icon: "heart" },
          ],

          cta: [
            {
              label: "Daftarkan Anak Sekarang",
              href: buildWhatsAppUrl({
                title: "English for Kids",
                price: "Rp 349.000",
                format: "Zoom",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Orang tua sudah melihat perubahan kepercayaan diri anaknya",
            count: "500+",
          },
        },
      },
      {
        id: "batches",
        type: "batches",

        content: {
          variant: "card",

          tagline: "Pilih Kelas",
          taglineAccent: "Terbaik",

          title: "Mulai Perjalanan Belajar Anak Bersama Batch Aktif",

          subtitle:
            "Kelas dibuat dalam kelompok kecil agar anak lebih nyaman, aktif, dan percaya diri saat belajar.",

          emptyMessage:
            "Saat ini belum ada kelas tersedia. Hubungi admin untuk informasi batch berikutnya.",
        },
      },

      {
        id: "gallery",
        type: "gallery",
        content: {
          tagline: "Dokumentasi",
          taglineAccent: "Kelas",
          title: "Momen Belajar yang Seru & Aktif",
          subtitle:
            "Anak-anak belajar sambil bermain, berbicara, dan berinteraksi dengan percaya diri",

          trustSignals: [
            "Kelas real via Zoom",
            "Interaksi aktif antar anak",
            "Tutor sabar & fun",
          ],

          photos: [
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-1.jpeg",
              caption:
                "Anak-anak mulai kelas dengan ice breaking seru biar lebih percaya diri.",
              tag: "Ice Breaking",
              highlight: true,
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-2.jpeg",
              caption:
                "Belajar kosakata baru lewat gambar dan interaksi langsung.",
              tag: "Vocabulary Practice",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-3.jpeg",
              caption:
                "Anak dilatih berani speaking dalam suasana yang santai.",
              tag: "Speaking Practice",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-4.jpeg",
              caption: "Tutor membimbing dengan pendekatan yang fun dan sabar.",
              tag: "Tutor Interaction",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-5.png",
              caption:
                "Belajar sambil bermain game interaktif yang bikin anak engaged.",
              tag: "Interactive Games",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-6.jpeg",
              caption: "Anak-anak aktif menjawab dan mencoba berbicara.",
              tag: "Active Participation",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-7.jpeg",
              caption:
                "Latihan komunikasi sederhana dalam kehidupan sehari-hari.",
              tag: "Daily Conversation",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-8.jpeg",
              caption: "Belajar bersama teman membuat anak lebih semangat.",
              tag: "Group Interaction",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-9.jpeg",
              caption: "Anak mulai berani tampil dan berbicara di depan teman.",
              tag: "Confidence Building",
            },
            {
              src: "/images/categories/online/english-for-kids/efk-reguler-10.jpeg",
              caption:
                "Suasana kelas yang positif membuat anak nyaman belajar.",
              tag: "Positive Environment",
            },
          ],
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

      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Belajar dengan Cara yang Tepat untuk Anak",
          tagline: "Bukan Sekadar Pintar",
          taglineAccent: "Tapi Percaya Diri",
          items: [
            {
              title: "Lingkungan belajar positif & supportif",
              description: "Anak bebas mencoba tanpa takut salah",
              icon: "shield-check",
            },
            {
              title: "Fokus berbicara setiap sesi",
              description: "Bukan hafalan, tapi praktik nyata",
              icon: "mic",
            },
            {
              title: "Meningkatkan kepercayaan diri",
              description: "Anak jadi lebih berani dan aktif",
              icon: "trending-up",
            },
            {
              title: "E-Module full color",
              description: "Materi menarik dan mudah dipahami anak",
              icon: "book-open",
            },
            {
              title: "Tutor kompeten & menyenangkan",
              description: "Belajar jadi lebih seru dan tidak membosankan",
              icon: "smile",
            },
            {
              title: "Kelas kecil maksimal 6 anak",
              description: "Lebih fokus & interaktif",
              icon: "users",
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
          tagline: "Program 2 Minggu",
          taglineAccent: "Terstruktur",
          title: "Detail Kelas",
          subtitle: "10x pertemuan • 60 menit per sesi • via Zoom",

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
              title: "Max 6 Anak",
              description: "Lebih fokus & kondusif",
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
          title: "Investasi untuk Perkembangan Anak",
          description:
            "Bukan hanya belajar bahasa Inggris, tapi membangun kepercayaan diri sejak dini",

          groups: [
            {
              title: "English for Kids Program",
              icon: "smile",

              features: [
                "10x Live Zoom Meeting",
                "Durasi 60 menit / sesi",
                "E-Module full color",
                "Tutor kompeten & menyenangkan",
                "Lingkungan belajar positif",
                "Max 6 siswa per kelas",
                "Progress report",
                "E-Certificate",
              ],

              packages: [
                {
                  label: "Full Program (10 Meeting)",
                  price: "Rp 349.000",
                  originalPrice: "Rp 549.000",
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
  {
    programSlug: generateSlug("Private Class"),
    theme: { primary: "#4da3ff" },
    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
          label: "Private Class 1-on-1",

          tagline: "Kamu Sibuk...",
          taglineAccent: "Tapi Tetap Mau Bisa Bahasa Inggris?",

          description:
            "Bukan masalah waktu. Tapi cara belajarnya yang belum tepat.",

          subtitle:
            "Belajar 1-on-1 dengan tutor, jadwal fleksibel, dan materi yang benar-benar kamu butuhkan",

          tags: [
            { title: "1-on-1 Private", icon: "user" },
            { title: "Jadwal Fleksibel", icon: "calendar" },
            { title: "Materi Custom", icon: "edit" },
          ],

          cta: [
            {
              label: "Diskusi Kebutuhanmu",
              href: buildWhatsAppUrl({
                title: "Private Class",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "500+ peserta sudah berkembang lebih cepat",
          },
        },
      },
      {
        id: "gallery",
        type: "gallery",
        content: {
          tagline: "Dokumentasi",
          taglineAccent: "Kelas",
          title: "Momen Belajar Asli di Kelas",
          subtitle:
            "Bukan stock photo — ini suasana real class saat peserta latihan langsung bersama tutor",

          trustSignals: [
            "Foto kelas asli (bukan stock)",
            "Interaksi real antara tutor & peserta",
            "Fokus praktik speaking setiap sesi",
          ],

          photos: [
            {
              src: "/images/categories/online/private-class/private-class-dewasa-1.jpeg",
              tag: "Zoom Live Session",
              caption:
                "Sesi 1-on-1 via Zoom, peserta langsung praktik speaking dengan tutor",
              highlight: true,
            },
            {
              src: "/images/categories/online/private-class/private-class-dewasa-2.jpeg",
              tag: "Guided Practice",
              caption:
                "Tutor memberikan contoh kalimat dan membimbing cara menjawab yang natural",
            },
            {
              src: "/images/categories/online/private-class/private-class-dewasa-3.jpeg",
              tag: "Speaking Practice",
              caption:
                "Peserta aktif latihan menjawab dan membangun confidence saat berbicara",
            },
            {
              src: "/images/categories/online/private-class/private-class-dewasa-4.jpeg",
              tag: "Feedback Session",
              caption:
                "Feedback langsung dari tutor untuk memperbaiki pronunciation dan struktur kalimat",
            },
            {
              src: "/images/categories/online/private-class/private-class-dewasa-5.jpeg",
              tag: "Interactive Learning",
              caption:
                "Belajar tidak hanya teori, tapi langsung praktik dengan interaksi real",
            },
            {
              src: "/images/categories/online/private-class/private-toefl-1.jpeg",
              tag: "TOEFL Coaching",
              caption:
                "Sesi khusus untuk meningkatkan skill TOEFL dengan pendekatan personal",
            },
            {
              src: "/images/categories/online/private-class/private-toefl-2.png",
              tag: "Focused Training",
              caption:
                "Latihan intensif untuk target tertentu seperti speaking test atau interview",
            },
            {
              src: "/images/categories/online/private-class/private-toefl-3.png",
              tag: "Progress Monitoring",
              caption:
                "Setiap sesi dipantau untuk memastikan progress benar-benar terasa",
            },
          ],
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Private Class Cocok untuk Kamu yang...",
          tagline: "Bukan Karena Tidak Bisa",
          taglineAccent: "Tapi Karena Kondisi",
          items: [
            {
              title: "Sibuk & waktu terbatas",
              description: "Tidak bisa ikut kelas reguler dengan jadwal tetap",
              icon: "clock",
            },
            {
              title: "Butuh jadwal fleksibel",
              description: "Ingin bebas pilih hari & jam belajar",
              icon: "calendar",
            },
            {
              title: "Ingin fokus materi tertentu",
              description:
                "Untuk kebutuhan kerja, akademik, atau target spesifik",
              icon: "target",
            },
            {
              title: "Ingin progress lebih cepat",
              description: "Belajar langsung ke poin tanpa buang waktu",
              icon: "zap",
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
            { title: "1-on-1 langsung dengan tutor", icon: "user" },
            { title: "Materi 100% sesuai kebutuhan", icon: "edit" },
            { title: "Jadwal fleksibel sesuai waktu kamu", icon: "calendar" },
            { title: "Durasi 60 menit per sesi", icon: "clock" },
            { title: "E-Module standar internasional", icon: "book-open" },
            { title: "Feedback & progress report", icon: "bar-chart" },
            { title: "Dapat E-Certificate", icon: "award" },
            { title: "Lingkungan belajar kondusif", icon: "sparkles" },
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
                "1-on-1 dengan tutor",
                "Jadwal fleksibel (bebas pilih)",
                "Materi 100% custom",
                "Durasi 60 menit per sesi",
                "E-Module & progress report",
                "E-Certificate",
              ],

              packages: [
                {
                  label: "10x Meeting",
                  price: "Rp 1.399.000",
                  originalPrice: "Rp 2.490.000",
                  highlight: "Paling Populer",
                },
                {
                  label: "20x Meeting",
                  price: "Rp 2.499.000",
                  originalPrice: "Rp 3.690.000",
                },
                {
                  label: "30x Meeting",
                  price: "Rp 3.799.000",
                  originalPrice: "Rp 5.999.000",
                },
              ],
            },

            {
              title: "Intensive",
              subtitle: "Fokus & Terstruktur",
              icon: "zap",

              features: [
                "Jadwal tetap (Senin – Jumat)",
                "Durasi 60 menit per sesi",
                "Materi disiapkan tutor",
                "Lebih disiplin & konsisten",
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
  {
    programSlug: generateSlug("Private Class for Kids"),
    theme: { primary: "#4da3ff" },
    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
          label: "Private Class Anak (Usia 4+)",

          tagline: "Anak Susah Fokus Belajar?",
          taglineAccent: "Atau Lebih Nyaman Belajar Sendiri?",

          description:
            "Setiap anak punya cara belajar berbeda. Dengan private class 1-on-1, anak bisa belajar lebih fokus, nyaman, dan percaya diri.",

          subtitle:
            "Belajar bahasa Inggris jadi lebih menyenangkan dengan tutor yang sabar & berpengalaman",

          tags: [
            { title: "1-on-1 Private", icon: "user" },
            { title: "Usia 4+", icon: "baby" },
            { title: "Fun & Interactive", icon: "sparkles" },
          ],

          cta: [
            {
              label: "Konsultasi untuk Anak",
              href: buildWhatsAppUrl({
                title: "Private Class for Kids",
              }),
              icon: "message-circle",
            },
          ],

          socialProof: {
            text: "Orang tua sudah mempercayakan belajar anaknya",
            count: "300+",
          },
        },
      },

      // ───────────────── GALLERY ─────────────────
      {
        id: "gallery",
        type: "gallery",
        content: {
          tagline: "Dokumentasi",
          taglineAccent: "Kelas Anak",
          title: "Belajar Lebih Fokus, Lebih Personal",
          subtitle:
            "Setiap sesi dirancang khusus agar anak bisa belajar dengan nyaman dan maksimal",

          trustSignals: [
            "1-on-1 real session",
            "Materi sesuai kebutuhan anak",
            "Fokus & tanpa distraksi",
          ],

          photos: [
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-1.jpeg",
              caption:
                "Sesi private 1-on-1 membuat anak lebih fokus dan nyaman belajar.",
              tag: "1-on-1 Session",
              highlight: true,
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-2.jpeg",
              caption: "Tutor menyesuaikan materi sesuai kemampuan anak.",
              tag: "Custom Learning",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-3.jpeg",
              caption: "Anak bisa belajar tanpa tekanan dari peserta lain.",
              tag: "Comfort Learning",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-4.jpeg",
              caption:
                "Interaksi langsung membuat anak lebih cepat memahami materi.",
              tag: "Direct Feedback",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-5.jpeg",
              caption:
                "Tutor membantu anak membangun kepercayaan diri secara bertahap.",
              tag: "Confidence Building",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-6.jpeg",
              caption:
                "Belajar speaking dengan pendekatan yang santai dan fun.",
              tag: "Speaking Practice",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-7.jpeg",
              caption: "Setiap sesi disesuaikan dengan kebutuhan anak.",
              tag: "Personalized Session",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-8.jpeg",
              caption: "Anak lebih aktif karena mendapatkan perhatian penuh.",
              tag: "Active Engagement",
            },
            {
              src: "/images/categories/online/private-class-for-kids/private-class-for-kids-9.jpeg",
              caption:
                "Belajar jadi lebih efektif karena fokus ke satu tujuan.",
              tag: "Focused Learning",
            },
          ],
        },
      },

      // ───────────────── WHY (PARENT PAIN) ─────────────────
      {
        id: "why",
        type: "why",
        content: {
          title: "Kenapa Banyak Anak Sulit Belajar di Kelas Biasa?",
          tagline: "Bukan Karena Anak Tidak Bisa",
          taglineAccent: "Tapi Karena Metodenya",
          items: [
            {
              title: "Kurang fokus di kelas ramai",
              description: "Anak mudah terdistraksi dan tidak maksimal belajar",
              icon: "users",
            },
            {
              title: "Tidak percaya diri",
              description: "Takut salah dan malu untuk mencoba",
              icon: "user-x",
            },
            {
              title: "Metode tidak cocok",
              description: "Cara belajar tidak sesuai dengan karakter anak",
              icon: "book",
            },
            {
              title: "Kurang perhatian personal",
              description:
                "Tidak ada pendampingan khusus untuk perkembangan anak",
              icon: "heart",
            },
          ],
        },
      },

      // ───────────────── BENEFITS ─────────────────
      {
        id: "benefits",
        type: "benefits",
        content: {
          title: "Kenapa Private Class Lebih Cocok untuk Anak?",
          tagline: "Belajar Lebih Fokus &",
          taglineAccent: "Menyenangkan",
          items: [
            {
              title: "1-on-1 dengan tutor sabar & berpengalaman",
              icon: "user",
            },
            { title: "Anak lebih fokus & tidak terdistraksi", icon: "target" },
            { title: "Materi bisa disesuaikan minat anak", icon: "sparkles" },
            { title: "Belajar dengan cara fun & interaktif", icon: "smile" },
            { title: "Jadwal fleksibel sesuai waktu anak", icon: "calendar" },
            { title: "Durasi 60 menit per sesi", icon: "clock" },
            { title: "Akses rekaman kelas", icon: "video" },
            { title: "Progress report untuk orang tua", icon: "bar-chart" },
            { title: "E-Certificate", icon: "award" },
          ],
        },
      },

      // ───────────────── PRICING ─────────────────
      {
        id: "pricing",
        type: "pricing",
        content: {
          title: "Pilih Paket Belajar untuk Anak",

          groups: [
            {
              title: "Private Kids Program",
              subtitle: "Flexible & Personalized",
              icon: "sparkles",

              features: [
                "1-on-1 dengan tutor",
                "Usia mulai 4 tahun",
                "Jadwal fleksibel (bebas pilih)",
                "Materi sesuai kebutuhan anak",
                "Durasi 60 menit per sesi",
                "E-Module standar internasional",
                "Progress report & E-Certificate",
                "Akses rekaman kelas",
              ],

              packages: [
                {
                  label: "10x Meeting",
                  price: "Rp 1.199.000",
                  originalPrice: "Rp 1.799.000",
                  highlight: "Paling Populer",
                },
                {
                  label: "20x Meeting",
                  price: "Rp 2.199.000",
                  originalPrice: "Rp 2.999.000",
                },
                {
                  label: "30x Meeting",
                  price: "Rp 3.199.000",
                  originalPrice: "Rp 4.999.000",
                },
              ],
            },
          ],

          urgency: "Slot terbatas — untuk menjaga kualitas belajar anak",
        },
      },

      // ───────────────── TESTIMONIALS ─────────────────
      {
        id: "testimonials",
        type: "testimonials",
        content: {
          title: "Apa Kata Orang Tua",
          items: [
            {
              quote:
                "Anak saya sekarang lebih berani ngomong Inggris. Tutor sangat sabar dan fun!",
              name: "Ibu Rina",
              role: "Orang Tua Murid",
            },
            {
              quote:
                "Belajarnya fleksibel dan anak saya jadi lebih semangat tiap sesi.",
              name: "Ibu Sari",
              role: "Orang Tua Murid",
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
            q: "Mulai usia berapa?",
            a: "Program ini bisa diikuti mulai usia 4 tahun.",
          },
          {
            q: "Apakah cocok untuk pemula?",
            a: "Ya, sangat cocok. Materi akan disesuaikan dari level dasar.",
          },
          {
            q: "Apakah orang tua bisa memantau?",
            a: "Ya, tersedia progress report dan rekaman kelas.",
          },
          {
            q: "Apakah jadwal bisa fleksibel?",
            a: "Bisa. Jadwal sepenuhnya bisa disesuaikan dengan waktu anak.",
          },
        ],
      },

      // ───────────────── CTA ─────────────────
      {
        id: "cta",
        type: "cta",
        content: {
          title: "Mulai dari Sekarang",
          titleAccent: "Untuk Masa Depan Anak",

          subtitle:
            "Kemampuan bahasa Inggris akan jadi bekal penting untuk masa depan anak",

          highlight: "Mulai dari kecil, hasilnya akan terasa jauh lebih besar",

          cta: {
            label: "Konsultasi Sekarang",
            href: buildWhatsAppUrl({
              title: "Private Class for Kids",
            }),
            note: "Diskusi kebutuhan anak tanpa komitmen",
          },

          urgency: "Slot terbatas • Prioritas untuk pendaftaran awal",
        },
      },
    ],
  },
  {
    programSlug: generateSlug("VIP English for Kids"),
    theme: { primary: "#4da3ff" },
    sections: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
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
        id: "batches",
        type: "batches",
        content: {
          variant: "card",

          tagline: "Pilih Jadwal",
          taglineAccent: "English Camp",

          title: "Batch VIP Kids English Camp 2026",

          subtitle:
            "Pilih durasi camp yang paling sesuai untuk anak Anda — tersedia program 1 minggu maupun 2 minggu intensif",

          emptyMessage:
            "Saat ini belum ada batch yang tersedia. Hubungi admin untuk informasi jadwal berikutnya.",
        },
      },
      {
        id: "benefits-1",
        type: "benefits",
        content: {
          title: "Aman, Nyaman, dan Terpantau",
          tagline: "Keamanan dan kenyamanan anak adalah prioritas utama kami.",

          images: [
            {
              src: "https://plus.unsplash.com/premium_photo-1663106423058-c5242333348c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVudG9yJTIwd2l0aCUyMGNoaWxkcmVufGVufDB8fDB8fHww",
              caption: "Pendampingan 24 Jam",
              highlight: true,
            },
            {
              src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FmZSUyMGVudmlyb25tZW50JTIwY2hpbGRyZW58ZW58MHx8MHx8fDA%3D",
              caption: "Update Kegiatan Real-Time",
            },
            {
              src: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              caption: "Lingkungan Aman & Terkontrol",
            },
            {
              src: "https://images.unsplash.com/photo-1758873268113-326c61b29968?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZyaWVuZGx5JTIwdGVhY2hlciUyMHNtaWxpbmd8ZW58MHx8MHx8fDA%3D",
              caption: "Staf Terlatih & Bersertifikat",
            },
          ],
          items: [
            {
              title: "Pendampingan 24 Jam",
              description:
                "Tutor berpengalaman mendampingi anak siang dan malam",
              icon: "clock", // or "clock-24h"
            },
            {
              title: "Update Kegiatan Real-Time",
              description: "Foto dan video kegiatan anak dikirim setiap hari",
              icon: "camera", // or "video"
            },
            {
              title: "Lingkungan Aman & Terkontrol",
              description: "1 gate system, keamanan berlapis, lokasi strategis",
              icon: "shield-check", // ❗ replace "user"
            },
            {
              title: "Staf Terlatih & Bersertifikat",
              description: "Semua tutor memiliki sertifikasi dan pengalaman",
              icon: "badge-check", // or "certificate"
            },
          ],
        },
      },
      {
        id: "gallery",
        type: "gallery",
        content: {
          tagline: "Dokumentasi Nyata",
          taglineAccent: "Kegiatan Anak Selama Camp",

          title: "Momen Belajar & Kebersamaan",
          subtitle:
            "Lihat langsung bagaimana anak-anak belajar, bermain, dan berkembang setiap hari di camp",

          photos: [
            {
              src: "/images/categories/offline/vip-kids/vip-kids-1.jpg",
              caption: "Suasana kelas interaktif bersama tutor",
              tag: "Kelas",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-2.jpg",
              caption: "Latihan speaking dalam kelompok kecil",
              tag: "Speaking",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-3.jpg",
              caption: "Outdoor activity & team games",
              tag: "Activity",
              highlight: true,
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-4.jpg",
              caption: "Kebersamaan & bonding antar peserta",
              tag: "Bonding",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-5.jpg",
              caption: "Suasana kamar & tempat tinggal anak",
              tag: "Fasilitas",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-6.jpg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-7.jpg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-8.jpg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-9.jpg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-10.jpg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-11.jpeg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-12.jpeg",
            },
            {
              src: "/images/categories/offline/vip-kids/vip-kids-13.jpeg",
            },
          ],

          trustSignals: [],
        },
      },

      {
        id: "why",
        type: "why",
        content: {
          title: "Apa yang Menghambat Anak Anda?",
          tagline: "Anak Sebenarnya Bisa Tapi",
          taglineAccent: "Tidak Berani",
          subtitle: "Masalah yang sering dihadapi anak Anda",
          conclusion: {
            tagline:
              "Lingkungan di mana mereka bisa berlatih tanpa takut, mendapat dukungan, dan melihat contoh dari teman sebaya.",
            taglineAccent: "Anak butuh lingkungan yang tepat untuk berkembang",
          },
          items: [
            {
              title: "Malu & Takut Salah",
              description:
                "Anak merasa malu saat berbicara, takut membuat kesalahan, atau takut ditertawakan teman",
              icon: "alert-circle",
            },
            {
              title: "Kurang Percaya Diri",
              description:
                "Kemampuan ada, tapi tidak berani menunjukkan karena kurang percaya diri dengan diri sendiri",
              icon: "user-x",
            },
            {
              title: "Terlalu Bergantung pada Orang Tua",
              description:
                "Selalu meminta bantuan, jarang mengambil keputusan sendiri, butuh dorongan dalam setiap hal",
              icon: "users",
            },
          ],
        },
      },

      {
        id: "benefits-2",
        type: "benefits",
        content: {
          title: "Transformasi Anak",
          tagline: "Perubahan Nyata",
          taglineAccent: "Yang Akan Anak Anda Rasakan",
          subtitle: "Transformasi yang terlihat dalam waktu singkat",
          conclusion: {
            tagline:
              "Orang tua biasanya sudah melihat perbedaan signifi`kan di hari ke-3 atau ke-4. Saat pulang, anak akan lebih berani, lebih tenang, dan lebih mandiri.",
            taglineAccent: "Perubahan Terlihat Jelas",
          },
          items: [
            {
              title: "Lebih Berani Berbicara",
              description:
                "Dalam lingkungan yang mendukung, anak akan mulai berani mencoba mengucapkan kata-kata baru",
              icon: "mic",
            },
            {
              title: "Lebih Percaya Diri",
              description:
                "Setiap kali berhasil, anak mendapat pujian. Kepercayaan diri tumbuh dari kesuksesan kecil",
              icon: "sparkles",
            },
            {
              title: "Lebih Mandiri",
              description:
                "Jauh dari orang tua, anak belajar mengurus diri sendiri, membuat keputusan, dan memecahkan masalah",
              icon: "user",
            },
            {
              title: "Terbiasa dengan Bahasa Inggris",
              description:
                "Dari pagi hingga malam, anak mendengar dan berbicara Inggris. Ini menjadi kebiasaan baru",
              icon: "globe",
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
          subtitle:
            "Anak belajar sambil bermain, dengan suasana yang menyenangkan dan berenergi",
          meta: [
            {
              image:
                "https://images.unsplash.com/flagged/photo-1567116681178-c326fa4e2c8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJhY3RpdmUlMjBjbGFzcyUyMGtpZHN8ZW58MHx8MHx8fDA%3D",
              title: "Kelas Interaktif",
              description:
                "5x kelas per hari dengan fokus pada speaking, listening, reading, dan writing dengan metode menyenangkan",
            },
            {
              image:
                "https://plus.unsplash.com/premium_photo-1661927916191-495b5718a113?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3BlYWtpbmclMjBwcmFjdGljZSUyMGtpZHN8ZW58MHx8MHx8fDA%3D",
              title: "Speaking Practice",
              description:
                "Latihan berbicara dalam berbagai situasi: presentasi, diskusi, games, dan aktivitas kelompok",
            },
            {
              image:
                "https://plus.unsplash.com/premium_photo-1686920245950-58617c8a602e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8a2lkcyUyMGdhbWVzJTIwYW5kJTIwYWN0aXZpdHl8ZW58MHx8MHx8fDA%3D",
              title: "Games & Activity",
              description:
                "Permainan edukatif, kompetisi antar tim, dan aktivitas outdoor yang seru dan melatih kolaborasi",
            },
            {
              image:
                "https://media.istockphoto.com/id/2219667811/photo/teacher-and-her-students-building-and-engineering-in-the-lab.webp?a=1&b=1&s=612x612&w=0&k=20&c=EJ8J1iwoehMoBwO97YRU0j96XiPgVINqAvVp2n_VQBs=",
              title: "Project Learning",
              description:
                "Anak bekerja dalam proyek, membuat presentasi, dan belajar dari pengalaman langsung",
            },
            {
              image:
                "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2lkcyUyMGNyZWF0aXZlJTIwYWN0aXZpdHl8ZW58MHx8MHx8fDA%3D",
              title: "Creative Activities",
              description:
                "Seni, musik, drama, dan aktivitas kreatif lainnya untuk mengekspresikan diri dalam bahasa Inggris",
            },
            {
              image:
                "https://images.unsplash.com/photo-1667386427340-ea2cbca9ad01?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2lkcyUyMGRyYW1hJTIwbXVzaWMlMjBhY3Rpdml0eXxlbnwwfHwwfHx8MA%3D%3D",
              title: "Evening Program",
              description:
                "Seni, musik, drama, dan aktivitas kreatif lainnya untuk mengekspresikan diri dalam bahasa Inggris",
            },
          ],

          weeks: [
            {
              icon: "sun",
              week: "Daily Schedule",
              title: "Kegiatan Harian",
              days: [
                { startTime: "06:00", title: "Morning Meeting" },
                { startTime: "07:00", endTime: "09:00", title: "Kelas 1 & 2" },
                {
                  startTime: "09:00",
                  endTime: "11:00",
                  title: "Kelas 3 & Activity",
                },
                {
                  startTime: "12:00",
                  endTime: "13:00",
                  title: "Makan & Istirahat",
                },
                { startTime: "13:00", endTime: "15:00", title: "Kelas 4 & 5" },
                {
                  startTime: "15:00",
                  endTime: "16:30",
                  title: "Outdoor Activity",
                },
                {
                  startTime: "17:00",
                  endTime: "18:00",
                  title: "Speaking Club",
                },
                {
                  startTime: "19:00",
                  endTime: "21:00",
                  title: "Evening Program",
                },
              ],
            },
          ],
        },
      },
      {
        type: "facilities",
        id: "facilities",
        content: {
          title: "Fasilitas yang Tersedia",
          tagline: "Fasilitas Nyaman untuk",
          taglineAccent: "Anak Anda",
          subtitle:
            "Semua yang dibutuhkan untuk kenyamanan dan kesejahteraan anak selama camp",
          items: [
            {
              icon: "bed",
              title: "Kamar AC",
              description: "Kamar nyaman dan bersih dengan AC",
            },
            {
              icon: "bath",
              title: "Kamar Mandi Dalam",
              description: "Setiap kamar dilengkapi kamar mandi pribadi",
            },
            {
              icon: "users",
              title: "1 Kamar 2 Anak",
              description: "Anak belajar bersosialisasi dalam satu kamar",
            },
            {
              icon: "utensils",
              title: "Makan 3x Sehari",
              description:
                "Menu bergizi dan lezat, dipersiapkan khusus untuk anak-anak",
            },
            {
              icon: "shirt",
              title: "Layanan Laundry",
              description: "Pakaian anak dicuci setiap hari",
            },
            {
              icon: "shield-check",
              title: "Lingkungan Aman",
              description: "Lokasi aman, terlihat jelas, dan terkontrol penuh",
            },
          ],
          visuals: [
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-1.jpeg",
            },

            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-2.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-3.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-4.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-5.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-6.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-7.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-8.jpeg",
            },
            {
              type: "image",
              src: "/images/categories/offline/vip-kids/facilities/vip-kids-facility-9.jpeg",
            },
          ],
        },
      },
      {
        type: "mentorship",
        id: "mentorship",
        content: {
          title: "Mentor Terpercaya",
          tagline: "Tidak Hanya Belajar,",
          taglineAccent: "Tapi Dibimbing",
          subtitle: "Tutor kami adalah pembimbing, bukan hanya pengajar",
          items: [
            {
              icon: "heart",
              title: "Pendampingan Moral",
              description:
                "Membangun karakter yang baik, kejujuran, tanggung jawab, dan empati",
            },
            {
              icon: "sparkles",
              title: "Pendampingan Spiritual",
              description:
                "Aktivitas rohani yang sesuai keyakinan, meditasi, dan refleksi diri",
            },
            {
              icon: "award",
              title: "Pembentukan Karakter",
              description:
                "Program khusus untuk mengembangkan kepemimpinan dan soft skills",
            },
            {
              icon: "message-circle-heart",
              title: "Tutor Sebagai Teman",
              description:
                "Hubungan hangat, anak merasa nyaman berbagi, bukan takut pada tutor",
            },
          ],
          visuals: [
            {
              type: "image",
              src: "https://plus.unsplash.com/premium_photo-1661714188599-e132395b5bf8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVhY2hlciUyMGxhdWdoJTIwc3R1ZGVudHxlbnwwfHwwfHx8MA%3D%3D",
              caption: "Pendamping Moral",
            },

            {
              type: "image",
              src: "https://plus.unsplash.com/premium_photo-1681825313495-88a3e574e4d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpbGQlMjBwcmF5aW5nJTIwcGVhY2VmdWx8ZW58MHx8MHx8fDA%3D",
              caption: "Pendamping Spiritual",
            },
            {
              type: "image",
              src: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              caption: "Pembentukan Karakter",
            },
            {
              type: "image",
              src: "https://images.unsplash.com/photo-1758687126448-df2ab9d1eda9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZyaWVuZGx5JTIwdGVhY2hlciUyMHN0dWRlbnR8ZW58MHx8MHx8fDA%3D",
              caption: "Tutor Sebagai Teman",
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
        id: "classes",
        type: "classes",
        content: {
          title: "Pilihan Program",
          tagline: "Pilih Durasi",
          taglineAccent: "Sesuai Kebutuhan",
          subtitle: "Pilih durasi yang sesuai dengan rencana liburan anak Anda",
          info: [
            {
              label: "Target Peserta",
              value: "SD – SMP (usia 8–15 tahun)",
            },
            {
              label: "Level",
              value: "Program disesuaikan dari pemula hingga advanced",
            },
          ],

          items: [
            {
              title: "Program Singkat",
              duration: "1 Minggu",

              description:
                "Cocok untuk trial dan adaptasi awal dengan lingkungan camp",
              schedules: ["21 – 28 Juni 2026", "28 Juni – 5 Juli 2026"],
            },
            {
              title: "Program Intensif",
              duration: "2 Minggu",
              description:
                "Transformasi lebih dalam dengan hasil yang lebih signifikan",
              schedules: ["21 Juni – 5 Juli 2026"],
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
          bonusTitle: "Penawaran Khusus",
          bonus: [
            {
              title: "Diskon Alumni",
              highlight: "Potongan Rp100.000",
              description: "Diskon spesial untuk alumni",
              icon: "gift",
            },
            {
              title: "Daftar 2 Anak",
              highlight: "Potongan Rp50.000 / anak",
              description: "Potongan per anak",
              icon: "user-plus",
            },
            {
              title: "Daftar 3+ Anak",
              highlight: "Potongan Rp75.000 / anak",
              description: "Potongan per anak",
              icon: "users",
            },
          ],
          bonusNote:
            "Promo bisa digabungkan dengan opsi pembayaran cicilan. Hubungi kami untuk detail lebih lanjut.",
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
  {
    programSlug: generateSlug("Kelas Rombongan"),
    theme: { primary: "#4da3ff" },
    sections: [
      {
        id: "hero",
        type: "hero",
        content: {
          image: "/images/home-hero.png",
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
];
