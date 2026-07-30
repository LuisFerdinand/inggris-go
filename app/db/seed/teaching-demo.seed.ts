// app/db/seed/teaching-demo.seed.ts
//
// Standalone, additive seeder for trying out the Teaching LMS (classes,
// attendance, scoring, PDF reports). Safe to re-run: upserts the teacher
// account and skips enrollments that already exist.
//
// Run with: npx tsx app/db/seed/teaching-demo.seed.ts

import "./load-env";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { user } from "../schema/auth-schema";
import { role, userRole } from "../schema/roles";
import { programs, programBatches, programPackages } from "../schema/programs";
import { enrollments } from "../schema/orders";
import { generateId } from "@/lib/utils";

const TEACHER_NAME = "Bu Sarah (Teacher Demo)";
const TEACHER_EMAIL =
  process.env.SEED_TEACHER_EMAIL ?? "teacher.demo@inggrisgo.com";
const TEACHER_PASSWORD =
  process.env.SEED_TEACHER_PASSWORD ?? "TeacherDemo123!";

const TARGET_PROGRAM_TITLE = "English for Kids";
const TARGET_BATCH_TITLE = "English for Kids — Juni 2026";

type DemoStudent = {
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: "paid" | "confirmed";
};

const DEMO_STUDENTS: DemoStudent[] = [
  {
    childName: "Aisyah Putri Ramadhani",
    age: 9,
    parentName: "Budi Ramadhan",
    parentPhone: "081234567801",
    parentEmail: "budi.ramadhan.demo@example.com",
    status: "paid",
  },
  {
    childName: "Bagas Wirawan Saputra",
    age: 10,
    parentName: "Siti Wirawan",
    parentPhone: "081234567802",
    parentEmail: "siti.wirawan.demo@example.com",
    status: "paid",
  },
  {
    childName: "Citra Ayu Lestari",
    age: 8,
    parentName: "Dedi Lestari",
    parentPhone: "081234567803",
    parentEmail: "dedi.lestari.demo@example.com",
    status: "confirmed",
  },
  {
    childName: "Dimas Aditya Pratama",
    age: 11,
    parentName: "Eka Pratama",
    parentPhone: "081234567804",
    parentEmail: "eka.pratama.demo@example.com",
    status: "confirmed",
  },
];

function genId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function upsertTeacher() {
  const now = new Date();
  const email = TEACHER_EMAIL.toLowerCase();

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  const teacherId = existing?.id ?? genId("user");

  if (existing) {
    await db
      .update(user)
      .set({
        name: TEACHER_NAME,
        passwordHash: await bcrypt.hash(TEACHER_PASSWORD, 12),
        emailVerified: true,
        updatedAt: now,
      })
      .where(eq(user.id, teacherId));
  } else {
    await db.insert(user).values({
      id: teacherId,
      name: TEACHER_NAME,
      email,
      passwordHash: await bcrypt.hash(TEACHER_PASSWORD, 12),
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const teacherRole = await db.query.role.findFirst({
    where: eq(role.name, "teacher"),
  });

  if (!teacherRole) {
    throw new Error(
      'Role "teacher" not found — run the main seeder first (npm run db:seed).',
    );
  }

  await db
    .insert(userRole)
    .values({
      id: genId("user-role"),
      userId: teacherId,
      roleId: teacherRole.id,
    })
    .onConflictDoNothing();

  return { id: teacherId, email, name: TEACHER_NAME };
}

async function findTargetBatch() {
  const program = await db.query.programs.findFirst({
    where: eq(programs.title, TARGET_PROGRAM_TITLE),
  });

  if (!program) {
    throw new Error(
      `Program "${TARGET_PROGRAM_TITLE}" not found — run the main seeder first (npm run db:seed).`,
    );
  }

  const batch = await db.query.programBatches.findFirst({
    where: and(
      eq(programBatches.programId, program.id),
      eq(programBatches.title, TARGET_BATCH_TITLE),
    ),
  });

  if (!batch) {
    throw new Error(
      `Batch "${TARGET_BATCH_TITLE}" not found — run the main seeder first (npm run db:seed).`,
    );
  }

  const pkg = await db.query.programPackages.findFirst({
    where: eq(programPackages.batchId, batch.id),
  });

  if (!pkg) {
    throw new Error(`No package found for batch "${TARGET_BATCH_TITLE}".`);
  }

  return { program, batch, pkg };
}

async function seedEnrollments(
  program: typeof programs.$inferSelect,
  batch: typeof programBatches.$inferSelect,
  pkg: typeof programPackages.$inferSelect,
) {
  const created: string[] = [];

  for (const student of DEMO_STUDENTS) {
    const existing = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.batchId, batch.id),
        eq(enrollments.childName, student.childName),
      ),
    });

    if (existing) {
      created.push(`${student.childName} (sudah ada)`);
      continue;
    }

    const now = new Date();

    await db.insert(enrollments).values({
      id: genId("enr"),
      programId: program.id,
      batchId: batch.id,
      packageId: pkg.id,
      userId: null,
      scheduleType: "scheduled",
      programSnapshot: {
        id: program.id,
        title: program.title,
        slug: program.slug,
        format: program.format,
        level: program.level,
        thumbnail: program.thumbnailUrl ?? undefined,
      },
      batchSnapshot: {
        id: batch.id,
        title: batch.title,
        slug: batch.slug,
        startDate: batch.startDate?.toISOString(),
        endDate: batch.endDate?.toISOString(),
        mode: batch.mode,
        location: batch.location ?? undefined,
      },
      packageSnapshot: {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description ?? undefined,
        price: pkg.price,
        originalPrice: pkg.originalPrice ?? undefined,
        isDefault: pkg.isDefault,
      },
      type: "offline",
      customerName: student.parentName,
      phone: student.parentPhone,
      email: student.parentEmail,
      childName: student.childName,
      age: student.age,
      data: {
        type: "offline",
        programId: program.id,
        batchId: batch.id,
        packageId: pkg.id,
        batchLabel: batch.title,
        packageLabel: pkg.title,
        nama: student.childName,
        panggilan: student.childName.split(" ")[0],
        jenisKelamin: "L",
        tempatLahir: "Kediri",
        tanggalLahir: "2016-01-01",
        usia: student.age,
        kelas: "SD",
        sekolah: "SD Demo",
        kotaAsal: "Kediri",
        namaOrtu: student.parentName,
        hpOrtu: student.parentPhone,
        email: student.parentEmail,
        alumni: "no",
        sumberInfo: "Seed demo data",
        alergi: "no",
        harapan: "Percaya diri berbicara bahasa Inggris",
        ukuranKaos: "M",
      },
      source: "seed",
      isManual: true,
      status: student.status,
      discountAmount: 0,
      subtotalPrice: pkg.price,
      finalPrice: pkg.price,
      createdAt: now,
      updatedAt: now,
    });

    created.push(student.childName);
  }

  return created;
}

async function main() {
  console.log("🌱 Seeding Teaching LMS demo data...\n");

  try {
    const teacher = await upsertTeacher();
    console.log(`✔ Teacher account ready: ${teacher.email}`);

    const { program, batch, pkg } = await findTargetBatch();

    await db
      .update(programBatches)
      .set({ teacherId: teacher.id })
      .where(eq(programBatches.id, batch.id));

    console.log(
      `✔ Assigned "${teacher.name}" as teacher of "${batch.title}" (${program.title})`,
    );

    const students = await seedEnrollments(program, batch, pkg);
    console.log(`✔ Registered students (paid/confirmed):`);
    students.forEach((s) => console.log(`   - ${s}`));

    console.log("\n✅ Teaching demo seed complete.\n");
    console.log("Login as the demo teacher:");
    console.log(`  Email:    ${TEACHER_EMAIL}`);
    console.log(`  Password: ${TEACHER_PASSWORD}`);
    console.log(
      `\nThen go to /dashboard/teaching — the batch "${batch.title}" will show ${DEMO_STUDENTS.length} registered students ready to be added to a class.\n`,
    );

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Teaching demo seed failed:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
