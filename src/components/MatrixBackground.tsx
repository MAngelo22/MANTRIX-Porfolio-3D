import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MatrixBackground() {
  const matrixRef = useRef<THREE.Points>(null);
  const buildingsRef = useRef<THREE.Group>(null);

  const matrixGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 10000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 100 - 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 25;

      color.setHSL(0.3, 1, Math.random());
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const buildings = useMemo(() => {
    const items = [];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 30 + 10;
      let x = (Math.random() - 0.5) * 40;
      // Ensure buildings are only on the sides by avoiding the center area
      while (Math.abs(x) < 15) {
        x = (Math.random() - 0.5) * 40;
      }
      items.push({
        position: [
          x,
          height / 2 - 20,
          (Math.random() - 0.5) * 40 - 20
        ],
        scale: [Math.random() * 2 + 1, height, Math.random() * 2 + 1]
      });
    }
    return items;
  }, []);

  useFrame(({ clock }) => {
    if (matrixRef.current) {
      const positions = matrixRef.current.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1; // Slowed down from 0.2 to 0.1
        if (positions[i] < -50) {
          positions[i] = 50;
        }
      }
      matrixRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (buildingsRef.current) {
      buildingsRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group>
      <points ref={matrixRef} geometry={matrixGeometry}>
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      <group ref={buildingsRef}>
        {buildings.map((building, index) => (
          <mesh key={index} position={building.position as [number, number, number]}>
            <boxGeometry args={building.scale} />
            <meshPhongMaterial
              color="#000000"
              emissive="#00ff00"
              emissiveIntensity={0.2}
              transparent
              opacity={0.9}
              shininess={100}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}