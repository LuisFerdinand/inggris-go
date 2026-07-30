// app/modules/order/server/order.router.ts

import { z } from "zod";
import { and, desc, eq, gte, ilike, or, sql, SQL } from "drizzle-orm";import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/lib/trpc/init";
import { auth } from "@/lib/auth";

import { db } from "@/app/db/db";
import {
  programs,
  programBatches,
  programPackages,
} from "@/app/db/schema/programs";
import { enrollments, payments } from "@/app/db/schema/orders";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";
import {
  getAdminUserIds,
  notifyUsers,
} from "@/app/modules/notifications/server/create-notification";

const DEFAULT_REGISTERED_ROLE_NAME = "student" as const;
const REGISTRABLE_BATCH_STATUSES = new Set(["open", "ongoing"]);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function genId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function genInvoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `INV-${stamp}-${rand}`;
}

function isBatchAtCapacity(batch: typeof programBatches.$inferSelect) {
  if (batch.capacity == null) return false;

  const enrolledCount = batch.enrolledCount ?? 0;
  return enrolledCount >= batch.capacity;
}

async function getOrCreateDefaultStudentRole() {
  const existingRole = await db.query.role.findFirst({
    where: eq(role.name, DEFAULT_REGISTERED_ROLE_NAME),
  });

  if (existingRole) return existingRole;

  const inserted = await db
    .insert(role)
    .values({
      id: genId("role"),
      name: DEFAULT_REGISTERED_ROLE_NAME,
      description: "Default registered student",
    })
    .returning();

  const createdRole = inserted[0];

  if (!createdRole) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Gagal membuat role default student.",
    });
  }

  return createdRole;
}

const registerOnlineInput = z.object({
  programId: z.string().trim().min(1),
  packageId: z.string().trim().min(1),
  batchId: z.string().trim().min(1).optional(),

  fullName: z.string().trim().min(2, "Nama minimal 2 karakter"),
  whatsapp: z.string().trim().min(6, "Nomor WhatsApp tidak valid"),
  email: z.string().trim().email("Email tidak valid"),
  age: z.coerce.number().int().positive().optional(),

  password: z
    .preprocess((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }, z.string().min(6, "Password minimal 6 karakter").optional())
    .optional(),
});

/* =========================================================
   ENROLLMENTS (dashboard "Pendaftar" tab)
========================================================= */

const getEnrollmentsByProgramInput = z.object({
  programId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),

  status: z
    .enum(["pending_payment", "paid", "confirmed", "cancelled", "expired"])
    .optional(),

  paymentStatus: z
    .enum(["pending", "paid", "failed", "expired", "cancelled", "refunded"])
    .optional(),

  batchId: z.string().optional(),

  search: z.string().trim().optional(),

  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const getEnrollmentByIdInput = z.object({
  id: z.string().min(1),
});

export type EnrollmentListResult = Awaited<ReturnType<typeof buildEnrollmentList>>;
export type EnrollmentListItem = EnrollmentListResult["items"][number];
export type EnrollmentDetail = Awaited<ReturnType<typeof buildEnrollmentDetail>>;

async function buildEnrollmentList(
  input: z.infer<typeof getEnrollmentsByProgramInput>,
) {
  const conditions: SQL[] = [];

  if (input.programId) {
    conditions.push(eq(enrollments.programId, input.programId));
  }

  if (input.userId) {
    conditions.push(eq(enrollments.userId, input.userId));
  }

  if (input.status) {
    conditions.push(eq(enrollments.status, input.status));
  }

  if (input.batchId) {
    conditions.push(eq(enrollments.batchId, input.batchId));
  }

  if (input.search) {
    const term = `%${input.search}%`;
    const searchCondition = or(
      ilike(enrollments.customerName, term),
      ilike(enrollments.email, term),
      ilike(enrollments.phone, term),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(enrollments)
    .where(and(...conditions));

  const rows = await db.query.enrollments.findMany({
    where: and(...conditions),
    orderBy: [desc(enrollments.createdAt)],
    limit: input.limit,
    offset: input.offset,
  });

  const enrollmentIds = rows.map((r) => r.id);

  const latestPayments = enrollmentIds.length
    ? await db.query.payments.findMany({
        where: (p, { inArray }) => inArray(p.enrollmentId, enrollmentIds),
        orderBy: [desc(payments.createdAt)],
      })
    : [];

  const paymentByEnrollment = new Map<string, (typeof latestPayments)[number]>();
  for (const p of latestPayments) {
    if (!paymentByEnrollment.has(p.enrollmentId)) {
      paymentByEnrollment.set(p.enrollmentId, p);
    }
  }

  let filtered = rows;
  if (input.paymentStatus) {
    filtered = rows.filter(
      (r) => paymentByEnrollment.get(r.id)?.status === input.paymentStatus,
    );
  }

  const items = filtered.map((r) => {
    const payment = paymentByEnrollment.get(r.id);

    return {
      id: r.id,
      type: r.type,
      status: r.status,

      customerName: r.customerName,
      phone: r.phone,
      email: r.email,
      childName: r.childName,
      age: r.age,

      program: {
        id: r.programId,
        title: r.programSnapshot?.title ?? null,
        slug: r.programSnapshot?.slug ?? null,
        categorySlug: r.programSnapshot?.categorySlug ?? null,
        thumbnail: r.programSnapshot?.thumbnail ?? null,
        format: r.programSnapshot?.format ?? null,
        level: r.programSnapshot?.level ?? null,
      },

      batch: r.batchSnapshot
        ? {
            id: r.batchId,
            title: r.batchSnapshot.title,
            startDate: r.batchSnapshot.startDate ?? null,
            endDate: r.batchSnapshot.endDate ?? null,
            mode: r.batchSnapshot.mode ?? null,
            location: r.batchSnapshot.location ?? null,
          }
        : null,

      package: {
        id: r.packageId,
        title: r.packageSnapshot?.title ?? null,
        price: r.packageSnapshot?.price ?? null,
        originalPrice: r.packageSnapshot?.originalPrice ?? null,
      },

      pricing: {
        subtotal: r.subtotalPrice,
        discount: r.discountAmount,
        final: r.finalPrice,
        couponCode: r.couponCode ?? null,
      },

      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            method: payment.paymentMethod,
            invoiceNumber: payment.invoiceNumber,
            paymentUrl: payment.paymentUrl,
            paidAt: payment.paidAt,
            expiredAt: payment.expiredAt,
          }
        : null,

      isManual: r.isManual,
      source: r.source,

      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });

  return {
    items,
    total: input.paymentStatus ? items.length : count,
    limit: input.limit,
    offset: input.offset,
  };
}

async function buildEnrollmentDetail(id: string) {
  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, id),
  });

  if (!enrollment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Pendaftaran tidak ditemukan",
    });
  }

  const enrollmentPayments = await db.query.payments.findMany({
    where: eq(payments.enrollmentId, id),
    orderBy: [desc(payments.createdAt)],
  });

  const account = enrollment.userId
    ? await db.query.user.findFirst({
        where: eq(user.id, enrollment.userId),
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          age: true,
          image: true,
          createdAt: true,
        },
      })
    : null;

  return {
    id: enrollment.id,
    type: enrollment.type,
    status: enrollment.status,
    scheduleType: enrollment.scheduleType,

    customerName: enrollment.customerName,
    phone: enrollment.phone,
    email: enrollment.email,
    childName: enrollment.childName,
    age: enrollment.age,

    program: enrollment.programSnapshot,
    batch: enrollment.batchSnapshot,
    package: enrollment.packageSnapshot,

    pricing: {
      subtotal: enrollment.subtotalPrice,
      discount: enrollment.discountAmount,
      final: enrollment.finalPrice,
      couponCode: enrollment.couponCode,
      couponSnapshot: enrollment.couponSnapshot,
    },

    formData: enrollment.data,
    attachments: enrollment.attachments,
    metadata: enrollment.metadata,

    isManual: enrollment.isManual,
    source: enrollment.source,

    payments: enrollmentPayments.map((p) => ({
      id: p.id,
      provider: p.provider,
      method: p.paymentMethod,
      invoiceNumber: p.invoiceNumber,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paymentUrl: p.paymentUrl,
      paidAt: p.paidAt,
      expiredAt: p.expiredAt,
      failureReason: p.failureReason,
      createdAt: p.createdAt,
    })),

    account,

    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  };
}

/* =========================================================
   DASHBOARD ANALYTICS
========================================================= */

const chartGranularityEnum = z.enum(["day", "week", "month"]);

const GRANULARITY_DEFAULT_RANGE: Record<z.infer<typeof chartGranularityEnum>, number> = {
  day: 30,
  week: 12,
  month: 12,
};

const GRANULARITY_MAX_RANGE: Record<z.infer<typeof chartGranularityEnum>, number> = {
  day: 90,
  week: 26,
  month: 24,
};

const dashboardOverviewInput = z.object({
  granularity: chartGranularityEnum.default("month"),
  // Number of buckets to show. Defaults/caps depend on granularity
  // (e.g. 30 days vs 12 weeks vs 12 months) — see GRANULARITY_*_RANGE.
  range: z.number().int().min(1).max(90).optional(),
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date) {
  // Monday-based week start.
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  return addDays(d, diff);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getWeekKey(date: Date) {
  return getDayKey(startOfWeek(date));
}

function getWeekLabel(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();

  const startLabel = start.toLocaleDateString("id-ID", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endLabel = end.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  return `${startLabel}–${endLabel}`;
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });
}

// Bucket-key / bucket-label / next-bucket-start, keyed by granularity.
const BUCKET_STRATEGY = {
  day: {
    bucketStart: startOfDay,
    key: getDayKey,
    label: getDayLabel,
    advance: (date: Date) => addDays(date, 1),
  },
  week: {
    bucketStart: startOfWeek,
    key: getWeekKey,
    label: getWeekLabel,
    advance: (date: Date) => addDays(date, 7),
  },
  month: {
    bucketStart: startOfMonth,
    key: getMonthKey,
    label: getMonthLabel,
    advance: (date: Date) => addMonths(date, 1),
  },
} satisfies Record<
  z.infer<typeof chartGranularityEnum>,
  {
    bucketStart: (date: Date) => Date;
    key: (date: Date) => string;
    label: (date: Date) => string;
    advance: (date: Date) => Date;
  }
>;

function isPaidEnrollmentStatus(status: string) {
  return status === "paid" || status === "confirmed";
}

function isUnpaidEnrollmentStatus(status: string) {
  return status === "pending_payment";
}

// Steps a bucket-start date backward by one bucket — the inverse of
// each strategy's `advance`.
const BUCKET_RETREAT: Record<
  z.infer<typeof chartGranularityEnum>,
  (date: Date) => Date
> = {
  day: (date) => addDays(date, -1),
  week: (date) => addDays(date, -7),
  month: (date) => addMonths(date, -1),
};

async function buildDashboardOverview(
  input: z.infer<typeof dashboardOverviewInput>,
) {
  const now = new Date();
  const strategy = BUCKET_STRATEGY[input.granularity];
  const retreat = BUCKET_RETREAT[input.granularity];

  const range = Math.min(
    input.range ?? GRANULARITY_DEFAULT_RANGE[input.granularity],
    GRANULARITY_MAX_RANGE[input.granularity],
  );

  // Walk back `range - 1` buckets from the current bucket to get the
  // window start — e.g. range=30 with granularity="day" means "today
  // and the 29 days before it".
  let fromDate = strategy.bucketStart(now);
  for (let i = 0; i < range - 1; i++) {
    fromDate = retreat(fromDate);
  }

  const [summaryRow] = await db
    .select({
      totalOrders: sql<number>`count(*)`.mapWith(Number),

      paidOrders:
        sql<number>`count(*) filter (where ${enrollments.status} in ('paid', 'confirmed'))`.mapWith(
          Number,
        ),

      unpaidOrders:
        sql<number>`count(*) filter (where ${enrollments.status} = 'pending_payment')`.mapWith(
          Number,
        ),

      cancelledOrders:
        sql<number>`count(*) filter (where ${enrollments.status} in ('cancelled', 'expired'))`.mapWith(
          Number,
        ),

      paidRevenue:
        sql<number>`coalesce(sum(case when ${enrollments.status} in ('paid', 'confirmed') then ${enrollments.finalPrice} else 0 end), 0)`.mapWith(
          Number,
        ),

      unpaidRevenue:
        sql<number>`coalesce(sum(case when ${enrollments.status} = 'pending_payment' then ${enrollments.finalPrice} else 0 end), 0)`.mapWith(
          Number,
        ),

      totalPotentialRevenue:
        sql<number>`coalesce(sum(${enrollments.finalPrice}), 0)`.mapWith(Number),

      averagePaidOrderValue:
        sql<number>`coalesce(avg(case when ${enrollments.status} in ('paid', 'confirmed') then ${enrollments.finalPrice} end), 0)`.mapWith(
          Number,
        ),
    })
    .from(enrollments);

  const chartRows = await db
    .select({
      status: enrollments.status,
      finalPrice: enrollments.finalPrice,
      createdAt: enrollments.createdAt,
    })
    .from(enrollments)
    .where(gte(enrollments.createdAt, fromDate));

  const chartMap = new Map<
    string,
    {
      month: string;
      label: string;
      paid: number;
      unpaid: number;
      total: number;
      paidOrders: number;
      unpaidOrders: number;
      totalOrders: number;
    }
  >();

  let cursor = fromDate;
  for (let i = 0; i < range; i++) {
    const key = strategy.key(cursor);

    chartMap.set(key, {
      month: key,
      label: strategy.label(cursor),
      paid: 0,
      unpaid: 0,
      total: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalOrders: 0,
    });

    cursor = strategy.advance(cursor);
  }

  for (const row of chartRows) {
    const key = strategy.key(row.createdAt);
    const point = chartMap.get(key);

    if (!point) continue;

    point.total += row.finalPrice;
    point.totalOrders += 1;

    if (isPaidEnrollmentStatus(row.status)) {
      point.paid += row.finalPrice;
      point.paidOrders += 1;
    }

    if (isUnpaidEnrollmentStatus(row.status)) {
      point.unpaid += row.finalPrice;
      point.unpaidOrders += 1;
    }
  }

  const recent = await buildEnrollmentList({
    limit: 8,
    offset: 0,
  });

  const totalOrders = summaryRow?.totalOrders ?? 0;
  const paidOrders = summaryRow?.paidOrders ?? 0;

  return {
    summary: {
      totalOrders,
      paidOrders,
      unpaidOrders: summaryRow?.unpaidOrders ?? 0,
      cancelledOrders: summaryRow?.cancelledOrders ?? 0,

      paidRevenue: summaryRow?.paidRevenue ?? 0,
      unpaidRevenue: summaryRow?.unpaidRevenue ?? 0,
      totalPotentialRevenue: summaryRow?.totalPotentialRevenue ?? 0,
      averagePaidOrderValue: summaryRow?.averagePaidOrderValue ?? 0,

      paidRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
    },

    chart: Array.from(chartMap.values()),

    recentOrders: recent.items,
  };
}

export type OrderDashboardOverview = Awaited<
  ReturnType<typeof buildDashboardOverview>
>;

/* =========================================================
   ROUTER
========================================================= */

export const orderRouter = createTRPCRouter({
  registerOnline: baseProcedure
    .input(registerOnlineInput)
    .mutation(async ({ input }) => {
      const session = await auth();

      const sessionUser = session?.user as
        | {
            id?: string;
            name?: string | null;
            email?: string | null;
          }
        | undefined;

      const sessionUserId = sessionUser?.id;

      const email = normalizeEmail(input.email);
      const fullName = input.fullName.trim();
      const whatsapp = input.whatsapp.trim();

      const program = await db.query.programs.findFirst({
        where: and(
          eq(programs.id, input.programId),
          eq(programs.status, "published"),
        ),
        with: { category: true },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan atau belum dipublikasikan.",
        });
      }

      const isScheduled = program.scheduleType === "scheduled";

      const pkg = await db.query.programPackages.findFirst({
        where: and(
          eq(programPackages.id, input.packageId),
          eq(programPackages.programId, program.id),
        ),
      });

      if (!pkg) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Paket tidak ditemukan untuk program ini.",
        });
      }

      let batch: typeof programBatches.$inferSelect | undefined;

      if (isScheduled) {
        if (!input.batchId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Silakan pilih batch terlebih dahulu.",
          });
        }

        batch = await db.query.programBatches.findFirst({
          where: and(
            eq(programBatches.id, input.batchId),
            eq(programBatches.programId, program.id),
          ),
        });

        if (!batch) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Batch tidak ditemukan untuk program ini.",
          });
        }

        if (!REGISTRABLE_BATCH_STATUSES.has(batch.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Batch ini belum dibuka atau sudah ditutup.",
          });
        }

        if (isBatchAtCapacity(batch)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kuota batch ini sudah penuh.",
          });
        }

        if (pkg.batchId && pkg.batchId !== batch.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Paket tidak tersedia untuk batch yang dipilih.",
          });
        }
      } else {
        if (input.batchId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Program ini tidak menggunakan batch.",
          });
        }

        if (pkg.batchId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Paket ini hanya tersedia untuk batch tertentu.",
          });
        }
      }

      const subtotal = pkg.price;
      const discount = 0;
      const finalPrice = Math.max(subtotal - discount, 0);
      const invoiceNumber = genInvoiceNumber();

      const defaultStudentRole = await getOrCreateDefaultStudentRole();

      let account: typeof user.$inferSelect | undefined;

      if (sessionUserId) {
        account = await db.query.user.findFirst({
          where: eq(user.id, sessionUserId),
        });

        if (!account) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sesi login tidak valid. Silakan login ulang.",
          });
        }
      } else {
        account = await db.query.user.findFirst({
          where: eq(user.email, email),
        });

        if (account) {
          if (!input.password) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Email sudah terdaftar. Silakan login terlebih dahulu atau masukkan password akun tersebut.",
            });
          }

          if (!account.passwordHash) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Akun ini tidak memiliki password login. Silakan login dengan metode sebelumnya.",
            });
          }

          const passwordValid = await bcrypt.compare(
            input.password,
            account.passwordHash,
          );

          if (!passwordValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message:
                "Password salah untuk email ini. Silakan login terlebih dahulu.",
            });
          }
        } else {
          if (!input.password) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Password wajib diisi untuk membuat akun baru.",
            });
          }

          const passwordHash = await bcrypt.hash(input.password, 10);
          const userId = genId("user");

          const inserted = await db
            .insert(user)
            .values({
              id: userId,
              name: fullName,
              email,
              passwordHash,
              emailVerified: false,
              phone: whatsapp,
              age: input.age ?? null,
            })
            .returning();

          account = inserted[0];

          if (!account) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Gagal membuat akun user.",
            });
          }
        }
      }

      const existingUserRole = await db.query.userRole.findFirst({
        where: and(
          eq(userRole.userId, account.id),
          eq(userRole.roleId, defaultStudentRole.id),
        ),
      });

      if (!existingUserRole) {
        await db.insert(userRole).values({
          id: genId("urole"),
          userId: account.id,
          roleId: defaultStudentRole.id,
        });
      }

      // Save latest registration contact data to user profile.
      await db
        .update(user)
        .set({
          name: fullName,
          phone: whatsapp,
          age: input.age ?? null,
        })
        .where(eq(user.id, account.id));

      const enrollmentEmail = account.email ?? email;
      const enrollmentId = genId("enr");

      await db.insert(enrollments).values({
        id: enrollmentId,
        programId: program.id,
        batchId: batch?.id ?? null,
        packageId: pkg.id,
        userId: account.id,

        scheduleType: program.scheduleType,
        type: "online",

        programSnapshot: {
          id: program.id,
          title: program.title,
          slug: program.slug,
          categorySlug: program.category?.slug ?? undefined,
          format: program.format ?? undefined,
          level: program.level ?? undefined,
          thumbnail: program.thumbnailUrl ?? undefined,
        },

        batchSnapshot: batch
          ? {
              id: batch.id,
              title: batch.title,
              slug: batch.slug ?? undefined,
              startDate: batch.startDate?.toISOString(),
              endDate: batch.endDate?.toISOString(),
              mode: batch.mode ?? undefined,
              location: batch.location ?? undefined,
            }
          : null,

        packageSnapshot: {
          id: pkg.id,
          title: pkg.title,
          slug: pkg.slug ?? undefined,
          description: pkg.description ?? undefined,
          price: pkg.price,
          originalPrice: pkg.originalPrice ?? null,
          isDefault: pkg.isDefault,
        },

        customerName: fullName,
        phone: whatsapp,
        email: enrollmentEmail,
        age: input.age ?? null,

        data: {
          type: "online",
          programId: program.id,
          batchId: batch?.id,
          packageId: pkg.id,
          fullName,
          whatsapp,
          email: enrollmentEmail,
          age: input.age,
        },

        discountAmount: discount,
        subtotalPrice: subtotal,
        finalPrice,
        status: "pending_payment",
      });

      const paymentId = genId("pay");

      const { getActiveGatewayCredentials, TRIPAY_PROVIDER } = await import(
        "@/app/modules/payment-settings/server/payment-settings.service"
      );

      const tripayCredentials = await getActiveGatewayCredentials(TRIPAY_PROVIDER);
      const provider = tripayCredentials ? "tripay" : "doku";

      await db.insert(payments).values({
        id: paymentId,
        enrollmentId,
        provider,
        invoiceNumber,
        amount: finalPrice,
        currency: "IDR",
        status: "pending",
      });

      let paymentUrl: string;

      if (tripayCredentials) {
        const { createTripayTransaction } = await import("@/lib/payments/tripay");

        const tripay = await createTripayTransaction({
          invoiceNumber,
          amount: finalPrice,
          itemName: program.title,
          customer: {
            name: fullName,
            email: enrollmentEmail,
            phone: whatsapp,
          },
        });

        await db
          .update(payments)
          .set({
            gatewayReference: tripay.reference,
            paymentUrl: tripay.paymentUrl,
          })
          .where(eq(payments.id, paymentId));

        paymentUrl = tripay.paymentUrl;
      } else {
        const { createDokuInvoice } = await import("@/lib/payments/doku");

        const doku = await createDokuInvoice({
          invoiceNumber,
          amount: finalPrice,
          customer: {
            name: fullName,
            email: enrollmentEmail,
            phone: whatsapp,
          },
        });

        await db
          .update(payments)
          .set({
            dokuInvoiceId: doku.dokuInvoiceId,
            paymentUrl: doku.paymentUrl,
          })
          .where(eq(payments.id, paymentId));

        paymentUrl = doku.paymentUrl;
      }

      const adminIds = await getAdminUserIds();
      await notifyUsers(adminIds, {
        category: "order",
        type: "order_new",
        title: "Pendaftaran baru",
        body: `${fullName} mendaftar ke ${program.title}`,
        link: "/dashboard/orders",
      });

      return {
        enrollmentId,
        invoiceNumber,
        paymentUrl,
      };
    }),

  /* ────────────────────────────────────────────────────────
     ENROLLMENTS — "Pendaftar" tab (dashboard)
  ───────────────────────────────────────────────────────── */

  getEnrollmentsByProgram: protectedProcedure
    .input(getEnrollmentsByProgramInput)
    .query(async ({ input }) => {
      if (!input.programId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "programId wajib diisi",
        });
      }

      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
        columns: { id: true, scheduleType: true },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });
      }

      return buildEnrollmentList(input);
    }),

  getProgramBatchOptions: protectedProcedure
    .input(z.object({ programId: z.string().min(1) }))
    .query(async ({ input }) => {
      return db.query.programBatches.findMany({
        where: eq(programBatches.programId, input.programId),
        columns: { id: true, title: true },
        orderBy: [desc(programBatches.createdAt)],
      });
    }),

  getEnrollmentById: protectedProcedure
    .input(getEnrollmentByIdInput)
    .query(async ({ input }) => buildEnrollmentDetail(input.id)),

  /* ────────────────────────────────────────────────────────
     MY ORDERS — "/dashboard/program-saya" (regular user view)
  ───────────────────────────────────────────────────────── */

  /**
   * Orders/enrollments belonging to the currently logged-in user.
   * `userId` is taken from the session, never from client input,
   * so a user can only ever see their own data.
   */
  getMyOrders: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["pending_payment", "paid", "confirmed", "cancelled", "expired"])
          .optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return buildEnrollmentList({
        userId: ctx.auth.userId,
        status: input.status,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /* ────────────────────────────────────────────────────────
     ORDERS — global "/dashboard/orders" page
  ───────────────────────────────────────────────────────── */

  getDashboardOverview: protectedProcedure
    .input(dashboardOverviewInput)
    .query(async ({ input }) => {
      return buildDashboardOverview(input);
    }),

  /**
   * Cross-program enrollment/order list. Same shape as
   * `getEnrollmentsByProgram`, but `programId` is optional so it
   * can list orders across every program.
   */
  getAll: protectedProcedure
    .input(getEnrollmentsByProgramInput.omit({ programId: true }).extend({
      programId: z.string().min(1).optional(),
    }))
    .query(async ({ input }) => {
      return buildEnrollmentList(input);
    }),

  /**
   * Programs that have at least one enrollment — used to populate
   * the program filter dropdown on the global orders page.
   */
  getOrderProgramOptions: protectedProcedure.query(async () => {
    const rows = await db
      .selectDistinct({
        id: programs.id,
        title: programs.title,
        slug: programs.slug,
      })
      .from(enrollments)
      .innerJoin(programs, eq(enrollments.programId, programs.id))
      .orderBy(programs.title);

    return rows;
  }),

  /**
   * Update the enrollment-level status (e.g. mark as confirmed,
   * cancel, mark expired). Does not touch the payment record.
   */
  updateEnrollmentStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum([
          "pending_payment",
          "paid",
          "confirmed",
          "cancelled",
          "expired",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(enrollments)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(enrollments.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pendaftaran tidak ditemukan",
        });
      }

      return row;
    }),

  /**
   * Update the latest payment's status for an enrollment
   * (e.g. mark manual transfer as paid, mark as refunded).
   */
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().min(1),
        status: z.enum([
          "pending",
          "paid",
          "failed",
          "expired",
          "cancelled",
          "refunded",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(payments)
        .set({
          status: input.status,
          ...(input.status === "paid" ? { paidAt: new Date() } : {}),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, input.paymentId))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pembayaran tidak ditemukan",
        });
      }

      // Keep enrollment status in sync for the common "mark as paid" case.
      if (input.status === "paid") {
        const [enrollment] = await db
          .update(enrollments)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(enrollments.id, row.enrollmentId))
          .returning();

        const adminIds = await getAdminUserIds();
        await notifyUsers(adminIds, {
          category: "order",
          type: "order_paid",
          title: "Pembayaran berhasil",
          body: enrollment
            ? `Pembayaran dari ${enrollment.customerName} telah dikonfirmasi — ${row.invoiceNumber}`
            : `Pembayaran ${row.invoiceNumber} telah dikonfirmasi`,
          link: "/dashboard/orders",
        });
      }

      return row;
    }),
});