import Reveal from "@/components/ui/Reveal";

const reasons = [
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
      </svg>
    ),
    bg: "bg-brand-orange",
    title: "Metode Praktis",
    desc: "Dirancang khusus untuk pemula yang ingin langsung bisa berbicara — bukan sekadar teori.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    bg: "bg-brand-teal",
    title: "Tutor Berpengalaman",
    desc: "Tim tutor profesional dari Kampung Inggris Pare dengan rekam jejak mengajar yang kuat.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    bg: "bg-purple-500",
    title: "Online & Offline",
    desc: "Fleksibel belajar dari mana saja online, atau nikmati suasana autentik langsung di Pare.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
    bg: "bg-yellow-500",
    title: "Kampung Inggris Pare",
    desc: "Pusat belajar bahasa Inggris terbesar di Indonesia — lingkungan terbaik untuk berkembang.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    bg: "bg-pink-500",
    title: "Fokus Speaking",
    desc: "Setiap program kami dirancang dengan satu tujuan: membuatmu berani dan lancar berbicara.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    ),
    bg: "bg-green-500",
    title: "Garansi Belajar",
    desc: "Jaminan kualitas pembelajaran dan pendampingan penuh hingga target kamu tercapai.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="py-20 lg:py-32 bg-brand-navy relative overflow-hidden">

      {/* Decorative rings */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -bottom-60 -left-20 w-[600px] h-[600px] rounded-full border border-white/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <Reveal>
            <span className="section-eyebrow text-brand-orange mb-4 block">Keunggulan Kami</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-display-md text-white mb-5">
              Mengapa Belajar di{" "}
              <span className="text-orange-gradient">Inggris Go</span>?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-white/45 text-lg leading-relaxed">
              Kami bukan sekadar kursus biasa. Ini adalah komunitas belajar yang membuatmu berani berbicara.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={0.07 * i}>
              <div className="group bg-white/6 backdrop-blur-sm rounded-3xl p-7 border border-white/8 hover:bg-white/10 hover:border-white/16 transition-all duration-300">
                <div className={`w-12 h-12 ${r.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                  {r.icon}
                </div>
                <h3 className="font-display font-700 text-white text-lg mb-2">{r.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom badge */}
        <Reveal delay={0.3}>
          <div className="mt-14 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white/8 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
              <div className="flex -space-x-1.5">
                {["🇮🇩", "✅", "⭐"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">{e}</div>
                ))}
              </div>
              <p className="text-white/70 text-sm">
                Dipercaya oleh <span className="font-600 text-white">500+ siswa</span> dari seluruh Indonesia
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
