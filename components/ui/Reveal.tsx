"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

type Direction = "up" | "left" | "right" | "none";
type AnimationType = "fade" | "slide" | "scale";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  once?: boolean;
  type?: AnimationType;

  // for advanced usage
  as?: React.ElementType;
}

const variants: Record<AnimationType, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },

  slide: {
    hidden: (direction: Direction) => ({
      opacity: 0,
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
      y: direction === "up" ? 30 : 0,
    }),
    visible: { opacity: 1, x: 0, y: 0 },
  },

  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "up",
  once = true,
  type = "slide",
  as: Comp = "div",
}: RevealProps) {
  const MotionComp = motion(Comp);
  const ref = useRef<Element | null>(null);
  const inView = useInView(ref, {
    once,
    margin: "-80px 0px",
  });

  return (
    <MotionComp
      ref={ref as React.Ref<any>}
      className={className}
      custom={direction}
      variants={variants[type]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionComp>
  );
}
