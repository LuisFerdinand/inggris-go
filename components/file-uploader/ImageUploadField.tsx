"use client";

import Image from "next/image";

import { useCallback, useRef, useState } from "react";

import {
  CloudUpload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField } from "../Form";

export type AspectRatioPreset = "16/9" | "4/3" | "1/1" | "3/2" | "21/9";

type Props = {
  value?: string | null;

  onChange: (file: File | null) => void;

  onRemove?: () => void;

  disabled?: boolean;

  required?: boolean;

  label?: string;

  hint?: string;

  error?: string;

  htmlFor?: string;

  description?: string;

  maxSizeLabel?: string;

  aspectRatio?: AspectRatioPreset;

  aspectRatioPresets?: AspectRatioPreset[];

  uploadProgress?: number;

  isLoading?: boolean;

  className?: string;
};

const ASPECT_MAP: Record<AspectRatioPreset, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
  "21/9": "aspect-[21/9]",
};

export function ImageUploadField({
  value,
  onChange,
  onRemove,
  disabled,
  required,
  label = "Upload image",
  hint = "Recommended 1280 × 720px for best quality",
  error,
  htmlFor,
  description = "PNG, JPG, WEBP",
  maxSizeLabel = "Max 4MB",
  aspectRatio = "16/9",
  aspectRatioPresets,
  uploadProgress,
  isLoading,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [activeRatio, setActiveRatio] =
    useState<AspectRatioPreset>(aspectRatio);

  const hasImage = !!value;

  const isUploading =
    isLoading || (uploadProgress !== undefined && uploadProgress < 100);

  const handleSelect = useCallback(
    (file: File | null) => {
      if (!file || disabled) return;

      onChange(file);
    },
    [onChange, disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      setIsDragging(false);

      const file = e.dataTransfer.files?.[0] ?? null;

      handleSelect(file);
    },
    [handleSelect],
  );

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={htmlFor}
      className={className}
    >
      {" "}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {" "}
        <div className="flex items-center gap-1.5">
          {" "}
          <span className="text-xs text-muted-foreground">
            {description} · {maxSizeLabel}{" "}
          </span>{" "}
        </div>
        {aspectRatioPresets && (
          <div className="flex gap-1">
            {aspectRatioPresets.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setActiveRatio(ratio)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] border transition-all",
                  activeRatio === ratio
                    ? "bg-green-50 border-green-300 text-green-700 font-medium"
                    : "bg-muted border-border text-muted-foreground hover:border-foreground/30",
                )}
              >
                {ratio}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={hasImage ? "Thumbnail uploaded" : "Upload thumbnail image"}
        onDragOver={(e) => {
          e.preventDefault();

          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !hasImage && !disabled) {
            e.preventDefault();

            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border transition-all duration-200",
          ASPECT_MAP[activeRatio],

          hasImage
            ? "border-border cursor-default group"
            : cn(
                "border-dashed border-2 cursor-pointer",
                isDragging
                  ? "border-green-500 bg-green-50/30 scale-[1.005]"
                  : "border-muted-foreground/25 bg-muted/40 hover:border-green-500 hover:bg-green-50/20",
              ),

          error && "border-red-400 bg-red-50/20",

          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <input
          id={htmlFor}
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
        />

        {!hasImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="rounded-2xl border bg-background p-3.5 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
              <CloudUpload className="size-7 text-muted-foreground" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {isDragging
                  ? "Release to upload"
                  : "Drop your image here, or browse"}
              </p>

              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {["PNG", "JPG", "WEBP"].map((ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 rounded-md bg-background border text-[11px] font-mono text-muted-foreground"
                >
                  {ext}
                </span>
              ))}
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background border text-sm font-medium hover:bg-muted transition-all active:scale-95"
            >
              <CloudUpload className="size-4 text-muted-foreground" />
              Choose file
            </button>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-[width] duration-300"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        )}

        {hasImage && (
          <>
            <Image
              src={value!}
              alt="Thumbnail preview"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            />

            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[11px] text-white/90">
              <CheckCircle2 className="size-3 text-green-400" />
              Uploaded
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-end p-3 gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-medium text-neutral-900 hover:bg-white transition-all active:scale-95"
              >
                <RefreshCw className="size-3.5" />
                Replace
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }

                  onRemove?.();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-xs font-medium text-white hover:bg-red-500 transition-all active:scale-95"
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </FormField>
  );
}
