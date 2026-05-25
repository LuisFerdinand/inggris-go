"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";
import { ProgramTableSkeleton } from "../components/Table/ProgramTableSkeleton";
import { ProgramsViewSwitcher } from "../components/ProgramsViewSwitcher";

export function ProgramsSection() {
  return (
    <div className="flex w-full px-4 pb-8 items-center justify-start ">
      <Suspense fallback={<ProgramTableSkeleton />}>
        <ErrorBoundary fallback={<ProgramsError />}>
          <ProgramsViewSwitcher />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

function ProgramsError() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
      <AlertCircle className="size-4 text-red-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-red-700">Gagal memuat program</p>
        <p className="text-xs text-red-500 mt-0.5">
          Coba refresh halaman Anda.
        </p>
      </div>
    </div>
  );
}
