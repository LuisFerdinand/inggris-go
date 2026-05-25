"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "react-hot-toast";

import type {
  ImageUploadOptions,
  ImageUploadState,
} from "./image-upload.types";

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useImageUpload(options?: ImageUploadOptions) {
  const maxSizeMB = options?.maxSizeMB ?? 4;

  const acceptedTypes = options?.acceptedTypes ?? DEFAULT_ACCEPTED_TYPES;

  const [state, setState] = useState<ImageUploadState>({
    file: null,
    previewUrl: null,
  });

  const [error, setError] = useState<string | undefined>();

  const removeFile = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    setState({
      file: null,
      previewUrl: null,
    });

    setError(undefined);
  }, [state.previewUrl]);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      setError(undefined);

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        const message = `File size exceeds ${maxSizeMB}MB.`;

        setError(message);

        toast.error(message);

        return;
      }

      if (!acceptedTypes.includes(file.type)) {
        const message =
          "Invalid image format. Only JPG, PNG, and WEBP are allowed.";

        setError(message);

        toast.error(message);

        return;
      }

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }

      const previewUrl = URL.createObjectURL(file);

      setState({
        file,
        previewUrl,
      });
    },
    [acceptedTypes, maxSizeMB, state.previewUrl],
  );

  useEffect(() => {
    return () => {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl]);

  return {
    file: state.file,

    previewUrl: state.previewUrl,

    error,

    handleFileSelect,

    removeFile,
  };
}
