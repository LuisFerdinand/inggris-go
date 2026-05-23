import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono, Geist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
        <TRPCProvider>
          <NuqsAdapter>
            <TooltipProvider delayDuration={0}>
              <main>
                {children}

                <Toaster
                  position="bottom-right"
                  gutter={10}
                  toastOptions={{
                    duration: 4000,
                    style: {
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      padding: "14px 16px",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.06)",
                    },

                    success: {
                      iconTheme: {
                        primary: "#1a52c8",
                        secondary: "#ffffff",
                      },
                      style: {
                        background: "#f8fbff",
                        color: "#163b8f",
                        border: "1px solid #d7e5ff",
                      },
                    },

                    error: {
                      iconTheme: {
                        primary: "#dc2626",
                        secondary: "#ffffff",
                      },
                      style: {
                        background: "#fff7f7",
                        color: "#991b1b",
                        border: "1px solid #ffd5d5",
                      },
                    },

                    loading: {
                      iconTheme: {
                        primary: "#1a52c8",
                        secondary: "#ffffff",
                      },
                      style: {
                        background: "#ffffff",
                        color: "#334155",
                        border: "1px solid #e2e8f0",
                      },
                    },
                  }}
                />
              </main>
            </TooltipProvider>
          </NuqsAdapter>
        </TRPCProvider>
      </body>
    </html>
  );
}
