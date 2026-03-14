import Link from "next/link";
import { siteConfig, navLinks, buildWhatsAppUrl } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      {/* Top band */}
      <div className="border-b border-white/8 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Brand column */}
            <div className="lg:col-span-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 mb-5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <span className="font-display font-700 text-xl tracking-tight">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="text-white/55 text-[0.9375rem] leading-relaxed max-w-sm mb-6">
                {siteConfig.tagline}. Program speaking untuk pemula dari Kampung
                Inggris Pare — belajar dengan cara yang sederhana, praktis, dan
                menyenangkan.
              </p>
              <div className="flex items-center gap-1.5 text-white/40 text-sm">
                <svg
                  className="w-4 h-4 text-brand-orange flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{siteConfig.location}</span>
              </div>
            </div>

            {/* Links columns */}
            <div className="lg:col-span-3">
              <p className="section-eyebrow text-white/30 mb-5">Program</p>
              <ul className="space-y-3">
                {navLinks.slice(1).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/55 hover:text-white transition-colors text-[0.9375rem]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <p className="section-eyebrow text-white/30 mb-5">Kontak</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href={buildWhatsAppUrl("Konsultasi")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/55 hover:text-white transition-colors text-[0.9375rem] inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Admin
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-white/55 hover:text-white transition-colors text-[0.9375rem] inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-brand-orange flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/55 hover:text-white transition-colors text-[0.9375rem] inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-brand-orange flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Form Pertanyaan
                  </Link>
                </li>
              </ul>

              {/* Social */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/14 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4 h-4 text-white/60"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom band */}
      <div className="py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-white/20 text-sm">
            Kampung Inggris Pare, Kediri, Jawa Timur, Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
