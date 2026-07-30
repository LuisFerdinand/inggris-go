// app/modules/merchant/server/merchant.router.ts

import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { merchantRegistrations } from "@/app/db/schema/payment-settings";
import { requireDbRole } from "@/lib/auth/roles";
import { generateId } from "@/lib/utils";

/* =========================================================
   INPUT
========================================================= */

const submitRegistrationInput = z.object({
  businessName: z.string().trim().min(2, "Nama usaha minimal 2 karakter").max(150),
  ownerName: z.string().trim().min(2, "Nama pemilik minimal 2 karakter").max(150),
  email: z.string().trim().email("Email tidak valid"),
  phone: z.string().trim().min(6, "Nomor telepon tidak valid").max(30),

  businessCategory: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),

  bankName: z.string().trim().min(2, "Nama bank wajib diisi").max(100),
  bankAccountNumber: z.string().trim().min(4, "Nomor rekening tidak valid").max(50),
  bankAccountName: z.string().trim().min(2, "Nama pemilik rekening wajib diisi").max(150),
});

const reviewRegistrationInput = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(1000).optional(),
});

const listRegistrationsInput = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

/* =========================================================
   ROUTER
========================================================= */

export const merchantRouter = createTRPCRouter({
  /* ────────────────────────────────────────────────────────
     USER-FACING — "/dashboard/merchant"
  ───────────────────────────────────────────────────────── */

  getMine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const row = await db.query.merchantRegistrations.findFirst({
      where: eq(merchantRegistrations.userId, userId),
    });

    return row ?? null;
  }),

  submit: protectedProcedure
    .input(submitRegistrationInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth?.userId;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existing = await db.query.merchantRegistrations.findFirst({
        where: eq(merchantRegistrations.userId, userId),
      });

      if (existing?.status === "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Merchant kamu sudah disetujui. Hubungi admin untuk perubahan data.",
        });
      }

      const values = {
        id: existing?.id ?? generateId("merchant"),
        userId,
        businessName: input.businessName,
        ownerName: input.ownerName,
        email: input.email,
        phone: input.phone,
        businessCategory: input.businessCategory || null,
        description: input.description || null,
        bankName: input.bankName,
        bankAccountNumber: input.bankAccountNumber,
        bankAccountName: input.bankAccountName,
        status: "pending" as const,
        reviewNote: null,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(merchantRegistrations)
        .values(values)
        .onConflictDoUpdate({
          target: merchantRegistrations.userId,
          set: values,
        })
        .returning();

      return row;
    }),

  /* ────────────────────────────────────────────────────────
     ADMIN REVIEW — "/dashboard/settings/merchant-requests"
     (super_admin only, same restriction as Payment Gateway)
  ───────────────────────────────────────────────────────── */

  listRegistrations: protectedProcedure
    .input(listRegistrationsInput)
    .query(async ({ input, ctx }) => {
      await requireDbRole(ctx.auth?.userId, ["super_admin"]);

      const conditions = input.status
        ? [eq(merchantRegistrations.status, input.status)]
        : [];

      const rows = await db.query.merchantRegistrations.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        orderBy: [desc(merchantRegistrations.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      const userIds = rows.map((r) => r.userId);

      const accounts = userIds.length
        ? await db.query.user.findMany({
            where: (u, { inArray }) => inArray(u.id, userIds),
            columns: { id: true, name: true, email: true, image: true },
          })
        : [];

      const accountById = new Map(accounts.map((a) => [a.id, a]));

      return rows.map((row) => ({
        ...row,
        account: accountById.get(row.userId) ?? null,
      }));
    }),

  reviewRegistration: protectedProcedure
    .input(reviewRegistrationInput)
    .mutation(async ({ input, ctx }) => {
      const actorUserId = ctx.auth?.userId;

      await requireDbRole(actorUserId, ["super_admin"]);

      const [row] = await db
        .update(merchantRegistrations)
        .set({
          status: input.status,
          reviewNote: input.reviewNote?.trim() || null,
          reviewedBy: actorUserId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(merchantRegistrations.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan merchant tidak ditemukan",
        });
      }

      return row;
    }),
});
