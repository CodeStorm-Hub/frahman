"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./scene";

export function CanvasBackground() {
  // Once the canvas has fully faded out (--map-opacity reaches its floor),
  // stop the WebGL render loop entirely instead of leaving frameloop="always"
  // running forever — it would otherwise keep doing per-frame shadow-map +
  // draw work below the fold, competing with scroll/paint for every frame.
  const [active, setActive] = useState(true);

  useEffect(() => {
    let ticking = false;
    const check = () => {
      const opacity = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--map-opacity") || "1",
      );
      setActive(opacity > 0.13);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-300"
      style={{ opacity: "var(--map-opacity, 1)" }}
    >
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "demand"}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
