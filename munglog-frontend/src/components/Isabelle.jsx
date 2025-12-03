import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Center, useTexture, useGLTF, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export default function Isabelle(props) {
    const { scene } = useGLTF('/Isabelle.glb');
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef();
    const { showModal } = props; // 모달 상태 받기
  
    useFrame((state) => {
      if (!groupRef.current) return;
  
      const time = state.clock.elapsedTime;
      const basePosition = props.position || [0, 0, 0]; // 원래 위치값
  
      // --- 목표치 설정 ---
      let targetRotationZ = 0;
      // 원래 Y 위치에서 시작
      let targetPositionY = basePosition[1];
  
      
      // 호버 상태일 때:
      // 좌우로 살랑살랑 (Z축 회전) - 속도 4, 강도 0.05
      targetRotationZ = Math.sin(time * 4) * 0.05;
      // 위아래로 둥둥 (Y축 이동) - 속도 3, 높이 0.02
      targetPositionY += Math.sin(time * 3) * 0.02;
    
  
      // --- 부드러운 움직임 적용 (lerp) ---
      // 현재 값에서 목표 값으로 0.1의 강도로 부드럽게 이동
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotationZ,
        0.1
      );
      
      // 중요: group 자체의 position을 건드리면 props로 받은 초기 위치가 무시될 수 있음.
      // 따라서 props.position 값을 기준으로 계산해야 함.
      groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          targetPositionY,
          0.1
      );
    });

    // 클릭 핸들러
    const handleClick = (e) => {
      e.stopPropagation();
      if (props.onClick) {
        props.onClick();
      }
    };
  
    return (
      <group 
        ref={groupRef}
        {...props}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation(); // 뒤에 있는 땅이 선택되지 않도록 이벤트 전파 중단
          document.body.style.cursor = 'pointer'; 
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
      >
        <primitive object={scene} />
        
        {/* 💬 3D 말풍선 - 모달이 없을 때만 표시 */}
        {!showModal && (
          <group position={[0, 100, 0]}>
            {/* 말풍선 배경 */}
            <RoundedBox
              args={[100, 30, 5]}
              radius={8}
              smoothness={4}
            >
              <meshStandardMaterial 
                color="#ffffff"
                transparent
                opacity={0.95}
                emissive="white" 
              />
            </RoundedBox>

            {/* 말풍선 테두리 */}
            <RoundedBox
              args={[105, 35, 4]}
              radius={8}
              smoothness={4}
              position={[0, 0, -1]}
            >
              <meshStandardMaterial 
                color='#FFB6C1'
                transparent
                opacity={0.95}
              />
            </RoundedBox>

            {/* 3D 텍스트 */}
            <Text
              position={[0, 0, 3]}
              fontSize={5}
              color="#555555"
              anchorX="center"
              anchorY="middle"
              maxWidth={160}
            >
              유기견 보호소에 온 걸 환영합니다! 🎵
            </Text>

            {/* 말풍선 꼬리 (작은 삼각뿔) */}
            <mesh position={[0, -24, 0]} rotation={[0, 0, 0]}>
              <coneGeometry args={[6, 8, 4]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
          </group>
        )}
      </group>
    );
  }