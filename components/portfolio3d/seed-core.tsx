"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/** Hero centerpiece: a distorting "seed core" symbolizing growth. Fades out by stage 1. */
export function SeedCore({ progressRef }: { progressRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<React.ComponentRef<typeof MeshDistortMaterial>>(null);

  useFrame((_, delta) => {
    const p = progressRef.current ?? 0;
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x = Math.sin(p * Math.PI) * 0.15;

    // Visible only through the hero stage (0 - 0.22), scales/fades out after.
    const localT = Math.min(1, p / 0.22);
    const scale = THREE.MathUtils.lerp(1, 0.2, localT);
    group.current.scale.setScalar(scale);
    group.current.position.y = THREE.MathUtils.lerp(0, -1.4, localT);

    const mesh = group.current.children[0] as THREE.Mesh | undefined;
    if (mesh) {
      const mtl = mesh.material as THREE.Material & { opacity: number };
      mtl.opacity = THREE.MathUtils.lerp(1, 0, localT);
      mtl.transparent = true;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={group} position={[1.6, 0, -1]}>
        <mesh>
          <icosahedronGeometry args={[1.15, 4]} />
          <MeshDistortMaterial
            ref={mat}
            color="#3f7a52"
            emissive="#1c3b26"
            emissiveIntensity={0.35}
            roughness={0.25}
            metalness={0.4}
            distort={0.35}
            speed={1.6}
          />
        </mesh>
      </group>
    </Float>
  );
}
