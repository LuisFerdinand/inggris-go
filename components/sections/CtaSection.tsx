import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import WAButton from "@/components/ui/WAButton";

export default function CtaSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-orange-gradient px-8 py-16 lg:px-20 lg:py-20 text-center grain-overlay">

            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/8 pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white/6 pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              <span className="pill pill-white mb-6 inline-flex">
                🚀 Mulai Perjalanan Bahasa Inggrismu Sekarang!
              </span>

              <h2 className="font-display text-display-lg text-white mb-5 max-w-2xl mx-auto">
                Siap Berani Bicara Bahasa Inggris?
              </h2>

              <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Jangan biarkan rasa takut menghalangi impianmu. Bergabunglah dengan 500+ siswa yang sudah membuktikannya.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/speaking-challenge"
                  className="inline-flex items-center gap-2 bg-white text-brand-orange font-display font-700 px-8 py-4 rounded-full hover:bg-brand-cream transition-all hover:-translate-y-1 hover:shadow-float text-base"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Join Speaking Challenge
                </Link>
                <WAButton
                  program="Konsultasi Program"
                  label="Hubungi Admin"
                  variant="ghost-white"
                  size="lg"
                />
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Tanpa syarat khusus
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Cocok untuk pemula absolut
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Respon admin cepat
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
