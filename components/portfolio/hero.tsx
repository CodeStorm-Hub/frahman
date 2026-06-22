"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown, ShieldCheck, Sprout, Truck } from "lucide-react";

const words = ["growth", "trust", "yield", "harvests"];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div id="top" ref={ref} className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, var(--p-bg) 0%, color-mix(in oklch, var(--p-bg) 80%, transparent) 45%, transparent 78%), linear-gradient(to top, var(--p-bg) 0%, transparent 45%)",
        }}
      />
      <motion.div style={{ opacity }} className="relative mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--p-border)] bg-[var(--p-card)]/70 px-3.5 py-1.5 text-xs font-medium text-[var(--p-ink-soft)] backdrop-blur"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--p-forest)]" />
          Government-verified BADC &amp; BCIC procurement
        </motion.div>

        <h1 className="max-w-4xl text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-[var(--p-ink)] md:text-7xl">
          {["Your trusted", "partner in"].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
          <span className="relative mt-1 block h-[1.15em] overflow-hidden">
            {words.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-gradient-to-r from-[var(--p-forest)] via-[var(--p-forest-2)] to-[var(--p-gold-2)] bg-clip-text text-transparent"
                style={{ display: i === words.length - 1 ? "block" : "none" }}
              >
                agricultural {w}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-6 max-w-xl text-base text-[var(--p-ink-soft)] md:text-lg"
        >
          Frahman &amp; Brothers sources fertilizer directly from official government
          godowns, stores it safely, and distributes it through verified retailers
          across Pirojpur — so every bag that reaches a farmer is exactly what it
          claims to be.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.68 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--p-forest)] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[var(--p-forest)]/20 transition-transform hover:-translate-y-0.5"
          >
            Request a Quote
          </a>
          <a
            href="#supply-chain"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--p-border)] px-6 py-3 text-sm font-medium text-[var(--p-ink)] transition-colors hover:bg-[var(--p-bg-soft)]"
          >
            See our supply chain
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-16 grid grid-cols-3 gap-4 border-t border-[var(--p-border)] pt-8 md:max-w-xl"
        >
          {[
            { icon: Sprout, label: "Verified Sourcing" },
            { icon: Truck, label: "Covered Logistics" },
            { icon: ShieldCheck, label: "Authorized Retail" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-start gap-2">
              <Icon className="h-5 w-5 text-[var(--p-forest)]" />
              <span className="text-xs font-medium text-[var(--p-ink-soft)]">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
