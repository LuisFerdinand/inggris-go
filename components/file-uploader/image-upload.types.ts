export type ImageUploadOptions = {
  maxSizeMB?: number;
  acceptedTypes?: string[];
};

export type ImageUploadState = {
  file: File | null;
  previewUrl: string | null;
};
