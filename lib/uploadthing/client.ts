// lib/uploadthing/client.ts
import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { UploadRouter } from "./core";

// `uploadFiles` is the imperative helper BrandingSection uses:
//   await uploadFiles("programThumbnailUploader", { files, input: { programId } })
// It resolves to an array; res[0].serverData is whatever onUploadComplete returned.
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<UploadRouter>();

export const UploadButton = generateUploadButton<UploadRouter>();
export const UploadDropzone = generateUploadDropzone<UploadRouter>();