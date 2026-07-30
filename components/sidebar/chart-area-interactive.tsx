// components/sidebar/chart-area-interactive.tsx

"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import type { OrderDashboardOverview } from "@/app/modules/order/server/order.router";

type ChartPoint = OrderDashboardOverview["chart"][number];

export type ChartGranularity = "day" | "week" | "month";

const GRANULARITY_OPTIONS: { value: ChartGranularity; label: string }[] = [
  { value: "day", label: "Harian" },
  { value: "week", label: "Mingguan" },
  { value: "month", label: "Bulanan" },
];

const GRANULARITY_DESCRIPTION: Record<ChartGranularity, string> = {
  day: "Perbandingan revenue lunas dan belum dibayar, 30 hari terakhir.",
  week: "Perbandingan revenue lunas dan belum dibayar, 12 minggu terakhir.",
  month: "Perbandingan revenue lunas dan belum dibayar, 12 bulan terakhir.",
};

// Brand-aligned chart colors: paid uses the primary blue (the
// money that's actually in), unpaid uses gold (pending, not yet
// resolved) — matching the badge colors used elsewhere instead of
// arbitrary chart palette defaults.
const chartConfig = {
  paid: {
    label: "Lunas",
    color: "var(--blue)",
  },
  unpaid: {
    label: "Belum Dibayar",
    color: "var(--gold)",
  },
} satisfies ChartConfig;

function formatCompactIDR(value: number) {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
}

export function ChartAreaInteractive({
  data,
  granularity,
  onGranularityChange,
  isRefetching,
}: {
  data: ChartPoint[];
  granularity: ChartGranularity;
  onGranularityChange: (value: ChartGranularity) => void;
  isRefetching?: boolean;
}) {
  return (
    <Card
      className="overflow-hidden bg-white shadow-sm"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <CardHeader
        className="flex flex-col gap-3 border-b lg:flex-row lg:items-center lg:justify-between"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div>
          <CardTitle
            className="font-display flex items-center gap-2 text-[15px] font-bold"
            style={{ color: "var(--text-main)" }}
          >
            <span
              className="flex size-7 items-center justify-center rounded-lg"
              style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
            >
              <TrendingUp className="size-3.5" />
            </span>
            Tren Pendapatan
            {isRefetching && (
              <Loader2
                className="size-3.5 animate-spin"
                style={{ color: "var(--text-faint)" }}
              />
            )}
          </CardTitle>
          <CardDescription className="mt-1 text-[12.5px]">
            {GRANULARITY_DESCRIPTION[granularity]}
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            className="flex items-center gap-1 rounded-xl border p-1"
            style={{ borderColor: "var(--border-soft)", background: "var(--bg-soft)" }}
          >
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onGranularityChange(option.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors",
                  granularity === option.value
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/60",
                )}
                style={{
                  color:
                    granularity === option.value
                      ? "var(--blue-navy)"
                      : "var(--text-faint)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-3 py-2 text-[12px] font-semibold"
            style={{ borderColor: "var(--border-soft)", background: "var(--bg-soft)" }}
          >
            <span className="flex items-center gap-1.5" style={{ color: "var(--blue-navy)" }}>
              <span
                className="size-2 rounded-full"
                style={{ background: "var(--blue)" }}
              />
              Lunas
            </span>
            <span className="flex items-center gap-1.5" style={{ color: "var(--blue-navy)" }}>
              <span
                className="size-2 rounded-full"
                style={{ background: "var(--gold)" }}
              />
              Belum Dibayar
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-paid)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="var(--color-paid)" stopOpacity={0.02} />
              </linearGradient>

              <linearGradient id="fillUnpaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-unpaid)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-unpaid)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--border-soft)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
              tick={{ fontSize: 11, fill: "var(--text-faint)" }}
              tickFormatter={(value) => formatCompactIDR(Number(value))}
            />

            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => (
                    <div className="flex min-w-[160px] items-center justify-between gap-4">
                      <span
                        className="capitalize"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {name === "paid" ? "Lunas" : "Belum Dibayar"}
                      </span>
                      <span
                        className="font-display font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        {formatCompactIDR(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />

            <Area
              dataKey="unpaid"
              type="monotone"
              fill="url(#fillUnpaid)"
              stroke="var(--color-unpaid)"
              strokeWidth={2}
              stackId="sales"
            />

            <Area
              dataKey="paid"
              type="monotone"
              fill="url(#fillPaid)"
              stroke="var(--color-paid)"
              strokeWidth={2}
              stackId="sales"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}