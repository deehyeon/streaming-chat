import React, { Suspense, useRef, useState, useMemo } from 'react';

// 나무 다리/데크
export default function WoodenDeck({ position, rotation, length = 2, width = 1 }) {
    const planks = [];
    for (let i = 0; i < length * 4; i++) {
      planks.push(
        <mesh key={i} position={[(i - length * 2) * 0.27, 0.05, 0]}>
          <boxGeometry args={[0.25, 0.1, width]} />
          <meshStandardMaterial color="#D4A574" />
        </mesh>
      );
    }
    
    return (
      <group position={position} rotation={rotation}>
        {planks}
      </group>
    );
  }