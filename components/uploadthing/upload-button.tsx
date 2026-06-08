"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { UploadRouter } from "@/lib/uploadthing/core";

export const UploadButton = generateUploadButton<UploadRouter>();

export const UploadDropzone = generateUploadDropzone<UploadRouter>();