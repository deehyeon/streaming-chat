import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D, Center,  useTexture, useGLTF, RoundedBox, Html} from '@react-three/drei';
import * as THREE from 'three';

export default function Isabelle(props) {
    const { scene } = useGLTF('/Isabelle.glb');
    const [hovered, setHovered] = useState(false);
    const groupRef = useRef();
  
    useFrame((state) => {
      if (!groupRef.current) return;
  
      const time = state.clock.elapsedTime;
      const basePosition = props.position || [0, 0, 0]; // 원래 위치값
  
      // --- 목표치 설정 ---
      let targetRotationZ = 0;
      // 원래 Y 위치에서 시작
      let targetPositionY = basePosition[1];
  
      if (hovered) {
        // 호버 상태일 때:
        // 좌우로 살랑살랑 (Z축 회전) - 속도 4, 강도 0.05
        targetRotationZ = Math.sin(time * 4) * 0.05;
        // 위아래로 둥둥 (Y축 이동) - 속도 3, 높이 0.02
        targetPositionY += Math.sin(time * 3) * 0.02;
      }
  
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
  
    return (
      <group 
        ref={groupRef}
        {...props}
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
        
        {/* 💬 말풍선 추가 */}
        {hovered && (
          <Html position={[0, 100, 40]} center distanceFactor={10}>
            <div style={{
              background: 'white',
              padding: '12px 20px',
              borderRadius: '20px',
              border: '3px solid #FFB6C1', // 분홍색 테두리
              color: '#555',
              fontSize: '10px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              유기견 보호소에 온 걸 환영합니다! 🎵
              
              {/* 말풍선 꼬리 */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #FFB6C1'
              }}></div>
            </div>
            <style>{`
              @keyframes popIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </Html>
        )}
      </group>
    );
  }