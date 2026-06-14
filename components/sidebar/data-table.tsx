// components/sidebar/data-table.tsx

"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Inbox,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { OrderDashboardOverview } from "@/app/modules/order/server/order.router";

type RecentOrder = OrderDashboardOverview["recentOrders"][number];

const ENROLLMENT_STATUS_META: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending_payment: {
    label: "Menunggu Bayar",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Lunas",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  confirmed: {
    label: "Terkonfirmasi",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

const PAYMENT_STATUS_META: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  expired: {
    label: "Expired",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  refunded: {
    label: "Refunded",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

function formatIDR(value: number | null | undefined) {
  if (value == null) return "—";

  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  status,
  meta,
}: {
  status: string;
  meta: Record<string, { label: string; className: string }>;
}) {
  const current = meta[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold",
        current.className,
      )}
    >
      {current.label}
    </Badge>
  );
}

export function DataTable({ data }: { data: RecentOrder[] }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
            <ShoppingBag className="size-4 text-indigo-600" />
            Pesanan Terbaru
          </CardTitle>
          <CardDescription>
            Order terbaru dari seluruh program dan status pembayarannya.
          </CardDescription>
        </div>

        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
        >
          Lihat Semua
          <ArrowUpRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Inbox className="size-8 text-slate-300" />

            <div>
              <p className="text-sm font-black text-slate-600">
                Belum ada pesanan
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Pesanan akan muncul setelah ada pendaftaran program.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="min-w-[260px]">Customer</TableHead>
                  <TableHead className="min-w-[260px]">Program</TableHead>
                  <TableHead className="min-w-[150px]">Amount</TableHead>
                  <TableHead className="min-w-[190px]">Status</TableHead>
                  <TableHead className="min-w-[170px]">Tanggal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item) => {
                  const displayName = item.childName || item.customerName;

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/70">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-800">
                            {displayName}
                          </p>

                          {item.childName && (
                            <p className="text-xs text-slate-400">
                              Wali: {item.customerName}
                            </p>
                          )}

                          <div className="mt-1 flex flex-col gap-1 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="size-3.5" />
                              {item.phone}
                            </span>

                            {item.email && (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail className="size-3.5" />
                                {item.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="min-w-0">
                          {item.program.title ? (
                            <Link
                              href={`/dashboard/programs/${item.program.id}?tab=enrollments`}
                              className="group inline-flex max-w-[240px] items-center gap-1 truncate text-sm font-bold text-slate-800 hover:text-indigo-600"
                            >
                              <span className="truncate">
                                {item.program.title}
                              </span>
                              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          ) : (
                            <p className="text-sm font-bold text-slate-800">
                              —
                            </p>
                          )}

                          <p className="mt-1 truncate text-xs text-slate-400">
                            Paket: {item.package.title ?? "—"}
                          </p>

                          {item.batch && (
                            <p className="truncate text-xs text-slate-400">
                              Batch: {item.batch.title}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm font-black text-slate-900">
                          {formatIDR(item.pricing.final)}
                        </p>

                        {item.payment?.invoiceNumber && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                            <CreditCard className="size-3" />
                            {item.payment.invoiceNumber}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge
                            status={item.status}
                            meta={ENROLLMENT_STATUS_META}
                          />

                          {item.payment && (
                            <StatusBadge
                              status={item.payment.status}
                              meta={PAYMENT_STATUS_META}
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Calendar className="size-3.5" />
                          {formatDateTime(item.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}