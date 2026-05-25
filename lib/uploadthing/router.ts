import type { FileRouter } from "uploadthing/next";

import { programs } from "@/app/db/schema";

import { createImageUploader } from "./factories/create-image-uploader";

export const ourFileRouter = {
  programThumbnailUploader: createImageUploader({
    table: programs,
    idField: "programId",
    keyColumn: "thumbnailKey",

    urlColumn: "thumbnailUrl",

    allowedRoles: ["admin", "super_admin"],

    maxFileSize: "4MB",
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
