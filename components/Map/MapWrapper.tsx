"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl overflow-hidden bg-white/5 animate-pulse flex items-center justify-center"
      style={{ minHeight: 220 }}
    >
      <div className="flex flex-col items-center gap-2 text-white/20">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span className="text-xs font-medium">Memuat peta…</span>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <Map />;
}
