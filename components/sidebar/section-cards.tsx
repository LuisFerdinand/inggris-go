// components/sidebar/section-cards.tsx

"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { OrderDashboardOverview } from "@/app/modules/order/server/order.router";

type Summary = OrderDashboardOverview["summary"];

function formatIDR(value: number | null | undefined) {
  if (value == null) return "Rp 0";
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatCompactIDR(value: number | null | undefined) {
  const v = value ?? 0;
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
  return `Rp ${v}`;
}

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString("id-ID");
}

function formatPercent(value: number | null | undefined) {
  return `${(value ?? 0).toFixed(1)}%`;
}

/* ─────────────────────────────────────────────────────────────
   HERO CARD — the one number that matters most: paid revenue.
   Carries the navy/blue brand gradient; everything else stays
   quiet so this stays the visual anchor of the row.
───────────────────────────────────────────────────────────── */
function HeroRevenueCard({ data }: { data: Summary }) {
  return (
    <div
      className="relative col-span-1 overflow-hidden rounded-3xl p-6 sm:col-span-2 lg:col-span-1 lg:row-span-2"
      style={{
        background:
          "linear-gradient(155deg, var(--blue-abyss) 0%, var(--blue-navy) 55%, var(--blue) 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(247,181,0,0.22) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between">
          <div
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Wallet className="size-5 text-white" />
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{
              background: "rgba(74, 222, 128, 0.16)",
              color: "#86efac",
            }}
          >
            <ArrowUpRight className="size-3" />
            {formatPercent(data.paidRate)} paid rate
          </span>
        </div>

        <div>
          <p
            className="font-display text-[12.5px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Revenue Lunas
          </p>
          <p className="font-display mt-1.5 text-[2.1rem] font-extrabold leading-none tracking-tight text-white sm:text-[2.5rem]">
            {formatIDR(data.paidRevenue)}
          </p>
          <p
            className="mt-3 text-[12.5px]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {formatNumber(data.paidOrders)} pesanan paid / confirmed •
            rata-rata {formatIDR(Math.round(data.averagePaidOrderValue))} per
            order
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUPPORTING METRIC — quiet white card, single accent color
   used only on the icon, not the whole surface.
───────────────────────────────────────────────────────────── */
function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  trend,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  tone: "amber" | "slate" | "blue";
  trend?: "up" | "down";
}) {
  const toneMap = {
    amber: { bg: "#fef3c7", fg: "#b45309" },
    slate: { bg: "#e2e8f0", fg: "#334155" },
    blue: { bg: "var(--surface-soft)", fg: "var(--blue)" },
  } as const;

  const t = toneMap[tone];

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{ background: t.bg, color: t.fg }}
        >
          <Icon className="size-4" />
        </div>

        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-bold",
              trend === "up" ? "text-emerald-600" : "text-slate-400",
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
          </span>
        )}
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

export function SectionCards({ data }: { data: Summary }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <HeroRevenueCard data={data} />

      <MetricCard
        label="Belum Dibayar"
        value={formatCompactIDR(data.unpaidRevenue)}
        description={`${formatNumber(data.unpaidOrders)} pesanan menunggu pembayaran`}
        icon={Clock3}
        tone="amber"
      />

      <MetricCard
        label="Total Pesanan"
        value={formatNumber(data.totalOrders)}
        description={`${formatNumber(data.cancelledOrders)} dibatalkan / kedaluwarsa`}
        icon={ShoppingBag}
        tone="blue"
      />

      <MetricCard
        label="Order Dibatalkan"
        value={formatNumber(data.cancelledOrders)}
        description="Cancelled & expired dari seluruh program"
        icon={ArrowDownRight}
        tone="slate"
      />
    </div>
  );
}