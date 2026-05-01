/* ─── lib/blog-data.ts ────────────────────────────────────
   Place this file at: src/lib/blog-data.ts  (or @/lib/blog-data.ts)
   ──────────────────────────────────────────────────────── */

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

export const blogCategories: BlogCategory[] = [
  { id: "c1", name: "Speaking", slug: "speaking", icon: "mic" },
  { id: "c2", name: "Grammar", slug: "grammar", icon: "book-open" },
  { id: "c3", name: "Vocabulary", slug: "vocabulary", icon: "list" },
  {
    id: "c4",
    name: "Tips & Motivation",
    slug: "tips-motivation",
    icon: "sparkles",
  },
];

export const blogTags: BlogTag[] = [
  { id: "t1", name: "Beginner", slug: "beginner", icon: "baby" },
  {
    id: "t2",
    name: "Daily Conversation",
    slug: "daily-conversation",
    icon: "message-circle",
  },
  { id: "t3", name: "Grammar Basics", slug: "grammar-basics", icon: "book" },
  { id: "t4", name: "Confidence", slug: "confidence", icon: "zap" },
];

export const blogAuthor: Author = {
  id: "u1",
  name: "Tim InggrisGo",
  image: "/images/authors/inggrisgo.png",
};

export const blogPosts: BlogPost[] = [
  {
    id: "p1",
    title: "Cara Cepat Lancar Speaking Bahasa Inggris Tanpa Takut Salah",
    slug: "cara-lancar-speaking-bahasa-inggris",
    excerpt:
      "Pelajari cara meningkatkan kemampuan speaking tanpa rasa takut dengan metode sederhana yang bisa langsung dipraktikkan.",
    coverImage:
      "https://images.unsplash.com/photo-1587038787166-becd08a156f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHNwZWFraW5nJTIwY2xhc3MlMjBpbmRvbmVzaWF8ZW58MHx8MHx8fDA%3D",
    readingTime: 5,
    category: blogCategories[0],
    tags: [blogTags[0], blogTags[1], blogTags[3]],
    views: 1200,
    likes: 340,
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
    isFeatured: true,
  },
  {
    id: "p2",
    title: "5 Kesalahan Grammar yang Sering Dilakukan Pemula",
    slug: "kesalahan-grammar-pemula",
    excerpt:
      "Hindari kesalahan grammar umum yang sering dilakukan pemula agar komunikasi lebih jelas dan percaya diri.",
    coverImage:
      "https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Z3JhbW1hcnxlbnwwfHwwfHx8MA%3D%3D",
    readingTime: 4,
    views: 980,
    likes: 215,
    category: blogCategories[1],
    tags: [blogTags[0], blogTags[2]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
    isFeatured: true,
  },
  {
    id: "p3",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    slug: "kosakata-bahasa-inggris-sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW5nbGlzaCUyMHZvY2FifGVufDB8fDB8fHww",
    readingTime: 6,
    views: 760,
    likes: 180,
    category: blogCategories[2],
    tags: [blogTags[0], blogTags[1]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p4",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    slug: "cara-mengatasi-tidak-pd-speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BlYWtpbmclMjBjb25maWRlbnR8ZW58MHx8MHx8fDA%3D",
    readingTime: 5,
    views: 640,
    likes: 155,
    category: blogCategories[3],
    tags: [blogTags[3]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p3",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    slug: "kosakata-bahasa-inggris-sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW5nbGlzaCUyMHZvY2FifGVufDB8fDB8fHww",
    readingTime: 6,
    views: 760,
    likes: 180,
    category: blogCategories[2],
    tags: [blogTags[0], blogTags[1]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p4",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    slug: "cara-mengatasi-tidak-pd-speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BlYWtpbmclMjBjb25maWRlbnR8ZW58MHx8MHx8fDA%3D",
    readingTime: 5,
    views: 640,
    likes: 155,
    category: blogCategories[3],
    tags: [blogTags[3]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p3",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    slug: "kosakata-bahasa-inggris-sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW5nbGlzaCUyMHZvY2FifGVufDB8fDB8fHww",
    readingTime: 6,
    views: 760,
    likes: 180,
    category: blogCategories[2],
    tags: [blogTags[0], blogTags[1]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p4",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    slug: "cara-mengatasi-tidak-pd-speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BlYWtpbmclMjBjb25maWRlbnR8ZW58MHx8MHx8fDA%3D",
    readingTime: 5,
    views: 640,
    likes: 155,
    category: blogCategories[3],
    tags: [blogTags[3]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p3",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    slug: "kosakata-bahasa-inggris-sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW5nbGlzaCUyMHZvY2FifGVufDB8fDB8fHww",
    readingTime: 6,
    views: 760,
    likes: 180,
    category: blogCategories[2],
    tags: [blogTags[0], blogTags[1]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "p4",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    slug: "cara-mengatasi-tidak-pd-speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BlYWtpbmclMjBjb25maWRlbnR8ZW58MHx8MHx8fDA%3D",
    readingTime: 5,
    views: 640,
    likes: 155,
    category: blogCategories[3],
    tags: [blogTags[3]],
    author: blogAuthor,
    publishedAt: "2025-02-10T00:00:00Z",
  },
];

export const blogPlaylists: BlogPlaylist[] = [
  {
    id: "pl1",
    name: "Belajar Speaking dari Nol",
    description:
      "Panduan lengkap untuk mulai speaking dari dasar hingga percaya diri.",
    isSystem: true,
    isDefault: false,
    isPublic: true,
    posts: [blogPosts[0], blogPosts[3]],
  },
  {
    id: "pl2",
    name: "Grammar Fundamental",
    description:
      "Materi penting grammar untuk membangun dasar bahasa Inggris yang kuat.",
    isSystem: true,
    isDefault: false,
    isPublic: true,
    posts: [blogPosts[1]],
  },
];
