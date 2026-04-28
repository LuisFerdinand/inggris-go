import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import { Toaster } from "react-hot-toast";
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",
  description:
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare. Mulai berbicara bahasa Inggris dengan percaya diri bersama Inggris Go.",
  keywords:
    "belajar bahasa inggris, kampung inggris pare, english course, speaking english, english camp",
  openGraph: {
    title: "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",
    description:
      "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={cn("h-full", "font-sans", geist.variable)}>
      <body
        className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} font-body h-full antialiased`}
      >
        <Navbar />
        <main>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0f172a",
                color: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#0f172a",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#0f172a",
                },
              },
            }}
          />
        </main>
        <Footer />
      </body>
    </html>
  );
}
