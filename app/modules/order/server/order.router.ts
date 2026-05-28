import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init"; // adjust path

import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  EnrollmentData,
  enrollments,
  programBatches,
  programPackages,
  programs,
} from "@/app/db/schema";
import { db } from "@/app/db/db";
import { TRPCError } from "@trpc/server";

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const onlineInputSchema = z.object({
  type: z.literal("online"),
  programId: z.string().min(1),
  batchId: z.string().optional(),
  fullName: z.string().min(2),
  whatsapp: z.string().min(9),
  email: z.string().email().optional().or(z.literal("")),
  age: z.coerce.number().min(1).max(120).optional(),
});

const offlineInputSchema = z.object({
  type: z.literal("offline"),
  programId: z.string().min(1),
  batchId: z.string().min(1),
  nama: z.string().min(2),
  panggilan: z.string().min(1),
  jenisKelamin: z.enum(["L", "P"]),
  tempatLahir: z.string().min(2),
  tanggalLahir: z.string().min(1),
  usia: z.coerce.number().min(1),
  kelas: z.string().min(1),
  sekolah: z.string().min(2),
  kotaAsal: z.string().min(2),
  namaOrtu: z.string().min(2),
  hpOrtu: z.string().min(9),
  hpAnak: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  alumni: z.enum(["yes", "no"]),
  sumberInfo: z.string().min(1),
  alergi: z.enum(["yes", "no"]),
  detailAlergi: z.string().optional(),
  catatan: z.string().optional(),
  harapan: z.string().min(5),
  ukuranKaos: z.string().min(1),
  // fotoAnak is uploaded separately via /api/upload — pass back the URL here
  fotoAnak: z.string().url().optional(),
});

const registerInputSchema = z.discriminatedUnion("type", [
  onlineInputSchema,
  offlineInputSchema,
]);

// ─── Procedure ────────────────────────────────────────────────────────────────

export const orderRouter = createTRPCRouter({
  registerProgram: baseProcedure
    .input(
      z.discriminatedUnion("type", [
        // Online
        z.object({
          type: z.literal("online"),
          programId: z.string().min(1),
          batchId: z.string().optional(),
          packageId: z.string().min(1),
          fullName: z.string().min(2),
          whatsapp: z.string().min(9),
          email: z.string().email().optional().or(z.literal("")),
          age: z.coerce.number().min(1).max(120).optional(),
        }),
        // Offline
        z.object({
          type: z.literal("offline"),
          programId: z.string().min(1),
          batchId: z.string().min(1),
          packageId: z.string().optional(),
          nama: z.string().min(2),
          panggilan: z.string().min(1),
          jenisKelamin: z.enum(["L", "P"]),
          tempatLahir: z.string().min(2),
          tanggalLahir: z.string().min(1),
          usia: z.coerce.number().min(1),
          kelas: z.string().min(1),
          sekolah: z.string().min(2),
          kotaAsal: z.string().min(2),
          namaOrtu: z.string().min(2),
          hpOrtu: z.string().min(9),
          hpAnak: z.string().optional().or(z.literal("")),
          email: z.string().email().optional().or(z.literal("")),
          alumni: z.enum(["yes", "no"]),
          sumberInfo: z.string().min(1),
          alergi: z.enum(["yes", "no"]),
          detailAlergi: z.string().optional(),
          catatan: z.string().optional(),
          harapan: z.string().min(5),
          ukuranKaos: z.string().min(1),
          fotoAnak: z.string().url().optional(),
        }),
      ]),
    )
    .mutation(async ({ input }) => {
      // ── 1. Fetch program ─────────────────────────────────────────────────
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
        columns: {
          id: true,
          title: true,
          slug: true,
          registrationType: true,
          scheduleType: true,
        },
      });
      if (!program) throw new Error("Program not found");
      if (program.registrationType !== input.type) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Registration type mismatch: program is "${program.registrationType}" but payload says "${input.type}"`,
        });
      }

      // ── 2. Fetch batch ───────────────────────────────────────────────────
      const batchId =
        input.type === "offline"
          ? input.batchId
          : (input as { batchId?: string }).batchId;

      let batchRecord:
        | {
            id: string;
            title: string;
            slug: string;
            startDate: Date | null;
            endDate: Date | null;
            mode: string | null;
            location: string | null;
            capacity: number | null;
            enrolledCount: number;
            status: string;
          }
        | undefined;

      if (batchId) {
        batchRecord = await db.query.programBatches.findFirst({
          where: eq(programBatches.id, batchId),
          columns: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            mode: true,
            location: true,
            capacity: true,
            enrolledCount: true,
            status: true,
          },
        });
        if (!batchRecord)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Batch not found",
          });
        if (batchRecord.status !== "open") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This batch is no longer open for registration",
          });
        }
        if (
          batchRecord.capacity != null &&
          batchRecord.enrolledCount >= batchRecord.capacity
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This batch is full",
          });
        }
      }

      // ── 3. Fetch selected package (price now lives here) ─────────────────

      const packageId = input.packageId;

      if (!packageId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Package is required",
        });
      }
      let packageWhereCondition;

      if (program.scheduleType === "permanent") {
        // Permanent:
        // package belongs directly to program
        // batchId must be null

        if (batchId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Permanent program cannot use batch",
          });
        }

        packageWhereCondition = and(
          eq(programPackages.id, packageId),
          eq(programPackages.programId, program.id),
          isNull(programPackages.batchId),
        );
      } else {
        // Scheduled:
        // package must belong to selected batch

        if (!batchId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Batch is required",
          });
        }

        packageWhereCondition = and(
          eq(programPackages.id, packageId),
          eq(programPackages.programId, program.id),
          eq(programPackages.batchId, batchId),
        );
      }

      const packageRecord = await db.query.programPackages.findFirst({
        where: packageWhereCondition,
        columns: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          isDefault: true,
        },
      });

      if (!packageRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Package not found",
        });
      }
      const resolvedPackageId = packageRecord.id;

      // ── 4. Build OrderData ───────────────────────────────────────────────
      let orderData: EnrollmentData;

      if (input.type === "online") {
        orderData = {
          type: "online",

          programId: input.programId,

          batchId: input.batchId,

          packageId: resolvedPackageId,

          fullName: input.fullName,
          whatsapp: input.whatsapp,
          email: input.email || undefined,
          age: input.age,
        };
      } else {
        orderData = {
          type: "offline",

          programId: input.programId,

          packageId: resolvedPackageId,
          packageLabel: packageRecord.title,

          batchId: input.batchId,
          batchLabel: batchRecord?.title ?? "",

          nama: input.nama,
          panggilan: input.panggilan,
          jenisKelamin: input.jenisKelamin,
          tempatLahir: input.tempatLahir,
          tanggalLahir: input.tanggalLahir,
          usia: input.usia,
          kelas: input.kelas,
          sekolah: input.sekolah,
          kotaAsal: input.kotaAsal,
          namaOrtu: input.namaOrtu,
          hpOrtu: input.hpOrtu,
          hpAnak: input.hpAnak || undefined,
          email: input.email || undefined,
          alumni: input.alumni,
          sumberInfo: input.sumberInfo,
          alergi: input.alergi,
          detailAlergi: input.detailAlergi,
          catatan: input.catatan,
          harapan: input.harapan,
          ukuranKaos: input.ukuranKaos,
        };
      }

      // ── 5. Insert order ──────────────────────────────────────────────────
      const orderId = nanoid(12);
      const customerName =
        input.type === "online" ? input.fullName : input.namaOrtu;
      const phone = input.type === "online" ? input.whatsapp : input.hpOrtu;
      const email =
        input.type === "online" ? input.email || null : input.email || null;
      const childName = input.type === "offline" ? input.nama : null;
      const age =
        input.type === "online" ? (input.age ?? null) : (input.usia ?? null);

      await db.insert(enrollments).values({
        id: orderId,
        programId: input.programId,
        batchId: batchId ?? null,
        packageId: resolvedPackageId,
        scheduleType: program.scheduleType,
        subtotalPrice: packageRecord.originalPrice ?? packageRecord.price,

        finalPrice: packageRecord.price,
        discountAmount: Math.max(
          (packageRecord.originalPrice ?? packageRecord.price) -
            packageRecord.price,
          0,
        ),
        programSnapshot: {
          id: program.id,
          title: program.title,
          slug: program.slug,
        },
        batchSnapshot: batchRecord
          ? {
              id: batchRecord.id,
              title: batchRecord.title,
              slug: batchRecord.slug,
              startDate: batchRecord.startDate?.toISOString(),
              endDate: batchRecord.endDate?.toISOString(),
              mode: batchRecord.mode ?? undefined,
              location: batchRecord.location ?? undefined,
            }
          : null,
        packageSnapshot: {
          id: packageRecord.id,
          title: packageRecord.title,
          slug: packageRecord.slug ?? undefined,
          description: packageRecord.description ?? undefined,
          price: packageRecord.price,
          originalPrice: packageRecord.originalPrice ?? null,
          isDefault: packageRecord.isDefault,
        },

        type: input.type,
        customerName,
        phone,
        email,
        childName,
        age,
        data: orderData,
        attachments:
          input.type === "offline" && input.fotoAnak
            ? { foto: input.fotoAnak }
            : undefined,
        source: "web",
        status: "pending_payment",
      });

      return {
        orderId,

        programTitle: program.title,

        batchTitle: batchRecord?.title ?? null,
        batchStartDate: batchRecord?.startDate?.toISOString() ?? null,
        batchLocation: batchRecord?.location ?? null,

        price: packageRecord.price,
        originalPrice: packageRecord.originalPrice ?? null,

        packageTitle: packageRecord.title,

        customerName,
        phone,

        type: input.type,

        scheduleType: program.scheduleType,
      };
    }),
  getAll: baseProcedure.query(async () => {
    const data = await db.select().from(enrollments);
    return data;
  }),
});
