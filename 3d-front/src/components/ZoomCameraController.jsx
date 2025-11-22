// ZoomCameraController.jsx
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect } from 'react';

export default function ZoomCameraController({ focusMode }) {
  const { camera, controls } = useThree();

  // controls 찾기 (OrbitControls가 있을 때 자동 세팅됨)
  useEffect(() => {
    if (!controls) return;
    controls.enabled = !focusMode;
  }, [focusMode, controls]);

  useFrame(() => {
    const target = focusMode
      ? new THREE.Vector3(0, 1.1, 2.8) // 확대 위치
      : new THREE.Vector3(0, 2, 5);    // 기본 위치

    camera.position.lerp(target, 0.05);
    camera.lookAt(0, 1, 0.3);
  });

  return null;
}
