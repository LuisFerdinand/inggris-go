// components/sidebar/section-cards.tsx

"use client";

import {
  BadgeCheck,
  Clock3,
  CreditCard,
  ShoppingBag,
  TrendingUpIcon,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { OrderDashboardOverview } from "@/app/modules/order/server/order.router";

type Summary = OrderDashboardOverview["summary"];

function formatIDR(value: number | null | undefined) {
  if (value == null) return "Rp 0";

  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString("id-ID");
}

function formatPercent(value: number | null | undefined) {
  return `${(value ?? 0).toFixed(1)}%`;
}

export function SectionCards({ data }: { data: Summary }) {
  const cards = [
    {
      label: "Revenue Lunas",
      value: formatIDR(data.paidRevenue),
      description: `${formatNumber(data.paidOrders)} pesanan sudah lunas`,
      footer: "Revenue dari pesanan paid / confirmed",
      icon: WalletCards,
      badge: "Paid",
      className: "from-emerald-50 to-white",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Belum Dibayar",
      value: formatIDR(data.unpaidRevenue),
      description: `${formatNumber(data.unpaidOrders)} pesanan pending`,
      footer: "Potensi revenue yang masih menunggu pembayaran",
      icon: Clock3,
      badge: "Unpaid",
      className: "from-amber-50 to-white",
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      label: "Total Pesanan",
      value: formatNumber(data.totalOrders),
      description: `${formatNumber(data.cancelledOrders)} cancelled / expired`,
      footer: "Total semua order dari seluruh program",
      icon: ShoppingBag,
      badge: "Orders",
      className: "from-indigo-50 to-white",
      iconClassName: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Paid Rate",
      value: formatPercent(data.paidRate),
      description: `AOV ${formatIDR(Math.round(data.averagePaidOrderValue))}`,
      footer: "Persentase order yang sudah menghasilkan revenue",
      icon: BadgeCheck,
      badge: "Conversion",
      className: "from-blue-50 to-white",
      iconClassName: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "@container/card overflow-hidden border-slate-200 bg-gradient-to-t shadow-sm",
            card.className,
          )}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                  card.iconClassName,
                )}
              >
                <card.icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="mt-1 truncate text-2xl font-black tabular-nums text-slate-900 @[250px]/card:text-3xl">
                  {card.value}
                </CardTitle>
              </div>
            </div>

            <CardAction>
              <Badge variant="outline" className="gap-1 bg-white/70">
                <TrendingUpIcon className="size-3" />
                {card.badge}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex items-center gap-2 font-bold text-slate-700">
              <CreditCard className="size-4 text-slate-400" />
              {card.description}
            </div>
            <div className="text-muted-foreground">{card.footer}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}