import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: [
          "bg-gold-btn",
          "text-[var(--color-brand-blue-abyss)]", // dark text
          "shadow-[var(--shadow-glow-gold-btn)]",
          "hover:shadow-[var(--shadow-glow-gold-btn-hover)]",
          "hover:-translate-y-px",
          "active:translate-y-0 active:scale-[0.98]",
        ].join(" "),
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: [
          "bg-navy-gradient",
          "text-white",
          "shadow-[var(--shadow-glow-navy-btn)]",
          "hover:shadow-[var(--shadow-glow-navy-btn-hover)]",
          "hover:-translate-y-px",
          "active:translate-y-0 active:scale-[0.98]",
        ].join(" "),
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",

        // ── Brand variants ────────────────────────────────────────────────
        brand:
          "text-white font-display font-bold rounded-2xl hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
        "brand-outline":
          "font-display font-semibold rounded-xl border-[1.5px] hover:-translate-y-px active:translate-y-0",
        "brand-ghost":
          "font-display font-semibold rounded-xl hover:-translate-y-px active:translate-y-0",
        "brand-secondary":
          "bg-white text-[#0F2340] font-display font-semibold rounded-2xl border border-[#E6EAF0] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
      },

      size: {
        // ── Default sizes (bumped padding) ────────────────────────────────
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[min(var(--radius-md),12px)] px-4 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-7 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 rounded-full",
        xl: "h-13 gap-2.5 px-9 text-base has-data-[icon=inline-end]:pr-7 has-data-[icon=inline-start]:pl-7 rounded-full",

        // ── Icon sizes ────────────────────────────────────────────────────
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",

        // ── Brand-specific sizes (explicit py for more breathing room) ─────
        "brand-sm": "gap-1.5 px-5 py-2 text-sm rounded-xl",
        "brand-md": "gap-2 px-6 py-2.5 text-[0.875rem] rounded-xl",
        "brand-lg": "gap-2 px-8 py-3.5 text-[0.9375rem] rounded-2xl",
        "brand-xl": "gap-2.5 px-10 py-4 text-base rounded-2xl",
        "brand-full":
          "gap-2.5 w-full justify-center px-6 py-3.5 text-[0.9375rem] rounded-2xl",
      },
    },

    // ── Compound variants: wire brand colours to brand sizes ──────────────
    compoundVariants: [
      {
        variant: "brand",
        className: [
          "bg-gold-btn",
          "text-[var(--color-brand-blue-abyss)]",
          "shadow-[var(--shadow-glow-gold-btn)]",
          "hover:shadow-[var(--shadow-glow-gold-btn-hover)]",
        ].join(" "),
      },
      {
        variant: "brand-outline",
        className:
          "border-[rgba(15,35,64,0.14)] text-[#0F2340] hover:border-[#FF6B35] hover:text-[#FF6B35]",
      },
      {
        variant: "brand-ghost",
        className: "text-[#0F2340] hover:bg-orange-50 hover:text-[#FF6B35]",
      },
      {
        variant: "brand-secondary",
        className:
          "shadow-[0_2px_10px_rgba(15,35,64,0.06)] hover:border-[#FF6B35] hover:text-[#FF6B35] hover:shadow-[0_6px_20px_rgba(255,107,53,0.15)]",
      },
    ],

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export type ButtonProps = React.ComponentProps<typeof Button>;

export { Button, buttonVariants };
