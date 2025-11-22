import React from 'react';

// 나무 더미
export default function WoodPile({ position }) {
  return (
    <group position={position}>
      {/* 나무 통나무들 */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.15 - 0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`top-${i}`} position={[i * 0.15 - 0.075, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      ))}
    </group>
  );
}