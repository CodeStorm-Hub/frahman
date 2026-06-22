"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./scene";

export function CanvasBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
