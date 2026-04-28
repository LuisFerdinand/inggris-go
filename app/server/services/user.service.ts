import { db } from "@/app/db/db";
import { user } from "@/app/db/schema";

export const userService = {
  async getAllUsers() {
    return db.select().from(user);
  },
};
