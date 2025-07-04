import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function TorusKnot() {
  const mesh = useRef();
  useFrame(() => (mesh.current.rotation.y += 0.01));
  
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1, 0.3, 128, 64]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}







