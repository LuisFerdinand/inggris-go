/**
 * programs.register — tRPC mutation procedure
 *
 * Add this inside your programs router alongside the existing
 * getProgramBatchesForRegister and getProgramsForRegister procedures.
 *
 * Dependencies already in your project:
 *   - drizzle db
 *   - baseProcedure
 *   - orders table + OrderData type
 *   - programs + programBatches tables
 *   - nanoid / cuid for ID generation (swap to whatever you use)
 */

import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init"; // adjust path

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { OrderData, orders, programBatches, programs } from "@/app/db/schema";
import { db } from "@/app/db/db";

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
    .input(registerInputSchema)
    .mutation(async ({ input, ctx }) => {
      // ── 1. Fetch program snapshot ──────────────────────────────────────────
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
        columns: {
          id: true,
          title: true,
          slug: true,
          registrationType: true,
        },
      });

      if (!program) {
        throw new Error("Program not found");
      }

      // Guard: type in payload must match program's registrationType
      if (program.registrationType !== input.type) {
        throw new Error(
          `Registration type mismatch: program is "${program.registrationType}" but payload says "${input.type}"`,
        );
      }

      // ── 2. Fetch batch snapshot (offline always has batchId) ───────────────
      let batchRecord:
        | {
            id: string;
            title: string;
            slug: string | null;
            startDate: Date | null;
            endDate: Date | null;
            mode: string | null;
            location: string | null;
            price: number | null;
            capacity: number | null;
            enrolledCount: number | null;
            isUnlimited: boolean | null;
            status: string;
            isOpen: boolean;
          }
        | undefined;

      const batchId =
        input.type === "offline"
          ? input.batchId
          : (input as { batchId?: string }).batchId;

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
            price: true,
            capacity: true,
            enrolledCount: true,
            isUnlimited: true,
            status: true,
            isOpen: true,
          },
        });

        if (!batchRecord) throw new Error("Batch not found");
        if (!batchRecord.isOpen || batchRecord.status !== "open") {
          throw new Error("This batch is no longer open for registration");
        }

        // Capacity check (non-unlimited scheduled batches only)
        if (
          !batchRecord.isUnlimited &&
          batchRecord.capacity != null &&
          batchRecord.enrolledCount != null &&
          batchRecord.enrolledCount >= batchRecord.capacity
        ) {
          throw new Error("This batch is full");
        }
      }

      // ── 3. Build typed OrderData payload ──────────────────────────────────
      let orderData: OrderData;

      if (input.type === "online") {
        orderData = {
          type: "online",
          programId: input.programId,
          batchId: input.batchId,
          fullName: input.fullName,
          whatsapp: input.whatsapp,
          email: input.email || undefined,
          age: input.age,
        };
      } else {
        orderData = {
          type: "offline",
          programId: input.programId,
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

      // ── 4. Insert order ────────────────────────────────────────────────────
      const orderId = nanoid(12); // swap to cuid() / uuid() if preferred

      const customerName =
        input.type === "online" ? input.fullName : input.namaOrtu;
      const phone = input.type === "online" ? input.whatsapp : input.hpOrtu;
      const email =
        input.type === "online" ? input.email || null : input.email || null;
      const childName = input.type === "offline" ? input.nama : null;
      const age =
        input.type === "online" ? (input.age ?? null) : (input.usia ?? null);

      await db.insert(orders).values({
        id: orderId,
        programId: input.programId,
        batchId: batchId ?? null,
        // userId: ctx.session?.user?.id ?? null, // uncomment if you have auth
        programSnapshot: {
          id: program.id,
          title: program.title,
          slug: program.slug,
          price: batchRecord?.price ?? null,
        },
        batchSnapshot: batchRecord
          ? {
              id: batchRecord.id,
              title: batchRecord.title,
              slug: batchRecord.slug ?? undefined,
              startDate: batchRecord.startDate?.toISOString(),
              endDate: batchRecord.endDate?.toISOString(),
              mode: batchRecord.mode ?? undefined,
              location: batchRecord.location ?? undefined,
            }
          : null,
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
            : null,
        source: "web",
        status: "pending",
      });

      return {
        orderId,
        programTitle: program.title,
        batchTitle: batchRecord?.title ?? null,
        batchStartDate: batchRecord?.startDate?.toISOString() ?? null,
        batchLocation: batchRecord?.location ?? null,
        price: batchRecord?.price ?? null,
        customerName,
        phone,
        type: input.type,
      };
    }),
});
