"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Default (English) copy so the component stays safe if rendered without props.
// Module-level so the `words` reference is stable across renders.
const defaultT = {
  badge: "Palms Sports · Professor Handbook",
  titleLine1: "Every professor.",
  titleLine2Prefix: "The same",
  // Each word completes a true sentence: "Every professor. The same <word>."
  words: ["standard", "structure", "discipline", "progression", "excellence"],
  description:
    "The rules and procedures our BJJ professors teach by — from white belt fundamentals to black belt promotions — all kept in one place so every class at Palms Sports is held to the same standard.",
  cta: "Read the handbook",
};

// BJJ belt order — the handbook's standards span every rank, so the progression
// sits directly under the rotating word and the two read as one idea.
const belts = [
  { label: "White", swatch: "#f5f5f5", ring: true },
  { label: "Blue", swatch: "#1d4ed8" },
  { label: "Purple", swatch: "#6d28d9" },
  { label: "Brown", swatch: "#78350f" },
  { label: "Black", swatch: "#171717" },
];

export function Hero({ t = defaultT }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { lang = "en" } = useParams(); // rendered under app/[lang]/(home)

  const words = t.words;

  useEffect(() => {
    if (reduceMotion) return; // don't cycle for reduced-motion users
    const id = setTimeout(() => {
      setIndex((i) => (i === words.length - 1 ? 0 : i + 1));
    }, 2200);
    return () => clearTimeout(id);
  }, [index, words, reduceMotion]);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 sm:pt-32">
      <div className="flex flex-col items-center gap-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-widest text-gray-500 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          {t.badge}
        </span>

        <h1 className="text-5xl font-medium tracking-tighter text-balance text-foreground sm:text-7xl">
          <span className="block">{t.titleLine1}</span>
          <span className="block">
            <span>{t.titleLine2Prefix}</span>{" "}
            {/* Rotating word lives on its own full-width line so longer words
                ("progression") never clip; siblings are absolutely stacked. */}
            <span className="relative flex h-[1.15em] w-full justify-center overflow-hidden pt-1 align-bottom">
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  className="absolute font-semibold text-brand"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : -100 }}
                  animate={
                    reduceMotion
                      ? { y: 0, opacity: i === 0 ? 1 : 0 }
                      : index === i
                        ? { y: 0, opacity: 1 }
                        : { y: index > i ? -150 : 150, opacity: 0 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 50, damping: 13 }
                  }
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          {t.description}
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={`/${lang}/docs`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {/* <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            About Palms Sports
          </Link> */}
        </div>

        {/* Signature: the belt progression, paired with the rotating word above. */}
        {/* <div className="mt-2 w-full max-w-xl">
          <div className="flex h-2 overflow-hidden rounded-full">
            {belts.map((b) => (
              <div
                key={b.label}
                className="flex-1"
                style={{
                  background: b.swatch,
                  boxShadow: b.ring ? "inset 0 0 0 1px var(--border)" : undefined,
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium tracking-wide text-muted">
            {belts.map((b) => (
              <span key={b.label}>{b.label}</span>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">
            Standards that hold at every rank.
          </p>
        </div> */}
      </div>
    </section>
  );
}
