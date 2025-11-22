// src/components/Computer.jsx
import React, { useRef, useState } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import MunglogChatLayout from './chat/MunglogChatLayout';

export default function Computer({ onScreenClick, ...props }) {
  const { scene } = useGLTF('/computer.glb');
  const { camera } = useThree();
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

  return (
    <group {...props}>
      {/* 3D 컴퓨터 모델 */}
      <primitive object={scene} />

      {/* 모니터 평면 위치 */}
      <group
        ref={screenRef}
        position={[0, 1.355, 0.4]}
        scale={[0.5, 0.54, 0.44]}
      >
        <Html
          transform
          distanceFactor={1}
          rotation={[0, 0, 0]}
          style={{
            display: isVisible ? 'block' : 'none',
            pointerEvents: isVisible ? 'auto' : 'none',
          }}
        >
          {/* 이 div 전체가 모니터 화면 */}
          <div
            style={{
              width: '800px',   // 기준 캔버스 크기 (Html에서만 사용)
              height: '480px',
            }}
            onClick={onScreenClick}
          >
            {/* 모니터 안에 맞게 쓰는 embedded 모드 */}
            <MunglogChatLayout embedded />
          </div>
        </Html>
      </group>
    </group>
  );
}
