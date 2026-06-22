"use client";

import { Sparkles, Stars } from "@react-three/drei";
import { useScrollProgressRef } from "@/lib/use-scroll-progress";
import { usePointerRef } from "@/lib/use-pointer-ref";
import { CameraRig } from "./camera-rig";
import { SeedCore } from "./seed-core";
import { CrateStack } from "./crate-stack";
import { ProductRing } from "./product-ring";

export function Scene() {
  const progressRef = useScrollProgressRef();
  const pointerRef = usePointerRef();

  return (
    <>
      <color attach="background" args={["#0c1712"]} />
      <fog attach="fog" args={["#0c1712", 6, 16]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#fff4dd" />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color="#caa14a" />

      <Stars radius={40} depth={30} count={1200} factor={2} fade speed={0.4} />
      <Sparkles count={60} scale={9} size={2.5} speed={0.3} color="#caa14a" opacity={0.6} />

      <CameraRig progressRef={progressRef} pointerRef={pointerRef} />
      <SeedCore progressRef={progressRef} />
      <CrateStack progressRef={progressRef} />
      <ProductRing progressRef={progressRef} />
    </>
  );
}
