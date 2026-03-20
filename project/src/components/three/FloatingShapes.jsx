import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, geometry, color, speed = 1, floatIntensity = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed;
      meshRef.current.rotation.y += 0.003 * speed;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={floatIntensity}
    >
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function FloatingShapes({ count = 8 }) {
  const shapes = useMemo(() => {
    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#06B6D4', '#10B981'];
    const geometries = [
      <icosahedronGeometry args={[0.5, 0]} />,
      <octahedronGeometry args={[0.5, 0]} />,
      <tetrahedronGeometry args={[0.5, 0]} />,
      <dodecahedronGeometry args={[0.4, 0]} />,
      <torusGeometry args={[0.3, 0.15, 8, 16]} />,
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 5,
      ],
      geometry: geometries[i % geometries.length],
      color: colors[i % colors.length],
      speed: 0.5 + Math.random() * 1.5,
      floatIntensity: 0.5 + Math.random() * 1,
    }));
  }, [count]);

  return (
    <group>
      {shapes.map((shape) => (
        <FloatingShape
          key={shape.id}
          position={shape.position}
          geometry={shape.geometry}
          color={shape.color}
          speed={shape.speed}
          floatIntensity={shape.floatIntensity}
        />
      ))}
    </group>
  );
}
