"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useGLTF,
  PresentationControls,
  ContactShadows,
  Stage
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
      {/* Glass shine effect */}
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
        <p className="mt-2 text-sm text-gray-600">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

export default function ProductViewer3DEnhanced({ modelUrl, imageUrl, productName = "Product" }) {
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

  // Fallback to image if no 3D model
  if (!modelUrl && imageUrl) {
    return (
      <div className="relative h-[500px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl">
        <img
          src={imageUrl}
          alt={productName}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6 text-white">
          <h3 className="text-lg font-semibold">{productName}</h3>
          <p className="text-sm opacity-90">2D Preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
      {/* 3D Canvas */}
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
        {/* Lighting Setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#ffd4a3" />
        <pointLight position={[0, -5, 5]} intensity={0.3} />

        {/* Model Loading */}
        <Suspense fallback={<LoadingFallback />}>
          {modelUrl ? (
            <GLTFModel url={modelUrl} />
          ) : (
            <BottleModel />
          )}
          <Environment preset="city" />
        </Suspense>

        {/* Shadow and Floor */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} />

        {/* Controls */}
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

      {/* UI Overlay */}
      <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between p-6 pointer-events-none">
        {/* Top Label */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{productName}</h3>
          <p className="text-sm text-gray-500">Drag to rotate • Scroll to zoom</p>
        </div>

        {/* Bottom Controls */}
        <div className="flex gap-3 pointer-events-auto">
          <button
            type="button"
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg transition-all hover:bg-white hover:shadow-xl"
            onClick={() => controls.current?.reset()}
          >
            🔄 Reset View
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
              autoRotate
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? "⏸ Pause" : "▶ Auto Rotate"}
          </button>
        </div>
      </div>

      {/* Interaction Hint */}
      {!isInteracting && autoRotate && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs text-blue-600">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-600" />
          Auto-rotating
        </div>
      )}
    </div>
  );
}
