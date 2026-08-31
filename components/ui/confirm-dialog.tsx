"use client";

import * as React from "react";
import { AlertDialog } from "radix-ui";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  /** Bold heading of the dialog. */
  title: string;
  /** Optional supporting copy under the title. */
  description?: React.ReactNode;
  /** Label of the confirming button. Defaults to "Hapus". */
  confirmText?: string;
  /** Label of the dismissing button. Defaults to "Batal". */
  cancelText?: string;
  /**
   * Visual weight of the confirm button:
   *  - "danger" (default) → red, for destructive actions
   *  - "primary" → indigo, for non-destructive confirmations
   */
  tone?: "danger" | "primary";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * App-wide replacement for `window.confirm`. Wrap the tree once in
 * `<ConfirmProvider>` (see app/layout.tsx), then in any client component:
 *
 *   const confirm = useConfirm();
 *   ...
 *   if (await confirm({ title: "Hapus tugas ini?", description: "…" })) {
 *     deleteMutation.mutate(...);
 *   }
 *
 * The returned promise resolves `true` when the user presses the confirm
 * button and `false` on cancel / escape / dismiss.
 */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a <ConfirmProvider>");
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const settle = React.useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    resolve?.(result);
  }, []);

  const confirm = React.useCallback<ConfirmFn>((next) => {
    // If a previous request is somehow still pending, treat it as cancelled.
    resolverRef.current?.(false);
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const tone = options?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) settle(false);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className={cn(
              "fixed inset-0 z-[100] bg-slate-900/40 supports-backdrop-filter:backdrop-blur-[2px]",
              "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            )}
          />
          <AlertDialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2",
              "rounded-2xl border border-slate-200 bg-white p-5 shadow-xl outline-none",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <div className="flex gap-3">
              {tone === "danger" && (
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle className="size-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <AlertDialog.Title className="text-[14px] font-bold text-slate-800">
                  {options?.title}
                </AlertDialog.Title>
                {options?.description ? (
                  <AlertDialog.Description asChild>
                    <div className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                      {options.description}
                    </div>
                  </AlertDialog.Description>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {options?.cancelText ?? "Batal"}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-[12.5px] font-bold text-white transition-colors",
                    tone === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-indigo-600 hover:bg-indigo-700",
                  )}
                >
                  {options?.confirmText ?? "Hapus"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
