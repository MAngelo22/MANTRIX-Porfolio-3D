import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Tipo extendido para incluir 'history'
interface CustomSprite extends THREE.Sprite {
  history: THREE.Vector3[];
}

// Función para crear la textura de una letra
const createTextTexture = (text: string) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 100; // Tamaño grande para depuración

  // Asegurar dimensiones adecuadas para el texto
  canvas.width = fontSize * 4;
  canvas.height = fontSize * 4;

  if (context) {
    // Fondo transparente
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Usar fuente específica (ejemplo: Press Start 2P o Arial)
    context.font = `${fontSize}px "Press Start 2P", Arial, monospace`;
    context.fillStyle = '#00ff00'; // Texto verde
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Dibujar texto centrado
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  // Crear textura del canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
};





export function FuturisticBackground() {
  const rainRef = useRef<THREE.Group>(null);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const trailLength = 5;

  const rainParticles = useMemo(() => {
    const particles: CustomSprite[] = [];
    for (let i = 0; i < 500; i++) {
      const char = letters[Math.floor(Math.random() * letters.length)];
      const texture = createTextTexture(char);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

      const sprite = new THREE.Sprite(material) as CustomSprite;
      sprite.scale.set(10, 20, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 200, // Posición X aleatoria
        Math.random() * 200,         // Posición Y aleatoria
        (Math.random() - 0.5) * 200  // Posición Z aleatoria
      );
      sprite.rotation.z = Math.random() * Math.PI;
      sprite.history = []; // Inicializar historial
      particles.push(sprite);
    }
    return particles;
  }, [letters]);

  useFrame(() => {
    if (rainRef.current) {
      rainRef.current.children.forEach((particle) => {
        const customParticle = particle as CustomSprite;

        // Actualizar posición
        customParticle.position.y -= 0.5;

        // Guardar la posición en el historial
        customParticle.history.push(customParticle.position.clone());
        if (customParticle.history.length > trailLength) {
          customParticle.history.shift();
        }

        // Reiniciar posición al caer fuera de la pantalla
        if (customParticle.position.y < -100) {
          customParticle.position.y = 100;
          customParticle.position.x = (Math.random() - 0.5) * 200;
          customParticle.position.z = (Math.random() - 0.5) * 200;
          customParticle.history = [];
        }
      });
    }
  });

  return (
    <>
      {/* Fondo negro */}
      <mesh>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Digital Rain con estelas */}
      <group ref={rainRef}>
        {rainParticles.map((particle, index) => (
          <group key={index}>
            {/* Renderizar las copias para la estela */}
            {particle.history.map((pos, i) => (
              <sprite
                key={`${index}-${i}`}
                position={[pos.x, pos.y, pos.z]}
                scale={particle.scale}
                rotation={[0, 0, particle.rotation.z]}
              >
                <spriteMaterial
                  map={particle.material.map}
                  transparent={true}
                  opacity={(trailLength - i) / trailLength}
                />
              </sprite>
            ))}
            {/* Renderizar la partícula principal */}
            <primitive object={particle} />
          </group>
        ))}
      </group>

      {/* Iluminación */}
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={['#000000', 1, 500]} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} color="#00ff00" />
    </>
  );
}
