// app/modules/order/server/order.router.ts

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

import { createTRPCRouter, baseProcedure } from "@/lib/trpc/init";
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

const DEFAULT_REGISTERED_ROLE_NAME = "user" as const;
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

async function getOrCreateDefaultUserRole() {
  const existingRole = await db.query.role.findFirst({
    where: eq(role.name, DEFAULT_REGISTERED_ROLE_NAME),
  });

  if (existingRole) return existingRole;

  const inserted = await db
    .insert(role)
    .values({
      id: genId("role"),
      name: DEFAULT_REGISTERED_ROLE_NAME,
      description: "Default registered user",
    })
    .returning();

  const createdRole = inserted[0];

  if (!createdRole) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Gagal membuat role default user.",
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

      const defaultUserRole = await getOrCreateDefaultUserRole();

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
          eq(userRole.roleId, defaultUserRole.id),
        ),
      });

      if (!existingUserRole) {
        await db.insert(userRole).values({
          id: genId("urole"),
          userId: account.id,
          roleId: defaultUserRole.id,
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

      await db.insert(payments).values({
        id: paymentId,
        enrollmentId,
        provider: "doku",
        invoiceNumber,
        amount: finalPrice,
        currency: "IDR",
        status: "pending",
      });

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

      return {
        enrollmentId,
        invoiceNumber,
        paymentUrl: doku.paymentUrl,
      };
    }),
});