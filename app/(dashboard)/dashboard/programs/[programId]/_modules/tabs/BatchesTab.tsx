// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/BatchesTab.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  LayoutGrid,
  List,
  X,
  Wifi,
  Building2,
  Globe,
  Package,
  Edit3,
  Eye,
  MoreHorizontal,
  Trash2,
  CalendarClock,
  Layers,
  ChevronDown,
  Sparkles,
  Timer,
  Star,
  Activity,
  XCircle,
  BookOpen,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import type { RouterOutputs } from "@/lib/trpc/react";

// ─── Types (derived from the router output) ────────────────────────────────────

type BatchListItem = RouterOutputs["batches"]["listByProgram"][number];
type BatchStatus = BatchListItem["status"];
type BatchMode = BatchListItem["mode"];

interface BatchesTabProps {
  programId: string;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatRelativeDate(date?: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffDays = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  if (diffDays === -1) return "Kemarin";
  if (diffDays > 0 && diffDays <= 7) return `Dalam ${diffDays} hari`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} hari lalu`;
  if (diffDays > 7 && diffDays <= 30) return `Dalam ${Math.ceil(diffDays / 7)} minggu`;
  if (diffDays < -7 && diffDays >= -30)
    return `${Math.ceil(Math.abs(diffDays) / 7)} minggu lalu`;
  const months = Math.round(Math.abs(diffDays) / 30);
  return diffDays > 0 ? `Dalam ${months} bln` : `${months} bln lalu`;
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
  const diffDays = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays <= 3) return "critical";
  if (diffDays <= 7) return "warning";
  return "normal";
}

// ─── Status / Mode config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  open: { label: "Open", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  ongoing: { label: "Ongoing", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  full: { label: "Full", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  completed: { label: "Completed", bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
  closed: { label: "Closed", bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-400" },
};

const MODE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  online: { label: "Online", icon: <Wifi className="w-3 h-3" /> },
  offline: { label: "Offline", icon: <Building2 className="w-3 h-3" /> },
  hybrid: { label: "Hybrid", icon: <Globe className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: BatchStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "ongoing" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: BatchMode }) {
  const cfg = MODE_CONFIG[mode] ?? MODE_CONFIG.online;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
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
  const barColor =
    pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : status === "ongoing" ? "bg-emerald-500" : "bg-blue-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-400">Kapasitas</span>
        <span className="font-medium tabular-nums text-neutral-600">
          {enrolled}
          <span className="text-neutral-400 font-normal">/{capacity}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function BatchSummaryCards({ batches }: { batches: BatchListItem[] }) {
  const active = batches.filter((b) => b.status === "ongoing" || b.status === "open").length;
  const totalEnrolled = batches.reduce((acc, b) => acc + b.enrolledCount, 0);
  const closingSoon = batches.filter((b) => {
    const u = getUrgencyLevel(b.registrationDeadline);
    return u === "critical" || u === "warning";
  }).length;
  const upcoming = batches.filter(
    (b) => b.status === "open" && b.startDate && new Date(b.startDate) > new Date(),
  ).length;

  const cards = [
    { icon: <Activity className="w-5 h-5" />, label: "Batch Aktif", value: active, sub: `${batches.filter((b) => b.status === "ongoing").length} berjalan`, color: "text-emerald-600", iconBg: "bg-emerald-50" },
    { icon: <Users className="w-5 h-5" />, label: "Total Pendaftar", value: totalEnrolled, sub: `dari ${batches.length} batch`, color: "text-blue-600", iconBg: "bg-blue-50" },
    { icon: <Timer className="w-5 h-5" />, label: "Segera Tutup", value: closingSoon, sub: closingSoon > 0 ? "deadline pendaftaran" : "aman", color: closingSoon > 0 ? "text-amber-600" : "text-slate-500", iconBg: closingSoon > 0 ? "bg-amber-50" : "bg-slate-50" },
    { icon: <CalendarClock className="w-5 h-5" />, label: "Akan Dimulai", value: upcoming, sub: "terbuka pendaftaran", color: "text-violet-600", iconBg: "bg-violet-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="relative bg-white border border-neutral-200 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400 mb-2 font-medium tracking-wide uppercase truncate">{card.label}</p>
              <p className={`text-3xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
              <p className="text-xs text-neutral-400 mt-1.5 truncate">{card.sub}</p>
            </div>
            <div className={`${card.iconBg} ${card.color} p-2.5 rounded-xl flex-shrink-0`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";

function BatchToolbar(props: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  modeFilter: string;
  setModeFilter: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onCreateBatch: () => void;
}) {
  const { search, setSearch, statusFilter, setStatusFilter, modeFilter, setModeFilter, viewMode, setViewMode, onCreateBatch } = props;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-neutral-400"
        />
      </div>

      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 pl-3 pr-7 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="h-9 pl-3 pr-7 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
        >
          <option value="all">Semua Mode</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      </div>

      <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-0.5 gap-0.5">
        {(["grid", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${viewMode === v ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700"}`}
          >
            {v === "grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>

      <Button onClick={onCreateBatch} className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-xl">
        <Plus className="w-4 h-4" />
        <span>Buat Batch</span>
      </Button>
    </div>
  );
}

// ─── Batch Card ───────────────────────────────────────────────────────────────

function BatchCard({
  batch,
  viewMode,
  onEdit,
  onManagePackages,
  onDelete,
  index,
}: {
  batch: BatchListItem;
  viewMode: ViewMode;
  onEdit: (b: BatchListItem) => void;
  onManagePackages: (b: BatchListItem) => void;
  onDelete: (b: BatchListItem) => void;
  index: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deadlineUrgency = getUrgencyLevel(batch.registrationDeadline);
  const isUpcoming = batch.startDate && new Date(batch.startDate) > new Date();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group bg-white border border-neutral-200 rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-neutral-300 transition-all"
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${(STATUS_CONFIG[batch.status] ?? STATUS_CONFIG.draft).dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-neutral-800 truncate">{batch.title}</span>
            <StatusBadge status={batch.status} />
            <ModeBadge mode={batch.mode} />
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
          <span className="text-sm font-medium tabular-nums text-neutral-700">
            {batch.enrolledCount}
            {batch.capacity ? `/${batch.capacity}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(batch)} className="h-7 px-2.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600">
            Edit
          </button>
          <button onClick={() => onDelete(batch)} className="h-7 w-7 flex items-center justify-center border border-neutral-200 rounded-lg hover:bg-red-50 hover:text-red-600 text-neutral-400">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all"
    >
      <div
        className={`h-0.5 w-full ${
          batch.status === "ongoing" ? "bg-emerald-400" : batch.status === "open" ? "bg-blue-400" : "bg-slate-300"
        }`}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-semibold text-sm text-neutral-800 leading-snug line-clamp-2 flex-1">{batch.title}</h4>
          <div ref={menuRef} className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen((v) => !v)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                >
                  {[
                    { label: "Edit Batch", icon: <Edit3 className="w-3.5 h-3.5" />, action: () => { onEdit(batch); setMenuOpen(false); } },
                    { label: "Kelola Paket", icon: <Package className="w-3.5 h-3.5" />, action: () => { onManagePackages(batch); setMenuOpen(false); } },
                    { label: "Hapus", icon: <Trash2 className="w-3.5 h-3.5" />, action: () => { onDelete(batch); setMenuOpen(false); }, danger: true },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-neutral-50 transition-colors ${item.danger ? "text-red-600 hover:bg-red-50" : "text-neutral-700"}`}
                    >
                      <span className={item.danger ? "text-red-400" : "text-neutral-400"}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <StatusBadge status={batch.status} />
          <ModeBadge mode={batch.mode} />
        </div>

        {batch.capacity ? (
          <div className="mb-3">
            <CapacityBar enrolled={batch.enrolledCount} capacity={batch.capacity} status={batch.status} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-neutral-400">
            <Users className="w-3.5 h-3.5" />
            <span className="tabular-nums font-medium text-neutral-700">{batch.enrolledCount}</span> terdaftar
          </div>
        )}

        <div className="space-y-1.5 mb-3">
          {batch.startDate && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {batch.status === "ongoing" ? "Berjalan" : isUpcoming ? `Mulai ${formatRelativeDate(batch.startDate)}` : formatRelativeDate(batch.startDate)}
              </span>
            </div>
          )}
          {batch.registrationDeadline && new Date(batch.registrationDeadline) > new Date() && (
            <div className={`flex items-center gap-2 text-xs ${deadlineUrgency === "critical" ? "text-red-600" : deadlineUrgency === "warning" ? "text-amber-600" : "text-neutral-400"}`}>
              <Timer className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Tutup {formatRelativeDate(batch.registrationDeadline)}</span>
            </div>
          )}
          {batch.location && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{batch.location}</span>
            </div>
          )}
        </div>

        {batch.packages && batch.packages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {batch.packages.map((pkg) => (
              <span
                key={pkg.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${pkg.isDefault ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}
              >
                {pkg.isDefault && <Star className="w-2.5 h-2.5" />}
                {pkg.title} · {formatPrice(pkg.price)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(batch)} className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => onManagePackages(batch)} className="h-8 w-8 flex items-center justify-center border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700" title="Kelola Paket">
            <Package className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty / Permanent states ──────────────────────────────────────────────────

function EmptyState({ onCreateBatch }: { onCreateBatch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <Layers className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Belum ada batch</h3>
      <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-6">
        Batch mewakili cohort atau kelas untuk program ini. Buat batch pertama untuk mulai menerima pendaftaran.
      </p>
      <Button onClick={onCreateBatch} className="h-10 px-5 rounded-xl gap-2">
        <Plus className="w-4 h-4" /> Buat Batch Pertama
      </Button>
    </div>
  );
}

function PermanentProgramState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-800 mb-2">Batch tidak tersedia</h3>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        Ini program permanent. Batch hanya tersedia untuk program scheduled. Ubah tipe jadwal di tab Detail untuk mengaktifkan batch.
      </p>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export default function BatchesTab({ programId }: BatchesTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Program (to know scheduleType) + batches list.
  const programQuery = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );
  const { data: batches = [], isLoading } = trpc.batches.listByProgram.useQuery(
    { programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  const deleteBatch = trpc.batches.remove.useMutation({
    onSuccess: () => {
      utils.batches.listByProgram.invalidate({ programId });
      toast.success("Batch dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus batch"),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const matchMode = modeFilter === "all" || b.mode === modeFilter;
      return matchSearch && matchStatus && matchMode;
    });
  }, [batches, search, statusFilter, modeFilter]);

  const openCreate = () => router.push(`/dashboard/programs/${programId}/batches/new`);
  const openEdit = (b: BatchListItem) => router.push(`/dashboard/programs/${programId}/batches/${b.id}/edit`);
  const openManagePackages = (b: BatchListItem) =>
    router.push(`/dashboard/programs/${programId}?tab=packages&batchId=${b.id}`);
  const handleDelete = (b: BatchListItem) => {
    if (confirm(`Hapus batch "${b.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteBatch.mutate({ id: b.id });
    }
  };

  if (programQuery.isLoading || isLoading) return null;
  if (programQuery.data?.scheduleType === "permanent") return <PermanentProgramState />;

  const hasBatches = batches.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <BatchSummaryCards batches={batches} />

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
      ) : filteredBatches.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" : "flex flex-col gap-2"}
          >
            {filteredBatches.map((batch, i) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                viewMode={viewMode}
                onEdit={openEdit}
                onManagePackages={openManagePackages}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <XCircle className="w-8 h-8 text-neutral-400 mb-3" />
          <p className="text-sm font-medium text-neutral-700 mb-1">Tidak ada batch yang cocok</p>
          <p className="text-xs text-neutral-400">Coba ubah pencarian atau filter Anda</p>
        </div>
      )}
    </div>
  );
}