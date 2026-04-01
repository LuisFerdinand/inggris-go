import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "guest",
  "user",
  "teacher",
  "author",
  "admin",
  "super_admin",
]);
