// src/components/Computer.jsx
import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Computer({ onScreenClick, focusMode, ...props }) {
  const { scene } = useGLTF('/computer.glb');
  const { camera, gl } = useThree();
  const screenRef = useRef();
  const [isVisible, setIsVisible] = useState(true);

  // 카메라가 모니터 앞쪽에 있을 때만 채팅 화면 보이게
  useFrame(() => {
    if (!screenRef.current) return;

    const screenWorldPos = screenRef.current.getWorldPosition(
      new THREE.Vector3()
    );

    // 모니터 앞을 향한 노말 벡터 (z+ 방향 기준)
    const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(
      screenRef.current.getWorldQuaternion(new THREE.Quaternion())
    );

    const dirToCamera = camera.position.clone().sub(screenWorldPos);
    const dot = screenNormal.dot(dirToCamera);

    setIsVisible(dot > 0);
  });

  // 클릭 가능한 영역 (보이지 않는 평면)
  const handleClick = (e) => {
    e.stopPropagation();
    if (onScreenClick && !focusMode) {
      onScreenClick();
    }
  };

  return (
    <group {...props}>
      {/* 3D 컴퓨터 모델 */}
      <primitive object={scene} />

      {/* 클릭 감지용 보이지 않는 평면 */}
      <group
        ref={screenRef}
        position={[0, 1.3, 0.4]}
      >
        <mesh
          onClick={handleClick}
          visible={false}
        >
          <planeGeometry args={[1.8, 1.1]} />
          <meshBasicMaterial transparent opacity={1} />
        </mesh>
      </group>
    </group>
  );
}