"use client";

/**
 * ProgramRegisterPageClient — Enhanced v2
 *
 * Changes from v1:
 * - All programs (online + offline) have batches
 * - Left/right decorative panels with visuals + image upload with BG removal
 * - Number inputs block alphabet characters
 * - Phone input with country code picker
 * - Textarea with character counter + maxLength
 * - T-shirt size: visual picker with size guide diagram (uses uploaded image)
 * - "How did you find us?" replaced with chip multi-select + optional free text
 * - All inputs extracted into reusable components (see form-components.tsx)
 */

import { useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  InfinityIcon,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Sparkles,
  Star,
  User,
  Users,
  Heart,
  Shield,
  Trophy,
  Zap,
  Image as ImageIcon,
  Quote,
} from "lucide-react";
import {
  FieldLabel,
  FieldError,
  StyledInput,
  PhoneInput,
  StyledSelect,
  StyledTextarea,
  RadioGroup,
  SourceOfInfoInput,
  TShirtSizeInput,
  ImageUploadWithRemoveBg,
  FormSection,
  Pill,
} from "@/components/Form";
import { LeftPanel } from "./LeftPanel";

// ─── Zod resolver ─────────────────────────────────────────────────────────────
function makeResolver<T extends z.ZodType>(schema: T) {
  return async (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success)
      return { values: result.data as z.infer<T>, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errors[key])
        errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors };
  };
}

// ─── Types (unchanged from v1) ────────────────────────────────────────────────
export type CategorySnap = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string | null;
  themePrimary: string;
  icon: string | null;
};
export type ProgramSnap = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  thumbnail: string | null;
  registrationType: "online" | "offline";
  categoryId: string;
  level: string;
  format: string;
};
export type ProgramListItem = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  thumbnail: string | null;
  registrationType: string;
  startingBasePrice?: number | null;
  startingOriginalPrice?: number | null;
  duration?: number | null;
  level: string;
  badge?: string | null;
  format: string;
};
type BatchListItem = {
  id: string;
  slug: string;
  title: string;
  type: "scheduled" | "package";
  isUnlimited: boolean | null;
  startDate: Date | null;
  endDate: Date | null;
  capacity: number | null;
  enrolledCount: number | null;
  price: number | null;
  originalPrice: number | null;
  mode: string | null;
  location: string | null;
  meetingTime: string | null;
};
export type BatchSnap = {
  id: string;
  slug: string;
  title: string;
  type: "scheduled" | "package";
  startDate: Date | null;
  endDate: Date | null;
  mode: string | null;
  capacity: number | null;
  enrolledCount: number | null;
  isUnlimited: boolean;
  location: string | null;
  meetingTime: string | null;
  price: number | null;
  originalPrice: number | null;
};
export type RegisterContext = {
  category: CategorySnap | null;
  program: ProgramSnap | null;
  batch: BatchSnap | null;
  warnings: string[];
  selected: {
    categoryId: string | null;
    programId: string | null;
    batchId: string | null;
  };
} | null;
type Step = "category" | "program" | "batch" | "form";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
const onlineFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  whatsapp: z.string().min(9, "Please enter a valid WhatsApp number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  age: z.coerce.number().min(1).max(120).optional(),
});
const offlineFormSchema = z.object({
  nama: z.string().min(2, "Name must be at least 2 characters"),
  panggilan: z.string().min(1, "Nickname is required"),
  jenisKelamin: z.enum(["L", "P"]),
  tempatLahir: z.string().min(2, "Place of birth is required"),
  tanggalLahir: z.string().min(1, "Date of birth is required"),
  usia: z.coerce.number().min(1, "Age is required"),
  kelas: z.string().min(1, "Grade/Class is required"),
  sekolah: z.string().min(2, "School name is required"),
  kotaAsal: z.string().min(2, "City is required"),
  namaOrtu: z.string().min(2, "Parent name is required"),
  hpOrtu: z.string().min(9, "Parent phone is required"),
  hpAnak: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  alumni: z.enum(["yes", "no"]),
  sumberInfo: z.string().min(1, "Please tell us how you found us"),
  alergi: z.enum(["yes", "no"]),
  detailAlergi: z.string().optional(),
  catatan: z.string().optional(),
  harapan: z.string().min(5, "Please share your expectations"),
  ukuranKaos: z.string().min(1, "T-shirt size is required"),
  fotoAnak: z.any().optional(),
});
type OnlineFormData = z.infer<typeof onlineFormSchema>;
type OfflineFormData = z.infer<typeof offlineFormSchema>;

// ─── Animation Variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
};
const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
  },
  item: {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 320, damping: 26 },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
function getStepIndex(step: Step) {
  return ["category", "program", "batch", "form"].indexOf(step);
}

// ─── Step config — batch is now ALWAYS shown ──────────────────────────────────
function getSteps(): { key: Step; label: string; icon: React.ReactNode }[] {
  return [
    {
      key: "category",
      label: "Category",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      key: "program",
      label: "Program",
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      key: "batch",
      label: "Batch",
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    { key: "form", label: "Details", icon: <User className="w-3.5 h-3.5" /> },
  ];
}

// ─── Step Navigator ───────────────────────────────────────────────────────────
function StepNavigator({
  currentStep,
  completedSteps,
  onNavigate,
}: {
  currentStep: Step;
  completedSteps: Set<Step>;
  onNavigate: (s: Step) => void;
}) {
  const steps = getSteps();
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-8 select-none">
      {steps.map((step, i) => {
        const done = completedSteps.has(step.key);
        const active = step.key === currentStep;
        const isNextUnlocked =
          !done &&
          !active &&
          i > 0 &&
          (completedSteps.has(steps[i - 1].key) ||
            steps[i - 1].key === currentStep);
        const clickable = (done || isNextUnlocked) && !active;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                onClick={() => clickable && onNavigate(step.key)}
                whileHover={clickable ? { scale: 1.1, y: -2 } : {}}
                whileTap={clickable ? { scale: 0.92 } : {}}
                className={cn(
                  "relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  done &&
                    !active &&
                    "bg-[#1a52c8] border-[#1a52c8] text-white cursor-pointer hover:bg-[#0a2d87] shadow-md shadow-[#1a52c8]/25",
                  active &&
                    "bg-[#ffc107] border-[#ffc107] text-[#0a2d87] shadow-lg shadow-[#ffc107]/35 cursor-default",
                  isNextUnlocked &&
                    !active &&
                    "bg-white border-[#1a52c8]/40 text-[#1a52c8]/60 cursor-pointer hover:border-[#1a52c8] hover:bg-[#1a52c8]/5",
                  !done &&
                    !active &&
                    !isNextUnlocked &&
                    "bg-white border-slate-200 text-slate-400 cursor-default",
                )}
              >
                {done && !active ? (
                  <Check className="w-4 h-4" />
                ) : active ? (
                  step.icon
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#ffc107]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
              <span
                className={cn(
                  "text-[10px] md:text-[11px] font-bold tracking-wide uppercase transition-colors duration-300",
                  active
                    ? "text-[#1a52c8]"
                    : done
                      ? "text-[#1a52c8]/70"
                      : isNextUnlocked
                        ? "text-[#1a52c8]/40"
                        : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="relative h-0.5 w-10 md:w-14 mx-1 md:mx-2 mb-5 rounded overflow-hidden bg-slate-200">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1a52c8] to-[#1a52c8]/70 rounded"
                  animate={{ width: i < currentIdx ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
function BackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
      className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1a52c8] transition-colors duration-200 px-3 py-2 rounded-xl hover:bg-[#1a52c8]/6 -ml-3"
    >
      <span className="w-7 h-7 rounded-lg border-2 border-slate-200 group-hover:border-[#1a52c8]/40 bg-white group-hover:bg-[#1a52c8]/5 flex items-center justify-center transition-all duration-200 shadow-sm">
        <ArrowLeft className="w-3.5 h-3.5" />
      </span>
      {label}
    </motion.button>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  selected,
  onClick,
}: {
  cat: CategorySnap;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={stagger.item}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
        selected
          ? "border-[#1a52c8] bg-gradient-to-br from-[#1a52c8]/8 to-[#1a52c8]/3 shadow-lg shadow-[#1a52c8]/15"
          : "border-slate-200 bg-white hover:border-[#1a52c8]/50 hover:shadow-lg hover:bg-slate-50/50",
      )}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            "absolute -right-8 -top-8 w-24 h-24 rounded-full transition-opacity duration-300",
            selected
              ? "bg-[#1a52c8]/8 opacity-100"
              : "bg-slate-100 opacity-0 group-hover:opacity-100",
          )}
        />
      </div>
      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm",
            selected
              ? "bg-[#1a52c8] text-white shadow-[#1a52c8]/30"
              : "bg-slate-100 group-hover:bg-[#1a52c8]/10",
          )}
        >
          {cat.icon ? (
            <Icon name={cat.icon} className="w-5 h-5" />
          ) : (
            <span className="text-lg">🎯</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-bold text-sm md:text-base transition-colors duration-300 leading-tight",
              selected ? "text-[#0a2d87]" : "text-slate-800",
            )}
          >
            {cat.label}
          </p>
          {cat.shortLabel && (
            <p className="text-xs text-slate-500 mt-0.5">{cat.shortLabel}</p>
          )}
        </div>
        {selected ? (
          <div className="w-7 h-7 rounded-full bg-[#1a52c8] flex items-center justify-center shadow-sm flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        ) : (
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1a52c8]/50 transition-colors duration-200 flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({
  program,
  selected,
  onClick,
}: {
  program: ProgramListItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={stagger.item}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 group",
        selected
          ? "border-[#1a52c8] shadow-xl shadow-[#1a52c8]/18"
          : "border-slate-200 bg-white hover:border-[#1a52c8]/50 hover:shadow-xl hover:shadow-slate-200/80",
      )}
    >
      {program.thumbnail ? (
        <div className="relative w-full h-40 overflow-hidden bg-slate-100">
          <img
            src={program.thumbnail}
            alt={program.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          {program.badge && (
            <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#ffc107] text-[#0a2d87] shadow-md">
              {program.badge}
            </span>
          )}
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#1a52c8] flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "relative w-full h-24 flex items-center justify-center transition-all duration-300 overflow-hidden",
            selected
              ? "bg-gradient-to-br from-[#1a52c8] to-[#0a2d87]"
              : "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-[#1a52c8]/12 group-hover:to-[#1a52c8]/6",
          )}
        >
          <GraduationCap
            className={cn(
              "w-9 h-9 transition-colors duration-300",
              selected ? "text-white/40" : "text-slate-300",
            )}
          />
          {program.badge && (
            <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#ffc107] text-[#0a2d87]">
              {program.badge}
            </span>
          )}
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </div>
      )}
      <div
        className={cn(
          "p-4 transition-colors duration-300",
          selected ? "bg-[#1a52c8]/4" : "bg-white",
        )}
      >
        <p
          className={cn(
            "font-bold text-sm md:text-base leading-snug mb-1.5",
            selected ? "text-[#0a2d87]" : "text-slate-800",
          )}
        >
          {program.title}
        </p>
        {program.shortDesc && (
          <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {program.shortDesc}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Pill color="blue">{program.level}</Pill>
          <Pill color="slate">{program.format}</Pill>
          {program.duration && <Pill color="slate">{program.duration}d</Pill>}
          <Pill
            color={program.registrationType === "offline" ? "amber" : "emerald"}
          >
            {program.registrationType}
          </Pill>
        </div>
        {program.startingBasePrice != null && (
          <div className="flex items-baseline gap-2 pt-3 border-t border-slate-100">
            <span className="text-sm font-black text-[#1a52c8]">
              {formatPrice(program.startingBasePrice)}
            </span>
            {program.startingOriginalPrice &&
              program.startingOriginalPrice > program.startingBasePrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  {formatPrice(program.startingOriginalPrice)}
                </span>
              )}
          </div>
        )}
      </div>
      {selected && (
        <div className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-[#1a52c8] rounded-2xl" />
      )}
    </motion.button>
  );
}

// ─── Batch Cards (unchanged) ──────────────────────────────────────────────────
function BatchTypeBadge({ type }: { type: "scheduled" | "package" }) {
  if (type === "package") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        <Package className="w-2.5 h-2.5" />
        Package
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1a52c8] border border-blue-100">
      <Calendar className="w-2.5 h-2.5" />
      Scheduled
    </span>
  );
}

function CapacityBar({
  enrolledCount,
  capacity,
}: {
  enrolledCount: number;
  capacity: number;
}) {
  const filled = Math.min(Math.round((enrolledCount / capacity) * 100), 100);
  const almostFull = filled >= 80;
  const isFull = filled >= 100;
  const remaining = Math.max(capacity - enrolledCount, 0);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
        <span>
          {isFull ? (
            "No seats left"
          ) : almostFull ? (
            <span className="text-red-500 font-bold">
              Only {remaining} seat{remaining !== 1 ? "s" : ""} left!
            </span>
          ) : (
            `${enrolledCount} enrolled`
          )}
        </span>
        <span>{capacity} seats total</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${filled}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className={cn(
            "h-full rounded-full",
            isFull
              ? "bg-slate-400"
              : almostFull
                ? "bg-red-400"
                : "bg-gradient-to-r from-[#1a52c8] to-[#1a52c8]/70",
          )}
        />
      </div>
    </div>
  );
}

function BatchCard({
  batch,
  selected,
  onClick,
}: {
  batch: BatchListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const isPackage = batch.type === "package";
  const isUnlimited = batch.isUnlimited ?? isPackage;
  const filled =
    !isUnlimited && batch.capacity && batch.enrolledCount != null
      ? Math.round((batch.enrolledCount / batch.capacity) * 100)
      : null;
  const isFull = filled != null && filled >= 100;

  return (
    <motion.button
      variants={stagger.item}
      whileHover={!isFull ? { y: -3, scale: 1.01 } : {}}
      whileTap={!isFull ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isFull}
      className={cn(
        "relative w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 group",
        selected
          ? isPackage
            ? "border-emerald-500 bg-gradient-to-br from-emerald-50/60 to-emerald-50/20 shadow-lg shadow-emerald-500/12"
            : "border-[#1a52c8] bg-gradient-to-br from-[#1a52c8]/8 to-[#1a52c8]/3 shadow-lg shadow-[#1a52c8]/15"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg",
        isFull && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <BatchTypeBadge type={batch.type} />
            {isFull && <Pill color="slate">Full</Pill>}
          </div>
          <p
            className={cn(
              "font-bold text-sm md:text-base leading-snug",
              selected
                ? isPackage
                  ? "text-emerald-900"
                  : "text-[#0a2d87]"
                : "text-slate-800",
            )}
          >
            {batch.title}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {batch.price != null && (
            <div className="text-right">
              <span
                className={cn(
                  "text-sm font-black",
                  selected
                    ? isPackage
                      ? "text-emerald-700"
                      : "text-[#1a52c8]"
                    : "text-slate-700",
                )}
              >
                {formatPrice(batch.price)}
              </span>
              {batch.originalPrice && batch.originalPrice > batch.price && (
                <span className="block text-[10px] text-slate-400 line-through">
                  {formatPrice(batch.originalPrice)}
                </span>
              )}
            </div>
          )}
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shadow",
                isPackage ? "bg-emerald-500" : "bg-[#1a52c8]",
              )}
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {isPackage ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <InfinityIcon className="w-3 h-3 text-emerald-600" />
            </div>
            <span>Unlimited spots — enroll anytime</span>
          </div>
          {batch.mode && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <Users className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="capitalize">{batch.mode}</span>
            </div>
          )}
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <Package className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Access granted immediately after registration. Work at your own
              pace with no fixed schedule.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {batch.startDate && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-[#1a52c8]/8 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 text-[#1a52c8]" />
                </div>
                <span>
                  {formatDate(batch.startDate)}
                  {batch.endDate ? ` – ${formatDate(batch.endDate)}` : ""}
                </span>
              </div>
            )}
            {batch.location && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-[#1a52c8]/8 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-[#1a52c8]" />
                </div>
                <span className="truncate">{batch.location}</span>
              </div>
            )}
            {batch.meetingTime && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-[#1a52c8]/8 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3 h-3 text-[#1a52c8]" />
                </div>
                <span>{batch.meetingTime}</span>
              </div>
            )}
            {batch.mode && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-6 h-6 rounded-lg bg-[#1a52c8]/8 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 text-[#1a52c8]" />
                </div>
                <span className="capitalize">{batch.mode}</span>
              </div>
            )}
          </div>
          {!isUnlimited &&
            batch.capacity != null &&
            batch.enrolledCount != null && (
              <div className="mt-3">
                <CapacityBar
                  enrolledCount={batch.enrolledCount}
                  capacity={batch.capacity}
                />
              </div>
            )}
        </div>
      )}
    </motion.button>
  );
}

// ─── Step hint content map ────────────────────────────────────────────────────
const stepHints: Record<Step, React.ReactNode> = {
  category: (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a52c8]/50 mb-1">
        Step 1 of 4
      </p>
      <p className="text-[12px] font-semibold text-[#0a2d87] leading-snug">
        Pick the category that excites you most.
      </p>
    </div>
  ),
  program: (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a52c8]/50 mb-1">
        Step 2 of 4
      </p>
      <p className="text-[12px] font-semibold text-[#0a2d87] leading-snug">
        Each program is crafted by expert instructors.
      </p>
    </div>
  ),
  batch: (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a52c8]/50 mb-1">
        Step 3 of 4
      </p>
      <p className="text-[12px] font-semibold text-[#0a2d87] leading-snug">
        Choose a schedule that fits your life.
      </p>
    </div>
  ),
  form: (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a52c8]/50 mb-1">
        Almost there!
      </p>
      <p className="text-[12px] font-semibold text-[#0a2d87] leading-snug">
        Fill in your details and you're in. 🎉
      </p>
    </div>
  ),
};

// ─── Right Decorative Panel ───────────────────────────────────────────────────
function RightPanel({
  category,
  program,
  batch,
  step,
}: {
  category: CategorySnap | null;
  program: ProgramListItem | ProgramSnap | null;
  batch: BatchSnap | null;
  step: Step;
}) {
  return (
    <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
      {/* Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#06195c] via-[#0a2d87] to-[#1a52c8] p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-[#ffc107]/10" />
          <p className="relative text-[10px] font-black uppercase tracking-widest text-[#ffc107] mb-1.5">
            Your Selection
          </p>
          <p className="relative text-white font-bold text-sm leading-snug">
            {program?.title ?? category?.label ?? "Getting started…"}
          </p>
        </div>
        <div className="p-4 space-y-3.5">
          <SummaryRow
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Category"
            value={category?.label}
            empty="Not selected"
            active={!!category}
          />
          <SummaryRow
            icon={<BookOpen className="w-3.5 h-3.5" />}
            label="Program"
            value={program?.title}
            empty="Not selected"
            active={!!program}
          />
          <SummaryRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Batch"
            value={batch?.title}
            empty="Not selected"
            active={!!batch}
          />
          {batch?.startDate && (
            <SummaryRow
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Starts"
              value={formatDate(batch.startDate) ?? undefined}
              active
            />
          )}
          {batch?.price != null ? (
            <SummaryRow
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Price"
              value={formatPrice(batch.price)}
              active
            />
          ) : (program as ProgramListItem)?.startingBasePrice != null ? (
            <SummaryRow
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Starting from"
              value={formatPrice(
                (program as ProgramListItem).startingBasePrice!,
              )}
              active
            />
          ) : null}
          {batch && (
            <div className="pt-1">
              <BatchTypeBadge type={batch.type} />
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Progress
        </p>
        <div className="space-y-1.5">
          {(["category", "program", "batch", "form"] as Step[]).map((s, i) => {
            const labels: Record<Step, string> = {
              category: "Category",
              program: "Program",
              batch: "Batch",
              form: "Your Details",
            };
            const isActive = s === step;
            const isDone = getStepIndex(step) > getStepIndex(s);
            return (
              <div
                key={s}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors duration-200",
                  isActive && "bg-[#1a52c8]/8",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black transition-colors duration-300",
                    isDone
                      ? "bg-[#1a52c8] text-white"
                      : isActive
                        ? "bg-[#ffc107] text-[#0a2d87]"
                        : "bg-slate-100 text-slate-400",
                  )}
                >
                  {isDone ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActive
                      ? "text-[#0a2d87]"
                      : isDone
                        ? "text-slate-600"
                        : "text-slate-400",
                  )}
                >
                  {labels[s]}
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-bold text-[#1a52c8] bg-[#1a52c8]/10 px-2 py-0.5 rounded-full">
                    Now
                  </span>
                )}
                {isDone && <Check className="ml-auto w-3 h-3 text-[#1a52c8]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Why Join Us?
        </p>
        {[
          {
            icon: <Shield className="w-3.5 h-3.5" />,
            text: "Secure & trusted registration",
          },
          {
            icon: <Trophy className="w-3.5 h-3.5" />,
            text: "Award-winning programs",
          },
          {
            icon: <Heart className="w-3.5 h-3.5" />,
            text: "Loved by 5000+ students",
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#1a52c8]/10 text-[#1a52c8] flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  empty,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  empty?: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200",
          active
            ? "bg-[#1a52c8]/10 text-[#1a52c8]"
            : "bg-slate-100 text-slate-400",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p
          className={cn(
            "text-xs font-semibold truncate",
            active ? "text-slate-800" : "text-slate-400 italic",
          )}
        >
          {value ?? empty}
        </p>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  onBack,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="mb-6">
      {onBack && (
        <div className="mb-4">
          <BackButton onClick={onBack} label={backLabel} />
        </div>
      )}
      <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Loading / Empty states ───────────────────────────────────────────────────
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
function LoadingList() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
        <BookOpen className="w-6 h-6 text-slate-400" />
      </div>
      <p className="font-bold text-slate-500 text-sm">{message}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const stats = [
    { icon: <Users className="w-4 h-4" />, value: "5,000+", label: "Students" },
    { icon: <Star className="w-4 h-4" />, value: "4.9", label: "Rating" },
    { icon: <Trophy className="w-4 h-4" />, value: "50+", label: "Programs" },
    { icon: <Zap className="w-4 h-4" />, value: "10+", label: "Years" },
  ];
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#06195c] via-[#0a2d87] to-[#1a52c8]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#1a52c8]/40 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#ffc107]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/4 blur-3xl" />

        <div className="absolute top-6 right-1/4 w-2 h-2 rounded-full bg-[#ffc107]/60" />

        <div className="absolute top-16 right-1/3 w-1.5 h-1.5 rounded-full bg-white/30" />

        <div className="absolute bottom-8 right-1/5 w-1 h-1 rounded-full bg-[#ffc107]/40" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 py-10 lg:py-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffc107]/15 border border-[#ffc107]/25 text-[#ffc107] text-[11px] font-black uppercase tracking-widest mb-5">
                <Sparkles className="w-3 h-3" />
                Registration Open
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 tracking-tight">
                Begin Your{" "}
                <span className="relative">
                  <span className="relative z-10 text-[#ffc107]">Learning</span>
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#ffc107]/20 rounded-full -z-0" />
                </span>{" "}
                Journey
              </h1>
              <p className="text-blue-200/75 text-sm md:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
                Select your program and register in minutes. Expert-led,
                community-driven, results guaranteed.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mt-7"
            >
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#ffc107]">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-white font-black text-sm leading-none">
                      {s.value}
                    </div>
                    <div className="text-blue-300/70 text-[10px] font-semibold uppercase tracking-wide">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="hidden lg:flex flex-shrink-0 items-end gap-3"
          >
            <div className="relative w-36 h-44 rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl shadow-black/40 translate-y-0">
              <img
                src="/images/student-learning.jpg"
                alt="Student learning"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";

                  (e.target as HTMLImageElement).parentElement!.classList.add(
                    "bg-gradient-to-br",

                    "from-blue-400/30",

                    "to-indigo-600/40",
                  );
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2d87]/60 to-transparent flex items-end p-3">
                <span className="text-[10px] font-bold text-white/90 leading-snug">
                  Students thriving daily
                </span>
              </div>
            </div>

            <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/12 shadow-xl shadow-black/30 -translate-y-2">
              <img
                src="/images/group-learning.jpg"
                alt="Group learning"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";

                  (e.target as HTMLImageElement).parentElement!.classList.add(
                    "bg-gradient-to-br",

                    "from-indigo-400/30",

                    "to-blue-700/40",
                  );
                }}
              />
            </div>

            <div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg shadow-black/20">
              <img
                src="/images/student-success.jpg"
                alt="Student success"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";

                  (e.target as HTMLImageElement).parentElement!.classList.add(
                    "bg-gradient-to-br",

                    "from-blue-300/20",

                    "to-indigo-500/30",
                  );
                }}
              />
            </div>

            <div className="absolute top-4 right-0 bg-white rounded-2xl px-3 py-2 shadow-xl shadow-black/20 border border-slate-100/50">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white shadow-sm"
                    />
                  ))}
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-800">
                    1,200+
                  </div>

                  <div className="text-[9px] text-slate-500 font-semibold">
                    joined this month
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-6"
        >
          <path
            d="M0 0C360 24 1080 24 1440 0V24H0V0Z"
            fill="rgb(243 246 252)"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Mobile Progress Bar ──────────────────────────────────────────────────────
function MobileProgressBar({ step }: { step: Step }) {
  const steps = getSteps();
  const currentIdx = steps.findIndex((s) => s.key === step);
  const progress = ((currentIdx + 1) / steps.length) * 100;
  return (
    <div className="lg:hidden mb-4 flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#1a52c8] to-[#ffc107] rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-black text-slate-400 tabular-nums">
        {currentIdx + 1}/{steps.length}
      </span>
    </div>
  );
}

// ─── Online Form ──────────────────────────────────────────────────────────────
function OnlineForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (d: OnlineFormData) => void;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OnlineFormData>({
    resolver: makeResolver(onlineFormSchema) as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
      <motion.div variants={stagger.item}>
        <FieldLabel required>Full Name</FieldLabel>
        <StyledInput
          {...register("fullName")}
          icon={<User className="size-4" />}
          placeholder="Your full name"
          error={!!errors.fullName}
        />
        <FieldError message={errors.fullName?.message} />
      </motion.div>

      <motion.div variants={stagger.item}>
        <FieldLabel required>WhatsApp Number</FieldLabel>
        <Controller
          name="whatsapp"
          control={control}
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
              error={!!errors.whatsapp}
            />
          )}
        />
        <FieldError message={errors.whatsapp?.message} />
      </motion.div>

      <motion.div variants={stagger.item}>
        <FieldLabel>Email Address</FieldLabel>
        <StyledInput
          {...register("email")}
          type="email"
          icon={<Mail className="size-4" />}
          placeholder="Optional"
          error={!!errors.email}
        />
        <FieldError message={errors.email?.message} />
      </motion.div>

      <motion.div variants={stagger.item}>
        <FieldLabel>Age</FieldLabel>
        {/* type="number" now blocks alphabet chars */}
        <StyledInput
          {...register("age")}
          type="number"
          placeholder="Optional"
        />
      </motion.div>

      <motion.div variants={stagger.item} className="pt-2">
        <SubmitButton isLoading={isLoading} />
      </motion.div>
    </form>
  );
}

// ─── Offline Form ─────────────────────────────────────────────────────────────
function OfflineForm({
  onSubmit,
  isLoading,
  tshirtDiagramImage,
}: {
  onSubmit: (d: OfflineFormData) => void;
  isLoading?: boolean;
  tshirtDiagramImage?: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<OfflineFormData>({
    resolver: makeResolver(offlineFormSchema) as any,
    defaultValues: { jenisKelamin: "L", alumni: "no", alergi: "no" },
  });
  const alergi = watch("alergi");

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      <FormSection
        title="Child Information"
        icon={<User className="w-3.5 h-3.5" />}
      >
        {/* Photo upload with BG removal */}
        <motion.div variants={stagger.item}>
          <ImageUploadWithRemoveBg
            label="Child's Photo (optional)"
            onChange={(file) => setValue("fotoAnak", file)}
            // onRemoveBg={async (file) => {
            // Wire to your actual remove.bg API call here
            // const form = new FormData(); form.append('image_file', file); form.append('size', 'auto');
            // const res = await fetch('https://api.remove.bg/v1.0/removebg', { method:'POST', headers:{'X-Api-Key': YOUR_KEY}, body: form });
            // const blob = await res.blob();
            // return URL.createObjectURL(blob);
            // return URL.createObjectURL(file); // placeholder
            // }}
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FieldLabel required>Full Name</FieldLabel>
            <StyledInput
              {...register("nama")}
              placeholder="Child's full name"
              error={!!errors.nama}
            />
            <FieldError message={errors.nama?.message} />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FieldLabel required>Nickname</FieldLabel>
            <StyledInput
              {...register("panggilan")}
              placeholder="What they go by"
              error={!!errors.panggilan}
            />
            <FieldError message={errors.panggilan?.message} />
          </motion.div>
        </div>

        <motion.div variants={stagger.item}>
          <RadioGroup
            label="Gender"
            required
            options={[
              { value: "L", label: "Male (L)" },
              { value: "P", label: "Female (P)" },
            ]}
            value={watch("jenisKelamin")}
            onChange={(v) => setValue("jenisKelamin", v as "L" | "P")}
          />
          <FieldError message={errors.jenisKelamin?.message} />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FieldLabel required>Place of Birth</FieldLabel>
            <StyledInput
              {...register("tempatLahir")}
              placeholder="e.g. Jakarta"
              error={!!errors.tempatLahir}
            />
            <FieldError message={errors.tempatLahir?.message} />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FieldLabel required>Date of Birth</FieldLabel>
            <StyledInput
              {...register("tanggalLahir")}
              type="date"
              error={!!errors.tanggalLahir}
            />
            <FieldError message={errors.tanggalLahir?.message} />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.div variants={stagger.item}>
            <FieldLabel required>Age</FieldLabel>
            <StyledInput
              {...register("usia")}
              type="number"
              placeholder="Years old"
              error={!!errors.usia}
            />
            <FieldError message={errors.usia?.message} />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FieldLabel required>Grade / Class</FieldLabel>
            <StyledInput
              {...register("kelas")}
              placeholder="e.g. 6 SD"
              error={!!errors.kelas}
            />
            <FieldError message={errors.kelas?.message} />
          </motion.div>
          <motion.div
            variants={stagger.item}
            className="col-span-2 sm:col-span-1"
          >
            <FieldLabel required>City</FieldLabel>
            <StyledInput
              {...register("kotaAsal")}
              placeholder="City of origin"
              error={!!errors.kotaAsal}
            />
            <FieldError message={errors.kotaAsal?.message} />
          </motion.div>
        </div>

        <motion.div variants={stagger.item}>
          <FieldLabel required>School Name</FieldLabel>
          <StyledInput
            {...register("sekolah")}
            icon={<GraduationCap className="w-4 h-4" />}
            placeholder="Current school"
            error={!!errors.sekolah}
          />
          <FieldError message={errors.sekolah?.message} />
        </motion.div>
      </FormSection>

      <FormSection
        title="Parent / Guardian"
        icon={<Users className="w-3.5 h-3.5" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FieldLabel required>Parent Full Name</FieldLabel>
            <StyledInput
              {...register("namaOrtu")}
              icon={<User className="size-4" />}
              placeholder="Parent name"
              error={!!errors.namaOrtu}
            />
            <FieldError message={errors.namaOrtu?.message} />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FieldLabel required>Parent WhatsApp</FieldLabel>
            <Controller
              name="hpOrtu"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.hpOrtu}
                />
              )}
            />

            <FieldError message={errors.hpOrtu?.message} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FieldLabel>Child's Phone</FieldLabel>
            <Controller
              name="hpAnak"
              control={control}
              render={({ field }) => (
                <PhoneInput value={field.value} onChange={field.onChange} />
              )}
            />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FieldLabel>Email</FieldLabel>
            <StyledInput
              {...register("email")}
              type="email"
              icon={<Mail className="size-4" />}
              placeholder="Optional"
              error={!!errors.email}
            />
            <FieldError message={errors.email?.message} />
          </motion.div>
        </div>
      </FormSection>

      <FormSection
        title="Additional Info"
        icon={<Sparkles className="w-3.5 h-3.5" />}
      >
        <motion.div variants={stagger.item}>
          <RadioGroup
            label="Are you an alumni?"
            required
            options={[
              { value: "yes", label: "Yes, alumni" },
              { value: "no", label: "New participant" },
            ]}
            value={watch("alumni")}
            onChange={(v) => setValue("alumni", v as "yes" | "no")}
          />
        </motion.div>

        {/* ── "How did you find us?" replaced with chip multi-select ── */}
        <motion.div variants={stagger.item}>
          <FieldLabel required>How did you find us?</FieldLabel>
          <Controller
            name="sumberInfo"
            control={control}
            render={({ field }) => (
              <SourceOfInfoInput
                value={field.value ?? ""}
                onChange={field.onChange}
                error={!!errors.sumberInfo}
              />
            )}
          />
          <FieldError message={errors.sumberInfo?.message} />
        </motion.div>

        <motion.div variants={stagger.item}>
          <RadioGroup
            label="Does the child have allergies?"
            required
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={watch("alergi")}
            onChange={(v) => setValue("alergi", v as "yes" | "no")}
          />
          <AnimatePresence>
            {alergi === "yes" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <FieldLabel>Allergy Details</FieldLabel>
                  <StyledInput
                    {...register("detailAlergi")}
                    placeholder="Describe the allergies"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── T-shirt size with visual size guide ── */}
        <motion.div variants={stagger.item}>
          <FieldLabel required>T-Shirt Size</FieldLabel>
          <Controller
            name="ukuranKaos"
            control={control}
            render={({ field }) => (
              <TShirtSizeInput
                value={field.value}
                onChange={field.onChange}
                error={!!errors.ukuranKaos}
                diagramImage="/images/tshirt-size-guide.png" // pass the uploaded image path
              />
            )}
          />
          <FieldError message={errors.ukuranKaos?.message} />
        </motion.div>

        <motion.div variants={stagger.item}>
          <FieldLabel>Additional Notes</FieldLabel>
          <StyledTextarea
            {...register("catatan")}
            rows={2}
            maxLength={300}
            placeholder="Any other information..."
          />
        </motion.div>

        {/* ── Textarea with char counter ── */}
        <motion.div variants={stagger.item}>
          <FieldLabel required>Expectations from this program</FieldLabel>
          <StyledTextarea
            {...register("harapan")}
            rows={4}
            maxLength={500}
            placeholder="What do you hope your child will gain from this program?"
            error={!!errors.harapan}
          />
          <FieldError message={errors.harapan?.message} />
        </motion.div>
      </FormSection>

      <motion.div variants={stagger.item} className="pt-2">
        <SubmitButton isLoading={isLoading} />
      </motion.div>
    </form>
  );
}

// ─── Submit Button ────────────────────────────────────────────────────────────
function SubmitButton({ isLoading }: { isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a52c8] via-[#1a52c8] to-[#0a2d87] text-white font-black text-base tracking-wide transition-all duration-300 shadow-lg shadow-[#1a52c8]/30 hover:shadow-xl hover:shadow-[#1a52c8]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Submit Registration
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProgramRegisterPageClient({
  initialData,
}: {
  initialData: RegisterContext;
}) {
  const deriveInitialStep = (): Step => {
    if (!initialData) return "category";
    if (initialData.program && initialData.batch) return "form";
    if (initialData.program) return "batch"; // all programs now require batch selection
    if (initialData.category) return "program";
    return "category";
  };

  const [step, setStep] = useState<Step>(deriveInitialStep);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState<number>(() =>
    getStepIndex(deriveInitialStep()),
  );
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(() => {
    const s = new Set<Step>();
    const init = deriveInitialStep();
    const order: Step[] = ["category", "program", "batch", "form"];
    for (let i = 0; i < order.indexOf(init); i++) s.add(order[i]);
    return s;
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialData?.selected.categoryId ?? null,
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    initialData?.selected.programId ?? null,
  );
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    initialData?.selected.batchId ?? null,
  );
  const [categorySnap, setCategorySnap] = useState<CategorySnap | null>(
    initialData?.category ?? null,
  );
  const [programSnap, setProgramSnap] = useState<ProgramSnap | null>(
    initialData?.program ?? null,
  );
  const [programListSnap, setProgramListSnap] =
    useState<ProgramListItem | null>(null);
  const [batchSnap, setBatchSnap] = useState<BatchSnap | null>(
    initialData?.batch ?? null,
  );

  const router = useRouter();
  const pathname = usePathname();
  const formCardRef = useRef<HTMLDivElement>(null);

  const updateUrl = useCallback(
    (cat?: string, prog?: string, batch?: string) => {
      const p = new URLSearchParams();
      if (cat) p.set("category", cat);
      if (prog) p.set("program", prog);
      if (batch) p.set("batch", batch);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const categoriesQuery = trpc.programs.getRegisterCategories.useQuery(
    undefined,
    { enabled: step === "category" },
  );
  const programsQuery = trpc.programs.getProgramsForRegister.useQuery(
    { categoryId: selectedCategoryId ?? undefined },
    { enabled: step === "program" && !!selectedCategoryId },
  );
  // ── Batches now always loaded for any program ──
  const batchesQuery = trpc.programs.getProgramBatchesForRegister.useQuery(
    { programId: selectedProgramId ?? undefined },
    { enabled: step === "batch" && !!selectedProgramId },
  );

  const scrollToForm = () => {
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const goTo = (next: Step, dir = 1) => {
    setDirection(dir);
    setStep(next);
    const nextIdx = getStepIndex(next);
    if (nextIdx > highestStepReached) setHighestStepReached(nextIdx);
    scrollToForm();
  };

  const markComplete = (s: Step) =>
    setCompletedSteps((prev) => new Set([...prev, s]));

  const handleNavigate = (target: Step) => {
    const targetIdx = getStepIndex(target);
    const currentIdx = getStepIndex(step);
    if (targetIdx <= highestStepReached || completedSteps.has(target))
      goTo(target, targetIdx < currentIdx ? -1 : 1);
  };

  const handleSelectCategory = (cat: CategorySnap) => {
    setSelectedProgramId(null);
    setSelectedBatchId(null);
    setProgramSnap(null);
    setProgramListSnap(null);
    setBatchSnap(null);
    setSelectedCategoryId(cat.id);
    setCategorySnap(cat);
    updateUrl(cat.slug);
    markComplete("category");
    goTo("program");
  };

  const handleSelectProgram = (prog: ProgramListItem) => {
    setSelectedBatchId(null);
    setBatchSnap(null);
    setSelectedProgramId(prog.id);
    setProgramListSnap(prog);
    setProgramSnap({
      id: prog.id,
      slug: prog.slug,
      title: prog.title,
      shortDesc: prog.shortDesc,
      thumbnail: prog.thumbnail,
      registrationType: prog.registrationType as "online" | "offline",
      categoryId: selectedCategoryId ?? "",
      level: prog.level,
      format: prog.format,
    });
    updateUrl(categorySnap?.slug, prog.slug);
    markComplete("program");
    // ── ALL programs now go to batch step ──
    goTo("batch");
  };

  const handleSelectBatch = (batch: BatchListItem) => {
    setSelectedBatchId(batch.id);
    setBatchSnap({
      id: batch.id,
      slug: batch.slug,
      title: batch.title,
      type: batch.type,
      startDate: batch.startDate,
      endDate: batch.endDate,
      mode: batch.mode,
      location: batch.location,
      meetingTime: batch.meetingTime,
      price: batch.price,
      capacity: batch.capacity,
      enrolledCount: batch.enrolledCount,
      isUnlimited: batch.isUnlimited ?? false,
      originalPrice: batch.originalPrice,
    });
    updateUrl(categorySnap?.slug, programSnap?.slug, batch.slug);
    markComplete("batch");
    goTo("form");
  };

  const handleFormSubmit = async (data: OnlineFormData | OfflineFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Form submitted", {
        programId: selectedProgramId,
        batchId: selectedBatchId,
        data,
      });
      await new Promise((r) => setTimeout(r, 1500));
    } finally {
      setIsSubmitting(false);
    }
  };

  const warnings = initialData?.warnings ?? [];
  const registrationType = programSnap?.registrationType ?? "online";
  const displayProgram = programListSnap ?? programSnap;

  return (
    <div className="min-h-screen bg-[#f3f6fc]">
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 mt-6 pb-16">
        <div className="flex gap-5 items-start">
          {/* ── Left decorative panel ── */}
          {/* <LeftPanel step={step} categorySnap={categorySnap} /> */}

          {/* ── Main form card ── */}
          <div className="flex-1 min-w-0" ref={formCardRef}>
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/25 border border-slate-100 p-6 md:p-8">
              <AnimatePresence>
                {warnings.map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {w}
                  </motion.div>
                ))}
              </AnimatePresence>

              <MobileProgressBar step={step} />
              <StepNavigator
                currentStep={step}
                completedSteps={completedSteps}
                onNavigate={handleNavigate}
              />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 380, damping: 36 }}
                >
                  {/* ── Category Step ── */}
                  {step === "category" && (
                    <div>
                      <SectionHeader
                        title="Choose a Category"
                        subtitle="What area would you like to explore?"
                      />
                      {categoriesQuery.isLoading && <LoadingGrid />}
                      {categoriesQuery.data && (
                        <motion.div
                          variants={stagger.container}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {categoriesQuery.data.map((cat) => (
                            <CategoryCard
                              key={cat.id}
                              cat={cat}
                              selected={selectedCategoryId === cat.id}
                              onClick={() => handleSelectCategory(cat)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── Program Step ── */}
                  {step === "program" && (
                    <div>
                      <SectionHeader
                        title="Select a Program"
                        subtitle={
                          categorySnap
                            ? `Programs in ${categorySnap.label}`
                            : "Choose a program to continue"
                        }
                        onBack={() => goTo("category", -1)}
                        backLabel="Back to Categories"
                      />
                      {programsQuery.isLoading && <LoadingGrid />}
                      {programsQuery.data?.length === 0 && (
                        <EmptyState message="No programs available in this category yet." />
                      )}
                      {programsQuery.data && programsQuery.data.length > 0 && (
                        <motion.div
                          variants={stagger.container}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          {programsQuery.data.map((prog) => (
                            <ProgramCard
                              key={prog.id}
                              program={prog}
                              selected={selectedProgramId === prog.id}
                              onClick={() => handleSelectProgram(prog)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── Batch Step — now for ALL programs ── */}
                  {step === "batch" && (
                    <div>
                      <SectionHeader
                        title="Choose a Batch"
                        subtitle={
                          programSnap
                            ? `Available batches for ${programSnap.title}`
                            : "Select your preferred schedule or package"
                        }
                        onBack={() => goTo("program", -1)}
                        backLabel="Back to Programs"
                      />
                      {/* Batch type summary pills */}
                      {batchesQuery.data &&
                        batchesQuery.data.length > 0 &&
                        (() => {
                          const scheduled = batchesQuery.data.filter(
                            (b) => b.type === "scheduled",
                          );
                          const packages = batchesQuery.data.filter(
                            (b) => b.type === "package",
                          );
                          return scheduled.length > 0 || packages.length > 0 ? (
                            <div className="mb-5 flex items-center gap-2 flex-wrap">
                              {scheduled.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#1a52c8]">
                                  <Calendar className="w-3 h-3" />
                                  {scheduled.length} scheduled batch
                                  {scheduled.length !== 1 ? "es" : ""}
                                </div>
                              )}
                              {packages.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                                  <Package className="w-3 h-3" />
                                  {packages.length} package
                                  {packages.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          ) : null;
                        })()}
                      {batchesQuery.isLoading && <LoadingList />}
                      {batchesQuery.data?.length === 0 && (
                        <EmptyState
                          message="No open batches right now."
                          sub="Check back soon or contact us."
                        />
                      )}
                      {batchesQuery.data && batchesQuery.data.length > 0 && (
                        <motion.div
                          variants={stagger.container}
                          initial="hidden"
                          animate="show"
                          className="space-y-3"
                        >
                          {[
                            ...batchesQuery.data.filter(
                              (b) => b.type === "scheduled",
                            ),
                            ...batchesQuery.data.filter(
                              (b) => b.type === "package",
                            ),
                          ].map((batch) => (
                            <BatchCard
                              key={batch.id}
                              batch={batch}
                              selected={selectedBatchId === batch.id}
                              onClick={() => handleSelectBatch(batch)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── Form Step ── */}
                  {step === "form" && (
                    <div>
                      <SectionHeader
                        title="Your Details"
                        subtitle="Complete your registration below"
                        onBack={() => goTo("batch", -1)}
                        backLabel="Back to Batches"
                      />
                      <div className="mb-6 flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
                            registrationType === "offline"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200",
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {registrationType === "offline"
                            ? "Offline Registration"
                            : "Online Registration"}
                        </span>
                        {batchSnap?.price != null ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-50 text-[#1a52c8] border-blue-200">
                            <Sparkles className="w-3 h-3" />
                            {formatPrice(batchSnap.price)}
                            {batchSnap.originalPrice &&
                              batchSnap.originalPrice > batchSnap.price && (
                                <span className="line-through text-slate-400 ml-1">
                                  {formatPrice(batchSnap.originalPrice)}
                                </span>
                              )}
                          </span>
                        ) : (displayProgram as ProgramListItem)
                            ?.startingBasePrice != null ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-50 text-[#1a52c8] border-blue-200">
                            <Sparkles className="w-3 h-3" />
                            From{" "}
                            {formatPrice(
                              (displayProgram as ProgramListItem)
                                .startingBasePrice!,
                            )}
                          </span>
                        ) : null}
                        {batchSnap && <BatchTypeBadge type={batchSnap.type} />}
                      </div>
                      <motion.div
                        variants={stagger.container}
                        initial="hidden"
                        animate="show"
                      >
                        {registrationType === "online" && (
                          <OnlineForm
                            onSubmit={handleFormSubmit}
                            isLoading={isSubmitting}
                          />
                        )}
                        {registrationType === "offline" && (
                          <OfflineForm
                            onSubmit={handleFormSubmit}
                            isLoading={isSubmitting}
                          />
                        )}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px flex-1 bg-slate-200/60" />
              <p className="text-xs text-slate-400 whitespace-nowrap">
                Need help?{" "}
                <span className="font-semibold text-[#1a52c8] cursor-pointer hover:underline">
                  Chat via WhatsApp
                </span>
              </p>
              <div className="h-px flex-1 bg-slate-200/60" />
            </div>
          </div>

          {/* ── Right summary panel ── */}
          <RightPanel
            category={categorySnap}
            program={displayProgram}
            batch={batchSnap}
            step={step}
          />
        </div>
      </div>
    </div>
  );
}
