"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: "500+", label: "Siswa Bergabung", color: "text-brand-orange" },
  { value: "4.9★", label: "Rating Kepuasan", color: "text-brand-teal" },
  { value: "5+", label: "Tahun Pengalaman", color: "text-brand-navy" },
  { value: "4", label: "Program Pilihan", color: "text-brand-orange" },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="bg-brand-navy py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:px-10"
            >
              <p className={`font-display font-800 text-4xl lg:text-5xl mb-1.5 ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-white/45 text-sm font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
