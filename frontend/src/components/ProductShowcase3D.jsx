"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

// Animated Bottle
function AnimatedBottle() {
  const groupRef = useRef();
  const meshRef = useRef();
  const [bobbing, setBobbing] = useState(true);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
    if (meshRef.current && bobbing) {
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bottle Body */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 2.2, 32]} />
        <meshStandardMaterial
          color="#cfa57f"
          roughness={0.3}
          metalness={0.2}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Bottle Cap */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Glass Highlights */}
      <mesh position={[0.35, 0.5, 0.6]} castShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[-0.4, -0.3, 0.5]} castShadow>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.8}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

// 3D Text Label
function TextMesh({ text, position, scale = 1 }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 5);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial color="transparent" />
      </mesh>
    </group>
  );
}

// Rotating Platform
function Platform() {
  const platformRef = useRef();

  useFrame(({ clock }) => {
    if (platformRef.current) {
      platformRef.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={platformRef}>
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 64]} />
        <meshStandardMaterial
          color="#1f2937"
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Platform ring */}
      <mesh position={[0, -2.45, 0]}>
        <torusGeometry args={[2.1, 0.05, 8, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.2}
          metalness={0.8}
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function ProductShowcase3D() {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[8, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-8, 5, 8]} intensity={0.8} color="#ff6b6b" />
        <pointLight position={[0, -5, 8]} intensity={0.5} color="#4ecdc4" />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Scene */}
        <Suspense fallback={null}>
          <AnimatedBottle />
          <Platform />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          rotateSpeed={0.5}
          zoomSpeed={1}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
        {/* Title */}
        <div>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            3D Product Showcase
          </h2>
          <p className="mt-2 text-lg text-gray-300">
            Experience products in stunning 3D
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`rounded-full px-6 py-3 font-medium transition-all shadow-lg ${
              autoRotate
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {autoRotate ? "⏸ Pause" : "▶ Auto Rotate"}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="absolute bottom-8 left-8 rounded-xl bg-white/10 backdrop-blur-md p-4 text-white max-w-xs">
        <p className="text-sm font-semibold">💡 Tip:</p>
        <p className="mt-1 text-xs opacity-90">
          Drag to rotate • Scroll to zoom • Double-click to reset
        </p>
      </div>

      {/* 3D Badge */}
      <div className="absolute right-8 top-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white font-semibold shadow-lg">
        <span className="text-xl">🎯</span> 3D Enabled
      </div>
    </div>
  );
}
