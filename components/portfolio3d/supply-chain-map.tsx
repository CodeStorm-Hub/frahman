"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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
  const { roadGeometry, dashes } = useMemo(() => {
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

    const dashCount = 70;
    const dashList: { pos: THREE.Vector3; rotY: number }[] = [];
    for (let i = 0; i < dashCount; i++) {
      const t = (i + 0.5) / dashCount;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      dashList.push({ pos: new THREE.Vector3(p.x, 0.03, p.z), rotY: Math.atan2(tangent.x, tangent.z) });
    }

    return { roadGeometry: geo, dashes: dashList };
  }, [curve]);

  const dashRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!dashRef.current) return;
    const dummy = new THREE.Object3D();
    dashes.forEach((d, i) => {
      dummy.position.copy(d.pos);
      dummy.rotation.set(0, d.rotY, 0);
      dummy.updateMatrix();
      dashRef.current!.setMatrixAt(i, dummy.matrix);
    });
    dashRef.current.instanceMatrix.needsUpdate = true;
  }, [dashes]);

  const rocks = useMemo(() => {
    const list: { x: number; z: number; s: number; r: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const t = (i * 0.61) % 1;
      const p = curve.getPointAt(t);
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        x: p.x + side * (1.1 + (i % 3) * 0.4),
        z: p.z + side * 0.6 + ((i * 13) % 5) * 0.3,
        s: 0.08 + (i % 4) * 0.03,
        r: (i * 37) % 360,
      });
    }
    return list;
  }, [curve]);

  const tufts = useMemo(() => {
    const list: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const t = (i * 0.37) % 1;
      const p = curve.getPointAt(t);
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        x: p.x + side * (0.85 + ((i * 7) % 5) * 0.25),
        z: p.z + side * 0.4 + ((i * 11) % 7) * 0.25 - 0.8,
        s: 0.07 + ((i * 3) % 4) * 0.02,
      });
    }
    return list;
  }, [curve]);

  const rockRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!rockRef.current) return;
    const dummy = new THREE.Object3D();
    rocks.forEach((r, i) => {
      dummy.position.set(r.x, 0.05, r.z);
      dummy.rotation.set(r.r * 0.3, r.r, r.r * 0.6);
      dummy.scale.setScalar(r.s);
      dummy.updateMatrix();
      rockRef.current!.setMatrixAt(i, dummy.matrix);
    });
    rockRef.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);

  const tuftRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!tuftRef.current) return;
    const dummy = new THREE.Object3D();
    tufts.forEach((t, i) => {
      dummy.position.set(t.x, 0.06, t.z);
      dummy.rotation.y = i * 0.7;
      dummy.scale.setScalar(t.s);
      dummy.updateMatrix();
      tuftRef.current!.setMatrixAt(i, dummy.matrix);
    });
    tuftRef.current.instanceMatrix.needsUpdate = true;
  }, [tufts]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 24, 24, 16]} />
        <meshStandardMaterial color="#1b2e22" flatShading />
      </mesh>
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial color="#312d27" flatShading roughness={0.95} />
      </mesh>
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]}>
        <boxGeometry args={[0.08, 0.01, 0.22]} />
        <meshStandardMaterial color="#d8cdb0" flatShading />
      </instancedMesh>
      <instancedMesh ref={rockRef} args={[undefined, undefined, rocks.length]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#5a5a52" flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh ref={tuftRef} args={[undefined, undefined, tufts.length]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#2f4a32" flatShading />
      </instancedMesh>
    </group>
  );
}

/* ---------------------------------- Low-poly props --------------------------------- */

function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.06, 8]} />
        <meshStandardMaterial color="#2a3b26" flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.1, 0.6, 6]} />
        <meshStandardMaterial color="#5a4632" flatShading />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow rotation-y={0.3}>
        <coneGeometry args={[0.46, 0.62, 7]} />
        <meshStandardMaterial color="#365c3f" flatShading />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow rotation-y={1.1}>
        <coneGeometry args={[0.36, 0.55, 7]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow rotation-y={2}>
        <coneGeometry args={[0.24, 0.46, 7]} />
        <meshStandardMaterial color="#4d8f60" flatShading />
      </mesh>
      <mesh position={[0, 1.66, 0]} castShadow>
        <coneGeometry args={[0.1, 0.22, 6]} />
        <meshStandardMaterial color="#5ea372" flatShading />
      </mesh>
    </group>
  );
}

function BushTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.05, 8]} />
        <meshStandardMaterial color="#2a3b26" flatShading />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.45, 6]} />
        <meshStandardMaterial color="#5a4632" flatShading />
      </mesh>
      <mesh position={[-0.14, 0.58, 0.05]} castShadow>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#4d8f60" flatShading />
      </mesh>
      <mesh position={[0.16, 0.62, -0.08]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      <mesh position={[0.02, 0.78, 0.1]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#5ea372" flatShading />
      </mesh>
    </group>
  );
}

function Window({
  position,
  lit = true,
  size = [0.22, 0.26],
  shutters = false,
}: {
  position: [number, number, number];
  lit?: boolean;
  size?: [number, number];
  shutters?: boolean;
}) {
  const [w, h] = size;
  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[w, h, 0.04]} />
        <meshStandardMaterial color="#2a2017" flatShading />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[w - 0.05, h - 0.05, 0.015]} />
        <meshStandardMaterial
          color={lit ? "#ffe5a0" : "#bcd6dc"}
          emissive={lit ? "#ffb347" : "#000000"}
          emissiveIntensity={lit ? 0.9 : 0}
          flatShading
        />
      </mesh>
      {/* Mullion cross */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[w - 0.04, 0.015, 0.01]} />
        <meshStandardMaterial color="#1d160f" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.015, h - 0.04, 0.01]} />
        <meshStandardMaterial color="#1d160f" flatShading />
      </mesh>
      {/* Sill */}
      <mesh position={[0, -h / 2 - 0.02, 0.05]}>
        <boxGeometry args={[w + 0.08, 0.03, 0.09]} />
        <meshStandardMaterial color="#4a3a26" flatShading />
      </mesh>
      {/* Shutters */}
      {shutters && (
        <>
          <mesh position={[-w / 2 - 0.05, 0, 0.04]} rotation-y={0.5}>
            <boxGeometry args={[0.07, h + 0.04, 0.02]} />
            <meshStandardMaterial color="#3f7a52" flatShading />
          </mesh>
          <mesh position={[w / 2 + 0.05, 0, 0.04]} rotation-y={-0.5}>
            <boxGeometry args={[0.07, h + 0.04, 0.02]} />
            <meshStandardMaterial color="#3f7a52" flatShading />
          </mesh>
        </>
      )}
    </group>
  );
}

function ShutterDoor({
  position,
  width = 0.5,
  height = 0.7,
  slats = 7,
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  slats?: number;
}) {
  const slatH = height / slats;
  return (
    <group position={position}>
      <mesh position={[0, height / 2, -0.01]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.02]} />
        <meshStandardMaterial color="#23190f" flatShading />
      </mesh>
      {Array.from({ length: slats }).map((_, i) => (
        <mesh key={i} position={[0, slatH * (i + 0.5), 0]}>
          <boxGeometry args={[width, slatH - 0.01, 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#8a8f93" : "#777b7e"} flatShading metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Corrugated tin gable roof: extruded gable cross-section + ridge cap + corrugation ribs + eave trim. */
function CorrugatedRoof({
  width,
  depth,
  height,
  y,
  color = "#9aa7ad",
}: {
  width: number;
  depth: number;
  height: number;
  y: number;
  color?: string;
}) {
  const overhang = 0.2;
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2 - overhang, 0);
    s.lineTo(width / 2 + overhang, 0);
    s.lineTo(0, height);
    s.closePath();
    return s;
  }, [width, height]);

  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth: depth + overhang * 2, bevelEnabled: false }),
    [shape, depth],
  );

  const slope = Math.sqrt((width / 2 + overhang) ** 2 + height ** 2);

  return (
    <group position={[0, y, -depth / 2 - overhang / 2]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} flatShading metalness={0.35} roughness={0.55} />
      </mesh>
      {/* Ridge cap */}
      <mesh position={[0, height + 0.02, 0]}>
        <boxGeometry args={[0.16, 0.07, depth + overhang * 2 + 0.05]} />
        <meshStandardMaterial color="#5c6b70" flatShading metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Rake (bargeboard) trim along each slope edge, front gable face */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[(side * (width / 2 + overhang)) / 2, height / 2, depth / 2 + overhang + 0.005]}
          rotation-z={side > 0 ? -Math.atan2(height, width / 2 + overhang) : Math.atan2(height, width / 2 + overhang)}
        >
          <boxGeometry args={[slope, 0.06, 0.05]} />
          <meshStandardMaterial color="#2c2117" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** A government depot — boxy hall, boundary wall with gate posts, and a flagpole. */
function DepotBuilding({ position }: { position: [number, number, number] }) {
  const w = 2.4;
  const h = 1.25;
  const d = 1.7;
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.12, 0.14, d + 0.12]} />
        <meshStandardMaterial color="#3a3026" flatShading />
      </mesh>
      <mesh position={[0, h / 2 + 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#8fc89a" flatShading />
      </mesh>
      {/* Painted base band */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[w + 0.01, 0.22, d + 0.01]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      {[
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, d / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2 + 0.14, z]}>
          <boxGeometry args={[0.08, h, 0.08]} />
          <meshStandardMaterial color="#2c4730" flatShading />
        </mesh>
      ))}
      <Window position={[-0.65, h * 0.62, d / 2 + 0.02]} lit shutters />
      <Window position={[0.65, h * 0.62, d / 2 + 0.02]} lit={false} shutters />
      <ShutterDoor position={[0, 0.14, d / 2 + 0.02]} width={0.5} height={0.78} />
      <CorrugatedRoof width={w} depth={d} height={0.62} y={h + 0.14} color="#9aa7ad" />

      {/* Sign above door */}
      <group position={[0, h + 0.08, d / 2 + 0.06]}>
        <mesh>
          <boxGeometry args={[w * 0.72, 0.24, 0.04]} />
          <meshStandardMaterial color="#3f7a52" flatShading />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <boxGeometry args={[w * 0.6, 0.13, 0.01]} />
          <meshStandardMaterial color="#fdf6e3" flatShading />
        </mesh>
      </group>

      {/* Boundary low wall with gate posts */}
      <mesh position={[0, 0.18, d / 2 + 1.05]}>
        <boxGeometry args={[w + 1, 0.32, 0.08]} />
        <meshStandardMaterial color="#5a4a36" flatShading />
      </mesh>
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.4, d / 2 + 1.05]} castShadow>
          <boxGeometry args={[0.14, 0.76, 0.14]} />
          <meshStandardMaterial color="#caa14a" flatShading />
        </mesh>
      ))}

      {/* Flagpole + pennant */}
      <group position={[w / 2 - 0.3, h + 0.14, -d / 2 + 0.3]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.8, 6]} />
          <meshStandardMaterial color="#d8d8d0" flatShading />
        </mesh>
        <mesh position={[0.13, 0.68, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.13, 0.26, 4]} />
          <meshStandardMaterial color="#caa14a" flatShading />
        </mesh>
      </group>
    </group>
  );
}

/** Climate-controlled warehouse — large gable hall, loading dock + ramp, roof water tank, vent strip. */
function WarehouseBuilding({ position }: { position: [number, number, number] }) {
  const w = 3.2;
  const h = 1.65;
  const d = 2.1;
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.12, 0.14, d + 0.12]} />
        <meshStandardMaterial color="#3a3026" flatShading />
      </mesh>
      <mesh position={[0, h / 2 + 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#d3ad57" flatShading />
      </mesh>
      {[
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, d / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2 + 0.14, z]}>
          <boxGeometry args={[0.09, h, 0.09]} />
          <meshStandardMaterial color="#5a4022" flatShading />
        </mesh>
      ))}
      <Window position={[-1.05, h * 0.68, d / 2 + 0.02]} lit shutters={false} size={[0.26, 0.3]} />
      <Window position={[0, h * 0.68, d / 2 + 0.02]} lit={false} shutters={false} size={[0.26, 0.3]} />
      <Window position={[1.05, h * 0.68, d / 2 + 0.02]} lit shutters={false} size={[0.26, 0.3]} />

      {/* Loading dock platform + ramp + roller door */}
      <mesh position={[-0.55, 0.32, d / 2 + 0.35]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.36, 0.7]} />
        <meshStandardMaterial color="#5a5248" flatShading />
      </mesh>
      <mesh position={[-0.55, 0.16, d / 2 + 0.85]} rotation-x={-0.32} castShadow>
        <boxGeometry args={[1.3, 0.06, 0.6]} />
        <meshStandardMaterial color="#454039" flatShading />
      </mesh>
      <ShutterDoor position={[-0.55, 0.5, d / 2 + 0.02]} width={1.0} height={0.95} slats={9} />

      <CorrugatedRoof width={w} depth={d} height={0.78} y={h + 0.14} color="#9aa7ad" />
      {/* Roof vent strip along ridge */}
      <mesh position={[0, h + 0.14 + 0.78 + 0.1, 0]}>
        <boxGeometry args={[w * 0.5, 0.16, 0.3]} />
        <meshStandardMaterial color="#8a979d" flatShading metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Rooftop water tank on stilts */}
      <group position={[w / 2 - 0.5, h + 0.14, -d / 2 + 0.45]}>
        {[
          [-0.18, -0.18],
          [0.18, -0.18],
          [-0.18, 0.18],
          [0.18, 0.18],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.18, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
            <meshStandardMaterial color="#6b6b6b" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 12]} />
          <meshStandardMaterial color="#bcc4c8" flatShading metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.73, 0]}>
          <coneGeometry args={[0.32, 0.14, 12]} />
          <meshStandardMaterial color="#9aa7ad" flatShading />
        </mesh>
      </group>

      {/* Sign */}
      <group position={[0.5, h + 0.08, d / 2 + 0.06]}>
        <mesh>
          <boxGeometry args={[1.5, 0.26, 0.04]} />
          <meshStandardMaterial color="#caa14a" flatShading />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <boxGeometry args={[1.3, 0.14, 0.01]} />
          <meshStandardMaterial color="#2c2117" flatShading />
        </mesh>
      </group>
    </group>
  );
}

/** A single retail shopfront — roller shutter, hanging sign, awning support post. Used 3x in a row. */
function RetailShop({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const w = 1.05;
  const h = 1.05;
  const d = 1.0;
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.08, 0.12, d + 0.08]} />
        <meshStandardMaterial color="#3a3026" flatShading />
      </mesh>
      <mesh position={[0, h / 2 + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <Window position={[w / 2 - 0.18, h * 0.7, d / 2 + 0.02]} lit shutters={false} size={[0.2, 0.22]} />
      <ShutterDoor position={[-0.12, 0.12, d / 2 + 0.02]} width={0.55} height={0.62} slats={6} />
      <CorrugatedRoof width={w} depth={d} height={0.4} y={h + 0.12} color="#9aa7ad" />

      {/* Hanging shop sign */}
      <group position={[0, h - 0.05, d / 2 + 0.18]}>
        <mesh>
          <boxGeometry args={[w * 0.85, 0.2, 0.035]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[w * 0.7, 0.1, 0.01]} />
          <meshStandardMaterial color="#fdf6e3" flatShading />
        </mesh>
      </group>

      {/* Awning support post */}
      <mesh position={[w / 2 + 0.05, 0.45, d / 2 + 0.38]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
        <meshStandardMaterial color="#caa14a" flatShading />
      </mesh>
    </group>
  );
}

/** Striped fabric awning shared across the retail row. */
function Awning({
  position,
  width,
  rotationY = 0,
}: {
  position: [number, number, number];
  width: number;
  rotationY?: number;
}) {
  const stripeCount = 8;
  return (
    <group position={position} rotation-y={rotationY}>
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh key={i} position={[(i - (stripeCount - 1) / 2) * (width / stripeCount), 0, 0]} rotation-x={-0.22}>
          <boxGeometry args={[width / stripeCount - 0.02, 0.02, 0.62]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#3f7a52" : "#fdf6e3"} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.01, -0.32]}>
        <boxGeometry args={[width, 0.05, 0.05]} />
        <meshStandardMaterial color="#caa14a" flatShading />
      </mesh>
    </group>
  );
}

/** Floating glass-pill marker labeling a stop on the route, billboarded toward the camera. */
function StationMarker({
  position,
  index,
  title,
  subtitle,
}: {
  position: [number, number, number];
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 6]} />
        <meshStandardMaterial color="#fdf6e3" transparent opacity={0.55} flatShading />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#caa14a" emissive="#caa14a" emissiveIntensity={0.8} flatShading />
      </mesh>
      <Html center distanceFactor={7} style={{ pointerEvents: "none" }} zIndexRange={[5, 0]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "oklch(0.205 0.02 152 / 55%)",
            border: "1px solid oklch(0.96 0.01 95 / 18%)",
            backdropFilter: "blur(10px)",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "999px",
              background: "#caa14a",
              color: "#23190f",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index}
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#fdf6e3" }}>{title}</span>
            <span style={{ fontSize: "10.5px", color: "rgba(253,246,227,0.65)" }}>{subtitle}</span>
          </span>
        </div>
      </Html>
    </group>
  );
}

function Figure({
  position,
  skin = "#e7c9a0",
  shirt = "#3f7a52",
  pants = "#3a3a3a",
  hat,
  bobOffset = 0,
  carrying = false,
}: {
  position: [number, number, number];
  skin?: string;
  shirt?: string;
  pants?: string;
  hat?: string;
  bobOffset?: number;
  carrying?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Mesh>(null);
  const armRRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 2 + bobOffset;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t) * 0.025;
    }
    if (armLRef.current && armRRef.current && !carrying) {
      armLRef.current.rotation.x = Math.sin(t) * 0.3;
      armRRef.current.rotation.x = -Math.sin(t) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Legs */}
      <mesh position={[-0.045, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.16, 4, 6]} />
        <meshStandardMaterial color={pants} flatShading />
      </mesh>
      <mesh position={[0.045, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.16, 4, 6]} />
        <meshStandardMaterial color={pants} flatShading />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.095, 0.2, 4, 8]} />
        <meshStandardMaterial color={shirt} flatShading />
      </mesh>

      {/* Arms */}
      <mesh ref={armLRef} position={[-0.13, 0.36, 0]} castShadow>
        <capsuleGeometry args={[0.032, 0.18, 4, 6]} />
        <meshStandardMaterial color={shirt} flatShading />
      </mesh>
      <mesh ref={armRRef} position={[0.13, 0.36, 0]} castShadow>
        <capsuleGeometry args={[0.032, 0.18, 4, 6]} />
        <meshStandardMaterial color={shirt} flatShading />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.56, 0]} castShadow>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.03, 0.57, 0.075]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#221b14" />
      </mesh>
      <mesh position={[0.03, 0.57, 0.075]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#221b14" />
      </mesh>

      {hat === "cap" && (
        <mesh position={[0, 0.62, 0.01]} rotation-x={-0.1}>
          <sphereGeometry args={[0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#caa14a" flatShading />
        </mesh>
      )}
      {hat === "hardhat" && (
        <group position={[0, 0.63, 0]}>
          <mesh>
            <sphereGeometry args={[0.095, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e7b53a" flatShading />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <torusGeometry args={[0.09, 0.012, 6, 16]} />
            <meshStandardMaterial color="#b3892a" flatShading />
          </mesh>
        </group>
      )}

      {carrying && (
        <mesh position={[0, 0.48, 0.12]} rotation-x={0.3} castShadow>
          <boxGeometry args={[0.22, 0.2, 0.2]} />
          <meshStandardMaterial color="#caa14a" flatShading />
        </mesh>
      )}
    </group>
  );
}

function CratePile({
  origin,
  count = 9,
  rotationY = 0,
}: {
  origin: [number, number, number];
  count?: number;
  rotationY?: number;
}) {
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const bandRef = useRef<THREE.InstancedMesh>(null);

  const layout = useMemo(() => {
    const cols = 3;
    const list: { pos: THREE.Vector3; rot: number }[] = [];
    let i = 0;
    for (let layer = 0; layer < Math.ceil(count / (cols * cols)); layer++) {
      for (let row = 0; row < cols && i < count; row++) {
        for (let col = 0; col < cols && i < count; col++) {
          const jitter = ((i * 53) % 7) / 7 - 0.5;
          list.push({
            pos: new THREE.Vector3(
              (col - 1) * 0.32 + jitter * 0.02,
              0.15 + layer * 0.3,
              (row - 1) * 0.32 + jitter * 0.02,
            ),
            rot: (i % 4) * 0.12 + jitter * 0.08,
          });
          i++;
        }
      }
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    if (!boxRef.current || !bandRef.current) return;
    const dummy = new THREE.Object3D();
    layout.forEach((item, i) => {
      dummy.position.set(origin[0] + item.pos.x, origin[1] + item.pos.y, origin[2] + item.pos.z);
      dummy.rotation.set(0, item.rot + rotationY, 0);
      dummy.updateMatrix();
      boxRef.current!.setMatrixAt(i, dummy.matrix);
      bandRef.current!.setMatrixAt(i, dummy.matrix);
    });
    boxRef.current.instanceMatrix.needsUpdate = true;
    bandRef.current.instanceMatrix.needsUpdate = true;
  }, [layout, origin, rotationY]);

  return (
    <group>
      <instancedMesh ref={boxRef} args={[undefined, undefined, layout.length]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#c79a3f" flatShading roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={bandRef} args={[undefined, undefined, layout.length]}>
        <boxGeometry args={[0.32, 0.045, 0.32]} />
        <meshStandardMaterial color="#5a4022" flatShading />
      </instancedMesh>
    </group>
  );
}

function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#2c2c2c" flatShading />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffe6a8" emissive="#ffb347" emissiveIntensity={1.1} flatShading />
      </mesh>
      <pointLight position={[0, 0.72, 0]} color="#ffb347" intensity={0.4} distance={2.2} />
    </group>
  );
}

/* ---------------------------------- Truck --------------------------------- */

function Truck({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = THREE.MathUtils.clamp(progressRef.current, 0.001, 0.999);
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    ref.current.position.set(pos.x, 0.18, pos.z);
    ref.current.rotation.y = Math.atan2(tangent.x, tangent.z) + Math.PI;
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x += delta * 6;
    });
  });

  const wheelPositions: [number, number][] = [
    [-0.27, -0.42],
    [0.27, -0.42],
    [-0.27, 0.1],
    [0.27, 0.1],
    [-0.27, 0.42],
    [0.27, 0.42],
  ];

  const ribCount = 7;

  return (
    <group ref={ref}>
      {/* Cab */}
      <mesh position={[0, 0.27, -0.55]} castShadow>
        <boxGeometry args={[0.56, 0.42, 0.42]} />
        <meshStandardMaterial color="#3f7a52" flatShading />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.35, -0.34]} rotation-x={0.25}>
        <boxGeometry args={[0.46, 0.22, 0.03]} />
        <meshStandardMaterial color="#a9dfff" flatShading transparent opacity={0.75} />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.285, 0.32, -0.5]}>
        <boxGeometry args={[0.02, 0.16, 0.18]} />
        <meshStandardMaterial color="#a9dfff" flatShading transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.285, 0.32, -0.5]}>
        <boxGeometry args={[0.02, 0.16, 0.18]} />
        <meshStandardMaterial color="#a9dfff" flatShading transparent opacity={0.75} />
      </mesh>
      {/* Hood / bumper */}
      <mesh position={[0, 0.12, -0.78]} castShadow>
        <boxGeometry args={[0.58, 0.16, 0.08]} />
        <meshStandardMaterial color="#caa14a" flatShading />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.2, 0.14, -0.82]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#fff7d6" emissive="#ffe9a8" emissiveIntensity={1.2} flatShading />
      </mesh>
      <mesh position={[0.2, 0.14, -0.82]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#fff7d6" emissive="#ffe9a8" emissiveIntensity={1.2} flatShading />
      </mesh>
      {/* Side mirrors */}
      <mesh position={[-0.3, 0.38, -0.62]}>
        <boxGeometry args={[0.05, 0.07, 0.02]} />
        <meshStandardMaterial color="#1d1d1d" flatShading />
      </mesh>
      <mesh position={[0.3, 0.38, -0.62]}>
        <boxGeometry args={[0.05, 0.07, 0.02]} />
        <meshStandardMaterial color="#1d1d1d" flatShading />
      </mesh>

      {/* Cargo box */}
      <mesh position={[0, 0.34, 0.32]} castShadow>
        <boxGeometry args={[0.62, 0.5, 0.78]} />
        <meshStandardMaterial color="#e7e1d4" flatShading />
      </mesh>
      {/* Cargo ribs */}
      {Array.from({ length: ribCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.34, 0.32 - 0.34 + (i * 0.68) / (ribCount - 1)]}>
          <boxGeometry args={[0.635, 0.51, 0.025]} />
          <meshStandardMaterial color="#cdc6b4" flatShading />
        </mesh>
      ))}
      {/* Rear doors */}
      <mesh position={[0, 0.34, 0.71]}>
        <boxGeometry args={[0.6, 0.48, 0.02]} />
        <meshStandardMaterial color="#d8d1c0" flatShading />
      </mesh>
      <mesh position={[0, 0.34, 0.72]}>
        <boxGeometry args={[0.02, 0.48, 0.02]} />
        <meshStandardMaterial color="#5a4022" flatShading />
      </mesh>
      {/* Chassis */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.45, 0.1, 1.3]} />
        <meshStandardMaterial color="#2c2c2c" flatShading />
      </mesh>
      {/* Exhaust pipe */}
      <mesh position={[-0.26, 0.06, -0.35]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Wheels with rims */}
      {wheelPositions.map(([x, z], i) => (
        <group key={i} position={[x, -0.07, z]}>
          <mesh
            ref={(el) => {
              if (el) wheelRefs.current[i] = el;
            }}
            rotation-z={Math.PI / 2}
            castShadow
          >
            <cylinderGeometry args={[0.135, 0.135, 0.13, 14]} />
            <meshStandardMaterial color="#1a1a1a" flatShading roughness={0.9} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.06, 0.06, 0.14, 8]} />
            <meshStandardMaterial color="#9a9a9a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------- Camera rig (follows truck) --------------------------------- */

function MapCameraRig({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: React.RefObject<number> }) {
  const { camera, size } = useThree();
  const lookTarget = useRef(new THREE.Vector3());

  // r3f's escape hatch: the camera object from useThree is meant to be mutated
  // imperatively per-frame, which the react-compiler immutability rule can't model.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const t = THREE.MathUtils.clamp(progressRef.current, 0.001, 0.999);
    const pos = curve.getPointAt(t);
    // Pull the camera back on narrow/portrait viewports so the same world-space
    // framing (buildings, labels) stays fully visible instead of overflowing.
    const aspect = size.width / size.height;
    const zoomOut = THREE.MathUtils.clamp(1.05 / Math.min(aspect, 1.3), 1, 2.3);
    const desired = new THREE.Vector3(pos.x + 5 * zoomOut, 4.6 * zoomOut, pos.z + 5.8 * zoomOut);
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

/**
 * Builds a (lateral, forward) -> world Vector3 placer for a station, using the
 * curve's true tangent/normal at that point — not raw world x/z deltas. The
 * road bends at varying angles along its length, so a fixed world-axis offset
 * (e.g. "z - 1.4") can land a building right back on the road at one station
 * even though it cleared it at another. Placing along the real perpendicular
 * (`normal`) guarantees the same road clearance everywhere.
 */
function useStationPlacer(curve: THREE.CatmullRomCurve3, t: number) {
  return useMemo(() => {
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    // Angle that rotates an object's local +x axis onto the road's tangent
    // direction — used to align row layouts (the retail awning) with the road.
    const angle = Math.atan2(-tangent.z, tangent.x);
    const at = ((lateral: number, forward = 0): [number, number, number] => [
      point.x + normal.x * lateral + tangent.x * forward,
      0,
      point.z + normal.z * lateral + tangent.z * forward,
    ]) as ((lateral: number, forward?: number) => [number, number, number]) & { angle: number };
    at.angle = angle;
    return at;
  }, [curve, t]);
}

export function SupplyChainMap({ progressRef }: { progressRef: React.RefObject<number> }) {
  const curve = useRouteCurve();
  const atDepot = useStationPlacer(curve, STATIONS.depot + 0.001);
  const atWarehouse = useStationPlacer(curve, STATIONS.warehouse);
  const atRetail = useStationPlacer(curve, STATIONS.retail - 0.001);

  return (
    <group>
      <GroundAndRoad curve={curve} />
      <MapCameraRig curve={curve} progressRef={progressRef} />
      <Truck curve={curve} progressRef={progressRef} />

      {/* Depot — government procurement point. Road half-width is 0.55, so every
          lateral offset below clears it with a healthy margin (~0.6+). */}
      <DepotBuilding position={atDepot(-2.1, 0)} />
      <CratePile origin={atDepot(-1.25, -0.5)} count={9} rotationY={0.2} />
      <Figure position={atDepot(-1.0, 0.5)} shirt="#caa14a" hat="hardhat" bobOffset={0} carrying />
      <Figure position={atDepot(-1.3, 0.85)} shirt="#5b8fb0" hat="cap" bobOffset={1.4} />
      <LampPost position={atDepot(-1.0, -1.2)} />
      <StationMarker
        position={atDepot(-2.1, 0).map((v, i) => (i === 1 ? 1.9 : v)) as [number, number, number]}
        index="01"
        title="Government Depot"
        subtitle="BADC / BCIC procurement"
      />

      {/* Warehouse — climate-controlled godown. Largest footprint, so it sits
          furthest back from the road. */}
      <WarehouseBuilding position={atWarehouse(2.6, 0)} />
      <CratePile origin={atWarehouse(1.5, -0.9)} count={12} rotationY={-0.1} />
      <CratePile origin={atWarehouse(1.6, 0.7)} count={6} rotationY={0.3} />
      <Figure position={atWarehouse(1.2, -1.3)} shirt="#3f7a52" hat="hardhat" bobOffset={0.6} carrying />
      <Figure position={atWarehouse(1.0, -1.6)} shirt="#caa14a" hat="hardhat" bobOffset={2.1} />
      <LampPost position={atWarehouse(1.1, 1.5)} />
      <StationMarker
        position={atWarehouse(2.6, 0).map((v, i) => (i === 1 ? 2.4 : v)) as [number, number, number]}
        index="02"
        title="Climate-Controlled Godown"
        subtitle="Secure transport & storage"
      />

      {/* Retailer row — verified retail distribution, three shopfronts spread
          along the road (forward axis) at a fixed safe lateral offset. */}
      {[-1.25, 0, 1.25].map((forward, i) => (
        <RetailShop key={i} position={atRetail(-1.7, forward)} color={["#5b8fb0", "#caa14a", "#7fb88a"][i]} />
      ))}
      <Awning
        position={atRetail(-1.7, 0).map((v, i) => (i === 1 ? 1.45 : v)) as [number, number, number]}
        width={3.9}
        rotationY={atRetail.angle}
      />
      <Figure position={atRetail(-1.0, -1.9)} shirt="#5b8fb0" hat="cap" bobOffset={0.9} />
      <Figure position={atRetail(-1.0, 0.6)} shirt="#7fb88a" bobOffset={1.8} carrying />
      <CratePile origin={atRetail(-1.0, 1.6)} count={4} rotationY={0.4} />
      <LampPost position={atRetail(-1.0, -2.3)} />
      <StationMarker
        position={atRetail(-1.7, 0).map((v, i) => (i === 1 ? 1.9 : v)) as [number, number, number]}
        index="03"
        title="Verified Retailers"
        subtitle="Last-mile distribution"
      />

      {/* Ambient trees along the route */}
      {[
        [-9, -2.6, "pine"],
        [-4, 1.8, "bush"],
        [0, -2.2, "pine"],
        [4.5, 2.2, "bush"],
        [9, -1.6, "pine"],
        [-6.2, -0.6, "bush"],
        [3, -1.2, "pine"],
      ].map(([x, z, kind], i) =>
        kind === "pine" ? (
          <PineTree key={i} position={[x as number, 0, z as number]} scale={0.85 + (i % 3) * 0.12} />
        ) : (
          <BushTree key={i} position={[x as number, 0, z as number]} scale={0.85 + (i % 3) * 0.12} />
        ),
      )}
    </group>
  );
}
