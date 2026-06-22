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

function Window({ position, lit = true }: { position: [number, number, number]; lit?: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.22, 0.26, 0.04]} />
        <meshStandardMaterial color="#2a2017" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.17, 0.21, 0.02]} />
        <meshStandardMaterial
          color={lit ? "#ffe5a0" : "#bcd6dc"}
          emissive={lit ? "#ffb347" : "#000000"}
          emissiveIntensity={lit ? 0.9 : 0}
          flatShading
        />
      </mesh>
    </group>
  );
}

function GableRoof({
  width,
  depth,
  height,
  y,
  color,
}: {
  width: number;
  depth: number;
  height: number;
  y: number;
  color: string;
}) {
  const overhang = 0.18;
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

  return (
    <group position={[0, y, -depth / 2 - overhang / 2]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, height * 0.55, depth / 2 + overhang]} rotation-x={Math.PI / 2}>
        <boxGeometry args={[0.05, 0.05, height * 1.05]} />
        <meshStandardMaterial color="#2c2117" flatShading />
      </mesh>
    </group>
  );
}

function Building({
  position,
  size = [2, 1.4, 1.6],
  color = "#caa14a",
  roofColor = "#7a5a2a",
  windows = 2,
  hasDoor = true,
  trimColor,
  sign,
}: {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  roofColor?: string;
  windows?: number;
  hasDoor?: boolean;
  trimColor?: string;
  sign?: { color: string; text?: string };
}) {
  const [w, h, d] = size;
  const trim = trimColor ?? "#2c2117";
  const windowYs = h * 0.62;
  const winXs = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < windows; i++) {
      arr.push((i - (windows - 1) / 2) * (w / (windows + 0.4)));
    }
    return arr;
  }, [windows, w]);

  return (
    <group position={position}>
      {/* Plinth / foundation */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.1, 0.12, d + 0.1]} />
        <meshStandardMaterial color="#3a3026" flatShading />
      </mesh>

      {/* Walls */}
      <mesh position={[0, h / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>

      {/* Corner trim posts */}
      {[
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, d / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2 + 0.1, z]}>
          <boxGeometry args={[0.07, h, 0.07]} />
          <meshStandardMaterial color={trim} flatShading />
        </mesh>
      ))}

      {/* Windows on front face */}
      {winXs.map((x, i) => (
        <Window key={i} position={[x, windowYs, d / 2 + 0.02]} lit={i % 2 === 0} />
      ))}

      {/* Door */}
      {hasDoor && (
        <group position={[0, 0.1, d / 2 + 0.02]}>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.36, 0.64, 0.05]} />
            <meshStandardMaterial color={trim} flatShading />
          </mesh>
          <mesh position={[0.1, 0.32, 0.03]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshStandardMaterial color="#e7c97a" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      )}

      <GableRoof width={w} depth={d} height={Math.max(0.5, h * 0.4)} y={h + 0.1} color={roofColor} />

      {/* Shop sign */}
      {sign && (
        <group position={[0, h + 0.05, d / 2 + 0.05]}>
          <mesh>
            <boxGeometry args={[w * 0.7, 0.22, 0.04]} />
            <meshStandardMaterial color={sign.color} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[w * 0.58, 0.12, 0.01]} />
            <meshStandardMaterial color="#fdf6e3" flatShading />
          </mesh>
        </group>
      )}
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
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());

  // r3f's escape hatch: the camera object from useThree is meant to be mutated
  // imperatively per-frame, which the react-compiler immutability rule can't model.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const t = THREE.MathUtils.clamp(progressRef.current, 0.001, 0.999);
    const pos = curve.getPointAt(t);
    const desired = new THREE.Vector3(pos.x + 5, 4.6, pos.z + 5.8);
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
      <Building
        position={[depot.x - 0.2, 0, depot.z - 1.4]}
        size={[2.2, 1.2, 1.6]}
        color="#7fb88a"
        roofColor="#3f7a52"
        windows={2}
        sign={{ color: "#3f7a52" }}
      />
      <CratePile origin={[depot.x - 0.6, 0, depot.z - 0.3]} count={9} rotationY={0.2} />
      <Figure position={[depot.x + 0.6, 0, depot.z - 0.5]} shirt="#caa14a" hat="hardhat" bobOffset={0} carrying />
      <Figure position={[depot.x + 0.9, 0, depot.z - 0.2]} shirt="#5b8fb0" hat="cap" bobOffset={1.4} />
      <LampPost position={[depot.x - 1.6, 0, depot.z + 0.4]} />

      {/* Warehouse — climate-controlled godown */}
      <Building
        position={[warehouse.x + 0.4, 0, warehouse.z + 1.6]}
        size={[3, 1.7, 2]}
        color="#caa14a"
        roofColor="#7a5a2a"
        windows={3}
        sign={{ color: "#caa14a" }}
      />
      <CratePile origin={[warehouse.x, 0, warehouse.z + 0.6]} count={12} rotationY={-0.1} />
      <CratePile origin={[warehouse.x + 1, 0, warehouse.z + 0.6]} count={6} rotationY={0.3} />
      <Figure position={[warehouse.x - 0.5, 0, warehouse.z + 0.3]} shirt="#3f7a52" hat="hardhat" bobOffset={0.6} carrying />
      <Figure position={[warehouse.x - 0.8, 0, warehouse.z + 0.7]} shirt="#caa14a" hat="hardhat" bobOffset={2.1} />
      <LampPost position={[warehouse.x + 2.1, 0, warehouse.z + 0.3]} />

      {/* Retailer row — verified retail distribution */}
      {[-1.2, 0, 1.2].map((offset, i) => (
        <Building
          key={i}
          position={[retail.x + offset, 0, retail.z - 1.5]}
          size={[1, 1, 1]}
          color={["#5b8fb0", "#caa14a", "#7fb88a"][i]}
          roofColor="#3a2f1c"
          windows={1}
          sign={{ color: ["#5b8fb0", "#caa14a", "#7fb88a"][i] }}
        />
      ))}
      <Figure position={[retail.x - 1.6, 0, retail.z - 0.6]} shirt="#5b8fb0" hat="cap" bobOffset={0.9} />
      <Figure position={[retail.x + 0.3, 0, retail.z - 0.6]} shirt="#7fb88a" bobOffset={1.8} carrying />
      <CratePile origin={[retail.x, 0, retail.z - 0.4]} count={4} rotationY={0.4} />
      <LampPost position={[retail.x - 2.3, 0, retail.z + 0.4]} />

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
