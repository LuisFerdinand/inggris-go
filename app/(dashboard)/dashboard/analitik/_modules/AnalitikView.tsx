// app/(dashboard)/dashboard/analitik/_modules/AnalitikView.tsx
"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Layers,
  Loader2,
  RefreshCcw,
  ShoppingBag,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { AnalyticsOverview } from "@/app/modules/analytics/server/analytics.router";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function formatIDR(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatCompactIDR(value: number) {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

/* ─────────────────────────────────────────────────────────────
   SUMMARY CARDS
───────────────────────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  tone: "blue" | "amber" | "emerald" | "slate";
}) {
  const toneMap = {
    blue: { bg: "var(--surface-soft)", fg: "var(--blue)" },
    amber: { bg: "#fef3c7", fg: "#b45309" },
    emerald: { bg: "#d1fae5", fg: "#047857" },
    slate: { bg: "#e2e8f0", fg: "#334155" },
  } as const;

  const t = toneMap[tone];

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div
        className="flex size-9 items-center justify-center rounded-xl"
        style={{ background: t.bg, color: t.fg }}
      >
        <Icon className="size-4" />
      </div>

      <p
        className="mt-3.5 text-[12px] font-semibold"
        style={{ color: "var(--text-faint)" }}
      >
        {label}
      </p>
      <p
        className="font-display mt-1 text-[1.5rem] font-extrabold tracking-tight"
        style={{ color: "var(--text-main)" }}
      >
        {value}
      </p>
      <p
        className="mt-1.5 text-[12px] leading-snug"
        style={{ color: "var(--text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}

function SummaryCards({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Revenue Lunas"
        value={formatCompactIDR(data.enrollments.revenue)}
        description={`${formatNumber(data.enrollments.success)} pendaftaran lunas / terkonfirmasi`}
        icon={Wallet}
        tone="emerald"
      />
      <SummaryCard
        label="Total Pendaftaran"
        value={formatNumber(data.enrollments.total)}
        description={`${formatNumber(data.enrollments.pending)} menunggu pembayaran`}
        icon={ShoppingBag}
        tone="amber"
      />
      <SummaryCard
        label="Total Program"
        value={formatNumber(data.programs.total)}
        description={`${formatNumber(data.programs.published)} terbit • ${formatNumber(data.programs.draft)} draf`}
        icon={BookOpen}
        tone="blue"
      />
      <SummaryCard
        label="Total Pengguna"
        value={formatNumber(data.users.total)}
        description={`+${formatNumber(data.users.newLast30Days)} pengguna baru 30 hari terakhir`}
        icon={Users}
        tone="slate"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TREND CHART — enrollments (bar) + revenue (line), 6 months
───────────────────────────────────────────────────────────── */

const chartConfig = {
  enrollments: {
    label: "Pendaftaran",
    color: "var(--blue)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--gold)",
  },
} satisfies ChartConfig;

function TrendChart({ trend }: { trend: AnalyticsOverview["trend"] }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div
        className="flex items-center gap-2 border-b px-5 py-4"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
        >
          <BarChart3 className="size-3.5" />
        </span>
        <div>
          <p className="font-display text-[15px] font-bold" style={{ color: "var(--text-main)" }}>
            Tren Pendaftaran & Revenue
          </p>
          <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            6 bulan terakhir
          </p>
        </div>
      </div>

      <div className="p-5">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <ComposedChart data={trend} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
              tickFormatter={(v) => formatCompactIDR(Number(v))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [formatIDR(Number(value)), " Revenue"]
                      : [formatNumber(Number(value)), " Pendaftaran"]
                  }
                />
              }
            />
            <Bar
              yAxisId="left"
              dataKey="enrollments"
              fill="var(--color-enrollments)"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            <Line
              yAxisId="right"
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROGRAM STATUS BREAKDOWN
───────────────────────────────────────────────────────────── */

function ProgramStatusBreakdown({
  programs,
}: {
  programs: AnalyticsOverview["programs"];
}) {
  const stats = [
    {
      label: "Terbit",
      value: programs.published,
      dotClass: "bg-teal-500",
      barClass: "bg-teal-500",
    },
    {
      label: "Draf",
      value: programs.draft,
      dotClass: "bg-blue-500",
      barClass: "bg-blue-500",
    },
    {
      label: "Diarsip",
      value: programs.archived,
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-300",
    },
  ];

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
        >
          <Layers className="size-3.5" />
        </span>
        <p className="font-display text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
          Status Program
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {stats.map((s) => {
          const pct = programs.total ? Math.round((s.value / programs.total) * 100) : 0;
          return (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: "var(--text-muted)" }}>
                  <span className={cn("size-1.5 rounded-full", s.dotClass)} />
                  {s.label}
                </span>
                <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--text-main)" }}>
                  {formatNumber(s.value)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className={cn("h-full rounded-full", s.barClass)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   USER ROLE BREAKDOWN
───────────────────────────────────────────────────────────── */

function UserRoleBreakdown({ byRole }: { byRole: Record<string, number> }) {
  const entries = Object.entries(byRole)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const max = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
        >
          <Users className="size-3.5" />
        </span>
        <p className="font-display text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
          Pengguna per Role
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          Belum ada data pengguna.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(([roleName, count]) => (
            <div key={roleName}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] ?? roleName}
                </span>
                <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--text-main)" }}>
                  {formatNumber(count)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, background: "var(--blue)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOP PROGRAMS
───────────────────────────────────────────────────────────── */

function TopPrograms({ items }: { items: AnalyticsOverview["topPrograms"] }) {
  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
        >
          <Trophy className="size-3.5" />
        </span>
        <p className="font-display text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
          Program Terlaris
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          Belum ada pendaftaran.
        </p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border-soft)" }}>
          {items.map((item, i) => (
            <div key={item.programId} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold" style={{ color: "var(--text-main)" }}>
                  {item.title}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                  {formatNumber(item.enrollmentCount)} pendaftaran
                </p>
              </div>
              <p className="shrink-0 text-[12.5px] font-bold tabular-nums" style={{ color: "var(--text-main)" }}>
                {formatCompactIDR(item.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY BREAKDOWN
───────────────────────────────────────────────────────────── */

function CategoryBreakdown({ items }: { items: AnalyticsOverview["categories"] }) {
  const max = Math.max(1, ...items.map((c) => c.revenue));

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-lg"
          style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
        >
          <Layers className="size-3.5" />
        </span>
        <p className="font-display text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
          Revenue per Kategori
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          Belum ada data.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((c) => (
            <div key={c.categoryId}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {c.categoryLabel}
                </span>
                <span className="shrink-0 text-[12.5px] font-bold tabular-nums" style={{ color: "var(--text-main)" }}>
                  {formatCompactIDR(c.revenue)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.revenue / max) * 100}%`, background: "var(--gold)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

export function AnalitikView() {
  const overviewQuery = trpc.analytics.getOverview.useQuery(undefined, {
    placeholderData: (prev) => prev,
  });

  const data = overviewQuery.data;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[{ label: "Analitik", icon: <BarChart3 /> }]}
            title="Analitik"
            description="Ringkasan performa program, pendaftaran, revenue, dan pertumbuhan pengguna."
          />
        </PageNav>

        <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
          {overviewQuery.isLoading && !data ? (
            <div
              className="flex min-h-[420px] items-center justify-center rounded-3xl border bg-white shadow-sm"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <div className="flex items-center gap-3" style={{ color: "var(--text-faint)" }}>
                <Loader2 className="size-5 animate-spin" style={{ color: "var(--blue)" }} />
                <p className="text-[13.5px] font-semibold">Memuat analitik…</p>
              </div>
            </div>
          ) : overviewQuery.isError ? (
            <div
              className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-3xl border bg-red-50/60 text-center shadow-sm"
              style={{ borderColor: "rgba(239,68,68,0.25)" }}
            >
              <AlertCircle className="size-8 text-red-500" />
              <div>
                <p className="font-display text-[14px] font-bold text-red-700">
                  Gagal memuat analitik
                </p>
                <p className="mt-1 max-w-md text-[12.5px] font-medium text-red-500">
                  {overviewQuery.error.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => overviewQuery.refetch()}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-bold text-white transition-colors"
                style={{ background: "var(--blue-navy)" }}
              >
                <RefreshCcw className="size-3.5" />
                Coba Lagi
              </button>
            </div>
          ) : data ? (
            <>
              <SummaryCards data={data} />

              <TrendChart trend={data.trend} />

              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
                <ProgramStatusBreakdown programs={data.programs} />
                <UserRoleBreakdown byRole={data.users.byRole} />
                <CategoryBreakdown items={data.categories} />
              </div>

              <TopPrograms items={data.topPrograms} />
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
