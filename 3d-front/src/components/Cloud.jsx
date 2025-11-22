import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';

// 구름 컴포넌트
export default function Cloud({ position }) {
    const cloudRef = useRef();
    
    useFrame((state) => {
      cloudRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.2) * 2;
    });
    
    return (
      <group ref={cloudRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
        </mesh>
        <mesh position={[-0.4, 0, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
        </mesh>
      </group>
    );
  }