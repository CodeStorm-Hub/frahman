"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a mutable ref tracking the supply-chain map's fly-through progress
 * (0-1) without triggering React re-renders — read it inside r3f's useFrame
 * loop instead. The journey completes by the bottom of the #supply-chain
 * section (so the camera doesn't keep drifting through Products/Team/Contact),
 * and a `--map-opacity` CSS variable fades the WebGL canvas out shortly after
 * so unrelated sections aren't fighting the 3D scene for attention.
 */
export function useScrollProgressRef() {
  const progress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById("supply-chain");
      const mapEnd = section
        ? section.offsetTop + section.offsetHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const fadeEnd = mapEnd + window.innerHeight * 0.6;
      const y = window.scrollY;

      progress.current = mapEnd > 0 ? Math.min(1, Math.max(0, y / mapEnd)) : 0;

      const minOpacity = 0.12;
      let opacity = 1;
      if (y > mapEnd) {
        const t = fadeEnd > mapEnd ? Math.min(1, (y - mapEnd) / (fadeEnd - mapEnd)) : 1;
        opacity = 1 - t * (1 - minOpacity);
      }
      document.documentElement.style.setProperty("--map-opacity", opacity.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}
