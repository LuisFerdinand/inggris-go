// app/(home)/registrasi/[programSlug]/page.tsx

import Link from "next/link";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { generateTheme } from "@/lib/utils";
import { db } from "@/app/db/db";
import { user as userTable } from "@/app/db/schema/auth-schema";
import { OnlineRegistrationForm } from "@/app/(home)/programs/[categorySlug]/[programSlug]/_components/OnlineRegistrationForm";

type PageProps = {
  params: Promise<{ programSlug: string }>;
  searchParams: Promise<{
    batchId?: string;
    packageId?: string;
  }>;
};

export default async function RegistrationPage({
  params,
  searchParams,
}: PageProps) {
  const { programSlug } = await params;
  const sp = await searchParams;

  const session = await auth();

  const sessionUser = session?.user as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
      }
    | undefined;

  const account = sessionUser?.id
    ? await db.query.user.findFirst({
        where: eq(userTable.id, sessionUser.id),
      })
    : null;

  const theme = generateTheme("#1a52c8");

  return (
    <>
      {/* ── Page header ── */}
      <div
        className="border-b"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}08, transparent)`,
          borderColor: theme.border,
          paddingTop: "calc(var(--navbar-height, 72px) + 2rem)",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-8">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 mb-6"
            aria-label="Breadcrumb"
            style={{ fontSize: "0.8125rem", color: "var(--text-faint)" }}
          >
            <Link
              href="/"
              className="hover:underline transition-colors"
              style={{ color: "var(--text-faint)" }}
            >
              Beranda
            </Link>

            <svg
              viewBox="0 0 12 12"
              className="w-3 h-3 flex-shrink-0"
              fill="none"
            >
              <path
                d="M4.5 2.5l3 3.5-3 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <Link
              href="/programs"
              className="hover:underline transition-colors"
              style={{ color: "var(--text-faint)" }}
            >
              Program
            </Link>

            <svg
              viewBox="0 0 12 12"
              className="w-3 h-3 flex-shrink-0"
              fill="none"
            >
              <path
                d="M4.5 2.5l3 3.5-3 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span style={{ color: "var(--text-muted)" }}>Pendaftaran</span>
          </nav>

          {/* Title block */}
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: theme.primary }}
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                <path
                  d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 9h6M7 12h4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h1
                className="font-display font-extrabold leading-tight"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  color: "var(--blue-navy)",
                  letterSpacing: "-0.025em",
                }}
              >
                Formulir Pendaftaran
              </h1>

              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Lengkapi data di bawah — proses cepat, kurang dari 3 menit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form content ── */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        <OnlineRegistrationForm
          programSlug={programSlug}
          theme={theme}
          initialBatchId={sp.batchId}
          initialPackageId={sp.packageId}
          initialUser={
            account?.id
              ? {
                  id: account.id,
                  name: account.name ?? sessionUser?.name ?? "",
                  email: account.email ?? sessionUser?.email ?? "",
                  phone: account.phone ?? "",
                  age: account.age ?? null,
                }
              : undefined
          }
        />
      </main>
    </>
  );
}