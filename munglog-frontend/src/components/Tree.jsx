import React from 'react';

// 나무 컴포넌트
export default function Tree({ position, scale = 1, type = 'round' }) {
    if (type === 'pine') {
      return (
        <group position={position} scale={scale}>
          {/* 나무 줄기 */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* 소나무 잎 - 3단 */}
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <coneGeometry args={[0.6, 1, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <coneGeometry args={[0.4, 0.8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
        </group>
      );
    }
    
    // 둥근 나무
    return (
      <group position={position} scale={scale}>
        {/* 나무 줄기 */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 1.2, 8]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
        {/* 나무 잎 (3개 구로 구성) */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
        <mesh position={[-0.3, 1.7, 0.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
        <mesh position={[0.3, 1.7, -0.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
      </group>
    );
  }