import { db } from "@/server/db";
import { user } from "@/server/db/schema";

export const userService = {
  async getAllUsers() {
    return db.select().from(user);
  },
};
