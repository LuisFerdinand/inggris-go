"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Wifi,
  Building2,
  Globe,
  Package,
  Edit3,
  Eye,
  MoreHorizontal,
  Zap,
  TrendingUp,
  CalendarClock,
  Layers,
  ChevronDown,
  UserCircle2,
  Sparkles,
  ArrowRight,
  Timer,
  Star,
  Activity,
  BarChart3,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type BatchStatus =
  | "draft"
  | "open"
  | "ongoing"
  | "full"
  | "closed"
  | "completed";
type BatchMode = "online" | "offline" | "hybrid";

interface BatchSchedule {
  type?: "weekly" | "daily" | "custom";
  label?: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  location?: string;
  note?: string;
}

interface BatchPackage {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  isDefault: boolean;
  features?: string[];
}

interface Teacher {
  id: string;
  name: string;
  avatar?: string | null;
}

interface Batch {
  id: string;
  programId: string;
  title: string;
  slug: string;
  description?: string | null;
  status: BatchStatus;
  mode: BatchMode;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  registrationDeadline?: Date | string | null;
  capacity?: number | null;
  enrolledCount: number;
  location?: string | null;
  timezone?: string | null;
  schedules?: BatchSchedule[] | null;
  notes?: string | null;
  brochureUrl?: string | null;
  teacher?: Teacher | null;
  packages?: BatchPackage[];
  ui: {
    isAlmostFull: boolean;
    isFull: boolean;
    isOpen: boolean;
    isOngoing: boolean;
    occupancyRate: number;
  };
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

interface BatchesTabProps {
  programId: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const batches: Batch[] = [
  {
    id: "batch-1",
    programId: "prog-1",
    title: "January 2026 Intensive",
    slug: "january-2026",
    description:
      "Full-stack cohort with live mentoring, portfolio project, and job placement support.",
    status: "ongoing",
    mode: "online",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42),
    registrationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    capacity: 40,
    enrolledCount: 36,
    timezone: "WIB",
    schedules: [
      {
        type: "weekly",
        days: ["monday", "wednesday", "friday"],
        startTime: "19:00",
        endTime: "21:30",
        label: "Mon / Wed / Fri",
      },
    ],
    teacher: { id: "t1", name: "Aditya Pratama", avatar: null },
    packages: [
      {
        id: "p1",
        title: "Regular Track",
        price: 2500000,
        isDefault: true,
        features: ["Live classes", "Recordings", "Certificate"],
      },
      {
        id: "p2",
        title: "Mentorship Plus",
        price: 4500000,
        originalPrice: 5000000,
        isDefault: false,
        features: ["Everything in Regular", "1:1 Mentoring", "Job referral"],
      },
    ],
    ui: {
      isAlmostFull: true,
      isFull: false,
      isOpen: true,
      isOngoing: true,
      occupancyRate: 0.9,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
  {
    id: "batch-2",
    programId: "prog-1",
    title: "March 2026 Weekend Cohort",
    slug: "march-2026-weekend",
    description:
      "Designed for working professionals. Weekend-only schedule, same quality curriculum.",
    status: "open",
    mode: "hybrid",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 112),
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
    capacity: 30,
    enrolledCount: 18,
    location: "Gedung Cyber 2, Jakarta",
    timezone: "WIB",
    schedules: [
      {
        type: "weekly",
        days: ["saturday", "sunday"],
        startTime: "09:00",
        endTime: "12:00",
        label: "Sat & Sun Morning",
      },
    ],
    teacher: { id: "t2", name: "Sari Dewi", avatar: null },
    packages: [
      {
        id: "p3",
        title: "Hybrid Access",
        price: 3200000,
        isDefault: true,
        features: ["Online + offline access", "Recordings"],
      },
    ],
    ui: {
      isAlmostFull: false,
      isFull: false,
      isOpen: true,
      isOngoing: false,
      occupancyRate: 0.6,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
  {
    id: "batch-3",
    programId: "prog-1",
    title: "May 2026 Evening Batch",
    slug: "may-2026-evening",
    description:
      "Flexible evening schedule. Perfect for those transitioning careers.",
    status: "open",
    mode: "online",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 65),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 155),
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50),
    capacity: 35,
    enrolledCount: 7,
    timezone: "WIB",
    schedules: [
      {
        type: "weekly",
        days: ["tuesday", "thursday"],
        startTime: "20:00",
        endTime: "22:00",
        label: "Tue & Thu Evenings",
      },
    ],
    teacher: { id: "t3", name: "Budi Santoso", avatar: null },
    packages: [
      { id: "p5", title: "Standard", price: 2200000, isDefault: true },
    ],
    ui: {
      isAlmostFull: false,
      isFull: false,
      isOpen: true,
      isOngoing: false,
      occupancyRate: 0.2,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "batch-4",
    programId: "prog-1",
    title: "October 2025 Cohort",
    slug: "october-2025",
    description: "Our first cohort. Proof of concept batch.",
    status: "completed",
    mode: "online",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    registrationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200),
    capacity: 25,
    enrolledCount: 24,
    timezone: "WIB",
    teacher: { id: "t1", name: "Aditya Pratama", avatar: null },
    packages: [],
    ui: {
      isAlmostFull: false,
      isFull: false,
      isOpen: false,
      isOngoing: false,
      occupancyRate: 0.96,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240),
  },
  {
    id: "batch-5",
    programId: "prog-1",
    title: "April 2026 Offline Class",
    slug: "april-2026-offline",
    description: "In-person classroom experience in our Jakarta center.",
    status: "draft",
    mode: "offline",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 135),
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    capacity: 20,
    enrolledCount: 0,
    location: "Ruko Puri Indah, Jakarta Barat",
    timezone: "WIB",
    teacher: null,
    packages: [],
    ui: {
      isAlmostFull: false,
      isFull: false,
      isOpen: false,
      isOngoing: false,
      occupancyRate: 0,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatRelativeDate(date?: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = d.getTime() - now;
  const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7 && diffDays <= 30)
    return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < -7 && diffDays >= -30)
    return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
  const months = Math.round(Math.abs(diffDays) / 30);
  return diffDays > 0
    ? `In ${months} month${months > 1 ? "s" : ""}`
    : `${months} month${months > 1 ? "s" : ""} ago`;
}

function formatShortDate(date?: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function getUrgencyLevel(
  deadline?: Date | string | null,
): "critical" | "warning" | "normal" | null {
  if (!deadline) return null;
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffDays = Math.round(
    (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return null;
  if (diffDays <= 3) return "critical";
  if (diffDays <= 7) return "warning";
  return "normal";
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BatchStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    glow?: string;
  }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100 ",
    text: "text-slate-600",
    border: "border-slate-200 ",
    dot: "bg-slate-400",
  },
  open: {
    label: "Open",
    bg: "bg-blue-50 ",
    text: "text-blue-700 ",
    border: "border-blue-200 ",
    dot: "bg-blue-500",
    glow: "shadow-blue-100 ",
  },
  ongoing: {
    label: "Ongoing",
    bg: "bg-emerald-50",
    text: "text-emerald-700 ",
    border: "border-emerald-200 ",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-100 ",
  },
  full: {
    label: "Full",
    bg: "bg-amber-50 ",
    text: "text-amber-700 ",
    border: "border-amber-200 ",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-slate-100 ",
    text: "text-slate-500 ",
    border: "border-slate-200 ",
    dot: "bg-slate-400",
  },
  closed: {
    label: "Closed",
    bg: "bg-red-50",
    text: "text-red-600 ",
    border: "border-red-200 ",
    dot: "bg-red-400",
  },
};

const MODE_CONFIG: Record<BatchMode, { label: string; icon: React.ReactNode }> =
  {
    online: { label: "Online", icon: <Wifi className="w-3 h-3" /> },
    offline: { label: "In-person", icon: <Building2 className="w-3 h-3" /> },
    hybrid: { label: "Hybrid", icon: <Globe className="w-3 h-3" /> },
  };

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BatchStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "ongoing" ? "animate-pulse" : ""}`}
      />
      {cfg.label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: BatchMode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100  text-slate-600 border border-slate-200 ">
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function CapacityBar({
  enrolled,
  capacity,
  status,
}: {
  enrolled: number;
  capacity?: number | null;
  status: BatchStatus;
}) {
  if (!capacity) return null;
  const pct = Math.min(100, Math.round((enrolled / capacity) * 100));
  const isAlmostFull = pct >= 80 && pct < 100;
  const isFull = pct >= 100;
  const barColor = isFull
    ? "bg-red-400"
    : isAlmostFull
      ? "bg-amber-400"
      : status === "ongoing"
        ? "bg-emerald-500"
        : "bg-blue-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Capacity</span>
        <span className="font-medium tabular-nums">
          {enrolled}
          <span className="text-muted-foreground font-normal">/{capacity}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100  rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function AvatarInitials({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === "md" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";
  return (
    <span
      className={`${sizeClass} rounded-full ${color} font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </span>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function BatchSummaryCards({ batches }: { batches: Batch[] }) {
  const active = batches.filter(
    (b) => b.status === "ongoing" || b.status === "open",
  ).length;
  const totalEnrolled = batches.reduce((acc, b) => acc + b.enrolledCount, 0);
  const closingSoon = batches.filter((b) => {
    if (!b.registrationDeadline) return false;
    const urgency = getUrgencyLevel(b.registrationDeadline);
    return urgency === "critical" || urgency === "warning";
  }).length;
  const upcoming = batches.filter(
    (b) =>
      b.status === "open" && b.startDate && new Date(b.startDate) > new Date(),
  ).length;

  const cards = [
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Active Batches",
      value: active,
      sub: `${batches.filter((b) => b.status === "ongoing").length} ongoing`,
      color: "text-emerald-600 ",
      iconBg: "bg-emerald-50 ",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Total Enrolled",
      value: totalEnrolled,
      sub: `across ${batches.length} batches`,
      color: "text-blue-600 ",
      iconBg: "bg-blue-50 ",
    },
    {
      icon: <Timer className="w-5 h-5" />,
      label: "Closing Soon",
      value: closingSoon,
      sub: closingSoon > 0 ? "registration deadlines" : "all clear",
      color: closingSoon > 0 ? "text-amber-600 " : "text-slate-500",
      iconBg: closingSoon > 0 ? "bg-amber-50 " : "bg-slate-50 ",
    },
    {
      icon: <CalendarClock className="w-5 h-5" />,
      label: "Upcoming Starts",
      value: upcoming,
      sub: "open for enrollment",
      color: "text-violet-600",
      iconBg: "bg-violet-50",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="relative bg-white  border border-slate-200/80 rounded-2xl p-4 overflow-hidden cursor-default"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase truncate">
                {card.label}
              </p>
              <p className={`text-3xl font-bold tabular-nums ${card.color}`}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {card.sub}
              </p>
            </div>
            <div
              className={`${card.iconBg} ${card.color} p-2.5 rounded-xl flex-shrink-0`}
            >
              {card.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";

interface ToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  modeFilter: string;
  setModeFilter: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onCreateBatch: () => void;
}

function BatchToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  modeFilter,
  setModeFilter,
  viewMode,
  setViewMode,
  onCreateBatch,
}: ToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex flex-wrap items-center gap-2"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search batches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 pl-3 pr-7 text-sm bg-white  border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer text-foreground"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="ongoing">Ongoing</option>
          <option value="full">Full</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Mode filter */}
      <div className="relative">
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="h-9 pl-3 pr-7 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer text-foreground"
        >
          <option value="all">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">In-person</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* View toggle */}
      <div className="flex items-center bg-white  border border-slate-200  rounded-xl p-0.5 gap-0.5">
        {(["grid", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
              viewMode === v
                ? "bg-slate-900  text-white "
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "grid" ? (
              <LayoutGrid className="w-3.5 h-3.5" />
            ) : (
              <List className="w-3.5 h-3.5" />
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <Button
        variant="dashboard"
        onClick={onCreateBatch}
        className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-slate-900 e  rounded-xl hover:bg-slate-800  transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Create Batch</span>
      </Button>
    </motion.div>
  );
}

// ─── Featured Batch (Hero) ────────────────────────────────────────────────────

function FeaturedBatchCard({
  batch,
  onView,
  onEdit,
  onManagePackages,
}: {
  batch: Batch;
  onView: (b: Batch) => void;
  onEdit: (b: Batch) => void;
  onManagePackages: (b: Batch) => void;
}) {
  const pct = batch.capacity
    ? Math.min(100, Math.round((batch.enrolledCount / batch.capacity) * 100))
    : 0;
  const schedule = batch.schedules?.[0];
  const deadlineUrgency = getUrgencyLevel(batch.registrationDeadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="relative bg-white  border border-slate-200/80 rounded-3xl overflow-hidden"
    >
      {/* Accent gradient top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50  text-emerald-700  border border-emerald-200 ">
                <Sparkles className="w-3 h-3" /> Featured Active
              </span>
              <StatusBadge status={batch.status} />
              <ModeBadge mode={batch.mode} />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {batch.title}
            </h3>
            {batch.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {batch.description}
              </p>
            )}
          </div>
          {/* Actions (desktop) */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onManagePackages(batch)}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
            >
              <Package className="w-3.5 h-3.5" />
              Packages
            </button>
            <button
              onClick={() => onEdit(batch)}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onView(batch)}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-slate-900  text-white  rounded-xl hover:bg-slate-800  transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {/* Enrollment */}
          <div className="bg-slate-50  rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Enrollment
              </p>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold tabular-nums">
                {batch.enrolledCount}
              </span>
              {batch.capacity && (
                <span className="text-sm text-muted-foreground">
                  / {batch.capacity} seats
                </span>
              )}
            </div>
            {batch.capacity && (
              <>
                <div className="h-2 bg-slate-200  rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.3,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {pct}% filled{pct >= 80 && pct < 100 ? " — almost full!" : ""}
                </p>
              </>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-slate-50  rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Timeline
              </p>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {batch.startDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {formatRelativeDate(batch.startDate)}
                  </span>
                </div>
              )}
              {batch.endDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ends</span>
                  <span className="font-medium">
                    {formatRelativeDate(batch.endDate)}
                  </span>
                </div>
              )}
              {batch.registrationDeadline &&
                new Date(batch.registrationDeadline) > new Date() && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registration</span>
                    <span
                      className={`font-medium ${deadlineUrgency === "critical" ? "text-red-600 " : deadlineUrgency === "warning" ? "text-amber-600 " : ""}`}
                    >
                      {formatRelativeDate(batch.registrationDeadline)}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Schedule + Teacher */}
          <div className="bg-slate-50  rounded-2xl p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Schedule
              </p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            {schedule ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {schedule.label || schedule.type}
                </p>
                {schedule.startTime && (
                  <p className="text-sm text-muted-foreground">
                    {schedule.startTime} – {schedule.endTime} {batch.timezone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No schedule set</p>
            )}
            {batch.teacher && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 ">
                <AvatarInitials name={batch.teacher.name} size="sm" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {batch.teacher.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Packages summary */}
        {batch.packages && batch.packages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Packages:</span>
            {batch.packages.map((pkg) => (
              <span
                key={pkg.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${pkg.isDefault ? "bg-violet-50  text-violet-700  border border-violet-200 " : "bg-slate-100  text-slate-600  border border-slate-200 "}`}
              >
                {pkg.isDefault && <Star className="w-2.5 h-2.5" />}
                {pkg.title} · {formatPrice(pkg.price)}
              </span>
            ))}
          </div>
        )}

        {/* Mobile actions */}
        <div className="flex sm:hidden items-center gap-2 flex-wrap">
          <button
            onClick={() => onView(batch)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 text-sm font-medium bg-slate-900  text-white  rounded-xl"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
          <button
            onClick={() => onManagePackages(batch)}
            className="h-9 w-9 flex items-center justify-center border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground"
          >
            <Package className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(batch)}
            className="h-9 w-9 flex items-center justify-center border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Batch Card ───────────────────────────────────────────────────────────────

function BatchCard({
  batch,
  viewMode,
  onView,
  onEdit,
  onManagePackages,
  index,
}: {
  batch: Batch;
  viewMode: ViewMode;
  onView: (b: Batch) => void;
  onEdit: (b: Batch) => void;
  onManagePackages: (b: Batch) => void;
  index: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deadlineUrgency = getUrgencyLevel(batch.registrationDeadline);
  const isUpcoming = batch.startDate && new Date(batch.startDate) > new Date();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.35,
          delay: index * 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="group bg-white  border border-slate-200/80  rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-slate-300  transition-all"
      >
        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[batch.status].dot} ${batch.status === "ongoing" ? "animate-pulse" : ""}`}
        />

        {/* Title + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {batch.title}
            </span>
            <StatusBadge status={batch.status} />
            <ModeBadge mode={batch.mode} />
          </div>
          {batch.teacher && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {batch.teacher.name}
            </p>
          )}
        </div>

        {/* Enrollment */}
        <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
          <span className="text-sm font-medium tabular-nums">
            {batch.enrolledCount}
            {batch.capacity ? `/${batch.capacity}` : ""}
          </span>
          {batch.capacity && (
            <CapacityBar
              enrolled={batch.enrolledCount}
              capacity={batch.capacity}
              status={batch.status}
            />
          )}
        </div>

        {/* Date */}
        <div className="hidden lg:block text-xs text-muted-foreground text-right min-w-[100px]">
          {batch.startDate && <div>{formatRelativeDate(batch.startDate)}</div>}
          {deadlineUrgency && batch.registrationDeadline && (
            <div
              className={
                deadlineUrgency === "critical"
                  ? "text-red-500"
                  : "text-amber-500"
              }
            >
              closes {formatRelativeDate(batch.registrationDeadline)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(batch)}
            className="h-7 px-2.5 text-xs font-medium border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
          >
            View
          </button>
          <button
            onClick={() => onEdit(batch)}
            className="h-7 w-7 flex items-center justify-center border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group bg-white  border border-slate-200/80  rounded-2xl overflow-hidden hover:border-slate-300  hover:shadow-sm transition-all"
    >
      {/* Status accent */}
      <div
        className={`h-0.5 w-full ${
          batch.status === "ongoing"
            ? "bg-emerald-400"
            : batch.status === "open"
              ? "bg-blue-400"
              : batch.status === "draft"
                ? "bg-slate-300"
                : batch.status === "completed"
                  ? "bg-slate-400"
                  : "bg-slate-300"
        }`}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
              {batch.title}
            </h4>
          </div>
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100  transition-colors text-muted-foreground opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-white  border border-slate-200  rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                >
                  {[
                    {
                      label: "View Details",
                      icon: <Eye className="w-3.5 h-3.5" />,
                      action: () => {
                        onView(batch);
                        setMenuOpen(false);
                      },
                    },
                    {
                      label: "Edit Batch",
                      icon: <Edit3 className="w-3.5 h-3.5" />,
                      action: () => {
                        onEdit(batch);
                        setMenuOpen(false);
                      },
                    },
                    {
                      label: "Manage Packages",
                      icon: <Package className="w-3.5 h-3.5" />,
                      action: () => {
                        onManagePackages(batch);
                        setMenuOpen(false);
                      },
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-slate-50  transition-colors"
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <StatusBadge status={batch.status} />
          <ModeBadge mode={batch.mode} />
        </div>

        {/* Capacity */}
        {batch.capacity ? (
          <div className="mb-3">
            <CapacityBar
              enrolled={batch.enrolledCount}
              capacity={batch.capacity}
              status={batch.status}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium text-foreground">
              {batch.enrolledCount}
            </span>{" "}
            enrolled
          </div>
        )}

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          {batch.startDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {batch.status === "ongoing"
                  ? "Ongoing"
                  : isUpcoming
                    ? `Starts ${formatRelativeDate(batch.startDate)}`
                    : formatRelativeDate(batch.startDate)}
              </span>
            </div>
          )}
          {batch.registrationDeadline &&
            new Date(batch.registrationDeadline) > new Date() && (
              <div
                className={`flex items-center gap-2 text-xs ${deadlineUrgency === "critical" ? "text-red-600 " : deadlineUrgency === "warning" ? "text-amber-600 " : "text-muted-foreground"}`}
              >
                <Timer className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Closes {formatRelativeDate(batch.registrationDeadline)}
                </span>
              </div>
            )}
          {batch.schedules?.[0] && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{batch.schedules[0].label || batch.schedules[0].type}</span>
            </div>
          )}
          {batch.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{batch.location}</span>
            </div>
          )}
        </div>

        {/* Teacher */}
        {batch.teacher && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100  mb-3">
            <AvatarInitials name={batch.teacher.name} />
            <span className="text-xs text-muted-foreground">
              {batch.teacher.name}
            </span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(batch)}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium bg-slate-900  text-white  rounded-xl hover:bg-slate-800  transition-colors"
          >
            <Eye className="w-3 h-3" /> View
          </button>
          <button
            onClick={() => onManagePackages(batch)}
            className="h-8 w-8 flex items-center justify-center border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
            title="Manage Packages"
          >
            <Package className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(batch)}
            className="h-8 w-8 flex items-center justify-center border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateBatch }: { onCreateBatch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100  flex items-center justify-center mb-5">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No batches yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        Batches represent cohorts or class sessions for this program — like
        "January 2026 Cohort" or "Weekend Class". Create your first batch to
        start enrolling students.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onCreateBatch}
        className="flex items-center gap-2 h-10 px-5 text-sm font-medium bg-slate-900  text-white  rounded-xl hover:bg-slate-800  transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Create First Batch
      </motion.button>
    </motion.div>
  );
}

function PermanentProgramState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100  flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Batches not available
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        This is a permanent program. Batches are only available for scheduled
        programs. Switch to scheduled mode in program settings to enable cohort
        management.
      </p>
    </motion.div>
  );
}

// ─── Batch Drawer (Create/Edit) ───────────────────────────────────────────────

function BatchDrawer({
  open,
  onClose,
  batch,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
  mode: "create" | "edit";
}) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const stepLabels = ["Basic Info", "Schedule", "Packages"];

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30  z-40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white  shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200  flex-shrink-0">
              <div>
                <h2 className="font-semibold text-foreground">
                  {mode === "create" ? "Create Batch" : `Edit: ${batch?.title}`}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Step {step} of {totalSteps}: {stepLabels[step - 1]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100  transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1 px-6 pt-4 pb-2 flex-shrink-0">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-slate-900 " : "bg-slate-200 "}`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Batch Title *
                        </label>
                        <input
                          type="text"
                          defaultValue={batch?.title ?? ""}
                          placeholder="e.g. January 2026 Cohort"
                          className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Description
                        </label>
                        <textarea
                          defaultValue={batch?.description ?? ""}
                          rows={3}
                          placeholder="What makes this batch special..."
                          className="w-full px-3 py-2.5 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-muted-foreground resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Mode
                          </label>
                          <select className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none appearance-none">
                            <option value="online">Online</option>
                            <option value="offline">In-person</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Status
                          </label>
                          <select className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none appearance-none">
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="ongoing">Ongoing</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Capacity
                          </label>
                          <input
                            type="number"
                            defaultValue={batch?.capacity ?? ""}
                            placeholder="e.g. 30"
                            className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Timezone
                          </label>
                          <select className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none appearance-none">
                            <option value="WIB">WIB (UTC+7)</option>
                            <option value="WITA">WITA (UTC+8)</option>
                            <option value="WIT">WIT (UTC+9)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Start Date
                          </label>
                          <input
                            type="date"
                            className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            End Date
                          </label>
                          <input
                            type="date"
                            className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Registration Deadline
                        </label>
                        <input
                          type="date"
                          className="w-full h-10 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Schedule Pattern
                        </label>
                        <div className="bg-slate-50  rounded-2xl p-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                              "Sun",
                            ].map((day) => (
                              <button
                                key={day}
                                className="h-8 px-3 text-xs font-medium border border-slate-200  rounded-lg hover:bg-white  transition-colors text-muted-foreground hover:text-foreground"
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                Start Time
                              </label>
                              <input
                                type="time"
                                className="w-full h-9 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                End Time
                              </label>
                              <input
                                type="time"
                                className="w-full h-9 px-3 text-sm bg-white  border border-slate-200  rounded-xl focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Packages define enrollment options and pricing for this
                        batch.
                      </p>
                      {(batch?.packages ?? []).map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between p-3.5 bg-slate-50  rounded-xl border border-slate-200 "
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {pkg.title}
                              </span>
                              {pkg.isDefault && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-violet-100  text-violet-700 ">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatPrice(pkg.price)}
                            </p>
                          </div>
                          <button className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button className="w-full flex items-center justify-center gap-2 h-10 border border-dashed border-slate-300  rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-slate-400  transition-colors">
                        <Plus className="w-4 h-4" /> Add Package
                      </button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200  flex-shrink-0">
              <button
                onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
                className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
              >
                {step > 1 ? "Back" : "Cancel"}
              </button>
              <Button
                onClick={() =>
                  step < totalSteps ? setStep((s) => s + 1) : onClose()
                }
                variant="dashboard"
              >
                {step < totalSteps ? (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {mode === "create" ? "Create Batch" : "Save Changes"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Batch Inspector ──────────────────────────────────────────────────────────

function BatchInspector({
  batch,
  open,
  onClose,
  onEdit,
  onManagePackages,
}: {
  batch: Batch | null;
  open: boolean;
  onClose: () => void;
  onEdit: (b: Batch) => void;
  onManagePackages: (b: Batch) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!batch) return null;

  const pct = batch.capacity
    ? Math.min(100, Math.round((batch.enrolledCount / batch.capacity) * 100))
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30  z-40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white  shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200  flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <StatusBadge status={batch.status} />
                    <ModeBadge mode={batch.mode} />
                  </div>
                  <h2 className="font-bold text-base text-foreground leading-snug">
                    {batch.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100  transition-colors text-muted-foreground flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => onEdit(batch)}
                  className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => onManagePackages(batch)}
                  className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-slate-200  rounded-xl hover:bg-slate-50  transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Package className="w-3 h-3" /> Packages
                </button>
                <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors ml-auto">
                  <Zap className="w-3 h-3" /> Open Enrollment
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                {/* Enrollment Analytics */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Enrollment
                  </h3>
                  <div className="bg-slate-50  rounded-2xl p-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-3xl font-bold tabular-nums">
                          {batch.enrolledCount}
                        </span>
                        {batch.capacity && (
                          <span className="text-sm text-muted-foreground ml-1.5">
                            / {batch.capacity} seats
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${pct >= 80 ? "text-amber-600 " : "text-emerald-600 "}`}
                      >
                        {pct}%
                      </span>
                    </div>
                    {batch.capacity && (
                      <div className="h-2.5 bg-slate-200  rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 1,
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.2,
                          }}
                        />
                      </div>
                    )}
                    {batch.capacity && (
                      <div className="flex items-center justify-between mt-2.5 text-xs text-muted-foreground">
                        <span>
                          {batch.capacity - batch.enrolledCount} seats remaining
                        </span>
                        {pct >= 80 && pct < 100 && (
                          <span className="text-amber-600  font-medium">
                            Almost full!
                          </span>
                        )}
                        {pct >= 100 && (
                          <span className="text-red-600  font-medium">
                            Batch full
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Timeline */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Starts",
                        date: batch.startDate,
                        icon: <Calendar className="w-3.5 h-3.5" />,
                      },
                      {
                        label: "Ends",
                        date: batch.endDate,
                        icon: <Calendar className="w-3.5 h-3.5" />,
                      },
                      {
                        label: "Registration closes",
                        date: batch.registrationDeadline,
                        icon: <Timer className="w-3.5 h-3.5" />,
                      },
                    ]
                      .filter((i) => i.date)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm p-3 bg-slate-50  rounded-xl"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {formatRelativeDate(item.date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatShortDate(item.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Schedule */}
                {batch.schedules && batch.schedules.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Schedule
                    </h3>
                    {batch.schedules.map((s, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50  rounded-xl space-y-1"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {s.label || s.type}
                        </p>
                        {s.days && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {s.days.join(", ")}
                          </p>
                        )}
                        {s.startTime && (
                          <p className="text-xs text-muted-foreground">
                            {s.startTime} – {s.endTime} {batch.timezone}
                          </p>
                        )}
                      </div>
                    ))}
                  </section>
                )}

                {/* Teacher */}
                {batch.teacher && (
                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Instructor
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-slate-50  rounded-xl">
                      <AvatarInitials name={batch.teacher.name} size="md" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {batch.teacher.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lead Instructor
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Packages */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Packages
                    </h3>
                    <button
                      onClick={() => onManagePackages(batch)}
                      className="text-xs text-blue-600  hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  {batch.packages && batch.packages.length > 0 ? (
                    <div className="space-y-2">
                      {batch.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-3 bg-slate-50  rounded-xl border border-slate-200 "
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-foreground">
                                  {pkg.title}
                                </p>
                                {pkg.isDefault && (
                                  <span className="px-1.5 py-0.5 rounded text-xs bg-violet-100  text-violet-700 ">
                                    Default
                                  </span>
                                )}
                              </div>
                              {pkg.features && pkg.features.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {pkg.features.slice(0, 2).join(" · ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold text-foreground">
                                {formatPrice(pkg.price)}
                              </p>
                              {pkg.originalPrice && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatPrice(pkg.originalPrice)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-300  rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">
                        No packages yet
                      </p>
                      <button
                        onClick={() => onManagePackages(batch)}
                        className="text-xs text-blue-600  mt-1 hover:underline"
                      >
                        Add package
                      </button>
                    </div>
                  )}
                </section>

                {/* Location */}
                {batch.location && (
                  <section>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Location
                    </h3>
                    <div className="flex items-start gap-2 p-3 bg-slate-50  rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        {batch.location}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BatchesTab({ programId }: BatchesTabProps) {
  const { data, isLoading } = trpc.programs.getBatches.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  const batches = data?.batches ?? [];
  const program = data?.program;
  const metrics = data?.metrics;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Featured batch: prefer ongoing, then open
  const featuredBatch = useMemo(() => {
    return (
      batches.find((b) => b.status === "ongoing") ||
      batches.find(
        (b) =>
          b.status === "open" &&
          b.registrationDeadline &&
          getUrgencyLevel(b.registrationDeadline) !== null,
      ) ||
      batches.find((b) => b.status === "open") ||
      null
    );
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (b.id === featuredBatch?.id) return false; // exclude featured from grid
      const matchSearch =
        !search || b.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const matchMode = modeFilter === "all" || b.mode === modeFilter;
      return matchSearch && matchStatus && matchMode;
    });
  }, [search, statusFilter, modeFilter, featuredBatch]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [drawerBatch, setDrawerBatch] = useState<Batch | null>(null);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorBatch, setInspectorBatch] = useState<Batch | null>(null);

  const openCreate = () => {
    setDrawerMode("create");
    setDrawerBatch(null);
    setDrawerOpen(true);
  };

  const openEdit = (batch: Batch) => {
    setDrawerMode("edit");
    setDrawerBatch(batch);
    setDrawerOpen(true);
    setInspectorOpen(false);
  };

  const openInspector = (batch: Batch) => {
    setInspectorBatch(batch);
    setInspectorOpen(true);
  };

  const openManagePackages = (batch: Batch) => {
    setDrawerMode("edit");
    setDrawerBatch(batch);
    setDrawerOpen(true);
    setInspectorOpen(false);
  };

  if (isLoading || !data) {
    return null;
  }

  if (program?.scheduleType === "permanent") {
    return <PermanentProgramState />;
  }

  const hasBatches = batches.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <BatchSummaryCards batches={batches} />
      {/* {JSON.stringify(batches)} */}
      {/* Toolbar */}
      {hasBatches && (
        <BatchToolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateBatch={openCreate}
        />
      )}

      {!hasBatches ? (
        <EmptyState onCreateBatch={openCreate} />
      ) : (
        <>
          {/* Featured batch */}
          {featuredBatch &&
            !search &&
            statusFilter === "all" &&
            modeFilter === "all" && (
              <FeaturedBatchCard
                batch={featuredBatch}
                onView={openInspector}
                onEdit={openEdit}
                onManagePackages={openManagePackages}
              />
            )}

          {/* Section label */}
          {filteredBatches.length > 0 && (
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {search || statusFilter !== "all" || modeFilter !== "all"
                  ? `${filteredBatches.length} result${filteredBatches.length !== 1 ? "s" : ""}`
                  : "All Batches"}
              </h3>
              <div className="flex-1 h-px bg-slate-200 " />
            </div>
          )}

          {/* Grid / List */}
          {filteredBatches.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                    : "flex flex-col gap-2"
                }
              >
                {filteredBatches.map((batch, i) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    viewMode={viewMode}
                    onView={openInspector}
                    onEdit={openEdit}
                    onManagePackages={openManagePackages}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : search || statusFilter !== "all" || modeFilter !== "all" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <XCircle className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No batches match your filters
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : null}
        </>
      )}

      {/* Drawers & Panels */}
      <BatchDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        batch={drawerBatch}
        mode={drawerMode}
      />
      <BatchInspector
        batch={inspectorBatch}
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        onEdit={openEdit}
        onManagePackages={openManagePackages}
      />
    </div>
  );
}
