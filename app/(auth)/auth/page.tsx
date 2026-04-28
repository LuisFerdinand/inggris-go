import { AuthPageShell } from "@/components/AuthPageShell";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Masuk atau Daftar — Inggris Go",
  description:
    "Masuk ke akun Inggris Go atau buat akun gratis dan mulai belajar bahasa Inggris.",
};

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageShell />
    </Suspense>
  );
}
