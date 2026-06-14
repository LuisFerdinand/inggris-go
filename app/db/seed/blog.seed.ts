// app/db/seed/blog.seed.ts
//
// Seed order: Tags → Categories → Posts → PostTags → syncViewCounts
//
// ─── HOW TO EDIT THIS FILE ────────────────────────────────────────────────────
//
//  • Add/remove a TAG           → edit TAG_DATA
//  • Add/remove a CATEGORY      → edit CATEGORY_DATA
//  • Add/remove a POST          → edit POST_DATA
//      - tags: string[]         → must match name field in TAG_DATA
//      - categorySlug: string   → must match slug in CATEGORY_DATA
//      - Set status: "draft" | "published" | "archived"
//
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/app/db/db";
import { post, postCategory, postTag, tag } from "@/app/db/schema";
import { generateId, generateSlug } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { user } from "@/app/db/schema/auth-schema";

// ─── Infer types ──────────────────────────────────────────────────────────────

type PostInsert = typeof post.$inferInsert;
type PostCategoryInsert = typeof postCategory.$inferInsert;
type TagInsert = typeof tag.$inferInsert;
type PostTagInsert = typeof postTag.$inferInsert;

// ─── Slug helper ──────────────────────────────────────────────────────────────

const sl = (str: string) => generateSlug(str);

// ─────────────────────────────────────────────────────────────────────────────
// ██████████████████████████████████████████████████████████████████████████
//
//   EDIT YOUR DATA BELOW
//
// ██████████████████████████████████████████████████████████████████████████
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — TAGS
// ═══════════════════════════════════════════════════════════════════════════════

type RawTag = { name: string; slug?: string };

const TAG_DATA: RawTag[] = [
  { name: "Beginner" },
  { name: "Daily Conversation" },
  { name: "Grammar Basics" },
  { name: "Confidence" },
  { name: "Vocabulary" },
  { name: "Speaking Tips" },
  { name: "Study Habits" },
  { name: "Pronunciation" },
  { name: "Listening" },
  { name: "Writing" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — POST CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

type RawCategory = {
  name: string;
  slug: string;
  description?: string;
};

const CATEGORY_DATA: RawCategory[] = [
  {
    name: "Speaking",
    slug: "speaking",
    description: "Tips dan teknik untuk meningkatkan kemampuan berbicara bahasa Inggris.",
  },
  {
    name: "Grammar",
    slug: "grammar",
    description: "Panduan tata bahasa untuk membangun fondasi bahasa Inggris yang kuat.",
  },
  {
    name: "Vocabulary",
    slug: "vocabulary",
    description: "Daftar kosakata penting dan cara efektif menghafal kosakata baru.",
  },
  {
    name: "Tips & Motivation",
    slug: "tips-motivation",
    description: "Motivasi belajar dan strategi agar konsisten belajar bahasa Inggris.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — POSTS
// ───────────────────────────────────────────────────────────────────────────────
//  - categorySlug  : must match a slug in CATEGORY_DATA
//  - tags          : array of tag names from TAG_DATA
//  - status        : "draft" | "published" | "archived"
//  - publishedAt   : ISO string, required when status is "published"
// ═══════════════════════════════════════════════════════════════════════════════

type RawPost = Omit<PostInsert, "id" | "slug" | "authorId"> & {
  categorySlug: string;
  tags: string[];
};

const POST_DATA: RawPost[] = [
  // ── Speaking ──────────────────────────────────────────────────────────────
  {
    categorySlug: "speaking",
    title: "Cara Cepat Lancar Speaking Bahasa Inggris Tanpa Takut Salah",
    excerpt:
      "Pelajari cara meningkatkan kemampuan speaking tanpa rasa takut dengan metode sederhana yang bisa langsung dipraktikkan.",
    coverImage:
      "https://images.unsplash.com/photo-1587038787166-becd08a156f7?w=600&auto=format&fit=crop&q=60",
    readTime: 5,
    status: "published",
    publishedAt: new Date("2025-02-10T00:00:00Z"),
    viewCount: 1200,
    tags: ["Beginner", "Daily Conversation", "Confidence", "Speaking Tips"],
    contentHtml: `
<p>Banyak orang yang sudah bertahun-tahun belajar bahasa Inggris, tapi ketika diminta untuk berbicara, tiba-tiba blank. Ini bukan masalah kosakata atau grammar — ini masalah <strong>kepercayaan diri</strong>.</p>

<h2>1. Mulai dari Kalimat Pendek</h2>
<p>Jangan langsung mencoba bicara panjang. Mulai dengan kalimat pendek yang kamu yakin benar. <em>"How are you?", "I think so.", "That's interesting."</em> — kalimat sederhana ini sudah cukup untuk memulai percakapan.</p>

<h2>2. Rekam Suaramu Sendiri</h2>
<p>Rekam dirimu sendiri berbicara selama 1–2 menit. Dengarkan ulang. Ini akan membantumu menyadari kesalahan yang tidak kamu perhatikan saat berbicara langsung.</p>

<h2>3. Shadowing Technique</h2>
<p>Pilih video YouTube dengan subtitle bahasa Inggris. Tiru cara pembicara berbicara — tempo, intonasi, jeda. Latihan ini membangun muscle memory untuk speaking.</p>

<h2>4. Jadikan Kesalahan Sebagai Guru</h2>
<p>Setiap kali salah, tulis kesalahannya. Bukan untuk dihukum, tapi untuk dipelajari. Otak kita lebih mudah mengingat sesuatu yang pernah salah kita lakukan.</p>

<p>Konsistensi 15 menit sehari jauh lebih efektif daripada marathon 3 jam seminggu sekali. Mulai hari ini, bukan besok.</p>
`,
  },
  {
    categorySlug: "speaking",
    title: "Cara Mengatasi Rasa Tidak Percaya Diri Saat Speaking",
    excerpt:
      "Temukan cara praktis untuk meningkatkan kepercayaan diri saat berbicara bahasa Inggris.",
    coverImage:
      "https://plus.unsplash.com/premium_photo-1705883064302-64958d65be71?w=600&auto=format&fit=crop&q=60",
    readTime: 5,
    status: "published",
    publishedAt: new Date("2025-03-05T00:00:00Z"),
    viewCount: 640,
    tags: ["Confidence", "Speaking Tips", "Study Habits"],
    contentHtml: `
<p>Rasa tidak percaya diri saat berbicara bahasa Inggris adalah hal yang sangat umum — bahkan di kalangan orang yang sudah fasih sekalipun. Bedanya, mereka sudah menemukan cara untuk mengelolanya.</p>

<h2>Kenapa Kita Tidak Percaya Diri?</h2>
<p>Ada dua penyebab utama: takut dihakimi orang lain, dan standar yang terlalu tinggi untuk diri sendiri. Kita ingin sempurna sebelum mau mencoba — padahal "sempurna" itu tidak pernah datang tanpa banyak mencoba dulu.</p>

<h2>Strategi Praktis</h2>

<h3>Bicara di depan cermin</h3>
<p>Latihan di depan cermin membantu kamu terbiasa dengan ekspresi wajah dan bahasa tubuh saat berbicara. Ini juga membuatmu lebih sadar dengan gerak-gerik yang membuat penampilan lebih meyakinkan.</p>

<h3>Mulai dengan teman atau komunitas kecil</h3>
<p>Jangan langsung terjun ke forum besar. Cari satu atau dua teman yang juga belajar bahasa Inggris. Praktik bersama jauh lebih nyaman dan efektif daripada sendirian.</p>

<h3>Fokus ke pesan, bukan ke grammar</h3>
<p>Tanyakan pada dirimu: apakah orang lain mengerti maksudku? Jika ya, artinya kamu sudah berkomunikasi dengan efektif. Grammar bisa diperbaiki seiring waktu.</p>
`,
  },

  // ── Grammar ───────────────────────────────────────────────────────────────
  {
    categorySlug: "grammar",
    title: "5 Kesalahan Grammar yang Sering Dilakukan Pemula",
    excerpt:
      "Hindari kesalahan grammar umum yang sering dilakukan pemula agar komunikasi lebih jelas dan percaya diri.",
    coverImage:
      "https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=600&auto=format&fit=crop&q=60",
    readTime: 4,
    status: "published",
    publishedAt: new Date("2025-02-18T00:00:00Z"),
    viewCount: 980,
    tags: ["Beginner", "Grammar Basics"],
    contentHtml: `
<p>Kesalahan grammar bukan sesuatu yang harus ditakuti — semua orang pernah melakukannya. Yang penting adalah kamu tahu kesalahan mana yang paling umum, sehingga bisa mulai menghindarinya secara aktif.</p>

<h2>1. Lupa "s" di Orang Ketiga Tunggal</h2>
<p>Contoh salah: <em>"She walk to school every day."</em><br>
Contoh benar: <em>"She <strong>walks</strong> to school every day."</em></p>
<p>Aturan ini berlaku untuk he, she, it, dan nama orang. Setiap kali kamu pakai simple present dengan subjek orang ketiga tunggal, tambahkan -s atau -es di kata kerja.</p>

<h2>2. Bingung "a" vs "an"</h2>
<p>"A" dipakai sebelum konsonan, "an" sebelum vokal — tapi aturannya berdasarkan <em>bunyi</em>, bukan huruf. "An hour" (h tidak berbunyi), "a university" (bunyi awalnya 'yu').</p>

<h2>3. Salah pakai Present Perfect vs Simple Past</h2>
<p>Simple past dipakai untuk kejadian di waktu tertentu yang sudah selesai:<br>
<em>"I ate rice this morning."</em></p>
<p>Present perfect dipakai untuk pengalaman atau kejadian yang masih relevan sekarang:<br>
<em>"I have eaten rice today."</em></p>

<h2>4. Kata Ganti Tidak Konsisten</h2>
<p>Jangan ganti subjek di tengah kalimat:<br>
Salah: <em>"When someone is tired, they should rest."</em> — ini sebenarnya sudah lebih diterima, tapi banyak pemula yang malah balik ke "he" tiba-tiba.</p>

<h2>5. "Much" vs "Many"</h2>
<p>"Much" untuk uncountable nouns (water, money, time). "Many" untuk countable nouns (books, people, ideas). Bingung? Tanyakan: apakah benda ini bisa dihitung satu per satu?</p>
`,
  },
  {
    categorySlug: "grammar",
    title: "Panduan Lengkap Penggunaan Tenses dalam Bahasa Inggris",
    excerpt:
      "Tenses sering bikin bingung, tapi dengan panduan ini kamu akan paham kapan dan bagaimana menggunakannya dengan tepat.",
    coverImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60",
    readTime: 8,
    status: "published",
    publishedAt: new Date("2025-04-01T00:00:00Z"),
    viewCount: 520,
    tags: ["Grammar Basics", "Beginner"],
    contentHtml: `
<p>Ada 12 tenses dalam bahasa Inggris, tapi jangan panik. Dalam percakapan sehari-hari, kamu hanya butuh menguasai sekitar 4–5 yang paling sering dipakai.</p>

<h2>Tenses yang Wajib Dikuasai Dulu</h2>

<h3>1. Simple Present</h3>
<p>Untuk kebiasaan, fakta, dan keadaan umum.<br>
<em>"I drink coffee every morning."</em></p>

<h3>2. Simple Past</h3>
<p>Untuk kejadian yang sudah selesai di masa lalu.<br>
<em>"I went to Surabaya last week."</em></p>

<h3>3. Present Continuous</h3>
<p>Untuk kejadian yang sedang berlangsung sekarang.<br>
<em>"She is studying right now."</em></p>

<h3>4. Present Perfect</h3>
<p>Untuk pengalaman atau kejadian yang punya efek sampai sekarang.<br>
<em>"I have visited Bali three times."</em></p>

<h3>5. Future (will / going to)</h3>
<p>"Will" untuk keputusan spontan atau prediksi. "Going to" untuk rencana yang sudah ada.<br>
<em>"I will call you later." vs "I'm going to visit my parents this weekend."</em></p>

<p>Kuasai 5 tenses ini dulu. Sisanya akan terasa jauh lebih mudah setelah fondasi ini kuat.</p>
`,
  },

  // ── Vocabulary ────────────────────────────────────────────────────────────
  {
    categorySlug: "vocabulary",
    title: "50 Kosakata Bahasa Inggris yang Wajib Dikuasai Sehari-hari",
    excerpt:
      "Daftar kosakata penting yang sering digunakan dalam percakapan sehari-hari.",
    coverImage:
      "https://images.unsplash.com/photo-1704881986205-ee7cb7688f3b?w=500&auto=format&fit=crop&q=60",
    readTime: 6,
    status: "published",
    publishedAt: new Date("2025-03-15T00:00:00Z"),
    viewCount: 760,
    tags: ["Beginner", "Daily Conversation", "Vocabulary"],
    contentHtml: `
<p>Kosakata adalah fondasi dari semua kemampuan bahasa. Semakin banyak kata yang kamu kenal, semakin bebas kamu berekspresi. Berikut 50 kosakata yang paling sering muncul dalam percakapan sehari-hari.</p>

<h2>Kata Kerja (Verbs)</h2>
<ul>
  <li><strong>get</strong> — mendapatkan, pergi, menjadi</li>
  <li><strong>make</strong> — membuat</li>
  <li><strong>go</strong> — pergi</li>
  <li><strong>know</strong> — tahu</li>
  <li><strong>think</strong> — berpikir</li>
  <li><strong>come</strong> — datang</li>
  <li><strong>take</strong> — mengambil, membutuhkan (waktu)</li>
  <li><strong>see</strong> — melihat</li>
  <li><strong>want</strong> — ingin</li>
  <li><strong>use</strong> — menggunakan</li>
</ul>

<h2>Kata Sifat (Adjectives)</h2>
<ul>
  <li><strong>good</strong> — baik</li>
  <li><strong>new</strong> — baru</li>
  <li><strong>first</strong> — pertama</li>
  <li><strong>last</strong> — terakhir</li>
  <li><strong>long</strong> — panjang / lama</li>
  <li><strong>great</strong> — hebat, luar biasa</li>
  <li><strong>little</strong> — sedikit, kecil</li>
  <li><strong>own</strong> — sendiri, milik</li>
  <li><strong>right</strong> — benar, kanan</li>
  <li><strong>big</strong> — besar</li>
</ul>

<h2>Frase yang Sering Dipakai</h2>
<ul>
  <li><em>I mean…</em> — Maksudku…</li>
  <li><em>You know what?</em> — Tau nggak?</li>
  <li><em>Actually…</em> — Sebenarnya…</li>
  <li><em>By the way…</em> — Ngomong-ngomong…</li>
  <li><em>That makes sense.</em> — Masuk akal.</li>
  <li><em>I'm not sure.</em> — Saya tidak yakin.</li>
  <li><em>Could you repeat that?</em> — Bisa diulang?</li>
  <li><em>What do you think?</em> — Menurutmu?</li>
</ul>

<p>Hafalkan 5 kata atau frase per hari. Lebih penting lagi: pakai langsung dalam kalimat nyata, jangan hanya dihafal di kepala.</p>
`,
  },
  {
    categorySlug: "vocabulary",
    title: "Cara Efektif Menghafal Kosakata Baru dan Tidak Mudah Lupa",
    excerpt:
      "Teknik berbasis riset untuk menghafal kosakata baru yang benar-benar masuk ke memori jangka panjang.",
    coverImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60",
    readTime: 5,
    status: "published",
    publishedAt: new Date("2025-05-10T00:00:00Z"),
    viewCount: 430,
    tags: ["Vocabulary", "Study Habits", "Beginner"],
    contentHtml: `
<p>Menghafal kosakata bukan tentang mengulang berkali-kali — ini tentang menggunakan teknik yang tepat agar kata-kata itu masuk ke memori jangka panjang.</p>

<h2>1. Spaced Repetition</h2>
<p>Ini adalah teknik terbaik yang didukung riset. Alih-alih belajar 50 kata sehari, belajar 10 kata dan ulangi di hari ke-2, ke-5, ke-12, dan ke-30. Aplikasi seperti Anki menggunakan sistem ini secara otomatis.</p>

<h2>2. Buat Kalimat Sendiri</h2>
<p>Setiap kali kamu belajar kata baru, buat minimal 2 kalimat menggunakan kata itu. Kalimat yang relevan dengan kehidupanmu sendiri akan jauh lebih mudah diingat.</p>

<h2>3. Kelompokkan Berdasarkan Tema</h2>
<p>Belajar kata-kata dalam kelompok tematik (misalnya: semua kata tentang makanan, atau semua kata tentang emosi) membuat otak lebih mudah membuat koneksi.</p>

<h2>4. Visualisasi dan Asosiasi</h2>
<p>Kaitkan kata baru dengan gambar atau cerita yang unik dan personal. Semakin absurd atau lucu asosiasinya, semakin mudah diingat.</p>

<h2>5. Gunakan dalam Percakapan Nyata</h2>
<p>Ini yang paling penting. Tidak ada teknik hafalan yang mengalahkan penggunaan langsung. Cari kesempatan untuk pakai kata baru itu hari ini juga.</p>
`,
  },

  // ── Tips & Motivation ──────────────────────────────────────────────────────
  {
    categorySlug: "tips-motivation",
    title: "Kenapa Konsistensi Lebih Penting dari Intensitas dalam Belajar Bahasa Inggris",
    excerpt:
      "15 menit sehari lebih efektif dari 3 jam seminggu sekali. Ini penjelasan ilmiahnya dan cara membangun kebiasaan belajar yang bertahan.",
    coverImage:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=60",
    readTime: 4,
    status: "published",
    publishedAt: new Date("2025-04-20T00:00:00Z"),
    viewCount: 510,
    tags: ["Study Habits", "Confidence"],
    contentHtml: `
<p>Otak manusia dirancang untuk belajar secara bertahap. Ini bukan opini — ini fakta neurosains. Setiap kali kamu mengulang sesuatu, koneksi saraf di otak semakin kuat. Tapi koneksi itu butuh waktu untuk terbentuk dengan benar.</p>

<h2>Masalah dengan "Belajar Marathon"</h2>
<p>Duduk 3 jam belajar bahasa Inggris di hari Sabtu terasa produktif. Tapi secara kognitif, kamu hanya memproses informasi dalam satu sesi panjang yang tidak efisien. Otakmu kelelahan dan retensinya rendah.</p>

<h2>Kenapa 15 Menit Sehari Lebih Baik</h2>
<p>Sesi pendek yang diulang setiap hari memicu sesuatu yang disebut <em>spaced repetition</em> secara alami. Setiap hari kamu "menyegarkan" koneksi saraf yang sudah ada, sehingga informasi benar-benar masuk ke memori jangka panjang.</p>

<h2>Cara Membangun Kebiasaan 15 Menit</h2>
<ol>
  <li><strong>Tentukan waktu yang sama setiap hari</strong> — otak suka rutinitas.</li>
  <li><strong>Kaitkan dengan kebiasaan yang sudah ada</strong> — belajar sambil sarapan, atau setelah sikat gigi malam.</li>
  <li><strong>Buat sesederhana mungkin</strong> — buka aplikasi dan baca 5 kalimat sudah cukup untuk memulai.</li>
  <li><strong>Rayakan konsistensi, bukan durasi</strong> — kalau kamu belajar 5 menit saja, itu tetap menang.</li>
</ol>

<p>Bahasa Inggris bukan sprint. Ini maraton. Dan yang menang maraton bukan yang paling kencang, tapi yang paling konsisten.</p>
`,
  },
  {
    categorySlug: "tips-motivation",
    title: "7 Kebiasaan Harian yang Membantu Kamu Belajar Bahasa Inggris Lebih Cepat",
    excerpt:
      "Belajar bahasa Inggris tidak selalu harus duduk di depan buku. Ini 7 kebiasaan kecil yang bisa kamu integrasikan ke rutinitas harianmu.",
    coverImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=60",
    readTime: 5,
    status: "draft",
    publishedAt: null,
    viewCount: 0,
    tags: ["Study Habits", "Speaking Tips", "Beginner"],
    contentHtml: `
<p>Kamu tidak perlu les setiap hari untuk menjadi fasih. Yang kamu butuhkan adalah kebiasaan kecil yang dilakukan secara konsisten. Berikut 7 kebiasaan yang bisa langsung kamu mulai hari ini.</p>

<h2>1. Ganti Bahasa HP ke Bahasa Inggris</h2>
<p>Ini cara paling mudah untuk menambah paparan bahasa Inggris tanpa usaha ekstra. Dalam seminggu, kamu akan otomatis tahu arti kata-kata teknis seperti "settings", "notifications", hingga "airplane mode".</p>

<h2>2. Dengarkan Podcast Bahasa Inggris saat Commute</h2>
<p>Pilih topik yang kamu suka — olahraga, bisnis, teknologi, atau true crime. Mendengarkan secara teratur akan membiasakan telinga dengan ritme dan intonasi bahasa Inggris alami.</p>

<h2>3. Nonton dengan Subtitle Bahasa Inggris</h2>
<p>Mulai dengan subtitle bahasa Indonesia, lalu setelah nyaman, ganti ke subtitle bahasa Inggris. Setelah itu, coba tanpa subtitle sama sekali.</p>

<h2>4. Berpikir dalam Bahasa Inggris</h2>
<p>Saat kamu sedang mandi, masak, atau jalan, coba narasikan aktivitasmu dalam bahasa Inggris di kepala. "I'm making coffee. I need to add sugar…" Ini latihan speaking tanpa perlu lawan bicara.</p>

<h2>5. Tulis Jurnal Singkat dalam Bahasa Inggris</h2>
<p>Tidak perlu panjang. 3–5 kalimat tentang harimu sudah cukup. Ini melatih grammar, kosakata, dan kemampuan mengekspresikan diri secara tertulis sekaligus.</p>

<h2>6. Ikuti Akun Bahasa Inggris di Media Sosial</h2>
<p>Follow akun yang posting konten dalam bahasa Inggris tentang topik yang kamu suka. Kamu akan menyerap bahasa secara pasif tanpa terasa belajar.</p>

<h2>7. Temukan Language Partner</h2>
<p>Cari satu orang yang juga belajar bahasa Inggris dan sepakati untuk saling mengkoreksi. Akuntabilitas dan praktik langsung adalah kombinasi yang sangat efektif.</p>
`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ██████████████████████████████████████████████████████████████████████████
//
//   SEED FUNCTIONS  (no need to edit below unless changing DB logic)
//
// ██████████████████████████████████████████████████████████████████████████
// ─────────────────────────────────────────────────────────────────────────────

// ─── 1. Tags ──────────────────────────────────────────────────────────────────

export async function seedBlogTags() {
  console.log("1. Seeding Blog Tags…");
  await db.delete(tag);

  const data: TagInsert[] = TAG_DATA.map((t) => ({
    id: generateId("tag"),
    name: t.name,
    slug: t.slug ?? sl(t.name),
  }));

  await db
    .insert(tag)
    .values(data)
    .onConflictDoUpdate({
      target: tag.slug,
      set: {
        name: sql`excluded.name`,
      },
    });

  console.log(`   ✓ ${data.length} tags inserted`);
}

// ─── 2. Post Categories ───────────────────────────────────────────────────────

export async function seedPostCategories() {
  console.log("2. Seeding Post Categories…");
  await db.delete(postCategory);

  const data: PostCategoryInsert[] = CATEGORY_DATA.map((c) => ({
    id: generateId("post-cat"),
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
  }));

  await db
    .insert(postCategory)
    .values(data)
    .onConflictDoUpdate({
      target: postCategory.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
      },
    });

  console.log(`   ✓ ${data.length} post categories inserted`);
}

// ─── 3. Posts ─────────────────────────────────────────────────────────────────

export async function seedPosts() {
  console.log("3. Seeding Posts…");

  // Delete post-tags first (FK child), then posts
  await db.delete(postTag);
  await db.delete(post);

  // ── Resolve fallback author ──────────────────────────────────────────────────
  // Pick the first available user (by createdAt) as the default post author.
  // This works regardless of which email is configured in the users seed.
  const firstUser = await db.query.user.findFirst({
    columns: { id: true, email: true },
    orderBy: (u, { asc }) => [asc(u.createdAt)],
  });

  if (!firstUser) {
    throw new Error(
      "No users found in the database. " +
        "Run seedUsers() before seedPosts().",
    );
  }

  const fallbackAuthorId = firstUser.id;
  console.log(`   → Using author: ${firstUser.email} (${firstUser.id})`);

  // ── Resolve tags ─────────────────────────────────────────────────────────────
  const tagRows = await db.query.tag.findMany({
    columns: { id: true, name: true },
  });

  const tagMap = new Map(tagRows.map((t) => [t.name, t.id]));

  function getTagId(name: string): string {
    const id = tagMap.get(name);
    if (!id) {
      throw new Error(
        `Tag not found: "${name}". ` +
          `Make sure it is listed in TAG_DATA and seedBlogTags() has run.`,
      );
    }
    return id;
  }

  // ── Insert posts ─────────────────────────────────────────────────────────────
  const postInserts: PostInsert[] = POST_DATA.map(
    ({ categorySlug: _cat, tags: _tags, ...p }) => ({
      ...p,
      id: generateId("post"),
      slug: sl(p.title),
      authorId: fallbackAuthorId,
    }),
  );

  await db
    .insert(post)
    .values(postInserts)
    .onConflictDoUpdate({
      target: post.slug,
      set: {
        title: sql`excluded.title`,
        excerpt: sql`excluded.excerpt`,
        coverImage: sql`excluded.cover_image`,
        contentHtml: sql`excluded.content_html`,
        readTime: sql`excluded.read_time`,
        status: sql`excluded.status`,
        publishedAt: sql`excluded.published_at`,
        viewCount: sql`excluded.view_count`,
        updatedAt: new Date(),
      },
    });

  // ── Re-fetch inserted posts to get their IDs ─────────────────────────────────
  const insertedPosts = await db.query.post.findMany({
    columns: { id: true, slug: true },
  });

  const postSlugToId = new Map(insertedPosts.map((p) => [p.slug, p.id]));

  // ── Insert post-tag relations ─────────────────────────────────────────────────
  const postTagRows: PostTagInsert[] = [];

  for (const rawPost of POST_DATA) {
    const postId = postSlugToId.get(sl(rawPost.title));
    if (!postId) continue; // should never happen

    for (const tagName of rawPost.tags) {
      postTagRows.push({
        id: generateId("pt"),
        postId,
        tagId: getTagId(tagName),
      });
    }
  }

  if (postTagRows.length > 0) {
    await db.insert(postTag).values(postTagRows);
  }

  console.log(
    `   ✓ ${postInserts.length} posts inserted, ${postTagRows.length} post-tag relations created`,
  );
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function seedAllBlog() {
  await seedBlogTags();
  await seedPostCategories();
  await seedPosts();
  console.log("\n✅  All blog data seeded successfully.");
}