"use client";

import { motion } from "motion/react";
import {
  Award,
  Banknote,
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  Phone,
  Sprout,
  Truck,
  Warehouse,
} from "lucide-react";
import { Reveal, TiltCard } from "./portfolio-motion";

/* ---------------------------------- Stats --------------------------------- */

const stats = [
  { value: "3", label: "Core fertilizer products" },
  { value: "100%", label: "Government-verified sourcing" },
  { value: "1", label: "Climate-controlled godown" },
  { value: "1995", label: "Family-run since" },
];

export function StatsBar() {
  return (
    <section className="border-y border-[var(--p-border)] bg-[var(--p-bg-soft)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4 md:px-8">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="text-center md:text-left">
              <div className="text-3xl font-semibold tracking-tight text-[var(--p-ink)] md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-[var(--p-ink-soft)] md:text-sm">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------- About --------------------------------- */

const pillars = [
  {
    icon: BadgeCheck,
    title: "Quality Products",
    body: "We source fertilizers from reputable, government-authorized manufacturers — ensuring purity and effectiveness in every bag.",
  },
  {
    icon: Truck,
    title: "Reliable Service",
    body: "Our covered-vehicle logistics network guarantees timely delivery to retailers, right when farmers need it most.",
  },
  {
    icon: Sprout,
    title: "Expert Support",
    body: "Our team offers knowledgeable, on-the-ground advice to help retailers and farmers choose the right products for their soil.",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--p-gold-2)]">
          About Us
        </span>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--p-ink)] md:text-4xl">
          A family-run link in Pirojpur&apos;s agricultural supply chain
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--p-ink-soft)]">
          Founded by the late Abu Bakar Siddique and carried forward by Mrs. Nargis
          Parvin, Afridi Siddique, and Khalekuzzaman Tutul, Frahman &amp; Brothers has
          grown into a premier fertilizer distributor serving farms of every size
          across the region — built on one simple promise: authenticity from source
          to soil.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.1}>
            <TiltCard className="h-full">
              <div className="h-full rounded-2xl border border-[var(--p-border)] bg-[var(--p-card)] p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--p-forest)]/10">
                  <p.icon className="h-5 w-5 text-[var(--p-forest)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--p-ink)]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--p-ink-soft)]">{p.body}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Supply chain ------------------------------ */

const steps = [
  {
    icon: Building2,
    title: "Direct Government Sourcing",
    body: "Procured directly from official BADC/BCIC depots and godowns — eliminating counterfeit risk and ensuring national quality compliance.",
  },
  {
    icon: Warehouse,
    title: "Secure Transport & Storage",
    body: "Moved in dedicated covered vehicles and held in modern, climate-controlled godowns that guard against moisture until distribution.",
  },
  {
    icon: Truck,
    title: "Verified Retail Distribution",
    body: "Delivered through a network of pre-verified, authorized local retailers — consistent supply with localized farmer support.",
  },
];

export function SupplyChain() {
  return (
    <section
      id="supply-chain"
      className="bg-[var(--p-forest)] py-24 text-white"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--p-gold)]">
            Our Supply Chain
          </span>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            Three steps from state godown to farmer&apos;s field
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-[var(--p-gold)]" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/70">{s.body}</p>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute right-[-1rem] top-4 hidden h-px w-8 origin-left bg-white/25 md:block"
                />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Products ------------------------------- */

const products = [
  {
    name: "Urea",
    price: "৳1,330 / bag",
    tag: "Nitrogen",
    body: "High-purity nitrogen fertilizer with fast-acting granules for vigorous plant growth and chlorophyll development.",
  },
  {
    name: "Triple Super Phosphate",
    price: "৳1,330 / bag",
    tag: "46% P₂O₅",
    body: "Enhances root development and stimulates flower and fruit formation — ideal for seedling establishment.",
  },
  {
    name: "Muriate of Potash",
    price: "৳980 / bag",
    tag: "60% K₂O",
    body: "Strengthens drought resistance and disease immunity while improving fruit size, color, and shelf-life.",
  },
  {
    name: "Di-Ammonium Phosphate",
    price: "Ask for pricing",
    tag: "DAP",
    body: "Balanced nitrogen-phosphorus blend for early-stage crop establishment — available on request.",
  },
];

export function Products() {
  return (
    <section id="products" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--p-gold-2)]">
          Our Products
        </span>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[var(--p-ink)] md:text-4xl">
            Government-grade fertilizers, fair pricing
          </h2>
          <p className="max-w-xs text-sm text-[var(--p-ink-soft)]">
            Prices shown are representative and may vary with government allotment cycles.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <TiltCard className="h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--p-border)] bg-[var(--p-card)] p-6 shadow-sm">
                <div>
                  <span className="inline-flex rounded-full bg-[var(--p-gold)]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--p-gold-2)]">
                    {p.tag}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--p-ink)]">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--p-ink-soft)]">{p.body}</p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[var(--p-forest)]">
                  <Banknote className="h-4 w-4" />
                  {p.price}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------- Team ----------------------------------- */

const team = [
  { name: "Late Abu Bakar Siddique", role: "Founder" },
  { name: "Mrs. Nargis Parvin", role: "Co-Founder" },
  { name: "Afridi Siddique", role: "Chief Executive Officer" },
  { name: "Khalekuzzaman Tutul", role: "Manager" },
];

export function Team() {
  return (
    <section id="team" className="bg-[var(--p-bg-soft)] py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--p-gold-2)]">
            Leadership
          </span>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[var(--p-ink)] md:text-4xl">
            Three generations, one promise to farmers
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="rounded-2xl border border-[var(--p-border)] bg-[var(--p-card)] p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--p-forest)]/10 text-lg font-semibold text-[var(--p-forest)]">
                  {m.name
                    .replace("Late ", "")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--p-ink)]">{m.name}</h3>
                <p className="mt-1 text-xs text-[var(--p-ink-soft)]">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Contact ---------------------------------- */

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <div className="grid gap-10 rounded-3xl border border-[var(--p-border)] bg-[var(--p-card)] p-8 shadow-sm md:grid-cols-2 md:p-14">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--p-gold-2)]">
            Get In Touch
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--p-ink)] md:text-4xl">
            Speak with an expert today
          </h2>
          <p className="mt-4 max-w-md text-sm text-[var(--p-ink-soft)]">
            Request a quote, ask about product availability, or learn how to become
            a verified retailer partner.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href="tel:+8801750188004"
              className="flex items-center gap-3 text-sm text-[var(--p-ink)] transition-colors hover:text-[var(--p-forest)]"
            >
              <Phone className="h-4 w-4 text-[var(--p-forest)]" />
              +880 1750-188004
            </a>
            <a
              href="mailto:info@frahmanandbrothers.com"
              className="flex items-center gap-3 text-sm text-[var(--p-ink)] transition-colors hover:text-[var(--p-forest)]"
            >
              <Mail className="h-4 w-4 text-[var(--p-forest)]" />
              info@frahmanandbrothers.com
            </a>
            <div className="flex items-center gap-3 text-sm text-[var(--p-ink)]">
              <MapPin className="h-4 w-4 text-[var(--p-forest)]" />
              Kawkhali, South Bazar, Pirojpur, Bangladesh
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First name"
                className="rounded-xl border border-[var(--p-border)] bg-[var(--p-bg)] px-4 py-2.5 text-sm text-[var(--p-ink)] placeholder:text-[var(--p-ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--p-forest)]/40"
              />
              <input
                type="text"
                placeholder="Last name"
                className="rounded-xl border border-[var(--p-border)] bg-[var(--p-bg)] px-4 py-2.5 text-sm text-[var(--p-ink)] placeholder:text-[var(--p-ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--p-forest)]/40"
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-[var(--p-border)] bg-[var(--p-bg)] px-4 py-2.5 text-sm text-[var(--p-ink)] placeholder:text-[var(--p-ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--p-forest)]/40"
            />
            <textarea
              placeholder="How can we help?"
              rows={4}
              className="w-full rounded-xl border border-[var(--p-border)] bg-[var(--p-bg)] px-4 py-2.5 text-sm text-[var(--p-ink)] placeholder:text-[var(--p-ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--p-forest)]/40"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--p-forest)] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              <Award className="h-4 w-4" />
              Send Message
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- Footer ----------------------------------- */

export function PortfolioFooter() {
  return (
    <footer className="border-t border-[var(--p-border)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-[var(--p-ink-soft)] md:flex-row md:px-8">
        <span>© {new Date().getFullYear()} Frahman &amp; Brothers · Pirojpur, Bangladesh</span>
        <span>Your Trusted Partner in Agricultural Growth</span>
      </div>
    </footer>
  );
}
