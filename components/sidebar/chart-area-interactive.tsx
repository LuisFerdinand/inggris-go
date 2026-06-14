// components/sidebar/chart-area-interactive.tsx

"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";

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

import type { OrderDashboardOverview } from "@/app/modules/order/server/order.router";

type ChartPoint = OrderDashboardOverview["chart"][number];

const chartConfig = {
  paid: {
    label: "Paid",
    color: "var(--chart-1)",
  },
  unpaid: {
    label: "Unpaid",
    color: "var(--chart-2)",
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

export function ChartAreaInteractive({ data }: { data: ChartPoint[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
            <BarChart3 className="size-4 text-indigo-600" />
            Sales Chart
          </CardTitle>
          <CardDescription>
            Perbandingan revenue paid dan unpaid dari pesanan 12 bulan terakhir.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" />
            Paid
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="size-2 rounded-full bg-[var(--chart-2)]" />
            Unpaid
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-paid)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-paid)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillUnpaid" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-unpaid)"
                  stopOpacity={0.75}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-unpaid)"
                  stopOpacity={0.08}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={72}
              tickFormatter={(value) => formatCompactIDR(Number(value))}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => (
                    <div className="flex min-w-[160px] items-center justify-between gap-4">
                      <span className="capitalize text-muted-foreground">
                        {name}
                      </span>
                      <span className="font-bold text-foreground">
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
              stackId="sales"
            />

            <Area
              dataKey="paid"
              type="monotone"
              fill="url(#fillPaid)"
              stroke="var(--color-paid)"
              stackId="sales"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}