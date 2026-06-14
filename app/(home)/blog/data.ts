// app/(home)/blog/data.ts
//
// This file is the STATIC type + fallback data layer for the public blog page.
// The real data comes from the database via tRPC (see useBlogData hook).
// Keep this in sync with the DB schema in app/db/schema/blog.ts.

export type Author = {
  id: string;
  name: string;
  image?: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  readingTime: number;
  category: BlogCategory;
  tags: BlogTag[];
  author: Author;
  publishedAt: string;
  isFeatured?: boolean;
  views?: number;
  likes?: number;
};

export type BlogPlaylist = {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isDefault?: boolean;
  isPublic: boolean;
  posts: (BlogPost & { position?: number })[];
};

// ─── Categories ───────────────────────────────────────────────────────────────
// Must match CATEGORY_DATA slugs in blog.seed.ts

export const blogCategories: BlogCategory[] = [
  { id: "c1", name: "Speaking", slug: "speaking", icon: "mic" },
  { id: "c2", name: "Grammar", slug: "grammar", icon: "book-open" },
  { id: "c3", name: "Vocabulary", slug: "vocabulary", icon: "list" },
  { id: "c4", name: "Tips & Motivation", slug: "tips-motivation", icon: "lightbulb" },
];

// ─── Tags ─────────────────────────────────────────────────────────────────────
// Must match TAG_DATA names in blog.seed.ts

export const blogTags: BlogTag[] = [
  { id: "t1", name: "Beginner", slug: "beginner" },
  { id: "t2", name: "Daily Conversation", slug: "daily-conversation" },
  { id: "t3", name: "Grammar Basics", slug: "grammar-basics" },
  { id: "t4", name: "Confidence", slug: "confidence" },
  { id: "t5", name: "Vocabulary", slug: "vocabulary" },
  { id: "t6", name: "Speaking Tips", slug: "speaking-tips" },
  { id: "t7", name: "Study Habits", slug: "study-habits" },
  { id: "t8", name: "Pronunciation", slug: "pronunciation" },
  { id: "t9", name: "Listening", slug: "listening" },
  { id: "t10", name: "Writing", slug: "writing" },
];

// ─── Author ───────────────────────────────────────────────────────────────────

export const blogAuthor: Author = {
  id: "u1",
  name: "Tim InggrisGo",
  image: "/images/authors/inggrisgo.png",
};

// ─── Posts ────────────────────────────────────────────────────────────────────
// These mirror the POST_DATA in blog.seed.ts.
// IDs must be unique — they are used as React keys.

export const blogPosts: BlogPost[] = [
  {
    id: "p1",
    title: "Cara Cepat Lancar Speaking Bahasa Inggris Tanpa Takut Salah",
    slug: "cara-cepat-lancar-speaking-bahasa-inggris-tanpa-takut-salah",
    excerpt:
      "Pelajari cara meningkatkan kemampuan speaking tanpa rasa takut dengan metode sederhana yang bisa langsung dipraktikkan.",
    coverImage:
      "https://images.unsplash.com/photo-1587038787166-becd08a156f7?w=600&auto=format&fit=crop&q=60",
    readingTime: 5,
    category: blogCategories[0]!, // speaking
    tags: [blogTags[0]!, blogTags[1]!, blogTags[3]!, blogTags[5]!],
    views: 1200,
    likes: 340,
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
    isFeatured: true,
  },
  {
    id: "p2",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    slug: "cara-mengatasi-rasa-tidak-percaya-diri-saat-speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60",
    readingTime: 5,
    category: blogCategories[0]!, // speaking
    tags: [blogTags[3]!, blogTags[5]!, blogTags[6]!],
    views: 640,
    likes: 155,
    author: blogAuthor,
    publishedAt: "2025-03-05T00:00:00Z",
    isFeatured: true,
  },
  {
    id: "p3",
    title: "5 Kesalahan Grammar yang Sering Dilakukan Pemula",
    slug: "5-kesalahan-grammar-yang-sering-dilakukan-pemula",
    excerpt:
      "Hindari kesalahan grammar umum yang sering dilakukan pemula agar komunikasi lebih jelas dan percaya diri.",
    coverImage:
      "https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=600&auto=format&fit=crop&q=60",
    readingTime: 4,
    category: blogCategories[1]!, // grammar
    tags: [blogTags[0]!, blogTags[2]!],
    views: 980,
    likes: 215,
    author: blogAuthor,
    publishedAt: "2025-02-18T00:00:00Z",
    isFeatured: true,
  },
  {
    id: "p4",
    title: "Panduan Lengkap Penggunaan Tenses dalam Bahasa Inggris",
    slug: "panduan-lengkap-penggunaan-tenses-dalam-bahasa-inggris",
    excerpt:
      "Tenses sering bikin bingung, tapi dengan panduan ini kamu akan paham kapan dan bagaimana menggunakannya dengan tepat.",
    coverImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60",
    readingTime: 8,
    category: blogCategories[1]!, // grammar
    tags: [blogTags[2]!, blogTags[0]!],
    views: 520,
    likes: 98,
    author: blogAuthor,
    publishedAt: "2025-04-01T00:00:00Z",
  },
  {
    id: "p5",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    slug: "50-kosakata-bahasa-inggris-yang-wajib-dikuasai-sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60",
    readingTime: 6,
    category: blogCategories[2]!, // vocabulary
    tags: [blogTags[0]!, blogTags[1]!, blogTags[4]!],
    views: 760,
    likes: 180,
    author: blogAuthor,
    publishedAt: "2025-03-15T00:00:00Z",
  },
  {
    id: "p6",
    title: "Cara Efektif Menghafal Kosakata Baru dan Tidak Mudah Lupa",
    slug: "cara-efektif-menghafal-kosakata-baru-dan-tidak-mudah-lupa",
    excerpt:
      "Teknik berbasis riset untuk menghafal kosakata baru yang benar-benar masuk ke memori jangka panjang.",
    coverImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60",
    readingTime: 5,
    category: blogCategories[2]!, // vocabulary
    tags: [blogTags[4]!, blogTags[6]!, blogTags[0]!],
    views: 430,
    likes: 87,
    author: blogAuthor,
    publishedAt: "2025-05-10T00:00:00Z",
  },
  {
    id: "p7",
    title: "Kenapa Konsistensi Lebih Penting dari Intensitas dalam Belajar Bahasa Inggris",
    slug: "kenapa-konsistensi-lebih-penting-dari-intensitas-dalam-belajar-bahasa-inggris",
    excerpt:
      "15 menit sehari lebih efektif dari 3 jam seminggu sekali. Ini penjelasan ilmiahnya dan cara membangun kebiasaan belajar yang bertahan.",
    coverImage:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=60",
    readingTime: 4,
    category: blogCategories[3]!, // tips-motivation
    tags: [blogTags[6]!, blogTags[3]!],
    views: 510,
    likes: 132,
    author: blogAuthor,
    publishedAt: "2025-04-20T00:00:00Z",
  },
  {
    id: "p8",
    title: "7 Kebiasaan Harian yang Membantu Kamu Belajar Bahasa Inggris Lebih Cepat",
    slug: "7-kebiasaan-harian-yang-membantu-kamu-belajar-bahasa-inggris-lebih-cepat",
    excerpt:
      "Belajar bahasa Inggris tidak selalu harus duduk di depan buku. Ini 7 kebiasaan kecil yang bisa kamu integrasikan ke rutinitas harianmu.",
    coverImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=60",
    readingTime: 5,
    category: blogCategories[3]!, // tips-motivation
    tags: [blogTags[6]!, blogTags[5]!, blogTags[0]!],
    views: 280,
    likes: 61,
    author: blogAuthor,
    publishedAt: "2025-05-25T00:00:00Z",
  },
];

// ─── Playlists ─────────────────────────────────────────────────────────────────

export const blogPlaylists: BlogPlaylist[] = [
  {
    id: "pl1",
    name: "Belajar Speaking dari Nol",
    description:
      "Panduan lengkap untuk mulai speaking dari dasar hingga percaya diri.",
    isSystem: true,
    isDefault: false,
    isPublic: true,
    posts: [blogPosts[0]!, blogPosts[1]!],
  },
  {
    id: "pl2",
    name: "Grammar Fundamental",
    description:
      "Materi penting grammar untuk membangun dasar bahasa Inggris yang kuat.",
    isSystem: true,
    isDefault: false,
    isPublic: true,
    posts: [blogPosts[2]!, blogPosts[3]!],
  },
  {
    id: "pl3",
    name: "Kuasai Kosakata Sehari-hari",
    description:
      "Strategi dan daftar kosakata esensial untuk percakapan sehari-hari.",
    isSystem: true,
    isDefault: false,
    isPublic: true,
    posts: [blogPosts[4]!, blogPosts[5]!],
  },
];