// lib/hooks/useCloudinaryUpload.ts
//
// Reusable hook for uploading images to Cloudinary via the
// /api/upload route. Returns state + an upload trigger function.
//
// Usage:
//   const { upload, isUploading, progress, error } = useCloudinaryUpload();
//   const url = await upload(file);

import { useState, useCallback } from "react";

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export type UseCloudinaryUploadReturn = {
  upload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  /** 0–100 during XMLHttpRequest upload, null when idle */
  progress: number | null;
  error: string | null;
  reset: () => void;
};

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Use XMLHttpRequest so we can track upload progress
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as UploadResult);
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error ?? `Upload failed (${xhr.status})`));
            } catch {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Network error during upload")),
        );
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload dibatalkan")),
        );

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setProgress(100);
      return result.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload gagal";
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, progress, error, reset };
}