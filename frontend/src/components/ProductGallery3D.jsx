"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";

function ProductModel({ url, scale = 1.5 }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} position={[0, -1, 0]} />;
}

function ProductCard3D({ product, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
    >
      {/* 3D Model or Image */}
      {product.model3D ? (
        <div className="relative h-64 w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 3, 3]} intensity={0.8} />
            <Suspense fallback={null}>
              <ProductModel url={product.model3D} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate={hovered}
              autoRotateSpeed={4}
            />
          </Canvas>
        </div>
      ) : (
        <img
          src={product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="h-64 w-full object-cover transition-transform group-hover:scale-110"
        />
      )}

      {/* Product Info */}
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {product.category}
          </span>
        </div>
        <button className="mt-3 w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
          View Details
        </button>
      </div>

      {/* Badge for 3D Models */}
      {product.model3D && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
          <span>🎯</span> 3D
        </div>
      )}
    </div>
  );
}

export default function ProductGallery3D({ products, onProductSelect }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard3D
          key={product.id}
          product={product}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
}
