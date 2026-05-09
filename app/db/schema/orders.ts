import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { programBatches, programs } from "./programs";
import { user } from "./auth-schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const orderTypeEnum = pgEnum("order_type", ["online", "offline"]);

export type OnlineProgramOrderData = {
  type: "online";

  // Selected
  programId: string;
  batchId?: string;

  // Participant
  fullName: string;
  whatsapp: string;
  email?: string;
  age?: number;
};

export type OfflineProgramOrderData = {
  type: "offline";

  // Selected
  programId: string;
  batchId: string;
  batchLabel: string;

  // Child
  nama: string;
  panggilan: string;
  jenisKelamin: "L" | "P";

  tempatLahir: string;
  tanggalLahir: string;

  usia: number;

  kelas: string;
  sekolah: string;
  kotaAsal: string;

  // Parent
  namaOrtu: string;
  hpOrtu: string;

  hpAnak?: string;

  email?: string;

  // Extra
  alumni: "yes" | "no";

  sumberInfo: string;

  alergi: "yes" | "no";

  detailAlergi?: string;

  catatan?: string;

  harapan: string;

  // Upload
  ukuranKaos: string;
};

export type OrderData = OnlineProgramOrderData | OfflineProgramOrderData;

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),

    programId: text("program_id")
      .notNull()
      .references(() => programs.id),
    batchId: text("batch_id").references(() => programBatches.id),
    userId: text("user_id").references(() => user.id),
    programSnapshot: jsonb("program_snapshot").$type<{
      id: string;
      title: string;
      slug: string;
      categorySlug?: string;
      price?: number | null;
      format?: string;
    }>(),
    batchSnapshot: jsonb("batch_snapshot").$type<{
      id: string;
      title: string;
      slug?: string;
      startDate?: string;
      endDate?: string;
      mode?: string;
      location?: string;
    }>(),
    metadata: jsonb("metadata").$type<{
      ip?: string;
      userAgent?: string;
      referer?: string;
    }>(),

    type: orderTypeEnum("type").notNull(),

    // Common fields (for quick access & admin)
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),

    // Promoted fields (optional but powerful)
    childName: text("child_name"),
    age: integer("age"),

    data: jsonb("data").$type<OrderData>().notNull(),

    attachments: jsonb("attachments").$type<{
      foto?: string;
    }>(),

    source: text("source").default("web"),

    status: orderStatusEnum("status").default("pending").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    programIdx: index("orders_program_id_idx").on(table.programId),
  }),
);
