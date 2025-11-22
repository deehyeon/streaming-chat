import React, { Suspense, useRef, useState, useMemo } from 'react';
import { OrbitControls, PerspectiveCamera, Text3D, Center,  useTexture, useGLTF, RoundedBox, Html} from '@react-three/drei';
export default function Island() {
  const { scene } = useGLTF('/background.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]} // 높이 조절 (강아지 발 위치에 맞게)
      scale={80}             // 크기 조절 (배경이 너무 크면 줄이세요)
      receiveShadow
    />
  );
}