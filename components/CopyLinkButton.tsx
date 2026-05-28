"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  text: string;

  /**
   * Optional message shown after successful copy
   */
  successMessage?: string;

  /**
   * Optional message shown when copy fails
   */
  errorMessage?: string;

  /**
   * Optional callback
   */
  onCopied?: () => void;

  /**
   * Optional custom className
   */
  className?: string;

  /**
   * Optional accessible label
   */
  ariaLabel?: string;

  /**
   * Whether to prepend current origin
   * Useful for relative URLs.
   */
  withOrigin?: boolean;

  /**
   * Disable interaction
   */
  disabled?: boolean;
}

export function CopyLinkButton({
  text,
  successMessage = "Copied to clipboard",
  errorMessage = "Failed to copy",
  onCopied,
  className,
  ariaLabel = "Copy to clipboard",
  withOrigin = false,
  disabled = false,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCopy() {
    if (disabled || loading) return;

    try {
      setLoading(true);

      const value =
        withOrigin && typeof window !== "undefined"
          ? `${window.location.origin}${text}`
          : text;

      await navigator.clipboard.writeText(value);

      setCopied(true);

      toast.success(successMessage);

      onCopied?.();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center",
        "size-7 rounded-lg border",
        "border-neutral-200 bg-white",
        "text-neutral-400 transition-all duration-150",
        "hover:border-neutral-300 hover:text-neutral-700",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus:outline-none focus:ring-2 focus:ring-neutral-300",
        "shrink-0",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}
