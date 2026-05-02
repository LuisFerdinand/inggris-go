import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono, Geist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
      <body className={`font-body h-full antialiased`}>
        <TooltipProvider delayDuration={0}>
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
        </TooltipProvider>
      </body>
    </html>
  );
}
