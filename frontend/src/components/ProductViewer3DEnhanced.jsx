"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useGLTF,
  ContactShadows
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

function BottleModel() {
  const mesh = useRef();
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y = rotation;
    }
  });

  return (
    <group>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 2.2, 32]} />
        <meshStandardMaterial
          color="#cfa57f"
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.4, 0.8, 0.5]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.8}
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return <primitive ref={groupRef} object={scene} scale={1.6} position={[0, -1, 0]} />;
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-ink" />
        <p className="mt-2 text-sm text-white/70">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

export default function ProductViewer3DEnhanced({
  modelUrl,
  imageUrl,
  productName = "Product"
}) {
  const controls = useRef();
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const idleTimer = useRef();

  const scheduleIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setIsInteracting(true);
    idleTimer.current = setTimeout(() => {
      setAutoRotate(true);
      setIsInteracting(false);
    }, 3000);
  };

  useEffect(() => {
    return () => clearTimeout(idleTimer.current);
  }, []);

  if (!modelUrl && imageUrl) {
    return (
      <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
        <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <h3 className="text-lg font-semibold">{productName}</h3>
          <p className="text-sm opacity-80">2D Preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        shadows
        onPointerMove={() => {
          if (autoRotate) {
            setAutoRotate(false);
            scheduleIdle();
          }
        }}
        onPointerDown={() => {
          setAutoRotate(false);
          scheduleIdle();
        }}
        onPointerUp={() => scheduleIdle()}
        onPointerLeave={() => {
          setAutoRotate(true);
          setIsInteracting(false);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#9be7ff" />
        <pointLight position={[0, -5, 5]} intensity={0.4} color="#0ea5a4" />

        <Suspense fallback={<LoadingFallback />}>
          {modelUrl ? <GLTFModel url={modelUrl} /> : <BottleModel />}
          <Environment preset="city" />
        </Suspense>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} />

        <OrbitControls
          ref={controls}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={4}
          rotateSpeed={0.5}
          zoomSpeed={1.2}
          minDistance={2}
          maxDistance={6}
        />
      </Canvas>

      <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between p-6 pointer-events-none">
        <div>
          <h3 className="text-2xl font-bold text-white">{productName}</h3>
          <p className="text-sm text-white/70">Drag to rotate • Scroll to zoom</p>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button
            type="button"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-white/20"
            onClick={() => controls.current?.reset()}
          >
            Reset View
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
              autoRotate
                ? "bg-ink text-white hover:bg-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "Pause" : "Auto Rotate"}
          </button>
        </div>
      </div>

      {!isInteracting && autoRotate && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/80">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ink" />
          Auto-rotating
        </div>
      )}
    </div>
  );
}
