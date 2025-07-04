import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment } from '@react-three/drei';
import { Suspense } from 'react';

function Globe() {
  // Updated to match your actual file path with the .jpg.jpg extension
  const texture = useTexture('/earth-texture.jpg.jpg');
  
  return (
    <mesh rotation={[0, 0, 0]} scale={1.5} className="animate-float">
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function ThreeScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        <Environment preset="sunset" />
        <Globe />
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
