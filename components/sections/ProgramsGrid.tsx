import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const programs = [
  {
    href: "/speaking-challenge",
    badge: "Paling Populer",
    badgeBg: "bg-brand-orange text-white",
    icon: "🎙️",
    iconBg: "bg-orange-gradient",
    accent: "border-brand-orange/20 hover:border-brand-orange/40",
    highlight: "bg-brand-orange",
    title: "Speaking Challenge",
    subtitle: "Program 30 Hari",
    desc: "Latihan speaking intensif untuk pemula. Challenge mingguan terstruktur dengan feedback langsung dari tutor.",
    features: ["4 minggu program", "Challenge mingguan", "Feedback personal", "Grup komunitas"],
    cta: "text-brand-orange",
  },
  {
    href: "/go-private",
    badge: "Fleksibel",
    badgeBg: "bg-brand-teal text-white",
    icon: "👤",
    iconBg: "bg-teal-gradient",
    accent: "border-brand-teal/20 hover:border-brand-teal/40",
    highlight: "bg-brand-teal",
    title: "GoPrivate",
    subtitle: "Online Class",
    desc: "Belajar 1-on-1 dengan tutor personal. Jadwal fleksibel, materi disesuaikan dengan kebutuhanmu.",
    features: ["Jadwal fleksibel", "Tutor 1-on-1", "Kurikulum personal", "Via Zoom/WA"],
    cta: "text-brand-teal",
  },
  {
    href: "/vip-camp",
    badge: "For Kids",
    badgeBg: "bg-brand-navy text-white",
    icon: "🏕️",
    iconBg: "bg-navy-gradient",
    accent: "border-brand-navy/20 hover:border-brand-navy/40",
    highlight: "bg-brand-navy",
    title: "VIP English Camp",
    subtitle: "for Kids",
    desc: "Pengalaman belajar tak terlupakan langsung di Kampung Inggris Pare. Seru, aman, dan efektif untuk anak.",
    features: ["Di Kampung Inggris", "Akomodasi nyaman", "Aktivitas seru", "Pengawasan 24 jam"],
    cta: "text-brand-navy",
  },
  {
    href: "/school-camp",
    badge: "Grup Sekolah",
    badgeBg: "bg-purple-600 text-white",
    icon: "🏫",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
    accent: "border-purple-300/30 hover:border-purple-400/50",
    highlight: "bg-purple-600",
    title: "English Camp",
    subtitle: "for Schools",
    desc: "Study tour edukatif ke Kampung Inggris Pare. Program terstruktur, fasilitas lengkap, paket customizable.",
    features: ["Untuk rombongan", "Program terstruktur", "Akomodasi + makan", "Laporan siswa"],
    cta: "text-purple-600",
  },
];

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function ProgramsGrid() {
  return (
    <section id="programs" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <Reveal>
              <span className="section-eyebrow text-brand-orange mb-4 block">Program Kami</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-display-md text-brand-navy">
                Pilih Program yang <span className="text-orange-gradient">Tepat Untukmu</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2} direction="right">
            <p className="text-brand-charcoal/55 max-w-xs leading-relaxed text-[0.9375rem]">
              Dari pemula hingga program rombongan sekolah — kami punya solusi untuk setiap kebutuhan belajar.
            </p>
          </Reveal>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((prog, i) => (
            <Reveal key={prog.href} delay={0.08 * i}>
              <Link
                href={prog.href}
                className={`group relative flex flex-col bg-white rounded-3xl border-2 ${prog.accent} shadow-card hover:shadow-card-hover transition-all duration-350 overflow-hidden h-full`}
              >
                {/* Top accent line */}
                <div className={`h-1 ${prog.highlight} w-full`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <span className={`pill text-xs ${prog.badgeBg}`}>{prog.badge}</span>
                    <div className={`w-11 h-11 rounded-2xl ${prog.iconBg} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                      {prog.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <p className="text-brand-charcoal/40 text-xs font-display font-600 tracking-wide uppercase mb-0.5">{prog.subtitle}</p>
                    <h3 className="font-display font-700 text-brand-navy text-xl">{prog.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-brand-charcoal/60 text-sm leading-relaxed mb-5">{prog.desc}</p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-6 flex-1">
                    {prog.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-brand-charcoal/70">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 font-display font-600 text-sm ${prog.cta} group-hover:gap-3 transition-all`}>
                    Lihat Detail
                    <ArrowRight />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
