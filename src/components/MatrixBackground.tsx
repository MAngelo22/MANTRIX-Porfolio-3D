import { useEffect, useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface MatrixBackgroundProps {
  cardCount: number;
  cardSpacing: number;
}

interface RainDrop {
  x: number;
  y: number;
  z: number;
  speed: number;
  drift: number;
  fontSize: number;
  headChar: string;
  trailChars: string;
  trailLength: number;
}

interface Vehicle {
  type: 'car' | 'truck' | 'van' | 'bus' | 'bike';
  truckVariant?: 'cargo' | 'tanker' | 'flatbed';
  direction: 1 | -1;
  laneX: number;
  z: number;
  speed: number;
  wheelSpin: number;
  length: number;
  color: string;
}

const ROAD_WIDTH = 18;
const MATRIX_CHARS = '0011010011010110<>[]{}$#@*+=-|/\\?';

export function MatrixBackground({ cardCount, cardSpacing }: MatrixBackgroundProps) {
  const { scene } = useThree();
  const matrixRef = useRef<THREE.Points>(null);
  const rainRefs = useRef<Array<THREE.Group | null>>([]);
  const vehicleRefs = useRef<Array<THREE.Group | null>>([]);
  const cloudMaterialARef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudMaterialBRef = useRef<THREE.MeshStandardMaterial>(null);

  const totalDepth = (cardCount + 8) * cardSpacing;

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#020b06', 0.035);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const matrixGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 70 - 35;
      positions[i * 3 + 2] = 20 - Math.random() * (totalDepth + 50);

      color.setHSL(0.35, 0.95, 0.25 + Math.random() * 0.35);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [totalDepth]);

  const buildingTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 8; y < canvas.height - 8; y += 14) {
      for (let x = 8; x < canvas.width - 8; x += 12) {
        const n = (x * 19 + y * 13) % 100;
        const alpha = n > 75 ? 0.95 : n > 45 ? 0.55 : 0.18;
        ctx.fillStyle = `rgba(120,255,170,${alpha})`;
        ctx.fillRect(x, y, 6, 8);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 2.8);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#020202');
    grad.addColorStop(1, '#021208');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 40 + Math.random() * 90;
      const cloud = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
      cloud.addColorStop(0, 'rgba(40,110,70,0.28)');
      cloud.addColorStop(1, 'rgba(5,20,12,0)');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);
    return texture;
  }, []);

  const buildings = useMemo(() => {
    const templates = [
      { width: 3.8, height: 16, depth: 4.0, laneOffset: 0 },
      { width: 4.6, height: 23, depth: 4.2, laneOffset: 0.8 },
      { width: 3.2, height: 19, depth: 3.5, laneOffset: 0.3 },
      { width: 5.4, height: 30, depth: 5.0, laneOffset: 1.2 },
      { width: 2.9, height: 26, depth: 3.4, laneOffset: 0.4 },
      { width: 4.2, height: 21, depth: 3.7, laneOffset: 0.9 },
    ];

    const rows = Math.ceil(totalDepth / 10);
    const items: Array<{ position: [number, number, number]; scale: [number, number, number] }> = [];

    for (let row = 0; row < rows; row++) {
      const z = 10 - row * 10;
      const base = templates[row % templates.length];
      const alt = templates[(row + 2) % templates.length];

      items.push({
        position: [-10.8 - base.laneOffset, base.height / 2 - 11, z],
        scale: [base.width, base.height, base.depth],
      });
      items.push({
        position: [-16.4 - alt.laneOffset, alt.height / 2 - 11, z - 3.5],
        scale: [alt.width, alt.height, alt.depth],
      });
      items.push({
        position: [10.8 + base.laneOffset, base.height / 2 - 11, z - 1.2],
        scale: [base.width, base.height, base.depth],
      });
      items.push({
        position: [16.4 + alt.laneOffset, alt.height / 2 - 11, z - 4.8],
        scale: [alt.width, alt.height, alt.depth],
      });
    }

    return items;
  }, [totalDepth]);

  const roadMarks = useMemo(() => {
    const marks: number[] = [];
    const count = Math.ceil(totalDepth / 7);
    for (let i = 0; i < count; i++) marks.push(8 - i * 7);
    return marks;
  }, [totalDepth]);

  const lightPosts = useMemo(() => {
    const posts: Array<{ x: number; z: number }> = [];
    const count = Math.ceil(totalDepth / 12);
    for (let i = 0; i < count; i++) {
      const z = 10 - i * 12;
      posts.push({ x: -8.6, z });
      posts.push({ x: 8.6, z: z - 6 });
    }
    return posts;
  }, [totalDepth]);

  const rainDrops = useMemo(() => {
    const chars = MATRIX_CHARS.split('');
    const items: RainDrop[] = [];

    for (let i = 0; i < 220; i++) {
      const len = 6 + Math.floor(Math.random() * 10);
      let tail = '';
      for (let j = 0; j < len; j++) {
        tail += chars[Math.floor(Math.random() * chars.length)];
        if (j < len - 1) tail += '\n';
      }

      items.push({
        x: (Math.random() - 0.5) * 46,
        y: -8 + Math.random() * 36,
        z: 20 - Math.random() * (totalDepth + 20),
        speed: 0.05 + Math.random() * 0.14,
        drift: (Math.random() - 0.5) * 0.2,
        fontSize: 0.1 + Math.random() * 0.08,
        headChar: chars[Math.floor(Math.random() * chars.length)],
        trailChars: tail,
        trailLength: len,
      });
    }

    return items;
  }, [totalDepth]);

  const vehicles = useMemo(() => {
    const colors = ['#8cffaa', '#7fffd4', '#6cff7a', '#9effb5', '#66ffaa'];
    const items: Vehicle[] = [];
    const lanesForward: number[] = [1.6, 3.2, 4.8];
    const lanesBackward: number[] = [-1.6, -3.2, -4.8];
    const types: Vehicle['type'][] = ['car', 'car', 'truck', 'truck', 'van', 'bus', 'bike'];
    const truckVariants: Array<NonNullable<Vehicle['truckVariant']>> = ['cargo', 'tanker', 'flatbed'];

    for (let i = 0; i < 38; i++) {
      const direction = (Math.random() > 0.5 ? 1 : -1) as 1 | -1;
      const laneChoices = direction === 1 ? lanesForward : lanesBackward;
      const type = types[Math.floor(Math.random() * types.length)];
      const truckVariant = type === 'truck' ? truckVariants[Math.floor(Math.random() * truckVariants.length)] : undefined;
      const baseSpeed =
        type === 'bus' ? 0.035 : type === 'truck' ? 0.045 : type === 'van' ? 0.065 : type === 'bike' ? 0.11 : 0.085;
      const length =
        type === 'bus'
          ? 2.2
          : type === 'truck'
            ? truckVariant === 'tanker'
              ? 2.45
              : truckVariant === 'flatbed'
                ? 2.25
                : 2.1
            : type === 'van'
              ? 1.6
              : type === 'bike'
                ? 0.82
                : 1.35;

      items.push({
        type,
        truckVariant,
        direction,
        laneX: laneChoices[Math.floor(Math.random() * laneChoices.length)],
        z: direction === 1 ? -Math.random() * totalDepth : 20 - Math.random() * totalDepth,
        speed: baseSpeed * (0.82 + Math.random() * 0.5),
        wheelSpin: type === 'bus' ? 0.06 : type === 'truck' ? 0.08 : type === 'bike' ? 0.18 : 0.12,
        length,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return items;
  }, [totalDepth]);

  useFrame(({ clock }) => {
    if (matrixRef.current) {
      const positions = matrixRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.08;
        if (positions[i] < -35) positions[i] = 35;
      }
      matrixRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (cloudMaterialARef.current?.map) {
      cloudMaterialARef.current.map.offset.x += 0.00035;
      cloudMaterialARef.current.map.offset.y += 0.00018;
    }
    if (cloudMaterialBRef.current?.map) {
      cloudMaterialBRef.current.map.offset.x -= 0.00022;
      cloudMaterialBRef.current.map.offset.y += 0.00012;
    }

    rainDrops.forEach((drop, index) => {
      const ref = rainRefs.current[index];
      if (!ref) return;
      ref.position.y -= drop.speed;
      ref.position.x += Math.sin(clock.elapsedTime * 0.7 + index) * drop.drift * 0.004;
      if (ref.position.y < -16) {
        ref.position.y = 24 + Math.random() * 8;
      }
    });

    vehicles.forEach((vehicle, index) => {
      const ref = vehicleRefs.current[index];
      if (!ref) return;

      ref.position.z += vehicle.speed * vehicle.direction;

      if (vehicle.direction === 1 && ref.position.z > 22) {
        ref.position.z = -totalDepth + Math.random() * 14;
      }
      if (vehicle.direction === -1 && ref.position.z < -totalDepth - 14) {
        ref.position.z = 18 - Math.random() * 14;
      }

      ref.children.forEach((child) => {
        if (child.userData.isWheel) {
          child.rotation.x -= vehicle.wheelSpin * vehicle.direction;
        }
      });
    });

    // Keep spacing by lane+direction so vehicles never overlap.
    const lanes = new Map<string, Array<{ index: number; z: number }>>();
    vehicles.forEach((vehicle, index) => {
      const ref = vehicleRefs.current[index];
      if (!ref) return;
      const key = `${vehicle.direction}:${vehicle.laneX.toFixed(1)}`;
      if (!lanes.has(key)) lanes.set(key, []);
      lanes.get(key)?.push({ index, z: ref.position.z });
    });

    lanes.forEach((entries, key) => {
      const direction = key.startsWith('1:') ? 1 : -1;
      const sorted = [...entries].sort((a, b) => (direction === 1 ? b.z - a.z : a.z - b.z));

      for (let i = 1; i < sorted.length; i++) {
        const front = sorted[i - 1];
        const follower = sorted[i];
        const frontVehicle = vehicles[front.index];
        const followerVehicle = vehicles[follower.index];
        const minGap = (frontVehicle.length + followerVehicle.length) * 1.05 + 1.25;
        const followerRef = vehicleRefs.current[follower.index];
        if (!followerRef) continue;

        if (direction === 1) {
          const maxZ = front.z - minGap;
          if (followerRef.position.z > maxZ) followerRef.position.z = maxZ;
        } else {
          const minZ = front.z + minGap;
          if (followerRef.position.z < minZ) followerRef.position.z = minZ;
        }
      }
    });
  });

  return (
    <group>
      <mesh position={[0, 28, -totalDepth / 2 + 10]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[120, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#020603" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 20, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, totalDepth + 80]} />
        <meshStandardMaterial
          ref={cloudMaterialARef}
          color="#08150d"
          map={cloudTexture ?? undefined}
          transparent
          opacity={0.52}
          emissive="#06240f"
          emissiveIntensity={0.16}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 16, -totalDepth / 2 + 16]} rotation={[-Math.PI / 2, 0.2, 0]}>
        <planeGeometry args={[120, totalDepth + 80]} />
        <meshStandardMaterial
          ref={cloudMaterialBRef}
          color="#060f0a"
          map={cloudTexture ?? undefined}
          transparent
          opacity={0.42}
          emissive="#041c0d"
          emissiveIntensity={0.12}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -11.95, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, totalDepth + 20]} />
        <meshStandardMaterial color="#080808" emissive="#001d0f" emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[-8.9, -11.85, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, totalDepth + 20]} />
        <meshStandardMaterial color="#12261c" emissive="#1b6e45" emissiveIntensity={0.28} />
      </mesh>

      <mesh position={[8.9, -11.85, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, totalDepth + 20]} />
        <meshStandardMaterial color="#12261c" emissive="#1b6e45" emissiveIntensity={0.28} />
      </mesh>

      <mesh position={[0, -11.83, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.25, totalDepth + 20]} />
        <meshBasicMaterial color="#65ff9e" transparent opacity={0.5} />
      </mesh>

      <mesh position={[-7.8, -11.8, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, totalDepth + 20]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.55} />
      </mesh>
      <mesh position={[7.8, -11.8, -totalDepth / 2 + 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, totalDepth + 20]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.55} />
      </mesh>

      {roadMarks.map((z, index) => (
        <group key={`lane-mark-${index}`}>
          <mesh position={[2.4, -11.89, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.18, 2.5]} />
            <meshBasicMaterial color="#8dffad" transparent opacity={0.4} />
          </mesh>
          <mesh position={[4.0, -11.89, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.18, 2.5]} />
            <meshBasicMaterial color="#8dffad" transparent opacity={0.4} />
          </mesh>
          <mesh position={[-2.4, -11.89, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.18, 2.5]} />
            <meshBasicMaterial color="#8dffad" transparent opacity={0.4} />
          </mesh>
          <mesh position={[-4.0, -11.89, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.18, 2.5]} />
            <meshBasicMaterial color="#8dffad" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {lightPosts.map((post, index) => (
        <group key={`light-${index}`} position={[post.x, -11.9, post.z]}>
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 4.2, 8]} />
            <meshStandardMaterial color="#0a0a0a" emissive="#005522" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.38 * Math.sign(-post.x), 4.05, 0]}>
            <boxGeometry args={[0.7, 0.14, 0.14]} />
            <meshStandardMaterial color="#0a0a0a" emissive="#00aa55" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.68 * Math.sign(-post.x), 3.98, 0]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshBasicMaterial color="#98ffb7" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.68 * Math.sign(-post.x), 2.7, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.9, 2.8, 16, 1, true]} />
            <meshBasicMaterial color="#53ff87" transparent opacity={0.11} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      <points ref={matrixRef} geometry={matrixGeometry}>
        <pointsMaterial size={0.17} vertexColors transparent opacity={0.65} sizeAttenuation />
      </points>

      <group>
        {buildings.map((building, index) => (
          <mesh key={`building-${index}`} position={building.position}>
            <boxGeometry args={building.scale} />
            <meshStandardMaterial
              color="#090909"
              map={buildingTexture ?? undefined}
              emissiveMap={buildingTexture ?? undefined}
              emissive="#00aa55"
              emissiveIntensity={0.3}
              metalness={0.55}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>

      <group>
        {rainDrops.map((drop, index) => (
          <group
            key={`rain-${index}`}
            ref={(el) => {
              rainRefs.current[index] = el;
            }}
            position={[drop.x, drop.y, drop.z]}
            rotation={[0, 0, (index % 2 === 0 ? 1 : -1) * 0.08]}
          >
            <Text
              fontSize={drop.fontSize * 1.02}
              lineHeight={0.68}
              color="#5dff87"
              fillOpacity={0.34}
              anchorX="center"
              anchorY="top"
            >
              {drop.trailChars}
            </Text>
            <Text
              fontSize={drop.fontSize}
              lineHeight={0.68}
              color="#caffda"
              fillOpacity={0.95}
              anchorX="center"
              anchorY="top"
              position={[0, drop.fontSize * 0.52, 0.02]}
            >
              {drop.headChar}
            </Text>
          </group>
        ))}
      </group>

      <group>
        {vehicles.map((vehicle, index) => {
          const preset =
            vehicle.type === 'bike'
              ? { w: 0.28, h: 0.16, l: 0.82, cabW: 0.2, cabH: 0.14, cabL: 0.28, wheelR: 0.06, wheelT: 0.018 }
              : vehicle.type === 'bus'
                ? { w: 0.78, h: 0.34, l: 2.2, cabW: 0.72, cabH: 0.3, cabL: 1.2, wheelR: 0.1, wheelT: 0.034 }
                : vehicle.type === 'truck'
                  ? vehicle.truckVariant === 'tanker'
                    ? { w: 0.74, h: 0.3, l: 2.45, cabW: 0.6, cabH: 0.24, cabL: 0.7, wheelR: 0.095, wheelT: 0.034 }
                    : vehicle.truckVariant === 'flatbed'
                      ? { w: 0.72, h: 0.28, l: 2.25, cabW: 0.58, cabH: 0.24, cabL: 0.68, wheelR: 0.092, wheelT: 0.033 }
                      : { w: 0.74, h: 0.3, l: 2.1, cabW: 0.62, cabH: 0.24, cabL: 0.78, wheelR: 0.094, wheelT: 0.034 }
                  : vehicle.type === 'van'
                    ? { w: 0.66, h: 0.28, l: 1.6, cabW: 0.58, cabH: 0.22, cabL: 0.86, wheelR: 0.088, wheelT: 0.03 }
                    : { w: 0.62, h: 0.24, l: 1.35, cabW: 0.48, cabH: 0.16, cabL: 0.6, wheelR: 0.085, wheelT: 0.03 };
          const frontZ = preset.l * 0.5;
          const rearZ = -preset.l * 0.5;
          const wheelX = preset.w * 0.35;
          const wheelZ = preset.l * 0.36;

          return (
            <group
              key={`vehicle-${index}`}
              ref={(el) => {
                vehicleRefs.current[index] = el;
              }}
              position={[vehicle.laneX, -11.72, vehicle.z]}
              rotation={[0, vehicle.direction === 1 ? 0 : Math.PI, 0]}
            >
              <mesh position={[0, preset.h * 0.55, 0]}>
                <boxGeometry args={[preset.w, preset.h, preset.l]} />
                <meshStandardMaterial color="#101010" emissive={vehicle.color} emissiveIntensity={0.26} />
              </mesh>

              <mesh position={[0, preset.h + preset.cabH * 0.35, -preset.l * 0.08]}>
                <boxGeometry args={[preset.cabW, preset.cabH, preset.cabL]} />
                <meshStandardMaterial color="#0d0d0d" emissive="#66ff99" emissiveIntensity={0.1} />
              </mesh>

              {vehicle.type === 'truck' && vehicle.truckVariant === 'tanker' && (
                <mesh position={[0, preset.h + 0.16, -preset.l * 0.08]}>
                  <cylinderGeometry args={[0.2, 0.2, preset.l * 0.72, 12]} />
                  <meshStandardMaterial color="#172a21" emissive="#2a7d54" emissiveIntensity={0.18} />
                </mesh>
              )}

              {vehicle.type === 'truck' && vehicle.truckVariant === 'flatbed' && (
                <mesh position={[0, preset.h + 0.08, -preset.l * 0.06]}>
                  <boxGeometry args={[preset.w * 0.95, 0.1, preset.l * 0.72]} />
                  <meshStandardMaterial color="#15261e" emissive="#2e8e61" emissiveIntensity={0.16} />
                </mesh>
              )}

              {vehicle.type === 'truck' && vehicle.truckVariant === 'cargo' && (
                <mesh position={[0, preset.h + 0.2, -preset.l * 0.1]}>
                  <boxGeometry args={[preset.w * 0.84, 0.34, preset.l * 0.62]} />
                  <meshStandardMaterial color="#1a2d23" emissive="#2e8e61" emissiveIntensity={0.14} />
                </mesh>
              )}

              <mesh position={[wheelX, 0.02, wheelZ]} userData={{ isWheel: true }}>
                <torusGeometry args={[preset.wheelR, preset.wheelT, 8, 12]} />
                <meshStandardMaterial color="#1c1c1c" />
              </mesh>
              <mesh position={[-wheelX, 0.02, wheelZ]} userData={{ isWheel: true }}>
                <torusGeometry args={[preset.wheelR, preset.wheelT, 8, 12]} />
                <meshStandardMaterial color="#1c1c1c" />
              </mesh>
              <mesh position={[wheelX, 0.02, -wheelZ]} userData={{ isWheel: true }}>
                <torusGeometry args={[preset.wheelR, preset.wheelT, 8, 12]} />
                <meshStandardMaterial color="#1c1c1c" />
              </mesh>
              <mesh position={[-wheelX, 0.02, -wheelZ]} userData={{ isWheel: true }}>
                <torusGeometry args={[preset.wheelR, preset.wheelT, 8, 12]} />
                <meshStandardMaterial color="#1c1c1c" />
              </mesh>

              <mesh position={[wheelX * 0.9, preset.h * 0.62, frontZ]}>
                <sphereGeometry args={[0.043, 6, 6]} />
                <meshBasicMaterial color="#d9fff2" />
              </mesh>
              <mesh position={[-wheelX * 0.9, preset.h * 0.62, frontZ]}>
                <sphereGeometry args={[0.043, 6, 6]} />
                <meshBasicMaterial color="#d9fff2" />
              </mesh>
              <mesh position={[wheelX * 0.9, preset.h * 0.62, rearZ]}>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshBasicMaterial color="#27ff7b" transparent opacity={0.7} />
              </mesh>
              <mesh position={[-wheelX * 0.9, preset.h * 0.62, rearZ]}>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshBasicMaterial color="#27ff7b" transparent opacity={0.7} />
              </mesh>
            </group>
          );
        })}
      </group>

    </group>
  );
}

