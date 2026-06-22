"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Dollies + drifts the camera through the scene as the page scrolls. */
export function CameraRig({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const ptr = pointerRef.current ?? { x: 0, y: 0 };

    const z = THREE.MathUtils.lerp(6, 9.5, p);
    const y = THREE.MathUtils.lerp(0.4, 1.4, p);
    const x = THREE.MathUtils.lerp(0, -0.6, Math.min(1, p / 0.6));

    camera.position.x = THREE.MathUtils.damp(camera.position.x, x + ptr.x * 0.35, 4, 0.05);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y + ptr.y * 0.2, 4, 0.05);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 4, 0.05);
    camera.lookAt(0, 0, -1);
  });

  return null;
}
