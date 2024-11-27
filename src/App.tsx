import { Canvas } from '@react-three/fiber';
import { ScrollControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Scene } from './components/Scene';

export default function App() {
  return (
    <div className="h-screen w-screen bg-black">
      <Canvas>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 15, 25]} />
        
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

        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} color="#00ff00" />
      </Canvas>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-[#00ff00] text-sm">
        Scroll to explore
      </div>
    </div>
  );
}