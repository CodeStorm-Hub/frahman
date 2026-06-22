"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ROUTE_POINTS: [number, number][] = [
  [-11, -2.2],
  [-7, 0.8],
  [-2.5, -1.6],
  [2.5, 1.4],
  [7, -0.8],
  [11, 1.6],
];

const STATIONS = {
  depot: 0,
  warehouse: 0.5,
  retail: 1,
};

function useRouteCurve() {
  return useMemo(() => {
    const points = ROUTE_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
  }, []);
}

/* ---------------------------------- Ground & road --------------------------------- */

function GroundAndRoad({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const roadGeometry = useMemo(() => {
    const divisions = 160;
    const pts = curve.getPoints(divisions);
    const shapePts: THREE.Vector3[] = [];
    const width = 0.55;
    for (let i = 0; i < pts.length; i++) {
      const t = i / (pts.length - 1);
      const tangent = curve.getTangentAt(Math.min(0.999, t)).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      shapePts.push(pts[i].clone().addScaledVector(normal, width));
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const t = i / (pts.length - 1);
      const tangent = curve.getTangentAt(Math.min(0.999, t)).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      shapePts.push(pts[i].clone().addScaledVector(normal, -width));
    }
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const a = shapePts[i];
      const b = shapePts[i + 1];
      const c = shapePts[2 * n - 2 - i];
      const d = shapePts[2 * n - 1 - i];
      positions.push(a.x, a.y + 0.02, a.z, b.x, b.y + 0.02, b.z, c.x, c.y + 0.02, c.z);
      positions.push(b.x, b.y + 0.02, b.z, d.x, d.y + 0.02, d.z, c.x, c.y + 0.02, c.z);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [curve]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 24]} />
        <meshStandardMaterial color="#1b2e22" flatShading />
      </mesh>
      <mesh geometry={roadGeometry}>
        <meshStandardMaterial color="#33302a" flatShading />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Low-poly props --------------------------------- */

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.6, 5]} />
        <meshStandardMaterial color="#5a4632" flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <coneGeometry args={[0.45, 0.9, 6]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <coneGeometry args={[0.32, 0.6, 6]} />
        <meshStandardMaterial color="#4d8f60" flatShading />
      </mesh>
    </group>
  );
}

function Building({
  position,
  size = [2, 1.4, 1.6],
  color = "#caa14a",
  roofColor = "#7a5a2a",
}: {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  roofColor?: string;
}) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, h + 0.25, 0]} castShadow>
        <coneGeometry args={[Math.max(w, d) * 0.75, 0.5, 4]} />
        <meshStandardMaterial color={roofColor} flatShading />
      </mesh>
    </group>
  );
}

function Figure({
  position,
  color = "#e7c9a0",
  shirt = "#3f7a52",
  bobOffset = 0,
}: {
  position: [number, number, number];
  color?: string;
  shirt?: string;
  bobOffset?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + bobOffset) * 0.03;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.22, 4, 8]} />
        <meshStandardMaterial color={shirt} flatShading />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function CratePile({ origin, count = 9 }: { origin: [number, number, number]; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const cols = 3;
    let i = 0;
    for (let layer = 0; layer < Math.ceil(count / (cols * cols)); layer++) {
      for (let row = 0; row < cols && i < count; row++) {
        for (let col = 0; col < cols && i < count; col++) {
          dummy.position.set(
            origin[0] + (col - 1) * 0.32,
            origin[1] + 0.15 + layer * 0.3,
            origin[2] + (row - 1) * 0.32,
          );
          dummy.rotation.y = (i % 4) * 0.12;
          dummy.updateMatrix();
          ref.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [origin, count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#caa14a" flatShading />
    </instancedMesh>
  );
}

/* ---------------------------------- Truck --------------------------------- */

function Truck({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = THREE.MathUtils.clamp(progressRef.current, 0.001, 0.999);
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    ref.current.position.set(pos.x, 0.28, pos.z);
    ref.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.16, -0.1]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.9]} />
        <meshStandardMaterial color="#e7e1d4" flatShading />
      </mesh>
      <mesh position={[0, 0.22, 0.55]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      <mesh position={[0, 0.4, 0.7]}>
        <boxGeometry args={[0.45, 0.18, 0.05]} />
        <meshStandardMaterial color="#8fd3ff" flatShading transparent opacity={0.6} />
      </mesh>
      {[[-0.26, -0.4], [0.26, -0.4], [-0.26, 0.35], [0.26, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.06, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.13, 0.13, 0.12, 10]} />
          <meshStandardMaterial color="#1d1d1d" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Camera rig (follows truck) --------------------------------- */

function MapCameraRig({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: React.RefObject<number> }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());

  // r3f's escape hatch: the camera object from useThree is meant to be mutated
  // imperatively per-frame, which the react-compiler immutability rule can't model.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const t = THREE.MathUtils.clamp(progressRef.current, 0.001, 0.999);
    const pos = curve.getPointAt(t);
    const desired = new THREE.Vector3(pos.x + 5.5, 5.2, pos.z + 6.5);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.x, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.y, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.z, 3, delta);
    lookTarget.current.lerp(pos, 1 - Math.pow(0.001, delta));
    camera.lookAt(lookTarget.current.x, 0.4, lookTarget.current.z);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}

/* ---------------------------------- Scene composition --------------------------------- */

export function SupplyChainMap({ progressRef }: { progressRef: React.RefObject<number> }) {
  const curve = useRouteCurve();
  const depot = curve.getPointAt(STATIONS.depot + 0.001);
  const warehouse = curve.getPointAt(STATIONS.warehouse);
  const retail = curve.getPointAt(STATIONS.retail - 0.001);

  return (
    <group>
      <GroundAndRoad curve={curve} />
      <MapCameraRig curve={curve} progressRef={progressRef} />
      <Truck curve={curve} progressRef={progressRef} />

      {/* Depot — government procurement point */}
      <Building position={[depot.x - 0.2, 0, depot.z - 1.4]} size={[2.2, 1.2, 1.6]} color="#7fb88a" roofColor="#3f7a52" />
      <CratePile origin={[depot.x - 0.6, 0, depot.z - 0.3]} count={9} />
      <Figure position={[depot.x + 0.6, 0, depot.z - 0.5]} shirt="#caa14a" bobOffset={0} />
      <Figure position={[depot.x + 0.9, 0, depot.z - 0.2]} shirt="#5b8fb0" bobOffset={1.4} />

      {/* Warehouse — climate-controlled godown */}
      <Building position={[warehouse.x + 0.4, 0, warehouse.z + 1.6]} size={[3, 1.7, 2]} color="#caa14a" roofColor="#7a5a2a" />
      <CratePile origin={[warehouse.x, 0, warehouse.z + 0.6]} count={12} />
      <CratePile origin={[warehouse.x + 1, 0, warehouse.z + 0.6]} count={6} />
      <Figure position={[warehouse.x - 0.5, 0, warehouse.z + 0.3]} shirt="#3f7a52" bobOffset={0.6} />
      <Figure position={[warehouse.x - 0.8, 0, warehouse.z + 0.7]} shirt="#caa14a" bobOffset={2.1} />

      {/* Retailer row — verified retail distribution */}
      {[-1.2, 0, 1.2].map((offset, i) => (
        <Building
          key={i}
          position={[retail.x + offset, 0, retail.z - 1.5]}
          size={[1, 1, 1]}
          color={["#5b8fb0", "#caa14a", "#7fb88a"][i]}
          roofColor="#3a2f1c"
        />
      ))}
      <Figure position={[retail.x - 1.6, 0, retail.z - 0.6]} shirt="#5b8fb0" bobOffset={0.9} />
      <Figure position={[retail.x + 0.3, 0, retail.z - 0.6]} shirt="#7fb88a" bobOffset={1.8} />
      <CratePile origin={[retail.x, 0, retail.z - 0.4]} count={4} />

      {/* Ambient trees along the route */}
      {[
        [-9, -2.6],
        [-4, 1.8],
        [0, -2.2],
        [4.5, 2.2],
        [9, -1.6],
      ].map(([x, z], i) => (
        <Tree key={i} position={[x, 0, z]} scale={0.9 + (i % 3) * 0.15} />
      ))}
    </group>
  );
}
