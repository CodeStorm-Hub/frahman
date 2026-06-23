"use client";

import { Sparkles, Stars } from "@react-three/drei";
import { useScrollProgressRef } from "@/lib/use-scroll-progress";
import { SupplyChainMap } from "./supply-chain-map";

export function Scene() {
  const progressRef = useScrollProgressRef();

  return (
    <>
      <color attach="background" args={["#0c1712"]} />
      <fog attach="fog" args={["#0c1712", 10, 28]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 4]} intensity={1.1} color="#fff4dd" castShadow />
      <pointLight position={[-6, 3, 2]} intensity={0.5} color="#caa14a" />

      <Stars radius={50} depth={30} count={900} factor={2} fade speed={0.3} />
      <Sparkles count={40} scale={14} size={2} speed={0.25} color="#caa14a" opacity={0.4} />

      <SupplyChainMap progressRef={progressRef} />
    </>
  );
}
