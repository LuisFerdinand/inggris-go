"use client";

import { BRAND } from "@/constants/brand";
import { Download, Maximize2, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const ORG_IMAGE_SRC = "/org-structure.png";
const ease = [0.22, 1, 0.36, 1] as const;

function Lightbox({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          style={{
            background: "rgba(15,35,64,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.button
            className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-colors"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "white",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            onClick={onClose}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.12)";
            }}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </motion.button>

          <motion.div
            className="relative max-w-6xl w-full overflow-auto rounded-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "calc(100vh - 64px)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
              background: "#FFF8F3",
            }}
          >
            <Image
              src={ORG_IMAGE_SRC}
              alt="Struktur Organisasi Inggris Go — full view"
              width={1200}
              height={800}
              className="w-full h-auto block"
              priority
            />
          </motion.div>

          <motion.p
            className="absolute bottom-5 left-1/2 -translate-x-1/2"
            style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Klik di luar gambar atau tekan Esc untuk menutup
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OrgChart() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: BRAND.orange, opacity: 0.5 }}
            />
            <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
              Struktur organisasi per 2025
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-2 font-display font-semibold rounded-xl px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                fontSize: "0.8125rem",
                background: "rgba(255,107,53,0.07)",
                color: BRAND.orange,
                border: "1.5px solid rgba(255,107,53,0.2)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,107,53,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,107,53,0.07)";
              }}
              aria-label="Perbesar gambar"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>

            <a
              href={ORG_IMAGE_SRC}
              download="inggris-go-struktur-organisasi.png"
              className="inline-flex items-center gap-2 font-display font-semibold rounded-xl px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontSize: "0.8125rem",
                background: "white",
                color: BRAND.navy,
                border: "1.5px solid rgba(15,35,64,0.14)",
                boxShadow: "0 2px 12px rgba(15,35,64,0.08)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  BRAND.orange;
                (e.currentTarget as HTMLAnchorElement).style.color =
                  BRAND.orange;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(15,35,64,0.14)";
                (e.currentTarget as HTMLAnchorElement).style.color = BRAND.navy;
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>

        <div
          className="rounded-3xl overflow-hidden relative cursor-zoom-in"
          style={{
            border: `1.5px solid ${hovered ? "rgba(255,107,53,0.22)" : "rgba(255,107,53,0.1)"}`,
            boxShadow: hovered
              ? "0 12px 40px rgba(15,35,64,0.1)"
              : "0 4px 24px rgba(15,35,64,0.07)",
            background: "#FFF8F3",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setLightboxOpen(true)}
        >
          <div
            className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 pointer-events-none"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full font-display font-semibold"
              style={{
                background: "rgba(15,35,64,0.75)",
                backdropFilter: "blur(6px)",
                color: "white",
                fontSize: "0.8125rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <ZoomIn className="w-4 h-4" />
              Klik untuk perbesar
            </div>
          </div>

          <div className="">
            <Image
              src={ORG_IMAGE_SRC}
              alt="Struktur Organisasi Inggris Go"
              width={1200}
              height={800}
              className="block"
              style={{
                width: "100%",
                minWidth: "640px",
                height: "auto",
                transition: "transform 0.3s ease",
                transform: hovered ? "scale(1.01)" : "scale(1)",
                transformOrigin: "center center",
              }}
              priority
            />
          </div>
        </div>

        <p
          className="text-center mt-3 sm:hidden"
          style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
        >
          Geser ke kanan untuk melihat seluruh struktur · Ketuk untuk perbesar
        </p>

        <p
          className="text-center mt-3 hidden sm:block"
          style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
        >
          Klik gambar untuk melihat lebih detail
        </p>
      </div>

      <Lightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </>
  );
}
