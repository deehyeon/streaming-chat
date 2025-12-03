import React, { Suspense, useRef, useState, useMemo } from 'react';

// 바위
export default function Rock({ position, scale = 1 }) {
    return (
      <group position={position} scale={scale}>
        <mesh>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#757575" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, 0, 0.3]} scale={0.7}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#616161" roughness={0.9} />
        </mesh>
        <mesh position={[-0.2, 0, 0.4]} scale={0.6}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#757575" roughness={0.9} />
        </mesh>
      </group>
    );
  }