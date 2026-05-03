import { db } from "@/app/db/db";
import { programs } from "../schema/programs";

export async function seedPrograms() {
  await db.insert(programs).values([
    {
      id: "prog-efk-1",
      title: "EFK Basic",
      slug: "efk-basic",
      description: "Belajar English dasar untuk anak",
      categoryId: "cat-efk",
      status: "published",
      basePrice: 500000,
      duration: 30,
      level: "beginner",
    },
    {
      id: "prog-toefl-1",
      title: "TOEFL Intensive",
      slug: "toefl-intensive",
      description: "Program intensif TOEFL",
      categoryId: "cat-toefl",
      status: "published",
      basePrice: 1500000,
      duration: 14,
      level: "intermediate",
    },
  ]);
}
