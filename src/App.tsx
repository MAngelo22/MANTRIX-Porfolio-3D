import { Canvas } from '@react-three/fiber';
import { ScrollControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useState } from 'react';
import { Scene } from './components/Scene';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: isMobile ? 85 : 70 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#010503']} />
        
        <ScrollControls pages={6} damping={0.3}>
          <Scene />
        </ScrollControls>

        <Environment preset="night" />
        
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        <ambientLight intensity={0.35} color="#4eff8f" />
        <directionalLight position={[0, 14, 8]} intensity={0.8} color="#64ff9d" />
      </Canvas>

      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 text-[#00ff00] text-xs md:text-sm px-2 text-center pointer-events-none">
        {isMobile ? 'Swipe up to explore' : 'Scroll to explore'}
      </div>
    </div>
  );
}
