import type { Metadata } from "next";
import { PortfolioNav } from "@/components/portfolio/nav";
import { Hero } from "@/components/portfolio/hero";
import {
  StatsBar,
  About,
  SupplyChain,
  Products,
  Team,
  Contact,
  PortfolioFooter,
} from "@/components/portfolio/sections";

export const metadata: Metadata = {
  title: "Frahman & Brothers — Trusted Partner in Agricultural Growth",
  description:
    "Frahman & Brothers sources government-verified fertilizer from BADC/BCIC godowns and distributes it through verified retailers across Pirojpur, Bangladesh.",
};

export default function PortfolioPage() {
  return (
    <div className="portfolio-theme min-h-dvh bg-[var(--p-bg)] text-[var(--p-ink)]">
      <PortfolioNav />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <SupplyChain />
        <Products />
        <Team />
        <Contact />
      </main>
      <PortfolioFooter />
    </div>
  );
}
