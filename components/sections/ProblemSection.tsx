import Reveal from "@/components/ui/Reveal";

const problems = [
  {
    icon: "😰",
    title: "Takut Salah Grammar",
    desc: "Terlalu fokus pada kesempurnaan membuat tidak berani mencoba berbicara.",
    tag: "01",
  },
  {
    icon: "🙍",
    title: "Tidak Ada Partner",
    desc: "Tidak punya teman latihan speaking, sehingga tidak bisa berkembang.",
    tag: "02",
  },
  {
    icon: "😕",
    title: "Bingung Mulai dari Mana",
    desc: "Tidak tahu metode belajar yang efektif untuk speaking bahasa Inggris.",
    tag: "03",
  },
  {
    icon: "😔",
    title: "Kurang Percaya Diri",
    desc: "Minder dengan kemampuan sendiri dan takut ditertawakan orang lain.",
    tag: "04",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left sticky header */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <Reveal>
              <span className="section-eyebrow text-brand-orange mb-4 block">Masalah Umum</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-display-md text-brand-navy mb-6">
                Kenapa Kamu{" "}
                <span className="text-orange-gradient">Belum Berani</span>{" "}
                Speaking?
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-brand-charcoal/60 leading-relaxed mb-8">
                Banyak orang sudah belajar bahasa Inggris bertahun-tahun, tapi masih bungkam saat diminta berbicara.
                Bukan karena tidak bisa — tapi karena hambatan-hambatan ini.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="inline-flex items-start gap-3 bg-brand-orange-light rounded-2xl px-5 py-4 border border-brand-orange/15">
                <span className="text-2xl">💡</span>
                <p className="text-brand-navy text-sm font-600 leading-snug">
                  Kabar baiknya — semua hambatan ini <span className="text-brand-orange">bisa diatasi</span> dengan metode yang tepat.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right — problem cards */}
          <div className="lg:col-span-8 space-y-4">
            {problems.map((p, i) => (
              <Reveal key={p.tag} delay={0.1 * i}>
                <div className="group card p-6 flex items-start gap-5">
                  <div className="font-display font-800 text-4xl leading-none text-brand-navy/6 w-10 flex-shrink-0 select-none">
                    {p.tag}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{p.icon}</span>
                      <h3 className="font-display font-700 text-brand-navy text-lg">{p.title}</h3>
                    </div>
                    <p className="text-brand-charcoal/60 text-[0.9375rem] leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
