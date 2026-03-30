import Reveal from "@/components/ui/Reveal";
import { BRAND } from "@/constants/brand";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

<section
  className="relative overflow-hidden py-20 lg:py-28"
  style={{
    background: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
  }}
>
  {/* Plus pattern */}
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cline x1='16' y1='10' x2='16' y2='22' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3Cline x1='10' y1='16' x2='22' y2='16' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundSize: "32px 32px",
    }}
  />
  <div className="relative z-10 max-w-2xl mx-auto px-5 text-center">
    <Reveal>
      <h2
        className="font-display font-extrabold text-white mb-4 leading-[1.08]"
        style={{
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          letterSpacing: "-0.022em",
        }}
      >
        Bergabunglah Bersama Kami
      </h2>
    </Reveal>
    <Reveal delay={0.08}>
      <p
        className="mb-8 leading-relaxed"
        style={{
          fontSize: "0.9375rem",
          color: "rgba(255,255,255,0.8)",
          lineHeight: "1.75",
        }}
      >
        Jadilah bagian dari keluarga besar Inggris Go dan mulai perjalanan
        bahasa Inggrismu hari ini.
      </p>
    </Reveal>
    <Reveal delay={0.14}>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/speaking-challenge"
          className="inline-flex items-center gap-2 font-display font-bold rounded-full px-7 py-3.5 text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            fontSize: "0.9375rem",
            background: "white",
            color: BRAND.orange,
            boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
          }}
        >
          Mulai Belajar Sekarang
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 font-display font-bold rounded-full px-7 py-3.5 text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            fontSize: "0.9375rem",
            border: "2px solid rgba(255,255,255,0.5)",
            background: "transparent",
          }}
        >
          Hubungi Kami
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Reveal>
  </div>
</section>;
