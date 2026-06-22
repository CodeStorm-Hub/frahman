"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROWS = 4;
const COLS = 5;
const LAYERS = 3;
const COUNT = ROWS * COLS * LAYERS;

/** Stacked-bag/crate grid that assembles itself as the supply-chain section scrolls into view. */
export function CrateStack({ progressRef }: { progressRef: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const slots = useMemo(() => {
    const arr: { base: THREE.Vector3; jitter: number }[] = [];
    for (let layer = 0; layer < LAYERS; layer++) {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          arr.push({
            base: new THREE.Vector3(
              (col - (COLS - 1) / 2) * 0.85,
              layer * 0.62 - 0.6,
              (row - (ROWS - 1) / 2) * 0.85,
            ),
            jitter: Math.random() * Math.PI,
          });
        }
      }
    }
    return arr;
  }, []);

  useFrame((state) => {
    const p = progressRef.current ?? 0;
    if (!mesh.current) return;

    // Active window: 0.16 - 0.46 of total scroll
    const localT = THREE.MathUtils.clamp((p - 0.16) / 0.3, 0, 1);
    const eased = THREE.MathUtils.smoothstep(localT, 0, 1);

    mesh.current.visible = p > 0.1 && p < 0.62;

    const group = mesh.current.parent as THREE.Object3D | null;
    if (group) {
      group.position.x = THREE.MathUtils.lerp(6, -0.4, eased);
      group.rotation.y = THREE.MathUtils.lerp(-0.6, 0.35, eased) + Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      const fadeOut = THREE.MathUtils.clamp((p - 0.5) / 0.12, 0, 1);
      group.position.x = THREE.MathUtils.lerp(group.position.x, group.position.x + 5, fadeOut);
    }

    slots.forEach((slot, i) => {
      const dropDelay = (i / COUNT) * 0.5;
      const t = THREE.MathUtils.clamp((eased - dropDelay) / (1 - dropDelay), 0, 1);
      const drop = THREE.MathUtils.lerp(4, 0, t);
      dummy.position.set(slot.base.x, slot.base.y + drop, slot.base.z);
      dummy.rotation.set(0, slot.jitter * 0.05, 0);
      const s = THREE.MathUtils.lerp(0.4, 1, t);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[6, -0.4, -2]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} castShadow>
        <boxGeometry args={[0.72, 0.5, 0.72]} />
        <meshStandardMaterial color="#caa14a" roughness={0.75} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}
