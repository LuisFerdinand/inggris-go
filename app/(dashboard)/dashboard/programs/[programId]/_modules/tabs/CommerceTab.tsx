// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/CommerceTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Info,
  Layers,
  Loader2,
  Package,
  Plus,
  Repeat,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { BatchForm } from "../ui/components/Batch/BatchForm";
import { PackageForm } from "../ui/components/Package/PackageForm";
import {
  DetailData,
  InfoNotice,
  MetaPill,
  ReadField,
  SectionCard,
} from "./detail";

type DrawerState =
  | { kind: "batch"; mode: "create"; id?: never }
  | { kind: "batch"; mode: "edit"; id: string }
  | { kind: "package"; mode: "create"; batchId?: string | null; id?: never }
  | { kind: "package"; mode: "edit"; id: string; batchId?: string | null }
  | null;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function noop() {}

function formatIDR(value: number | null | undefined) {
  if (value == null) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Belum diatur";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function DetailButton({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "outline" | "danger";
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant === "primary" ? "default" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-7 rounded-lg px-2.5 text-[11px] font-semibold gap-1.5",
        variant === "primary" && "bg-neutral-900 text-white hover:bg-neutral-800",
        variant === "outline" &&
          "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
        variant === "danger" &&
          "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </Button>
  );
}

function Drawer({
  open,
  title,
  description,
  icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Tutup drawer"
            className="fixed inset-0 z-40 bg-[rgba(6,15,46,0.40)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/40 px-6 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13px] font-bold tracking-tight text-neutral-800">
                    {title}
                  </h2>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-400">
                    {description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 shadow-sm transition hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 shadow-sm">
        {icon}
      </div>
      <p className="text-[13px] font-bold text-neutral-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-neutral-400">
        {description}
      </p>
      <div className="mt-4">{action}</div>
    </div>
  );
}

function StatGrid({
  data,
  isScheduled,
  totalPackages,
  totalBatches,
}: {
  data: DetailData;
  isScheduled: boolean;
  totalPackages: number;
  totalBatches: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <ReadField label="Harga Mulai">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CircleDollarSign className="size-4" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-neutral-800">
              {formatIDR(data.startingPrice)}
            </p>
            {data.startingOriginalPrice &&
              data.startingPrice &&
              data.startingOriginalPrice > data.startingPrice && (
                <p className="text-[11px] text-neutral-300 line-through">
                  {formatIDR(data.startingOriginalPrice)}
                </p>
              )}
          </div>
        </div>
      </ReadField>

      <ReadField label="Total Paket">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            <Package className="size-4" />
          </div>
          <span className="text-[13px] font-bold text-neutral-800">
            {totalPackages} paket
          </span>
        </div>
      </ReadField>

      <ReadField label={isScheduled ? "Total Batch" : "Tipe Setup"}>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            {isScheduled ? (
              <Layers className="size-4" />
            ) : (
              <Repeat className="size-4" />
            )}
          </div>
          <span className="text-[13px] font-bold text-neutral-800">
            {isScheduled ? `${totalBatches} batch` : "Direct package"}
          </span>
        </div>
      </ReadField>
    </div>
  );
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  deleting,
}: {
  pkg: any;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:bg-neutral-50/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[13px] font-bold text-neutral-800">
              {pkg.title}
            </h4>
            {pkg.isDefault && (
              <MetaPill className="border-amber-200 bg-amber-50 text-amber-700">
                <CheckCircle2 className="size-3" />
                Default
              </MetaPill>
            )}
          </div>

          {pkg.description ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-neutral-400">
              {pkg.description}
            </p>
          ) : (
            <p className="mt-1 text-[12px] italic text-neutral-300">
              Belum ada deskripsi
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white hover:text-neutral-700 hover:shadow-sm"
          >
            <Edit3 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReadField label="Harga">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-neutral-800">
              {formatIDR(pkg.price)}
            </span>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <span className="text-[11px] text-neutral-300 line-through">
                {formatIDR(pkg.originalPrice)}
              </span>
            )}
          </div>
        </ReadField>

        <ReadField label="Fitur">
          <span className="text-neutral-800">
            {pkg.features?.length ?? 0} fitur
          </span>
        </ReadField>
      </div>
    </div>
  );
}

function BatchCard({
  batch,
  onEditBatch,
  onDeleteBatch,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  deletingBatch,
  deletingPackage,
}: {
  batch: any;
  onEditBatch: () => void;
  onDeleteBatch: () => void;
  onAddPackage: () => void;
  onEditPackage: (pkg: any) => void;
  onDeletePackage: (pkg: any) => void;
  deletingBatch?: boolean;
  deletingPackage?: boolean;
}) {
  const capacity = batch.capacity
    ? `${batch.enrolledCount}/${batch.capacity}`
    : `${batch.enrolledCount ?? 0}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-neutral-50/40 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-bold text-neutral-800">
                {batch.title}
              </h3>
              <MetaPill>
                <span className="size-1.5 rounded-full bg-neutral-400" />
                {batch.status}
              </MetaPill>
            </div>

            {batch.description ? (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-neutral-400">
                {batch.description}
              </p>
            ) : (
              <p className="mt-1 text-[12px] italic text-neutral-300">
                Belum ada deskripsi batch
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <DetailButton variant="outline" onClick={onEditBatch}>
              <Edit3 className="size-3" />
              Edit
            </DetailButton>
            <DetailButton variant="outline" onClick={onAddPackage}>
              <Plus className="size-3" />
              Paket
            </DetailButton>
            <DetailButton
              variant="danger"
              onClick={onDeleteBatch}
              disabled={deletingBatch}
            >
              {deletingBatch ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
            </DetailButton>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ReadField label="Tanggal">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-neutral-400" />
              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
            </span>
          </ReadField>
          <ReadField label="Peserta">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-neutral-400" />
              {capacity}
            </span>
          </ReadField>
          <ReadField label="Mode">
            <span className="capitalize">{batch.mode}</span>
          </ReadField>
        </div>
      </div>

      <div className="p-5">
        {batch.packages?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {batch.packages.map((pkg: any) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                deleting={deletingPackage}
                onEdit={() => onEditPackage(pkg)}
                onDelete={() => onDeletePackage(pkg)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="size-4" />}
            title="Belum ada paket di batch ini"
            description="Tambahkan paket harga agar peserta bisa mendaftar ke batch ini."
            action={
              <DetailButton onClick={onAddPackage}>
                <Plus className="size-3" />
                Tambah Paket
              </DetailButton>
            }
          />
        )}
      </div>
    </div>
  );
}

export default function CommerceTab({ programId }: { programId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const utils = trpc.useUtils();

  const detailQuery = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );
  const batchesQuery = trpc.batches.listByProgram.useQuery({ programId });
  const packagesQuery = trpc.packages.listByProgram.useQuery({ programId });

  const removeBatch = trpc.batches.remove.useMutation({
    onSuccess: () => {
      utils.batches.listByProgram.invalidate({ programId });
      utils.packages.listByProgram.invalidate({ programId });
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Batch dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus batch"),
  });

  const removePackage = trpc.packages.remove.useMutation({
    onSuccess: () => {
      utils.packages.listByProgram.invalidate({ programId });
      utils.batches.listByProgram.invalidate({ programId });
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Paket dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus paket"),
  });

  const data = detailQuery.data as DetailData | undefined;
  const isScheduled = data?.scheduleType === "scheduled";
  const isLoading =
    detailQuery.isLoading || batchesQuery.isLoading || packagesQuery.isLoading;

  const directPackages = useMemo(
    () => (packagesQuery.data ?? []).filter((pkg: any) => !pkg.batchId),
    [packagesQuery.data],
  );

  function closeDrawer() {
    setDrawer(null);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("drawer");
    next.delete("batchId");
    next.delete("packageId");

    const qs = next.toString();
    router.replace(`/dashboard/programs/${programId}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }

  useEffect(() => {
    const drawerParam = searchParams.get("drawer");
    const batchId = searchParams.get("batchId");
    const packageId = searchParams.get("packageId");

    if (!drawerParam) return;

    setDrawer((current) => {
      if (drawerParam === "batch-new") {
        if (current?.kind === "batch" && current.mode === "create") {
          return current;
        }
        return { kind: "batch", mode: "create" };
      }

      if (drawerParam === "batch-edit" && batchId) {
        if (
          current?.kind === "batch" &&
          current.mode === "edit" &&
          current.id === batchId
        ) {
          return current;
        }
        return { kind: "batch", mode: "edit", id: batchId };
      }

      if (drawerParam === "package-new") {
        const nextBatchId = batchId ?? null;
        if (
          current?.kind === "package" &&
          current.mode === "create" &&
          current.batchId === nextBatchId
        ) {
          return current;
        }
        return { kind: "package", mode: "create", batchId: nextBatchId };
      }

      if (drawerParam === "package-edit" && packageId) {
        const nextBatchId = batchId ?? null;
        if (
          current?.kind === "package" &&
          current.mode === "edit" &&
          current.id === packageId &&
          current.batchId === nextBatchId
        ) {
          return current;
        }
        return {
          kind: "package",
          mode: "edit",
          id: packageId,
          batchId: nextBatchId,
        };
      }

      return current;
    });
  }, [searchParams]);

  const drawerTitle =
    drawer?.kind === "batch"
      ? drawer.mode === "create"
        ? "Batch Baru"
        : "Edit Batch"
      : drawer?.kind === "package"
        ? drawer.mode === "create"
          ? "Paket Baru"
          : "Edit Paket"
        : "";

  const drawerDescription =
    drawer?.kind === "batch"
      ? "Atur cohort, jadwal, kapasitas, dan lokasi program."
      : "Atur harga, fitur, dan opsi pendaftaran yang bisa dibeli peserta.";

  const drawerIcon =
    drawer?.kind === "batch" ? (
      <Layers className="size-4" />
    ) : (
      <Package className="size-4" />
    );

  if (isLoading && !data) {
    return (
      <div className="flex max-w-4xl items-center justify-center rounded-2xl border border-neutral-200 bg-white py-24 text-neutral-400 shadow-sm">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex max-w-4xl flex-col gap-4"
    >
      <motion.div variants={itemVariants}>
        <SectionCard
          icon={<Package className="size-4" />}
          title="Batch & Paket"
          description={
            isScheduled
              ? "Kelola cohort, jadwal, kapasitas, dan paket harga dalam satu tempat."
              : "Kelola opsi harga langsung tanpa batch karena program berjalan permanen."
          }
          readOnly
          isEditing={false}
          onEdit={noop}
          onSave={noop}
          onCancel={noop}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <MetaPill>
                  {isScheduled ? (
                    <CalendarClock className="size-3" />
                  ) : (
                    <Repeat className="size-3" />
                  )}
                  {isScheduled ? "Scheduled Program" : "Permanent Program"}
                </MetaPill>

                {data.hasPackages ? (
                  <MetaPill className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="size-3" />
                    Paket tersedia
                  </MetaPill>
                ) : (
                  <MetaPill className="border-amber-200 bg-amber-50 text-amber-700">
                    <Info className="size-3" />
                    Belum ada paket
                  </MetaPill>
                )}
              </div>

              <DetailButton
                onClick={() =>
                  isScheduled
                    ? setDrawer({ kind: "batch", mode: "create" })
                    : setDrawer({
                        kind: "package",
                        mode: "create",
                        batchId: null,
                      })
                }
              >
                <Plus className="size-3" />
                {isScheduled ? "Batch Baru" : "Paket Baru"}
              </DetailButton>
            </div>

            <StatGrid
              data={data}
              isScheduled={isScheduled}
              totalPackages={packagesQuery.data?.length ?? 0}
              totalBatches={batchesQuery.data?.length ?? 0}
            />

            <InfoNotice icon={<Info className="size-3.5" />}>
              Data order/enrollment mengambil snapshot program, batch, dan
              package saat transaksi dibuat. Perubahan harga atau judul ke
              depannya tidak merusak riwayat transaksi lama.
            </InfoNotice>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SectionCard
          icon={
            isScheduled ? (
              <Layers className="size-4" />
            ) : (
              <Package className="size-4" />
            )
          }
          title={isScheduled ? "Daftar Batch" : "Daftar Paket"}
          description={
            isScheduled
              ? "Setiap batch bisa memiliki paket harga sendiri."
              : "Paket langsung berada di bawah program ini."
          }
          readOnly
          isEditing={false}
          onEdit={noop}
          onSave={noop}
          onCancel={noop}
        >
          {isScheduled ? (
            batchesQuery.data?.length ? (
              <div className="flex flex-col gap-4">
                {batchesQuery.data.map((batch: any) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    deletingBatch={removeBatch.isPending}
                    deletingPackage={removePackage.isPending}
                    onEditBatch={() =>
                      setDrawer({
                        kind: "batch",
                        mode: "edit",
                        id: batch.id,
                      })
                    }
                    onDeleteBatch={() => {
                      if (
                        window.confirm(
                          "Hapus batch ini? Paket di dalamnya juga akan ikut terhapus.",
                        )
                      ) {
                        removeBatch.mutate({ id: batch.id });
                      }
                    }}
                    onAddPackage={() =>
                      setDrawer({
                        kind: "package",
                        mode: "create",
                        batchId: batch.id,
                      })
                    }
                    onEditPackage={(pkg) =>
                      setDrawer({
                        kind: "package",
                        mode: "edit",
                        id: pkg.id,
                        batchId: batch.id,
                      })
                    }
                    onDeletePackage={(pkg) => {
                      if (window.confirm("Hapus paket ini?")) {
                        removePackage.mutate({ id: pkg.id });
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Layers className="size-4" />}
                title="Belum ada batch"
                description="Untuk scheduled program, peserta memilih batch terlebih dahulu sebelum memilih paket harga."
                action={
                  <DetailButton
                    onClick={() =>
                      setDrawer({ kind: "batch", mode: "create" })
                    }
                  >
                    <Plus className="size-3" />
                    Buat Batch Pertama
                  </DetailButton>
                }
              />
            )
          ) : directPackages.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {directPackages.map((pkg: any) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  deleting={removePackage.isPending}
                  onEdit={() =>
                    setDrawer({
                      kind: "package",
                      mode: "edit",
                      id: pkg.id,
                      batchId: null,
                    })
                  }
                  onDelete={() => {
                    if (window.confirm("Hapus paket ini?")) {
                      removePackage.mutate({ id: pkg.id });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="size-4" />}
              title="Belum ada paket"
              description="Tambahkan minimal satu paket agar program permanent bisa dibeli atau didaftarkan."
              action={
                <DetailButton
                  onClick={() =>
                    setDrawer({
                      kind: "package",
                      mode: "create",
                      batchId: null,
                    })
                  }
                >
                  <Plus className="size-3" />
                  Buat Paket Pertama
                </DetailButton>
              }
            />
          )}
        </SectionCard>
      </motion.div>

      <Drawer
        open={!!drawer}
        title={drawerTitle}
        description={drawerDescription}
        icon={drawerIcon}
        onClose={closeDrawer}
      >
        {drawer?.kind === "batch" && (
          <BatchForm
            mode={drawer.mode}
            programId={programId}
            batchId={drawer.mode === "edit" ? drawer.id : undefined}
            onCancel={closeDrawer}
            onDone={closeDrawer}
          />
        )}

        {drawer?.kind === "package" && (
          <PackageForm
            mode={drawer.mode}
            programId={programId}
            batchId={drawer.batchId ?? null}
            packageId={drawer.mode === "edit" ? drawer.id : undefined}
            onCancel={closeDrawer}
            onDone={closeDrawer}
          />
        )}
      </Drawer>
    </motion.div>
  );
}
