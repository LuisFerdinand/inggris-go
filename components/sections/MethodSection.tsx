import Reveal from "@/components/ui/Reveal";

const steps = [
  {
    num: "01",
    title: "Understand",
    desc: "Pahami kalimat sederhana, struktur dasar, dan pola percakapan sehari-hari bahasa Inggris.",
    icon: "👁",
    bg: "bg-brand-orange-light",
    border: "border-brand-orange/20",
    accent: "bg-orange-gradient",
  },
  {
    num: "02",
    title: "Imitate",
    desc: "Tirukan cara bicara tutor berpengalaman. Dengar, ulangi, resapi intonasi dan ritme yang benar.",
    icon: "📋",
    bg: "bg-brand-teal-light",
    border: "border-brand-teal/20",
    accent: "bg-teal-gradient",
  },
  {
    num: "03",
    title: "Practice",
    desc: "Latihan speaking rutin dengan feedback langsung dari tutor. Challenge mingguan untuk konsistensi.",
    icon: "🎯",
    bg: "bg-blue-50",
    border: "border-brand-navy/10",
    accent: "bg-navy-gradient",
  },
  {
    num: "04",
    title: "Speak",
    desc: "Gunakan bahasa Inggris dengan percaya diri di situasi nyata. No fear, just speak!",
    icon: "🗣️",
    bg: "bg-brand-orange-light",
    border: "border-brand-orange/20",
    accent: "bg-orange-gradient",
  },
];

export default function MethodSection() {
  return (
    <section className="py-20 lg:py-32 bg-warm-gradient">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
          <Reveal>
            <span className="section-eyebrow text-brand-orange mb-4 block">Metode Kami</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-display-md text-brand-navy mb-5">
              4 Langkah Jadi Berani <span className="text-orange-gradient">Speaking</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-brand-charcoal/60 text-lg leading-relaxed">
              Metode terstruktur yang telah membantu 500+ siswa dari nol hingga percaya diri berbicara bahasa Inggris.
            </p>
          </Reveal>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={0.1 * i}>
              <div className={`relative rounded-3xl p-7 border ${s.bg} ${s.border} h-full overflow-hidden group hover:shadow-card transition-all duration-300`}>
                {/* Big number bg */}
                <span className="step-number">{s.num}</span>

                {/* Icon badge */}
                <div className={`w-12 h-12 rounded-2xl ${s.accent} flex items-center justify-center text-xl mb-5 relative z-10 shadow-sm group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>

                {/* Content */}
                <h3 className="font-display font-700 text-brand-navy text-xl mb-3 relative z-10">{s.title}</h3>
                <p className="text-brand-charcoal/60 text-sm leading-relaxed relative z-10">{s.desc}</p>

                {/* Step indicator */}
                <div className="absolute top-6 right-6 font-mono text-xs font-500 text-brand-charcoal/25 tracking-widest">
                  {s.num}/04
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Connector line — desktop only */}
        <div className="hidden lg:flex items-center justify-center mt-6 gap-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex-1 h-px bg-brand-orange/20" />
              {i < steps.length - 1 && (
                <svg className="w-4 h-4 text-brand-orange/40 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 17l5-5-5-5v10z" />
                </svg>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
