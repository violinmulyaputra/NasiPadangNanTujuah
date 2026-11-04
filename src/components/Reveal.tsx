"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

const instant: Variants = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

type Props = { index?: number; className?: string; children: ReactNode };

export default function Reveal({ index = 0, className, children }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      data-reveal
      custom={index}
      variants={reduce ? instant : variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      {children}
    </motion.div>
  );
}
