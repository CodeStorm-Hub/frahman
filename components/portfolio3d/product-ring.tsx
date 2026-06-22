"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PRODUCT_COLORS = ["#7fb88a", "#caa14a", "#5b8fb0", "#caa14a"];

/** Four orbiting spheres representing the product catalogue. */
export function ProductRing({ progressRef }: { progressRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const refs = useRef<THREE.Mesh[]>([]);

  const items = useMemo(
    () =>
      PRODUCT_COLORS.map((color, i) => ({
        color,
        angle: (i / PRODUCT_COLORS.length) * Math.PI * 2,
      })),
    [],
  );

  useFrame((state) => {
    const p = progressRef.current ?? 0;
    if (!group.current) return;

    const localT = THREE.MathUtils.clamp((p - 0.46) / 0.22, 0, 1);
    const eased = THREE.MathUtils.smoothstep(localT, 0, 1);
    const fadeOut = THREE.MathUtils.clamp((p - 0.7) / 0.12, 0, 1);

    group.current.visible = p > 0.38 && p < 0.85;
    group.current.position.y = THREE.MathUtils.lerp(3, 0, eased) + fadeOut * -2.5;
    group.current.rotation.y = state.clock.elapsedTime * 0.25;
    const scale = THREE.MathUtils.lerp(0.3, 1, eased) * (1 - fadeOut * 0.4);
    group.current.scale.setScalar(scale);

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const radius = 2.4;
      const a = items[i].angle + state.clock.elapsedTime * 0.15;
      mesh.position.set(Math.cos(a) * radius, Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.25, Math.sin(a) * radius);
    });
  });

  return (
    <group ref={group} position={[0, 3, -3]}>
      {items.map((it, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} castShadow>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial color={it.color} roughness={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
