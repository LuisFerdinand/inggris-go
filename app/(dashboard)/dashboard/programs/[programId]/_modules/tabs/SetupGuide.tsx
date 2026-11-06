// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/SetupGuide.tsx
"use client";

import { ArrowRight, Check, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  key: string;
  title: string;
  hint: string;
  done: boolean;
  action?: { label: string; onClick: () => void };
};

type Props = {
  isScheduled: boolean;
  isPublished: boolean;
  batchCount: number;
  batchesWithoutPackages: number;
  directPackageCount: number;
  onCreateBatch: () => void;
  onCreatePackage: (batchId?: string | null) => void;
  firstBatchWithoutPackageId?: string | null;
};

/**
 * Beginner-friendly checklist shown at the top of the Commerce tab.
 * It tells a new admin exactly what is still missing before the program
 * can take registrations, and offers a button for the next step.
 */
export function SetupGuide({
  isScheduled,
  isPublished,
  batchCount,
  batchesWithoutPackages,
  directPackageCount,
  onCreateBatch,
  onCreatePackage,
  firstBatchWithoutPackageId,
}: Props) {
  const steps: Step[] = [];

  if (isScheduled) {
    steps.push({
      key: "batch",
      title: "Buat batch pertama",
      hint: "Batch adalah gelombang kelas dengan tanggal mulai, kapasitas, dan lokasi sendiri.",
      done: batchCount > 0,
      action: { label: "Buat Batch", onClick: onCreateBatch },
    });
    steps.push({
      key: "package",
      title: "Tambahkan paket harga di setiap batch",
      hint:
        batchCount > 0 && batchesWithoutPackages > 0
          ? `${batchesWithoutPackages} batch belum punya paket. Tanpa paket, peserta tidak bisa memilih harga.`
          : "Paket adalah pilihan harga yang bisa dibeli peserta, mis. Reguler dan Premium.",
      done: batchCount > 0 && batchesWithoutPackages === 0,
      action:
        batchCount > 0
          ? {
              label: "Buat Paket",
              onClick: () => onCreatePackage(firstBatchWithoutPackageId ?? null),
            }
          : undefined,
    });
  } else {
    steps.push({
      key: "package",
      title: "Buat paket harga pertama",
      hint: "Paket adalah pilihan harga yang bisa dibeli peserta, mis. Reguler dan Premium. Harga Rp 0 akan tampil sebagai “Hubungi Admin”.",
      done: directPackageCount > 0,
      action: { label: "Buat Paket", onClick: () => onCreatePackage(null) },
    });
  }

  steps.push({
    key: "publish",
    title: "Terbitkan program",
    hint: "Ubah status program menjadi Published agar tampil di website. Cara pendaftaran bisa diatur di kartu di bawah.",
    done: isPublished,
  });

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-blue-100 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 shadow-sm">
            <Rocket className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold tracking-tight text-neutral-800">
              Panduan Setup
            </h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">
              Ikuti langkah berikut supaya program siap menerima pendaftar.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
          {doneCount}/{steps.length}
        </span>
      </div>

      <ol className="flex flex-col gap-1 p-3">
        {steps.map((step, i) => {
          const isNext = i === nextIndex;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-start gap-3 rounded-xl px-3 py-2.5",
                isNext && "bg-white shadow-sm ring-1 ring-blue-100",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold",
                  step.done
                    ? "bg-emerald-500 text-white"
                    : isNext
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-200 text-neutral-500",
                )}
              >
                {step.done ? <Check className="size-3" /> : i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[12.5px] font-semibold",
                    step.done
                      ? "text-neutral-400 line-through"
                      : "text-neutral-800",
                  )}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-neutral-500">
                    {step.hint}
                  </p>
                )}
              </div>

              {isNext && step.action && (
                <Button
                  type="button"
                  size="sm"
                  onClick={step.action.onClick}
                  className="shrink-0"
                >
                  {step.action.label}
                  <ArrowRight className="ml-1 size-3.5" />
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
