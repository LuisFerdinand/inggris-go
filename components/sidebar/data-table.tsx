// components/sidebar/data-table.tsx

"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Inbox,
  ListOrdered,
  Mail,
  Phone,
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

// Status colors are intentionally muted/desaturated so they read
// as quiet metadata, not competing accent chips. Saturation is
// reserved for the hero revenue card.
const ENROLLMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending_payment: {
    label: "Menunggu Bayar",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  paid: {
    label: "Lunas",
    className: "border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] text-[color:var(--blue-navy)]",
  },
  confirmed: {
    label: "Terkonfirmasi",
    className: "border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] text-[color:var(--blue-navy)]",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-red-50 text-red-600 border-red-200/80",
  },
};

const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  paid: {
    label: "Paid",
    className: "border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] text-[color:var(--blue-navy)]",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-600 border-red-200/80",
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
    className: "bg-violet-50 text-violet-700 border-violet-200/80",
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
        "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        current.className,
      )}
    >
      {current.label}
    </Badge>
  );
}

export function DataTable({ data }: { data: RecentOrder[] }) {
  return (
    <Card
      className="bg-white shadow-sm"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <CardHeader
        className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between"
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
              <ListOrdered className="size-3.5" />
            </span>
            Pesanan Terbaru
          </CardTitle>
          <CardDescription className="mt-1 text-[12.5px]">
            Order terbaru dari seluruh program dan status pembayarannya.
          </CardDescription>
        </div>

        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors"
          style={{
            borderColor: "var(--border-soft)",
            color: "var(--text-muted)",
          }}
        >
          Lihat Semua
          <ArrowUpRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Inbox className="size-8" style={{ color: "var(--border)" }} />
            <div>
              <p
                className="font-display text-[13.5px] font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                Belum ada pesanan
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-faint)" }}>
                Pesanan akan muncul setelah ada pendaftaran program.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ background: "var(--bg-soft)" }}>
                  <TableHead className="min-w-[260px]">Customer</TableHead>
                  <TableHead className="min-w-[260px]">Program</TableHead>
                  <TableHead className="min-w-[150px]">Jumlah</TableHead>
                  <TableHead className="min-w-[190px]">Status</TableHead>
                  <TableHead className="min-w-[170px]">Tanggal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item) => {
                  const displayName = item.childName || item.customerName;

                  return (
                    <TableRow key={item.id} className="hover:bg-[var(--bg-soft)]">
                      <TableCell>
                        <div className="min-w-0">
                          <p
                            className="truncate text-[13px] font-bold"
                            style={{ color: "var(--text-main)" }}
                          >
                            {displayName}
                          </p>

                          {item.childName && (
                            <p className="text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                              Wali: {item.customerName}
                            </p>
                          )}

                          <div
                            className="mt-1 flex flex-col gap-1 text-[11.5px]"
                            style={{ color: "var(--text-faint)" }}
                          >
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
                              className="group inline-flex max-w-[240px] items-center gap-1 truncate text-[13px] font-semibold transition-colors"
                              style={{ color: "var(--text-main)" }}
                            >
                              <span className="truncate">{item.program.title}</span>
                              <ArrowUpRight
                                className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ color: "var(--blue)" }}
                              />
                            </Link>
                          ) : (
                            <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                              —
                            </p>
                          )}

                          <p
                            className="mt-1 truncate text-[11.5px]"
                            style={{ color: "var(--text-faint)" }}
                          >
                            Paket: {item.package.title ?? "—"}
                          </p>

                          {item.batch && (
                            <p
                              className="truncate text-[11.5px]"
                              style={{ color: "var(--text-faint)" }}
                            >
                              Batch: {item.batch.title}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <p
                          className="font-display text-[13.5px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {formatIDR(item.pricing.final)}
                        </p>

                        {item.payment?.invoiceNumber && (
                          <p
                            className="mt-1 inline-flex items-center gap-1 text-[11px]"
                            style={{ color: "var(--text-faint)" }}
                          >
                            <CreditCard className="size-3" />
                            {item.payment.invoiceNumber}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={item.status} meta={ENROLLMENT_STATUS_META} />
                          {item.payment && (
                            <StatusBadge status={item.payment.status} meta={PAYMENT_STATUS_META} />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
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