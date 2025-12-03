import React from 'react';

// 작은 부엌/화덕
export default function Oven({ position }) {
    return (
      <group position={position}>
        {/* 벽돌 구조 */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial color="#A1887F" />
        </mesh>
        {/* 굴뚝 */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        {/* 화덕 입구 */}
        <mesh position={[0, 0.3, 0.31]}>
          <circleGeometry args={[0.2, 16]} />
          <meshStandardMaterial color="#212121" />
        </mesh>
      </group>
    );
  }