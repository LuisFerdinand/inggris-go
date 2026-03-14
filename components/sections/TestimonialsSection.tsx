import Reveal from "@/components/ui/Reveal";

const testimonials = [
  {
    quote:
      "Sebelumnya saya sangat takut speaking, tapi setelah ikut Speaking Challenge di Inggris Go, sekarang saya sudah berani ngobrol pakai bahasa Inggris! Metodenya praktis dan tutornya sabar banget.",
    name: "Rina Amelia",
    role: "Mahasiswa",
    location: "Jakarta",
    initials: "RA",
    program: "Speaking Challenge",
    rating: 5,
    bg: "bg-brand-orange",
  },
  {
    quote:
      "Anak saya ikut VIP English Camp dan pulang dengan perubahan luar biasa! Sekarang dia lebih percaya diri dan suka belajar bahasa Inggris. Terima kasih Inggris Go!",
    name: "Budi Hartono",
    role: "Orang Tua",
    location: "Surabaya",
    initials: "BH",
    program: "VIP English Camp",
    rating: 5,
    bg: "bg-brand-teal",
  },
  {
    quote:
      "Kami sudah bekerja sama dengan Inggris Go untuk English Camp sekolah kami 2 tahun berturut-turut. Programnya terstruktur dan siswa-siswa sangat antusias belajar di Pare!",
    name: "Sri Wahyuni, S.Pd",
    role: "Kepala Sekolah SMP",
    location: "Bandung",
    initials: "SW",
    program: "School Camp",
    rating: 5,
    bg: "bg-purple-600",
  },
  {
    quote:
      "GoPrivate benar-benar mengubah cara saya belajar. Tutor memahami kelemahan saya dan memberikan latihan yang tepat sasaran. Dalam 2 bulan, speaking saya meningkat drastis!",
    name: "Dian Kusuma",
    role: "Profesional",
    location: "Bandung",
    initials: "DK",
    program: "GoPrivate",
    rating: 5,
    bg: "bg-brand-navy",
  },
  {
    quote:
      "Awalnya ragu karena sudah lama tidak belajar bahasa Inggris. Tapi sistem challenge mingguan di Inggris Go bikin saya tetap semangat dan tidak pernah merasa tertinggal.",
    name: "Anisa Putri",
    role: "Ibu Rumah Tangga",
    location: "Yogyakarta",
    initials: "AP",
    program: "Speaking Challenge",
    rating: 5,
    bg: "bg-brand-orange",
  },
  {
    quote:
      "Program School Camp dari Inggris Go jauh melebihi ekspektasi. Siswa-siswa kami kembali dengan semangat belajar bahasa Inggris yang baru dan kepercayaan diri yang meningkat.",
    name: "Ahmad Fauzi, M.Pd",
    role: "Guru Bahasa Inggris",
    location: "Semarang",
    initials: "AF",
    program: "School Camp",
    rating: 5,
    bg: "bg-brand-teal",
  },
];

const Stars = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <Reveal>
            <span className="section-eyebrow text-brand-orange mb-4 block">Testimoni</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-display-md text-brand-navy mb-5">
              Kata Mereka yang Sudah{" "}
              <span className="text-orange-gradient">Berani Speak</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-brand-charcoal/55 text-lg">
              Lebih dari 500 siswa telah membuktikan — belajar bahasa Inggris tidak harus menakutkan.
            </p>
          </Reveal>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={0.05 * i}>
              <div className="break-inside-avoid card p-7">
                {/* Stars + program tag */}
                <div className="flex items-center justify-between mb-4">
                  <Stars count={t.rating} />
                  <span className="pill pill-orange text-xs">{t.program}</span>
                </div>

                {/* Quote */}
                <blockquote className="text-brand-charcoal/75 text-[0.9375rem] leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-display font-700 flex-shrink-0"
                    style={{ background: t.bg === "bg-brand-orange" ? "#FF6B35" : t.bg === "bg-brand-teal" ? "#2DB8B0" : t.bg === "bg-purple-600" ? "#9333ea" : t.bg === "bg-brand-navy" ? "#0F2340" : "#FF6B35" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-display font-600 text-brand-navy text-sm">{t.name}</p>
                    <p className="text-brand-charcoal/45 text-xs">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
