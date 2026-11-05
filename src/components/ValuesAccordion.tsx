"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aboutValues, type AboutValue } from "@/lib/about-values";
import { CloseIcon } from "./Icons";

function ValueText({ value, panel }: { value: AboutValue; panel?: boolean }) {
  const gap = panel ? "mt-1.5" : "mt-2";
  const halo = panel ? "text-halo-paper" : "";
  return (
    <>
      <p
        className={`text-[0.9375rem] leading-snug font-semibold md:text-base ${halo} ${
          panel ? "text-brand" : "text-brand-strong"
        }`}
      >
        {value.id}. {value.title}
      </p>
      <span aria-hidden className={`${gap} block h-0.5 w-12 bg-brand`} />
      <p className={`${gap} text-[0.8125rem] leading-snug text-ink md:text-sm ${halo}`}>{value.description}</p>
    </>
  );
}

export default function ValuesAccordion() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(3);
  const [modal, setModal] = useState<AboutValue | null>(null);
  const [interacted, setInteracted] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPointer = useRef("");

  const open = (i: number) => {
    setInteracted(true);
    setActive(i);
  };

  const close = () => {
    const i = aboutValues.findIndex((v) => v.id === modal?.id);
    setModal(null);
    triggers.current[i]?.focus();
  };

  const [hideCount, setHideCount] = useState(0);
  useLayoutEffect(
    () => () => {
      setModal(null);
      setHideCount((c) => c + 1);
    },
    [],
  );

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  return (
    <>
      <ul className="mx-auto flex h-[300px] w-full max-w-[960px] gap-1 sm:h-80 md:h-[340px] md:gap-2 lg:h-[380px]">
        {aboutValues.map((value, i) => {
          const isOpen = i === active;
          return (
            <li
              key={value.id}
              className={`flex min-w-0 shrink-0 basis-3 transition-[flex-grow] duration-300 ease-in-out motion-reduce:transition-none sm:basis-6 md:basis-10 lg:basis-14 ${
                isOpen ? "grow" : "grow-0"
              }`}
            >
              <button
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                type="button"
                aria-label={value.title}
                aria-expanded={isOpen}
                onPointerMove={(e) => {
                  const pos = `${e.clientX},${e.clientY}`;
                  if (e.pointerType !== "mouse" || pos === lastPointer.current) return;
                  lastPointer.current = pos;
                  if (!isOpen) open(i);
                }}
                onFocus={(e) => e.currentTarget.matches(":focus-visible") && open(i)}
                onClick={() => (isOpen ? setModal(value) : open(i))}
                className="relative w-full cursor-pointer overflow-hidden rounded-card text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
              >
                <motion.div
                  layoutId={isOpen && !reduce ? `nilai-${value.id}` : undefined}
                  className="absolute inset-0"
                >
                  <Image
                    src={value.image}
                    alt={`Foto untuk nilai ${value.title}`}
                    fill
                    sizes="(min-width: 1024px) 600px, (min-width: 768px) 60vw, 70vw"
                    className="object-cover mask-b-from-96%"
                  />
                </motion.div>
                {isOpen && (
                  <motion.div
                    initial={interacted && !reduce ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.22 }}
                    className="absolute inset-x-0 bottom-0 bg-paper/(--values-panel-opacity) px-3.5 py-3 backdrop-blur-[2px] md:px-[18px] md:py-3.5"
                  >
                    <ValueText value={value} panel />
                  </motion.div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence key={hideCount}>
            {modal && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                onClick={close}
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-paper/70 p-4 backdrop-blur-lg"
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label={modal.title}
                  onClick={(e) => e.stopPropagation()}
                  className="relative my-auto w-[min(92vw,560px)]"
                >
                  <motion.div
                    layoutId={reduce ? undefined : `nilai-${modal.id}`}
                    className="relative aspect-square overflow-hidden rounded-card shadow-card"
                  >
                    <Image
                      src={modal.image}
                      alt={`Foto untuk nilai ${modal.title}`}
                      fill
                      sizes="min(92vw, 560px)"
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="mt-3 rounded-card border border-line bg-paper p-4 shadow-card md:p-6">
                    <ValueText value={modal} />
                  </div>
                  <button
                    type="button"
                    aria-label="Tutup"
                    autoFocus
                    onClick={close}
                    className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full border border-line bg-paper text-ink hover:border-brand hover:bg-brand hover:text-paper focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
