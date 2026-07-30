// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/CommercePreviewSection.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Eye,
  Archive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Package,
  ArrowRight,
  DollarSign,
  Tag,
  Info,
  TrendingDown,
  CalendarDays,
  RefreshCw,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  DetailData,
  FieldWrap,
  formatDateShort,
  inputCls,
  InfoNotice,
  ReadField,
  SectionCard,
  StickySaveBar,
} from ".";
import { PROGRAM_STATUS, PROGRAM_STATUS_META } from "@/lib/enums/enums";
import { getToneStyle } from "@/lib/ui/ui.helpers";

/* ═══════════════════════════════════════════════════════════════
   SCHEMA
═══════════════════════════════════════════════════════════════ */

const publishSchema = z.object({
  status: z.enum(PROGRAM_STATUS),
});
type PublishFormValues = z.infer<typeof publishSchema>;

/* ═══════════════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  draft: {
    icon: Clock,
    label: "Draft",
    desc: "Tidak terlihat oleh publik",
    pill: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-400",
    card: {
      idle: "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50/60",
      active: "border-amber-300 bg-amber-50 text-amber-800",
      check: "text-amber-500",
      iconOn: "text-amber-500",
      iconOff: "text-neutral-400",
    },
  },
  published: {
    icon: Eye,
    label: "Published",
    desc: "Terlihat dan aktif di katalog",
    pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
    card: {
      idle: "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50/60",
      active: "border-emerald-300 bg-emerald-50 text-emerald-800",
      check: "text-emerald-500",
      iconOn: "text-emerald-500",
      iconOff: "text-neutral-400",
    },
  },
  archived: {
    icon: Archive,
    label: "Archived",
    desc: "Disembunyikan dari katalog",
    pill: "bg-neutral-100 border-neutral-300 text-neutral-600",
    dot: "bg-neutral-400",
    card: {
      idle: "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50/60",
      active: "border-neutral-300 bg-neutral-100 text-neutral-700",
      check: "text-neutral-500",
      iconOn: "text-neutral-500",
      iconOff: "text-neutral-400",
    },
  },
} as const;

type ProgramStatus = keyof typeof STATUS_CONFIG;

/* ═══════════════════════════════════════════════════════════════
   STATUS CARD  (edit mode selector)
═══════════════════════════════════════════════════════════════ */

function StatusCard({
  status,
  selected,
  onSelect,
}: {
  status: ProgramStatus;
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const cardCls = selected ? cfg.card.active : cfg.card.idle;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-[1.5px] transition-all duration-150 text-left",
        cardCls,
      )}
    >
      {/* Status dot */}
      <div
        className={cn(
          "size-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          selected ? "bg-white/70 shadow-sm" : "bg-neutral-100",
        )}
      >
        <Icon
          className={cn(
            "size-4",
            selected ? cfg.card.iconOn : cfg.card.iconOff,
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold leading-tight">{cfg.label}</p>
        <p className="text-[11px] opacity-60 mt-0.5 leading-snug">{cfg.desc}</p>
      </div>

      {/* Selected checkmark with spring animation */}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <CheckCircle2
              className={cn("size-4 flex-shrink-0", cfg.card.check)}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS PILL  (read mode)
═══════════════════════════════════════════════════════════════ */

function StatusPill({ status }: { status: ProgramStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-bold",
        cfg.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIMELINE ROW  (read mode)
═══════════════════════════════════════════════════════════════ */

function TimelineRow({
  label,
  date,
  icon: Icon,
}: {
  label: string;
  date: string | Date | null | undefined;
  icon: React.ElementType;
}) {
  if (!date) return null;
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
        <Icon className="size-3.5 text-neutral-400" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </p>
        <p className="text-[12px] font-semibold text-neutral-700">
          {formatDateShort(date)}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PUBLISHING — READ MODE
═══════════════════════════════════════════════════════════════ */

function PublishingReadMode({ data }: { data: DetailData }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Status row */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-neutral-500 font-medium">
          Status saat ini:
        </span>
        <StatusPill status={data.status as ProgramStatus} />
      </div>

      {/* Timeline */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <TimelineRow label="Dibuat" date={data.createdAt} icon={CalendarDays} />
        <TimelineRow
          label="Dipublikasikan"
          date={data.publishedAt}
          icon={Globe}
        />
        <TimelineRow
          label="Terakhir diubah"
          date={data.updatedAt}
          icon={RefreshCw}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PUBLISHING — EDIT MODE
═══════════════════════════════════════════════════════════════ */

function PublishingEditMode({
  form,
}: {
  form: ReturnType<typeof useForm<PublishFormValues>>;
}) {
  const { control, watch } = form;
  const currentStatus = watch("status") as ProgramStatus;

  return (
    <div className="flex flex-col gap-4">
      <FieldWrap label="Status Publikasi" required>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {(Object.keys(STATUS_CONFIG) as ProgramStatus[]).map((s) => (
                <StatusCard
                  key={s}
                  status={s}
                  selected={field.value === s}
                  onSelect={() => field.onChange(s)}
                />
              ))}
            </div>
          )}
        />
      </FieldWrap>

      {/* Contextual notices keyed to current selection */}
      <AnimatePresence mode="wait">
        {currentStatus === "published" && (
          <motion.div
            key="published-notice"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <InfoNotice icon={<Send className="size-3.5" />} variant="success">
              Program akan langsung terlihat oleh publik setelah disimpan.
            </InfoNotice>
          </motion.div>
        )}
        {currentStatus === "archived" && (
          <motion.div
            key="archived-notice"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <InfoNotice
              icon={<AlertTriangle className="size-3.5" />}
              variant="warn"
            >
              Program yang diarsipkan tidak bisa diakses oleh peserta baru.
            </InfoNotice>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PUBLISHING SECTION — ROOT
═══════════════════════════════════════════════════════════════ */

interface PublishingSectionProps {
  data: DetailData;
  programId: string;
}

export function PublishingSection({ data, programId }: PublishingSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const updateStatus = trpc.programs.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
      ]);

      toast.success("Status program berhasil diperbarui");
      setIsEditing(false);
      form.reset(form.getValues());
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal memperbarui status");
    },
  });

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: { status: data.status },
  });

  const { isDirty, isSubmitting } = form.formState;
  const isPending = isSubmitting || updateStatus.isPending;

  async function onSubmit(values: PublishFormValues) {
    await updateStatus.mutateAsync({ id: programId, status: values.status });
  }

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <>
      <SectionCard
        icon={<Globe className="size-4" />}
        title="Publishing"
        description="Status visibilitas dan lifecycle program."
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isPending}
        onEdit={() => setIsEditing(true)}
        onSave={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <PublishingEditMode form={form} />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <PublishingReadMode data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <AnimatePresence>
        {isEditing && (
          <StickySaveBar
            isDirty={isDirty}
            isSubmitting={isPending}
            sectionTitle="Publishing"
            onCancel={handleCancel}
            onSave={form.handleSubmit(onSubmit)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUDGET (ANGGARAN) — internal, editable
═══════════════════════════════════════════════════════════════ */

const budgetSchema = z.object({
  budget: z
    .union([z.coerce.number().int().nonnegative(), z.literal("")])
    .optional(),
});
type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetSectionProps {
  data: DetailData;
  programId: string;
}

function BudgetReadMode({ budget }: { budget: number | null }) {
  return (
    <ReadField label="Anggaran Program" empty={budget == null}>
      {budget != null ? formatIDR(budget) : null}
    </ReadField>
  );
}

function BudgetEditMode({
  form,
}: {
  form: ReturnType<typeof useForm<BudgetFormValues>>;
}) {
  const { register, formState } = form;

  return (
    <FieldWrap
      label="Anggaran Program (Rp)"
      hint="Alokasi anggaran internal untuk menjalankan program ini — tidak ditampilkan ke pelanggan."
      error={formState.errors.budget?.message}
    >
      <input
        type="number"
        min={0}
        placeholder="0"
        {...register("budget")}
        className={inputCls}
      />
    </FieldWrap>
  );
}

export function BudgetSection({ data, programId }: BudgetSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { budget: data.budget ?? "" },
  });

  const updateBudget = trpc.programs.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
      ]);

      toast.success("Anggaran program berhasil disimpan");
      setIsEditing(false);
      form.reset(form.getValues());
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menyimpan anggaran");
    },
  });

  const { isDirty, isSubmitting } = form.formState;
  const isPending = isSubmitting || updateBudget.isPending;

  async function onSubmit(values: BudgetFormValues) {
    await updateBudget.mutateAsync({
      id: programId,
      budget: values.budget === "" ? null : values.budget,
    });
  }

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <>
      <SectionCard
        icon={<Wallet className="size-4" />}
        title="Anggaran Program"
        description="Alokasi anggaran internal untuk menjalankan program ini."
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isPending}
        onEdit={() => setIsEditing(true)}
        onSave={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
      >
        {isEditing ? (
          <BudgetEditMode form={form} />
        ) : (
          <BudgetReadMode budget={data.budget} />
        )}
      </SectionCard>

      <AnimatePresence>
        {isEditing && (
          <StickySaveBar
            isDirty={isDirty}
            isSubmitting={isPending}
            sectionTitle="Anggaran Program"
            onCancel={handleCancel}
            onSave={form.handleSubmit(onSubmit)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMERCE PREVIEW (read-only)
═══════════════════════════════════════════════════════════════ */

function formatIDR(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface CommercePreviewProps {
  data: DetailData;
  programId: string;
}

export function CommercePreviewSection({
  data,
  programId,
}: CommercePreviewProps) {
  const price = formatIDR(data.startingPrice);
  const originalPrice = formatIDR(data.startingOriginalPrice);
  const hasDiscount =
    data.startingPrice != null &&
    data.startingOriginalPrice != null &&
    data.startingOriginalPrice > data.startingPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - data.startingPrice! / data.startingOriginalPrice!) * 100)
    : null;

  const metrics = [
    {
      icon: <Package className="size-4 text-neutral-500" />,
      label: "Total Paket",
      value: String(data.packagesCount ?? 0),
      bg: "bg-neutral-50 border-neutral-200",
    },
    {
      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      label: "Paket Aktif",
      value: String(data.activePackagesCount ?? 0),
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      icon: <Tag className="size-4 text-neutral-500" />,
      label: "Harga Mulai",
      value: price ?? "—",
      sub: hasDiscount ? originalPrice : null,
      bg: "bg-neutral-50 border-neutral-200",
      large: true,
    },
    {
      icon: <TrendingDown className="size-4 text-amber-500" />,
      label: "Diskon",
      value: discountPct ? `${discountPct}%` : "—",
      bg: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <SectionCard
      icon={<DollarSign className="size-4" />}
      title="Ringkasan Commerce"
      description="Informasi harga dan paket — dikelola di tab Packages."
      isEditing={false}
      isDirty={false}
      isSubmitting={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      readOnly
    >
      <div className="flex flex-col gap-5">
        <InfoNotice icon={<Info className="size-3.5" />} variant="info">
          Harga dikelola per paket di tab <strong>Packages</strong>. Nilai di
          bawah adalah kalkulasi otomatis.
        </InfoNotice>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-2.5 px-4 py-3.5 rounded-xl border",
                m.bg,
              )}
            >
              <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-white/80">
                {m.icon}
              </div>
              <div>
                <p
                  className={cn(
                    "font-bold text-neutral-900 tabular-nums leading-tight",
                    m.large ? "text-[14px]" : "text-[20px]",
                  )}
                >
                  {m.value}
                </p>
                {m.sub && (
                  <p className="text-[11px] text-neutral-400 line-through leading-none mt-0.5">
                    {m.sub}
                  </p>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mt-1">
                  {m.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/dashboard/programs/${programId}?tab=commerce`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-[12px] font-semibold hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm transition-all duration-150 self-start"
        >
          <Package className="size-3.5" />
          Kelola Paket Harga
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </SectionCard>
  );
}
