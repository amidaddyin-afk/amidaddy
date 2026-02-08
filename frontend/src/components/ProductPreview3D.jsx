"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.4} position={[0, -1, 0]} />;
}

export default function ProductPreview3D({ modelUrl }) {
  const [autoRotate, setAutoRotate] = useState(false);

  if (!modelUrl) return null;

  return (
    <div
      className="h-full w-full"
      onMouseEnter={() => setAutoRotate(true)}
      onMouseLeave={() => setAutoRotate(false)}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={0.9} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={autoRotate} />
      </Canvas>
    </div>
  );
}
