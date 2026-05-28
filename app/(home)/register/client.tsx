"use client";

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE REWRITE — key changes from original:
//
// FLOW
//  • scheduleType === "permanent" → Category → Program → Package → Form
//  • scheduleType === "scheduled" → Category → Program → Batch+Package → Form
//  • Step "batch" is skipped entirely for permanent programs
//  • StepNavigator adapts its labels and count to the active flow
//
// PACKAGE SELECTION
//  • Permanent: dedicated PackageStep between Program and Form
//  • Scheduled: package selected inside BatchStep (existing behaviour, kept)
//  • Form step: compact inline package re-selector shown at the top of the form
//    so users can change their mind without going back
//
// DATA FIXES
//  • packageId is required in both mutateAsync calls
//  • scheduleType flows from program to state and is used for routing
//  • getProgramsForRegister now returns scheduleType
//  • getProgramPackagesForRegister new query used for permanent programs
//
// UI FIXES
//  • RightPanel shows package row when selected
//  • SuccessBanner always has price/packageTitle (they now come from the server)
//  • handleBatchContinue guards on package selection
//  • handleFormSubmit guards on package selection before sending
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  MotionConfig,
} from "framer-motion";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
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
  ChevronRight,
  Clock,
  Copy,
  GraduationCap,
  Heart,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Package,
  PartyPopper,
  Phone,
  Shield,
  Sparkles,
  Star,
  Tag,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import {
  FieldError,
  StyledInput,
  PhoneInput,
  StyledTextarea,
  RadioGroup,
  SourceOfInfoInput,
  TShirtSizeInput,
  ImageUploadWithRemoveBg,
  FormSection,
  Pill,
  FormField,
} from "@/components/Form";
import { LeftPanel } from "./LeftPanel";
import toast from "react-hot-toast";
import { makeResolver } from "@/lib/zodSchemas";
import { BatchSchedule } from "@/app/modules/program/program.types";

/* =========================================================
   TYPES
========================================================= */

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
  thumbnailUrl: string | null;
  registrationType: "online" | "offline";
  categoryId: string;
  level: string;
  format: string;
  scheduleType: "permanent" | "scheduled"; // ★
};

export type PackageItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice: number | null;
  isDefault: boolean;
  order: number;
};

export type BatchSnap = {
  id: string;
  slug: string;
  title: string;

  startDate: Date | null;
  endDate: Date | null;

  mode: string | null;
  location: string | null;

  schedules: BatchSchedule[] | null;

  capacity: number | null;
  enrolledCount: number;

  packages: PackageItem[];
};

export type ProgramListItem = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  thumbnailUrl: string | null;
  registrationType: string;
  startingPrice?: number | null;
  startingOriginalPrice?: number | null;
  duration?: number | null;
  level: string;
  badge?: string | null;
  format: string;
  scheduleType: "permanent" | "scheduled"; // ★
};

export type BatchListItem = {
  id: string;
  slug: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  capacity: number | null;
  enrolledCount: number;
  mode: string | null;
  location: string | null;
  schedules: BatchSchedule[] | null;
  packages: PackageItem[];
};

export type RegisterContext = {
  category: CategorySnap | null;
  program: ProgramSnap | null;
  // ★ packages for permanent programs
  programPackages: PackageItem[];
  batch: BatchSnap | null;
  warnings: string[];
  selected: {
    categoryId: string | null;
    programId: string | null;
    batchId: string | null;
    packageId: string | null; // ★ now actually set from server
  };
} | null;

// ★ Step type — "package" is the new step for permanent programs
type Step = "category" | "program" | "package" | "batch" | "form";

type RegistrationResult = {
  orderId: string;
  programTitle: string;
  batchTitle: string | null;
  batchStartDate: string | null;
  batchLocation: string | null;
  price: number | null;
  originalPrice?: number | null;
  packageTitle: string | null;
  customerName: string;
  phone: string;
  type: "online" | "offline";
  scheduleType: "permanent" | "scheduled";
};

/* =========================================================
   ZOD SCHEMAS (client-side form validation)
========================================================= */

const onlineFormSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  whatsapp: z.string().min(9, "Masukkan nomor WhatsApp yang valid"),
  email: z
    .string()
    .email("Alamat email tidak valid")
    .optional()
    .or(z.literal("")),
  age: z.coerce.number().min(1, "Usia wajib diisi").max(80, "Usia tidak valid"),
});

const offlineFormSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(50),
  panggilan: z.string().min(1, "Wajib diisi").max(50),
  jenisKelamin: z.enum(["L", "P"]),
  tempatLahir: z.string().min(2, "Wajib diisi"),
  tanggalLahir: z.string().min(1, "Wajib diisi"),
  usia: z.coerce.number().min(1).max(80),
  kelas: z.string().min(1, "Wajib diisi"),
  sekolah: z.string().min(2, "Wajib diisi"),
  kotaAsal: z.string().min(2, "Wajib diisi"),
  namaOrtu: z.string().min(2, "Wajib diisi"),
  hpOrtu: z.string().min(9, "Wajib diisi"),
  hpAnak: z.string().optional().or(z.literal("")),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  alumni: z.enum(["yes", "no"]),
  sumberInfo: z.string().min(1, "Wajib diisi"),
  alergi: z.enum(["yes", "no"]),
  detailAlergi: z.string().optional(),
  catatan: z.string().optional(),
  harapan: z.string().min(5, "Wajib diisi"),
  ukuranKaos: z.string().min(1, "Wajib dipilih"),
  fotoAnak: z.any().optional(),
});

type OnlineFormData = z.infer<typeof onlineFormSchema>;
type OfflineFormData = z.infer<typeof offlineFormSchema>;

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: Date | string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(price: number) {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function discountPct(original: number, sale: number) {
  if (original <= sale) return null;
  return Math.round(((original - sale) / original) * 100);
}

function cheapestPackage(packages: PackageItem[]): PackageItem | null {
  if (!packages.length) return null;
  const def = packages.find((p) => p.isDefault);
  if (def) return def;
  return [...packages].sort((a, b) => a.price - b.price)[0] ?? null;
}

function getStepIndex(step: Step, scheduleType: "permanent" | "scheduled") {
  const order = buildStepOrder(scheduleType);
  return order.indexOf(step);
}

// ★ Step order depends on schedule type
function buildStepOrder(scheduleType: "permanent" | "scheduled"): Step[] {
  if (scheduleType === "permanent") {
    return ["category", "program", "package", "form"];
  }
  return ["category", "program", "batch", "form"];
}

function buildStepDefs(scheduleType: "permanent" | "scheduled") {
  const base = [
    {
      key: "category" as Step,
      label: "Kategori",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      key: "program" as Step,
      label: "Program",
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
  ];
  if (scheduleType === "permanent") {
    base.push({
      key: "package" as Step,
      label: "Paket",
      icon: <Package className="w-3.5 h-3.5" />,
    });
  } else {
    base.push({
      key: "batch" as Step,
      label: "Batch",
      icon: <Calendar className="w-3.5 h-3.5" />,
    });
  }
  base.push({
    key: "form" as Step,
    label: "Detail",
    icon: <User className="w-3.5 h-3.5" />,
  });
  return base;
}

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

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

/* =========================================================
   STEP NAVIGATOR
========================================================= */

function StepNavigator({
  currentStep,
  completedSteps,
  scheduleType,
  onNavigate,
}: {
  currentStep: Step;
  completedSteps: Set<Step>;
  scheduleType: "permanent" | "scheduled";
  onNavigate: (s: Step) => void;
}) {
  const steps = buildStepDefs(scheduleType);
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

/* =========================================================
   BACK BUTTON
========================================================= */

function BackButton({
  onClick,
  label = "Kembali",
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

/* =========================================================
   CATEGORY CARD
========================================================= */

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

/* =========================================================
   PROGRAM CARD
========================================================= */

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
      {program.thumbnailUrl ? (
        <div className="relative w-full h-40 overflow-hidden bg-slate-100">
          <img
            src={program.thumbnailUrl}
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
          {program.duration && <Pill color="slate">{program.duration}h</Pill>}
          <Pill
            color={program.registrationType === "offline" ? "amber" : "emerald"}
          >
            {program.registrationType === "offline" ? "Luring" : "Daring"}
          </Pill>
          {/* ★ Show schedule type badge */}
          <Pill
            color={program.scheduleType === "permanent" ? "violet" : "blue"}
          >
            {program.scheduleType === "permanent" ? "Kapan saja" : "Terjadwal"}
          </Pill>
        </div>
        {program.startingPrice != null && (
          <div className="flex items-baseline gap-2 pt-3 border-t border-slate-100">
            <span className="text-sm font-black text-[#1a52c8]">
              {formatPrice(program.startingPrice)}
            </span>
            {program.startingOriginalPrice &&
              program.startingOriginalPrice > program.startingPrice && (
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

/* =========================================================
   PACKAGE ROW  (used in both PackageStep and inline re-selector)
========================================================= */

function PackageRow({
  pkg,
  index,
  isSelected,
  onSelect,
}: {
  pkg: PackageItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const discount =
    pkg.originalPrice != null && pkg.originalPrice > pkg.price
      ? discountPct(pkg.originalPrice, pkg.price)
      : null;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 340,
        damping: 28,
      }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8]",
        isSelected
          ? "bg-[#1a52c8]/8 border-2 border-[#1a52c8] shadow-sm shadow-[#1a52c8]/10"
          : "bg-white border-2 border-slate-100 hover:border-[#1a52c8]/30 hover:bg-slate-50/80",
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
          isSelected
            ? "border-[#1a52c8] bg-[#1a52c8]"
            : "border-slate-300 bg-white group-hover:border-[#1a52c8]/50",
        )}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-bold leading-tight",
              isSelected ? "text-[#0a2d87]" : "text-slate-800",
            )}
          >
            {pkg.title}
          </span>
          {pkg.isDefault && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 leading-none">
              <Star className="w-2.5 h-2.5" />
              Rekomendasi
            </span>
          )}
        </div>
        {pkg.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed truncate">
            {pkg.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {discount !== null && (
          <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-700">
            -{discount}%
          </span>
        )}
        <div className="text-right">
          {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
            <p className="text-[10px] text-slate-400 line-through leading-none">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
          <p
            className={cn(
              "text-sm font-black tabular-nums",
              isSelected ? "text-[#1a52c8]" : "text-slate-700",
            )}
          >
            {formatPrice(pkg.price)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
   ★ PACKAGE STEP  (new — for permanent programs)
========================================================= */

function PackageStep({
  programTitle,
  packages,
  isLoading,
  selectedPackageId,
  onSelectPackage,
  onContinue,
  onBack,
}: {
  programTitle: string;
  packages: PackageItem[];
  isLoading: boolean;
  selectedPackageId: string | null;
  onSelectPackage: (pkg: PackageItem) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const canContinue = !!selectedPackageId;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4">
          <BackButton onClick={onBack} label="Kembali ke Program" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
          Pilih Paket
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Paket tersedia untuk{" "}
          <span className="font-semibold text-[#0a2d87]">{programTitle}</span>
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {!isLoading && packages.length === 0 && (
        <div className="py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-bold text-slate-500 text-sm">
            Belum ada paket tersedia untuk program ini.
          </p>
        </div>
      )}

      {!isLoading && packages.length > 0 && (
        <>
          <div className="rounded-2xl border-2 border-[#1a52c8]/15 bg-[#f7f9ff] overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a52c8]/10 bg-white/70">
              <div className="w-5 h-5 rounded-md bg-[#1a52c8]/10 flex items-center justify-center flex-shrink-0">
                <Tag className="w-3 h-3 text-[#1a52c8]" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#1a52c8] flex-1">
                Pilih Paket Harga
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">
                {packages.length} paket
              </span>
              {selectedPackageId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700">
                  <Check className="w-2.5 h-2.5" />
                  Terpilih
                </span>
              )}
            </div>
            <div className="p-3 space-y-1.5">
              {packages.map((pkg, idx) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  index={idx}
                  isSelected={selectedPackageId === pkg.id}
                  onSelect={() => onSelectPackage(pkg)}
                />
              ))}
              {!selectedPackageId && (
                <p className="text-center text-[11px] text-slate-400 pt-1 pb-0.5 font-medium">
                  Pilih paket untuk melanjutkan
                </p>
              )}
            </div>
          </div>

          {/* Spacer so last package row isn't hidden behind sticky bar */}
          {selectedPackageId && <div className={STICKY_BAR_SPACER} />}
        </>
      )}

      <StickyCtaBar
        mode="package"
        selectedPackage={
          packages.find((p) => p.id === selectedPackageId) ?? null
        }
        canContinue={canContinue}
        onContinue={onContinue}
      />
    </div>
  );
}

/* =========================================================
   PACKAGE PICKER PANEL  (inside BatchCard)
========================================================= */

function PackagePickerPanel({
  packages,
  selectedId,
  onSelect,
  isOpen,
}: {
  packages: PackageItem[];
  selectedId: string | null;
  onSelect: (pkg: PackageItem) => void;
  isOpen: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="pkg-panel"
          initial={
            shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
          }
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }
          }
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="mx-5 h-3 flex items-center">
            <div className="w-0.5 h-full bg-gradient-to-b from-[#1a52c8]/30 to-transparent mx-auto" />
          </div>
          <div className="mx-1 mb-1 rounded-2xl border-2 border-[#1a52c8]/15 bg-[#f7f9ff] overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a52c8]/10 bg-white/70">
              <div className="w-5 h-5 rounded-md bg-[#1a52c8]/10 flex items-center justify-center flex-shrink-0">
                <Tag className="w-3 h-3 text-[#1a52c8]" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#1a52c8] flex-1">
                Pilih Paket Harga
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">
                {packages.length} paket
              </span>
              {selectedId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700">
                  <Check className="w-2.5 h-2.5" />
                  Terpilih
                </span>
              )}
            </div>
            <div className="p-3 space-y-1.5">
              {packages.map((pkg, idx) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  index={idx}
                  isSelected={selectedId === pkg.id}
                  onSelect={() => onSelect(pkg)}
                />
              ))}
              {!selectedId && (
                <p className="text-center text-[11px] text-slate-400 pt-1 pb-0.5 font-medium">
                  Pilih paket untuk melanjutkan
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   CAPACITY BAR
========================================================= */

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
            <span className="text-slate-500 font-bold">
              Tidak ada kursi tersisa
            </span>
          ) : almostFull ? (
            <span className="text-red-500 font-bold">
              ⚡ Sisa {remaining} kursi!
            </span>
          ) : (
            `${enrolledCount} terdaftar`
          )}
        </span>
        <span>{capacity} kursi total</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${filled}%` }}
          transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.1,
          }}
          className={cn(
            "h-full rounded-full",
            isFull
              ? "bg-slate-300"
              : almostFull
                ? "bg-gradient-to-r from-red-400 to-orange-400"
                : "bg-gradient-to-r from-[#1a52c8] via-[#2563eb] to-[#1a52c8]/80",
          )}
        />
      </div>
    </div>
  );
}

/* =========================================================
   BATCH CARD
========================================================= */

function BatchCard({
  batch,
  isExpanded,
  isSelected,
  selectedPackageId,
  onToggle,
  onSelectPackage,
}: {
  batch: BatchListItem;
  isExpanded: boolean;
  isSelected: boolean;
  selectedPackageId: string | null;
  onToggle: () => void;
  onSelectPackage: (pkg: PackageItem) => void;
}) {
  const lowestPkg = cheapestPackage(batch.packages);
  const isFull =
    batch.capacity != null && batch.enrolledCount >= batch.capacity;
  const hasPackages = batch.packages.length > 0;
  const selectedPkg =
    batch.packages.find((p) => p.id === selectedPackageId) ?? null;

  const scheduleText = batch.schedules
    ?.map((schedule) => {
      const days = schedule.days?.length
        ? schedule.days
            .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
            .join(", ")
        : null;

      const time =
        schedule.startTime && schedule.endTime
          ? `${schedule.startTime} – ${schedule.endTime}`
          : schedule.startTime;

      return [days, time].filter(Boolean).join(" • ");
    })
    .filter(Boolean)
    .join(" | ");

  const metaItems = [
    batch.startDate && {
      icon: <Calendar className="w-3 h-3 text-[#1a52c8]" />,
      text: `${formatDate(batch.startDate)}${
        batch.endDate ? ` – ${formatDate(batch.endDate)}` : ""
      }`,
    },

    scheduleText && {
      icon: <Clock className="w-3 h-3 text-[#1a52c8]" />,
      text: scheduleText,
    },

    batch.location && {
      icon: <MapPin className="w-3 h-3 text-[#1a52c8]" />,
      text: batch.location,
    },

    batch.mode && {
      icon: <Users className="w-3 h-3 text-[#1a52c8]" />,
      text: batch.mode.charAt(0).toUpperCase() + batch.mode.slice(1),
    },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <div className="group">
      <motion.div
        layout="position"
        className={cn(
          "relative rounded-2xl border-2 overflow-hidden transition-all duration-300",
          isFull
            ? "border-slate-200 opacity-50 cursor-not-allowed bg-slate-50"
            : isExpanded
              ? "border-[#1a52c8] shadow-lg shadow-[#1a52c8]/12 bg-white"
              : isSelected
                ? "border-[#1a52c8]/60 bg-[#1a52c8]/3 shadow-md shadow-[#1a52c8]/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1a52c8] via-[#ffc107] to-[#1a52c8] transition-opacity duration-300",
            isExpanded || isSelected ? "opacity-100" : "opacity-0",
          )}
        />
        <button
          type="button"
          disabled={isFull}
          onClick={!isFull ? onToggle : undefined}
          className="w-full text-left p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a52c8]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    isFull
                      ? "bg-slate-400"
                      : batch.startDate &&
                          new Date(batch.startDate) < new Date()
                        ? "bg-amber-400 animate-pulse"
                        : "bg-emerald-400 animate-pulse",
                  )}
                />
                <p
                  className={cn(
                    "font-black text-[15px] leading-snug",
                    isExpanded || isSelected
                      ? "text-[#0a2d87]"
                      : "text-slate-800",
                  )}
                >
                  {batch.title}
                </p>
                {isFull && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Penuh
                  </span>
                )}
                {isSelected && !isExpanded && selectedPkg && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1a52c8]/10 border border-[#1a52c8]/20 text-[10px] font-black text-[#1a52c8]">
                    <Check className="w-2.5 h-2.5" />
                    {selectedPkg.title}
                  </span>
                )}
              </div>
              {metaItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                  {metaItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <div className="w-5 h-5 rounded-md bg-[#1a52c8]/8 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="truncate">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {batch.capacity != null && (
                <div className="mt-3">
                  <CapacityBar
                    enrolledCount={batch.enrolledCount}
                    capacity={batch.capacity}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {lowestPkg && !isExpanded && !selectedPkg && (
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1">
                    mulai dari
                  </p>
                  <p
                    className={cn(
                      "text-base font-black leading-none",
                      isSelected ? "text-[#1a52c8]" : "text-slate-800",
                    )}
                  >
                    {formatPrice(lowestPkg.price)}
                  </p>
                  {lowestPkg.originalPrice != null &&
                    lowestPkg.originalPrice > lowestPkg.price && (
                      <p className="text-[10px] text-slate-400 line-through mt-0.5">
                        {formatPrice(lowestPkg.originalPrice)}
                      </p>
                    )}
                </div>
              )}
              {!isExpanded && selectedPkg && (
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1">
                    harga
                  </p>
                  <p className="text-base font-black leading-none text-[#1a52c8]">
                    {formatPrice(selectedPkg.price)}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isSelected && !isExpanded && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-[#1a52c8] flex items-center justify-center shadow-sm"
                  >
                    <Check
                      className="w-3.5 h-3.5 text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200",
                    isExpanded
                      ? "bg-[#1a52c8] text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                  )}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {hasPackages ? (
        <PackagePickerPanel
          packages={batch.packages}
          selectedId={selectedPackageId}
          onSelect={onSelectPackage}
          isOpen={isExpanded}
        />
      ) : (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mx-4 mt-2 mb-1 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <p className="text-xs font-semibold text-teal-700 leading-relaxed">
                  Tidak ada paket berbayar — detail biaya akan dikonfirmasi via
                  WhatsApp.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* =========================================================
   STICKY CTA BAR
   ─────────────────────────────────────────────────────────
   Shared between PackageStep and BatchStep. Fixed to the
   bottom of the viewport so the user never scrolls to find
   the continue button no matter how long the list is.

   Two modes:
   • "package" — shows selected package name + price
   • "batch"   — shows batch + optional package + price

   A padding spacer in each step keeps content clear of bar.
========================================================= */

type StickyCtaMode =
  | {
      mode: "package";
      selectedPackage: PackageItem | null;
      canContinue: boolean;
      onContinue: () => void;
    }
  | {
      mode: "batch";
      selectedBatch: BatchListItem | null;
      selectedPackage: PackageItem | null;
      canContinue: boolean;
      needsPackage: boolean;
      onContinue: () => void;
    };

function StickyCtaBar(props: StickyCtaMode) {
  const visible =
    props.mode === "package" ? !!props.selectedPackage : !!props.selectedBatch;
  const { canContinue, onContinue } = props;

  // ── Build summary pieces ─────────────────────────────────
  let left: React.ReactNode = null;
  let right: React.ReactNode = null;
  let nudge: React.ReactNode = null;

  if (props.mode === "package" && props.selectedPackage) {
    const pkg = props.selectedPackage;
    left = (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-white/55 leading-none mb-0.5">
            Paket dipilih
          </p>
          <p className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[280px] leading-tight">
            {pkg.title}
          </p>
        </div>
      </div>
    );
    right = (
      <div className="text-right flex-shrink-0">
        {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
          <p className="text-[10px] text-white/40 line-through leading-none">
            {formatPrice(pkg.originalPrice)}
          </p>
        )}
        <p className="text-lg font-black text-[#ffc107] tabular-nums leading-tight">
          {formatPrice(pkg.price)}
        </p>
      </div>
    );
  }

  if (props.mode === "batch" && props.selectedBatch) {
    const batch = props.selectedBatch;
    const pkg = props.selectedPackage;

    left = (
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wide text-white/55 leading-none mb-0.5">
            Batch
          </p>
          <p className="text-sm font-bold text-white truncate w-full leading-tight">
            {batch.title}
          </p>
        </div>

        {pkg && (
          <>
            <div className="w-px h-7 bg-white/20 flex-shrink-0 hidden sm:block" />
            <div className="min-w-0 flex-shrink-0 hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-wide text-white/55 leading-none mb-0.5">
                Paket
              </p>
              <p className="text-sm font-bold text-white truncate max-w-[100px] leading-tight">
                {pkg.title}
              </p>
            </div>
          </>
        )}
      </div>
    );

    if (pkg) {
      right = (
        <div className="text-right flex-shrink-0">
          {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
            <p className="text-[10px] text-white/40 line-through leading-none">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
          <p className="text-lg font-black text-[#ffc107] tabular-nums leading-tight">
            {formatPrice(pkg.price)}
          </p>
        </div>
      );
    }

    if (props.needsPackage) {
      nudge = (
        <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold flex-shrink-0 ml-auto">
          <span className="w-4 h-4 rounded-full bg-amber-400/30 flex items-center justify-center text-[10px] font-black">
            !
          </span>
          <span className="hidden sm:inline">Pilih paket dulu</span>
        </div>
      );
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cta"
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Scrim — hints at content beneath without blocking it */}
          <div className="absolute inset-x-0 bottom-0 h-[calc(100%+40px)] bg-gradient-to-t from-[#f3f6fc] via-[#f3f6fc]/80 to-transparent pointer-events-none" />

          <div className="relative pointer-events-auto max-w-6xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow:
                  "0 8px 40px rgba(10,45,135,0.35), 0 2px 8px rgba(10,45,135,0.15)",
              }}
            >
              {/* Summary strip */}
              <div className="bg-gradient-to-r from-[#06195c] via-[#0a2d87] to-[#1a52c8] px-4 py-3 flex items-center gap-3">
                {left}
                {nudge}
                {right && !nudge && <div className="ml-auto">{right}</div>}
              </div>

              {/* Continue button — amber accent so it pops against the dark strip */}
              <motion.button
                type="button"
                disabled={!canContinue}
                onClick={onContinue}
                whileTap={canContinue ? { scale: 0.98 } : {}}
                className={cn(
                  "group relative w-full py-4 font-black text-sm tracking-wide transition-all duration-200 overflow-hidden",
                  "flex items-center justify-center gap-2.5",
                  canContinue
                    ? "bg-[#ffc107] text-[#0a2d87] hover:bg-[#ffcd38] active:bg-[#f0b800]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed",
                )}
              >
                {canContinue && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                )}
                <ChevronRight className="w-4 h-4" />
                Lanjut ke Formulir Pendaftaran
                {canContinue && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Spacer height reserved for the sticky bar so list content isn't clipped.
// summary (48px) + button (56px) + padding (16px) + safe-area buffer (24px) = 144px
const STICKY_BAR_SPACER = "pb-36";

/* =========================================================
   BATCH STEP
========================================================= */

function BatchStep({
  programTitle,
  batches,
  isLoading,
  selectedBatchId,
  selectedPackageId,
  onSelectBatch,
  onSelectPackage,
  onContinue,
  onBack,
}: {
  programTitle: string;
  batches: BatchListItem[];
  isLoading: boolean;
  selectedBatchId: string | null;
  selectedPackageId: string | null;
  onSelectBatch: (batch: BatchListItem) => void;
  onSelectPackage: (pkg: PackageItem) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(
    selectedBatchId,
  );

  useEffect(() => {
    if (selectedBatchId && expandedBatchId !== selectedBatchId) {
      setExpandedBatchId(selectedBatchId);
    }
  }, [selectedBatchId]);

  const handleToggle = (batch: BatchListItem) => {
    if (expandedBatchId === batch.id) {
      setExpandedBatchId(null);
    } else {
      onSelectBatch(batch);
      setExpandedBatchId(batch.id);
    }
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  return (
    <MotionConfig reducedMotion="user">
      <div>
        <div className="mb-6">
          <div className="mb-4">
            <BackButton onClick={onBack} label="Kembali ke Program" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
            Pilih Jadwal & Paket
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Batch tersedia untuk{" "}
            <span className="font-semibold text-[#0a2d87]">{programTitle}</span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 rounded-xl border border-[#1a52c8]/15 bg-[#1a52c8]/4 px-4 py-3 mb-5"
        >
          <div className="w-5 h-5 rounded-full bg-[#1a52c8]/20 text-[#1a52c8] flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
            i
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Klik batch untuk melihat paket harga yang tersedia, lalu pilih paket
            yang sesuai sebelum melanjutkan.
          </p>
        </motion.div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {!isLoading && batches.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-bold text-slate-500 text-sm">
              Belum ada batch yang dibuka saat ini.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cek lagi nanti atau hubungi kami.
            </p>
          </div>
        )}

        {!isLoading && batches.length > 0 && (
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.07, delayChildren: 0.03 },
              },
            }}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {batches.map((batch) => (
              <motion.div
                key={batch.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 320, damping: 28 },
                  },
                }}
              >
                <BatchCard
                  batch={batch}
                  isExpanded={expandedBatchId === batch.id}
                  isSelected={selectedBatchId === batch.id}
                  selectedPackageId={
                    selectedBatchId === batch.id ? selectedPackageId : null
                  }
                  onToggle={() => handleToggle(batch)}
                  onSelectPackage={onSelectPackage}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Spacer so list content isn't hidden behind sticky bar */}
        {selectedBatch && <div className={STICKY_BAR_SPACER} />}

        <StickyCtaBar
          mode="batch"
          selectedBatch={selectedBatch}
          selectedPackage={
            batches
              .find((b) => b.id === selectedBatchId)
              ?.packages.find((p) => p.id === selectedPackageId) ?? null
          }
          canContinue={
            !!selectedBatch &&
            (selectedBatch.packages.length === 0 || !!selectedPackageId)
          }
          needsPackage={
            !!selectedBatch &&
            selectedBatch.packages.length > 0 &&
            !selectedPackageId
          }
          onContinue={onContinue}
        />
      </div>
    </MotionConfig>
  );
}

/* =========================================================
   ★ INLINE PACKAGE RE-SELECTOR  (shown at top of form step)
========================================================= */

function InlinePackageReselector({
  packages,
  selectedId,
  onSelect,
}: {
  packages: PackageItem[];
  selectedId: string | null;
  onSelect: (pkg: PackageItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPkg = packages.find((p) => p.id === selectedId) ?? null;

  if (packages.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border-2 border-[#1a52c8]/20 bg-[#f7f9ff] overflow-hidden">
      {/* Header / current selection summary */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#1a52c8]/4 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-[#1a52c8]/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-[#1a52c8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Paket Dipilih
          </p>
          {selectedPkg ? (
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-sm font-bold text-[#0a2d87]">
                {selectedPkg.title}
              </p>
              <span className="text-sm font-black text-[#1a52c8]">
                {formatPrice(selectedPkg.price)}
              </span>
              {selectedPkg.originalPrice &&
                selectedPkg.originalPrice > selectedPkg.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(selectedPkg.originalPrice)}
                  </span>
                )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-amber-600 mt-0.5">
              Pilih paket terlebih dahulu
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedPkg && (
            <span className="text-[10px] font-semibold text-[#1a52c8] bg-[#1a52c8]/10 px-2 py-0.5 rounded-full">
              Ganti
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-1.5 border-t border-[#1a52c8]/10">
              {packages.map((pkg, idx) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  index={idx}
                  isSelected={selectedId === pkg.id}
                  onSelect={() => {
                    onSelect(pkg);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

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

/* =========================================================
   LOADING / EMPTY
========================================================= */

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

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  const stats = [
    { icon: <Users className="w-4 h-4" />, value: "5.000+", label: "Pelajar" },
    { icon: <Star className="w-4 h-4" />, value: "4,9", label: "Rating" },
    { icon: <Trophy className="w-4 h-4" />, value: "50+", label: "Program" },
    { icon: <Zap className="w-4 h-4" />, value: "10+", label: "Tahun" },
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
                Pendaftaran Dibuka
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 tracking-tight">
                Mulai Perjalanan{" "}
                <span className="relative">
                  <span className="relative z-10 text-[#ffc107]">Belajar</span>
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#ffc107]/20 rounded-full -z-0" />
                </span>{" "}
                Anda
              </h1>
              <p className="text-blue-200/75 text-sm md:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
                Pilih program Anda dan daftar dalam hitungan menit. Dipandu oleh
                ahli, berbasis komunitas, hasil terjamin.
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

/* =========================================================
   MOBILE PROGRESS BAR
========================================================= */

function MobileProgressBar({
  step,
  scheduleType,
}: {
  step: Step;
  scheduleType: "permanent" | "scheduled";
}) {
  const steps = buildStepOrder(scheduleType);
  const currentIdx = steps.indexOf(step);
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

/* =========================================================
   RIGHT PANEL (sidebar)
========================================================= */

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

function RightPanel({
  category,
  program,
  batch,
  selectedPackage,
  step,
  scheduleType,
}: {
  category: CategorySnap | null;
  program: ProgramListItem | ProgramSnap | null;
  batch: BatchSnap | null;
  selectedPackage: PackageItem | null;
  step: Step;
  scheduleType: "permanent" | "scheduled";
}) {
  const displayPrice =
    selectedPackage?.price ??
    (batch ? (cheapestPackage(batch.packages)?.price ?? null) : null) ??
    (program as ProgramListItem)?.startingPrice ??
    null;

  const stepOrder = buildStepOrder(scheduleType);

  return (
    <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#06195c] via-[#0a2d87] to-[#1a52c8] p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-[#ffc107]/10" />
          <p className="relative text-[10px] font-black uppercase tracking-widest text-[#ffc107] mb-1.5">
            Pilihan Anda
          </p>
          <p className="relative text-white font-bold text-sm leading-snug">
            {program?.title ?? category?.label ?? "Mari kita mulai…"}
          </p>
        </div>
        <div className="p-4 space-y-3.5">
          <SummaryRow
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Kategori"
            value={category?.label}
            empty="Belum dipilih"
            active={!!category}
          />
          <SummaryRow
            icon={<BookOpen className="w-3.5 h-3.5" />}
            label="Program"
            value={program?.title}
            empty="Belum dipilih"
            active={!!program}
          />
          {scheduleType === "scheduled" && (
            <SummaryRow
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Batch"
              value={batch?.title}
              empty="Belum dipilih"
              active={!!batch}
            />
          )}
          {selectedPackage && (
            <SummaryRow
              icon={<Package className="w-3.5 h-3.5" />}
              label="Paket"
              value={selectedPackage.title}
              active
            />
          )}
          {batch?.startDate && (
            <SummaryRow
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Mulai"
              value={formatDate(batch.startDate) ?? undefined}
              active
            />
          )}
          {displayPrice != null && (
            <SummaryRow
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label={selectedPackage ? "Harga" : "Mulai dari"}
              value={formatPrice(displayPrice)}
              active
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Progres
        </p>
        <div className="space-y-1.5">
          {stepOrder.map((s, i) => {
            const labels: Record<Step, string> = {
              category: "Kategori",
              program: "Program",
              package: "Paket",
              batch: "Batch",
              form: "Data Diri",
            };
            const isActive = s === step;
            const isDone = stepOrder.indexOf(step) > i;
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
                    Sekarang
                  </span>
                )}
                {isDone && <Check className="ml-auto w-3 h-3 text-[#1a52c8]" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Mengapa Bergabung?
        </p>
        {[
          {
            icon: <Shield className="w-3.5 h-3.5" />,
            text: "Pendaftaran aman & terpercaya",
          },
          {
            icon: <Trophy className="w-3.5 h-3.5" />,
            text: "Program pemenang penghargaan",
          },
          {
            icon: <Heart className="w-3.5 h-3.5" />,
            text: "Dipercaya 5.000+ pelajar",
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

/* =========================================================
   ONLINE FORM
========================================================= */

function OnlineForm({
  methods,
  onSubmit,
  isLoading,
}: {
  methods: UseFormReturn<OnlineFormData>;
  onSubmit: (d: OnlineFormData) => void;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
      <motion.div variants={stagger.item}>
        <FormField
          label="Nama Lengkap"
          required
          error={errors.fullName?.message}
        >
          <StyledInput
            {...register("fullName")}
            icon={<User className="size-4" />}
            placeholder="Nama lengkap Anda"
            error={!!errors.fullName}
          />
        </FormField>
      </motion.div>
      <motion.div variants={stagger.item}>
        <FormField
          label="Nomor WhatsApp"
          required
          error={errors.whatsapp?.message}
        >
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
        </FormField>
      </motion.div>
      <motion.div variants={stagger.item}>
        <FormField label="Alamat Email" error={errors.email?.message}>
          <StyledInput
            {...register("email")}
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="Opsional"
            error={!!errors.email}
          />
        </FormField>
      </motion.div>
      <motion.div variants={stagger.item}>
        <FormField label="Usia" error={errors.age?.message} required>
          <StyledInput
            {...register("age")}
            type="number"
            placeholder="Usia anda"
            error={!!errors.age}
          />
        </FormField>
      </motion.div>
      <motion.div variants={stagger.item} className="pt-2">
        <SubmitButton isLoading={isLoading} />
      </motion.div>
    </form>
  );
}

/* =========================================================
   OFFLINE FORM
========================================================= */

function OfflineForm({
  methods,
  onSubmit,
  isLoading,
}: {
  methods: UseFormReturn<OfflineFormData>;
  onSubmit: (d: OfflineFormData) => void;
  isLoading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;
  const alergi = watch("alergi");

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
      <FormSection title="Data Anak" icon="user">
        <motion.div variants={stagger.item}>
          <ImageUploadWithRemoveBg
            label="Foto Anak (opsional)"
            onChange={(file) => setValue("fotoAnak", file)}
          />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FormField
              label="Nama Lengkap"
              htmlFor="name"
              required
              error={errors.nama?.message}
            >
              <StyledInput
                {...register("nama")}
                placeholder="Nama lengkap anak"
                error={!!errors.nama}
              />
            </FormField>
          </motion.div>
          <motion.div variants={stagger.item}>
            <FormField
              label="Nama Panggilan"
              required
              error={errors.panggilan?.message}
            >
              <StyledInput
                {...register("panggilan")}
                placeholder="Biasa dipanggil apa"
                error={!!errors.panggilan}
              />
            </FormField>
          </motion.div>
        </div>
        <motion.div variants={stagger.item}>
          <FormField
            label="Jenis Kelamin"
            required
            error={errors.jenisKelamin?.message}
          >
            <RadioGroup
              options={[
                { value: "L", label: "Laki-laki (L)" },
                { value: "P", label: "Perempuan (P)" },
              ]}
              value={watch("jenisKelamin")}
              onChange={(v) => setValue("jenisKelamin", v as "L" | "P")}
            />
          </FormField>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FormField
              label="Tempat Lahir"
              required
              error={errors.tempatLahir?.message}
            >
              <StyledInput
                {...register("tempatLahir")}
                placeholder="Mis. Jakarta"
                error={!!errors.tempatLahir}
              />
            </FormField>
          </motion.div>
          <motion.div variants={stagger.item}>
            <FormField
              label="Tanggal Lahir"
              required
              error={errors.tanggalLahir?.message}
            >
              <StyledInput
                {...register("tanggalLahir")}
                type="date"
                error={!!errors.tanggalLahir}
              />
            </FormField>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.div variants={stagger.item}>
            <FormField required label="Usia" error={errors.usia?.message}>
              <StyledInput
                {...register("usia")}
                type="number"
                placeholder="Tahun"
                error={!!errors.usia}
              />
            </FormField>
          </motion.div>
          <motion.div variants={stagger.item}>
            <FormField required label="Kelas" error={errors.kelas?.message}>
              <StyledInput
                {...register("kelas")}
                placeholder="Mis. 6 SD"
                error={!!errors.kelas}
              />
            </FormField>
          </motion.div>
          <motion.div
            variants={stagger.item}
            className="col-span-2 sm:col-span-1"
          >
            <FormField
              required
              label="Kota Asal"
              error={errors.kotaAsal?.message}
            >
              <StyledInput
                {...register("kotaAsal")}
                placeholder="Kota asal"
                error={!!errors.kotaAsal}
              />
            </FormField>
          </motion.div>
        </div>
        <motion.div variants={stagger.item}>
          <FormField
            required
            label="Nama Sekolah"
            error={errors.sekolah?.message}
          >
            <StyledInput
              {...register("sekolah")}
              icon={<GraduationCap className="w-4 h-4" />}
              placeholder="Sekolah saat ini"
              error={!!errors.sekolah}
            />
          </FormField>
        </motion.div>
      </FormSection>

      <FormSection title="Orang Tua / Wali" icon="users">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FormField
              required
              label="Nama Lengkap Orang Tua"
              error={errors.namaOrtu?.message}
            >
              <StyledInput
                {...register("namaOrtu")}
                icon={<User className="size-4" />}
                placeholder="Nama orang tua"
                error={!!errors.namaOrtu}
              />
            </FormField>
          </motion.div>
          <motion.div variants={stagger.item}>
            <FormField
              required
              label="WhatsApp Orang Tua"
              error={errors.hpOrtu?.message}
            >
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
            </FormField>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={stagger.item}>
            <FormField label="HP Anak" error={errors.hpAnak?.message}>
              <Controller
                name="hpAnak"
                control={control}
                render={({ field }) => (
                  <PhoneInput value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </motion.div>
          <motion.div variants={stagger.item}>
            <FormField label="Email" error={errors.email?.message}>
              <StyledInput
                {...register("email")}
                type="email"
                icon={<Mail className="size-4" />}
                placeholder="Opsional"
                error={!!errors.email}
              />
            </FormField>
          </motion.div>
        </div>
      </FormSection>

      <FormSection title="Informasi Tambahan" icon="sparkles">
        <motion.div variants={stagger.item}>
          <FormField
            label="Apakah Anda alumni?"
            required
            error={errors.alumni?.message}
          >
            <RadioGroup
              options={[
                { value: "yes", label: "Ya, alumni" },
                { value: "no", label: "Peserta baru" },
              ]}
              value={watch("alumni")}
              onChange={(v) => setValue("alumni", v as "yes" | "no")}
            />
          </FormField>
        </motion.div>
        <motion.div variants={stagger.item}>
          <FormField
            label="Dari mana Anda mengetahui kami?"
            error={errors.sumberInfo?.message}
            required
          >
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
          </FormField>
        </motion.div>
        <motion.div variants={stagger.item}>
          <FormField
            label="Apakah anak memiliki alergi?"
            required
            error={errors.alergi?.message}
          >
            <RadioGroup
              options={[
                { value: "yes", label: "Ya" },
                { value: "no", label: "Tidak" },
              ]}
              value={watch("alergi")}
              onChange={(v) => setValue("alergi", v as "yes" | "no")}
            />
          </FormField>
          <AnimatePresence>
            {alergi === "yes" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <FormField
                    label="Detail Alergi"
                    error={errors.detailAlergi?.message}
                  >
                    <StyledInput
                      {...register("detailAlergi")}
                      placeholder="Jelaskan alergi yang dimiliki"
                    />
                  </FormField>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={stagger.item}>
          <FormField
            required
            label="Ukuran Kaos"
            error={errors.ukuranKaos?.message}
          >
            <Controller
              name="ukuranKaos"
              control={control}
              render={({ field }) => (
                <TShirtSizeInput
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.ukuranKaos}
                  diagramImage="/images/tshirt-size-guide.png"
                />
              )}
            />
          </FormField>
        </motion.div>
        <motion.div variants={stagger.item}>
          <FormField label="Catatan Tambahan" error={errors.catatan?.message}>
            <StyledTextarea
              {...register("catatan")}
              rows={2}
              maxLength={300}
              placeholder="Informasi lain yang ingin disampaikan..."
            />
          </FormField>
        </motion.div>
        <motion.div variants={stagger.item}>
          <FormField
            required
            label="Harapan dari program ini"
            error={errors.harapan?.message}
          >
            <StyledTextarea
              {...register("harapan")}
              rows={4}
              maxLength={500}
              placeholder="Apa yang Anda harapkan anak Anda dapatkan dari program ini?"
              error={!!errors.harapan}
            />
          </FormField>
        </motion.div>
      </FormSection>

      <motion.div variants={stagger.item} className="pt-2">
        <SubmitButton isLoading={isLoading} />
      </motion.div>
    </form>
  );
}

/* =========================================================
   SUBMIT BUTTON
========================================================= */

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
          Mengirim...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Kirim Pendaftaran
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </button>
  );
}

/* =========================================================
   SUCCESS BANNER
========================================================= */

function SuccessBanner({
  result,
  onRegisterAnother,
}: {
  result: RegistrationResult;
  onRegisterAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    navigator.clipboard.writeText(result.orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="py-6"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06195c] via-[#0a2d87] to-[#1a52c8] p-8 mb-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            delay: 0.15,
          }}
          className="relative w-20 h-20 rounded-full bg-[#ffc107] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-[#ffc107]/40"
        >
          <PartyPopper className="w-9 h-9 text-[#0a2d87]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-[11px] font-black uppercase tracking-widest text-[#ffc107] mb-2">
            Pendaftaran Berhasil!
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
            Selamat, {result.customerName}! 🎉
          </h2>
          <p className="text-blue-200/80 text-sm max-w-sm mx-auto">
            Tempat Anda di{" "}
            <span className="text-white font-semibold">
              {result.programTitle}
            </span>{" "}
            telah dikonfirmasi. Kami akan menghubungi Anda melalui WhatsApp
            segera.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4 shadow-sm"
      >
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Detail Pemesanan
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1a52c8]/5 border border-[#1a52c8]/15">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-0.5">
                ID Pesanan
              </p>
              <p className="text-sm font-black text-[#0a2d87] tracking-wider font-mono">
                #{result.orderId}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyOrderId}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a52c8]/40 hover:text-[#1a52c8]",
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Salin
                </>
              )}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: <BookOpen className="w-3.5 h-3.5" />,
                label: "Program",
                value: result.programTitle,
              },
              ...(result.batchTitle
                ? [
                    {
                      icon: <Calendar className="w-3.5 h-3.5" />,
                      label: "Batch",
                      value: result.batchTitle,
                    },
                  ]
                : []),
              ...(result.packageTitle
                ? [
                    {
                      icon: <Package className="w-3.5 h-3.5" />,
                      label: "Paket",
                      value: result.packageTitle,
                    },
                  ]
                : []),
              ...(result.batchStartDate
                ? [
                    {
                      icon: <Clock className="w-3.5 h-3.5" />,
                      label: "Mulai",
                      value: formatDate(result.batchStartDate) ?? "",
                    },
                  ]
                : []),
              ...(result.batchLocation
                ? [
                    {
                      icon: <MapPin className="w-3.5 h-3.5" />,
                      label: "Lokasi",
                      value: result.batchLocation,
                    },
                  ]
                : []),
              ...(result.price != null
                ? [
                    {
                      icon: <Sparkles className="w-3.5 h-3.5" />,
                      label: "Total Pembayaran",
                      value: formatPrice(result.price),
                      highlight: true,
                    },
                  ]
                : []),
              {
                icon: <Phone className="w-3.5 h-3.5" />,
                label: "WhatsApp",
                value: result.phone,
              },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    (row as any).highlight
                      ? "bg-[#ffc107]/20 text-[#0a2d87]"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {row.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    {row.label}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold truncate",
                      (row as any).highlight
                        ? "text-[#1a52c8]"
                        : "text-slate-800",
                    )}
                  >
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5"
      >
        <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2.5">
          Langkah Selanjutnya
        </p>
        <div className="space-y-2">
          {[
            "Tim kami akan menghubungi Anda melalui WhatsApp dalam 1×24 jam",
            "Anda akan menerima instruksi pembayaran dan detail konfirmasi",
            "Simpan ID Pesanan di atas untuk pertanyaan lebih lanjut",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {s}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegisterAnother}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#1a52c8] to-[#0a2d87] text-white font-black text-sm tracking-wide shadow-lg shadow-[#1a52c8]/30 hover:shadow-xl hover:shadow-[#1a52c8]/40 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Daftar Program Lain
        </motion.button>
        <motion.a
          href={`https://wa.me/?text=${encodeURIComponent(`Halo, saya baru mendaftar program ${result.programTitle}. ID Pesanan saya: #${result.orderId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 rounded-2xl bg-[#25D366] text-white font-black text-sm tracking-wide shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Chat via WhatsApp
        </motion.a>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   MAIN PAGE CLIENT
========================================================= */

export default function ProgramRegisterPageClient({
  initialData,
}: {
  initialData: RegisterContext;
}) {
  // ── Derive initial schedule type ────────────────────────
  const initialScheduleType: "permanent" | "scheduled" =
    initialData?.program?.scheduleType ?? "scheduled";

  const [scheduleType, setScheduleType] = useState<"permanent" | "scheduled">(
    initialScheduleType,
  );

  const deriveInitialStep = (): Step => {
    if (!initialData) return "category";
    if (initialData.program && initialData.batch) return "form";
    if (
      initialData.program &&
      initialData.program.scheduleType === "permanent"
    ) {
      // If packages loaded and one selected → go to form; else → package step
      return initialData.selected.packageId ? "form" : "package";
    }
    if (initialData.program) return "batch";
    if (initialData.category) return "program";
    return "category";
  };

  const [step, setStep] = useState<Step>(deriveInitialStep);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] =
    useState<RegistrationResult | null>(null);

  const [highestStepReached, setHighestStepReached] = useState<number>(() =>
    getStepIndex(deriveInitialStep(), initialScheduleType),
  );
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(() => {
    const s = new Set<Step>();
    const init = deriveInitialStep();
    const order = buildStepOrder(initialScheduleType);
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    initialData?.selected.packageId ?? null,
  );
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(
    () => {
      // Pre-populate selected package from initialData if available
      const pkgId = initialData?.selected.packageId;
      if (!pkgId) return null;
      const allPkgs = [
        ...(initialData?.programPackages ?? []),
        ...(initialData?.batch?.packages ?? []),
      ];
      return allPkgs.find((p) => p.id === pkgId) ?? null;
    },
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
  // ★ packages for permanent programs
  const [directPackages, setDirectPackages] = useState<PackageItem[]>(
    initialData?.programPackages ?? [],
  );

  // ★ Fix 4: Hoist form state to parent so it survives step navigation.
  // Both form instances live here and are never unmounted — only the form step
  // renders them visibly, but their useForm state is kept alive at all times.
  const onlineFormMethods = useForm<OnlineFormData>({
    resolver: makeResolver(onlineFormSchema) as any,
    defaultValues: { fullName: "", email: "", whatsapp: "" },
  });
  const offlineFormMethods = useForm<OfflineFormData>({
    resolver: makeResolver(offlineFormSchema) as any,
    defaultValues: {
      jenisKelamin: "L",
      alumni: "no",
      alergi: "no",
      hpOrtu: "",
      ukuranKaos: "",
      sumberInfo: "",
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  const formCardRef = useRef<HTMLDivElement>(null);

  const registerMutation = trpc.orders.registerProgram.useMutation({
    onSuccess: (data) => {
      setRegistrationResult(data);
      setCompletedSteps((prev) => new Set([...prev, "form"]));
      // ★ Clear URL params — enrollment is done, stale params would re-trigger SSR context
      router.replace(pathname, { scroll: false });
    },
  });

  const updateUrl = useCallback(
    (cat?: string, prog?: string, batch?: string, pkg?: string) => {
      const p = new URLSearchParams();
      if (cat) p.set("category", cat);
      if (prog) p.set("program", prog);
      if (batch) p.set("batch", batch);
      // ★ Package slug in URL — only for permanent programs (no batch)
      if (pkg && !batch) p.set("package", pkg);
      const qs = p.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );

  // ── Queries ──────────────────────────────────────────────
  const categoriesQuery = trpc.programs.getRegisterCategories.useQuery(
    undefined,
    { enabled: step === "category" },
  );
  const programsQuery = trpc.programs.getProgramsForRegister.useQuery(
    { categoryId: selectedCategoryId ?? undefined },
    { enabled: step === "program" && !!selectedCategoryId },
  );
  const batchesQuery = trpc.programs.getProgramBatchesForRegister.useQuery(
    { programId: selectedProgramId ?? undefined },
    { enabled: step === "batch" && !!selectedProgramId },
  );
  // ★ New query for permanent program packages
  const programPackagesQuery =
    trpc.programs.getProgramPackagesForRegister.useQuery(
      { programId: selectedProgramId ?? undefined },
      {
        enabled:
          step === "package" &&
          !!selectedProgramId &&
          scheduleType === "permanent",
      },
    );

  // Merge server packages with client-fetched ones for permanent programs
  const availablePackages: PackageItem[] =
    programPackagesQuery.data ?? directPackages;

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
    const nextIdx = getStepIndex(next, scheduleType);
    if (nextIdx > highestStepReached) setHighestStepReached(nextIdx);
    scrollToForm();
  };

  const markComplete = (...steps: Step[]) =>
    setCompletedSteps((prev) => new Set([...prev, ...steps]));
  const markIncomplete = (...steps: Step[]) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      steps.forEach((s) => next.delete(s));
      return next;
    });
  };

  const handleNavigate = (target: Step) => {
    const targetIdx = getStepIndex(target, scheduleType);
    const currentIdx = getStepIndex(step, scheduleType);
    if (targetIdx <= highestStepReached || completedSteps.has(target)) {
      goTo(target, targetIdx < currentIdx ? -1 : 1);
    }
  };

  // ── Handlers ─────────────────────────────────────────────

  const handleSelectCategory = (cat: CategorySnap) => {
    setSelectedProgramId(null);
    setSelectedBatchId(null);
    setSelectedPackageId(null);
    setSelectedPackage(null);
    setProgramSnap(null);
    setProgramListSnap(null);
    setBatchSnap(null);
    setDirectPackages([]);
    setSelectedCategoryId(cat.id);
    setCategorySnap(cat);
    updateUrl(cat.slug);
    markComplete("category");
    markIncomplete("program", "package", "batch", "form");
    goTo("program");
  };

  const handleSelectProgram = (prog: ProgramListItem) => {
    setSelectedBatchId(null);
    setSelectedPackageId(null);
    setSelectedPackage(null);
    setBatchSnap(null);
    setDirectPackages([]);
    setSelectedProgramId(prog.id);
    setProgramListSnap(prog);
    setProgramSnap({
      id: prog.id,
      slug: prog.slug,
      title: prog.title,
      shortDesc: prog.shortDesc,
      thumbnailUrl: prog.thumbnailUrl,
      registrationType: prog.registrationType as "online" | "offline",
      categoryId: selectedCategoryId ?? "",
      level: prog.level,
      format: prog.format,
      scheduleType: prog.scheduleType,
    });
    // ★ Update flow type
    setScheduleType(prog.scheduleType);
    updateUrl(categorySnap?.slug, prog.slug);
    markComplete("program");
    markIncomplete("package", "batch", "form");

    // ★ Branch: permanent → package step; scheduled → batch step
    if (prog.scheduleType === "permanent") {
      goTo("package");
    } else {
      goTo("batch");
    }
  };

  const handleSelectBatch = (batch: BatchListItem) => {
    setSelectedBatchId(batch.id);
    // Don't reset package selection if same batch re-expanded
    if (selectedBatchId !== batch.id) {
      setSelectedPackageId(null);
      setSelectedPackage(null);
    }
    setBatchSnap({
      id: batch.id,
      slug: batch.slug,
      title: batch.title,
      startDate: batch.startDate,
      endDate: batch.endDate,
      mode: batch.mode,
      location: batch.location,
      schedules: batch.schedules,
      capacity: batch.capacity,
      enrolledCount: batch.enrolledCount,
      packages: batch.packages,
    });
    updateUrl(categorySnap?.slug, programSnap?.slug, batch.slug);
    markIncomplete("form");
  };

  const handleSelectPackage = (pkg: PackageItem) => {
    setSelectedPackageId(pkg.id);
    setSelectedPackage(pkg);
    // ★ Reflect package in URL for permanent programs so the link is shareable
    if (scheduleType === "permanent") {
      updateUrl(categorySnap?.slug, programSnap?.slug, undefined, pkg.slug);
    }
  };

  // ★ Package step continue (permanent programs)
  const handlePackageContinue = () => {
    if (!selectedPackageId) {
      toast.error("Pilih paket harga terlebih dahulu.");
      return;
    }
    markComplete("package");
    goTo("form");
  };

  // Batch step continue (scheduled programs)
  const handleBatchContinue = () => {
    const selectedBatch = batchesQuery.data?.find(
      (b) => b.id === selectedBatchId,
    );
    const batchHasPackages = (selectedBatch?.packages.length ?? 0) > 0;

    if (batchHasPackages && !selectedPackageId) {
      toast.error("Pilih paket harga terlebih dahulu sebelum melanjutkan.");
      return;
    }

    markComplete("batch");
    goTo("form");
  };

  // ── Form submit ──────────────────────────────────────────
  const handleFormSubmit = async (data: OnlineFormData | OfflineFormData) => {
    if (!selectedProgramId || !programSnap) {
      toast.error("Tidak ada program yang dipilih. Silakan mulai dari awal.");
      return;
    }

    // ★ Package is always required
    if (!selectedPackageId) {
      toast.error("Silakan pilih paket terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    // ★ Create the loading toast once — every branch below must resolve it
    const toastId = toast.loading(
      programSnap.registrationType === "offline"
        ? "Mengunggah foto & mengirim pendaftaran…"
        : "Mengirim pendaftaran Anda…",
      { duration: Infinity },
    );

    try {
      let fotoUrl: string | undefined;

      if (programSnap.registrationType === "offline") {
        const photoFile = (data as OfflineFormData).fotoAnak as
          | File
          | undefined;
        if (photoFile instanceof File) {
          toast.loading("Mengunggah foto…", { id: toastId });
          const formData = new FormData();
          formData.append("file", photoFile);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(err?.message ?? "Unggah foto gagal");
          }
          const uploadJson = await uploadRes.json();
          fotoUrl = uploadJson.url as string;
        }
      }

      toast.loading("Menyimpan pendaftaran Anda…", { id: toastId });

      if (programSnap.registrationType === "online") {
        const d = data as OnlineFormData;
        await registerMutation.mutateAsync({
          type: "online",
          programId: selectedProgramId,
          batchId: selectedBatchId ?? undefined,
          packageId: selectedPackageId,
          fullName: d.fullName,
          whatsapp: d.whatsapp,
          email: d.email || undefined,
          age: d.age,
        });
      } else {
        const d = data as OfflineFormData;
        if (!selectedBatchId)
          throw new Error(
            "Pemilihan batch wajib dilakukan untuk program luring.",
          );
        await registerMutation.mutateAsync({
          type: "offline",
          programId: selectedProgramId,
          batchId: selectedBatchId,
          packageId: selectedPackageId,
          nama: d.nama,
          panggilan: d.panggilan,
          jenisKelamin: d.jenisKelamin,
          tempatLahir: d.tempatLahir,
          tanggalLahir: d.tanggalLahir,
          usia: d.usia,
          kelas: d.kelas,
          sekolah: d.sekolah,
          kotaAsal: d.kotaAsal,
          namaOrtu: d.namaOrtu,
          hpOrtu: d.hpOrtu,
          hpAnak: d.hpAnak || undefined,
          email: d.email || undefined,
          alumni: d.alumni,
          sumberInfo: d.sumberInfo,
          alergi: d.alergi,
          detailAlergi: d.detailAlergi,
          catatan: d.catatan,
          harapan: d.harapan,
          ukuranKaos: d.ukuranKaos,
          fotoAnak: fotoUrl,
        });
      }

      // ★ Success: resolve loading toast before the onSuccess callback fires
      toast.success("Pendaftaran berhasil dikirim! Selamat datang 🎉", {
        id: toastId,
        duration: 5000,
        icon: "🎉",
      });
      setTimeout(() => {
        formCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (err: any) {
      const message = err?.message ?? "Terjadi kesalahan. Silakan coba lagi.";
      const friendlyMessage = message.includes("full")
        ? "Batch ini sudah penuh. Silakan kembali dan pilih batch lain."
        : message.includes("not found")
          ? "Program atau batch tidak lagi tersedia. Silakan muat ulang dan coba lagi."
          : message.includes("no longer open")
            ? "Batch ini sudah ditutup. Silakan pilih yang lain."
            : message.includes("mismatch")
              ? "Tipe pendaftaran tidak sesuai. Silakan muat ulang dan coba lagi."
              : message;
      // ★ Always pass { id: toastId } so the loading toast is replaced, never orphaned
      toast.error(friendlyMessage, { id: toastId, duration: 7000 });
    } finally {
      // ★ Regardless of outcome, re-enable the submit button
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegistrationResult(null);
    setSelectedCategoryId(null);
    setSelectedProgramId(null);
    setSelectedBatchId(null);
    setSelectedPackageId(null);
    setSelectedPackage(null);
    setCategorySnap(null);
    setProgramSnap(null);
    setProgramListSnap(null);
    setBatchSnap(null);
    setDirectPackages([]);
    setScheduleType("scheduled");
    setCompletedSteps(new Set());
    setHighestStepReached(0);
    router.replace(pathname, { scroll: false });
    goTo("category", -1);
  };

  const warnings = initialData?.warnings ?? [];
  const registrationType = programSnap?.registrationType ?? "online";
  const displayProgram = programListSnap ?? programSnap;

  // Packages available on the form step for re-selection
  const formStepPackages: PackageItem[] =
    scheduleType === "permanent"
      ? availablePackages
      : (batchesQuery.data?.find((b) => b.id === selectedBatchId)?.packages ??
        batchSnap?.packages ??
        []);

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#f3f6fc]">
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 mt-6 pb-16">
        <div className="flex gap-5 items-start">
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

              <AnimatePresence mode="wait">
                {registrationResult ? (
                  <SuccessBanner
                    key="success"
                    result={registrationResult}
                    onRegisterAnother={handleRegisterAnother}
                  />
                ) : (
                  <motion.div key="wizard">
                    <MobileProgressBar
                      step={step}
                      scheduleType={scheduleType}
                    />
                    <StepNavigator
                      currentStep={step}
                      completedSteps={completedSteps}
                      scheduleType={scheduleType}
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
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 36,
                        }}
                      >
                        {/* ── CATEGORY ── */}
                        {step === "category" && (
                          <div>
                            <SectionHeader
                              title="Pilih Kategori"
                              subtitle="Area mana yang ingin Anda jelajahi?"
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

                        {/* ── PROGRAM ── */}
                        {step === "program" && (
                          <div>
                            <SectionHeader
                              title="Pilih Program"
                              subtitle={
                                categorySnap
                                  ? `Program dalam ${categorySnap.label}`
                                  : "Pilih program untuk melanjutkan"
                              }
                              onBack={() => goTo("category", -1)}
                              backLabel="Kembali ke Kategori"
                            />
                            {programsQuery.isLoading && <LoadingGrid />}
                            {programsQuery.data?.length === 0 && (
                              <EmptyState message="Belum ada program tersedia di kategori ini." />
                            )}
                            {programsQuery.data &&
                              programsQuery.data.length > 0 && (
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

                        {/* ★ ── PACKAGE (permanent programs only) ── */}
                        {step === "package" && (
                          <PackageStep
                            programTitle={programSnap?.title ?? ""}
                            packages={availablePackages}
                            isLoading={programPackagesQuery.isLoading}
                            selectedPackageId={selectedPackageId}
                            onSelectPackage={handleSelectPackage}
                            onContinue={handlePackageContinue}
                            onBack={() => goTo("program", -1)}
                          />
                        )}

                        {/* ── BATCH (scheduled programs only) ── */}
                        {step === "batch" && (
                          <BatchStep
                            programTitle={programSnap?.title ?? ""}
                            batches={batchesQuery.data ?? []}
                            isLoading={batchesQuery.isLoading}
                            selectedBatchId={selectedBatchId}
                            selectedPackageId={selectedPackageId}
                            onSelectBatch={handleSelectBatch}
                            onSelectPackage={handleSelectPackage}
                            onContinue={handleBatchContinue}
                            onBack={() => goTo("program", -1)}
                          />
                        )}

                        {/* ── FORM ── */}
                        {step === "form" && (
                          <div>
                            <SectionHeader
                              title="Data Diri"
                              subtitle="Lengkapi pendaftaran Anda di bawah ini"
                              onBack={() =>
                                goTo(
                                  scheduleType === "permanent"
                                    ? "package"
                                    : "batch",
                                  -1,
                                )
                              }
                              backLabel={
                                scheduleType === "permanent"
                                  ? "Kembali ke Paket"
                                  : "Kembali ke Batch"
                              }
                            />

                            {/* ★ Inline package re-selector always shown on form step */}
                            {formStepPackages.length > 0 && (
                              <InlinePackageReselector
                                packages={formStepPackages}
                                selectedId={selectedPackageId}
                                onSelect={handleSelectPackage}
                              />
                            )}

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
                                  ? "Pendaftaran Luring"
                                  : "Pendaftaran Daring"}
                              </span>
                            </div>

                            <motion.div
                              variants={stagger.container}
                              initial="hidden"
                              animate="show"
                            >
                              {registrationType === "online" && (
                                <OnlineForm
                                  methods={onlineFormMethods}
                                  onSubmit={handleFormSubmit}
                                  isLoading={isSubmitting}
                                />
                              )}
                              {registrationType === "offline" && (
                                <OfflineForm
                                  methods={offlineFormMethods}
                                  onSubmit={handleFormSubmit}
                                  isLoading={isSubmitting}
                                />
                              )}
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px flex-1 bg-slate-200/60" />
              <p className="text-xs text-slate-400 whitespace-nowrap">
                Butuh bantuan?{" "}
                <span className="font-semibold text-[#1a52c8] cursor-pointer hover:underline">
                  Chat via WhatsApp
                </span>
              </p>
              <div className="h-px flex-1 bg-slate-200/60" />
            </div>
          </div>

          <RightPanel
            category={categorySnap}
            program={displayProgram}
            batch={batchSnap}
            selectedPackage={selectedPackage}
            step={step}
            scheduleType={scheduleType}
          />
        </div>
      </div>
    </div>
  );
}
