import React, { Suspense, useRef, useState, useMemo } from 'react';
export default function Fence({ position, rotation }) {
    const posts = [];
    for (let i = 0; i < 5; i++) {
      posts.push(
        <group key={i} position={[i * 0.4 - 0.8, 0, 0]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#D2691E" />
          </mesh>
        </group>
      );
    }
    
    return (
      <group position={position} rotation={rotation}>
        {posts}
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[2, 0.08, 0.08]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
        <mesh castShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[2, 0.08, 0.08]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      </group>
    );
  }