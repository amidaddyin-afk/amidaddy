"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";

function BottleFallback() {
  const mesh = useRef();
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.003;
    }
  });
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[0.6, 0.7, 2.2, 32]} />
      <meshStandardMaterial color="#cfa57f" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.6} position={[0, -1, 0]} />;
}

export default function ProductViewer3D({ modelUrl, imageUrl }) {
  const controls = useRef();
  const [autoRotate, setAutoRotate] = useState(true);
  const idleTimer = useRef();

  const scheduleIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAutoRotate(true), 2000);
  };

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  if (!modelUrl && imageUrl) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-3xl bg-white shadow-soft">
        <img src={imageUrl} alt="Product" className="max-h-72 object-contain" />
      </div>
    );
  }

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-3xl bg-white shadow-soft">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        onPointerOver={() => setAutoRotate(true)}
        onPointerDown={() => {
          setAutoRotate(false);
          scheduleIdle();
        }}
        onPointerUp={scheduleIdle}
        onPointerLeave={scheduleIdle}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={1} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          {modelUrl ? <Model url={modelUrl} /> : <BottleFallback />}
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          ref={controls}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
        />
      </Canvas>
      <button
        type="button"
        className="absolute bottom-4 right-4 rounded-full border border-black/20 bg-white/80 px-3 py-1 text-xs"
        onClick={() => controls.current?.reset()}
      >
        Reset view
      </button>
    </div>
  );
}
