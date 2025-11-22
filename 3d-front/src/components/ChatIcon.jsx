import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three'; 

export default function ChatIcon({ position = [0,0,0], rotation, scale = 0.1, onClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // --- 1. 하트 모양 만들기 (useMemo로 최적화) ---
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = -1.5;
    const y = -2.5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2.0, y, x, y);
    shape.bezierCurveTo(x - 3.0, y, x - 3.0, y + 3.5, x - 3.0, y + 3.5);
    shape.bezierCurveTo(x - 3.0, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6.5, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5);
    shape.bezierCurveTo(x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    // 2D 모양을 3D로 돌출시킴
    const extrudeSettings = {
      steps: 2,
      depth: 1.5, // 하트 두께
      bevelEnabled: true, // 모서리 둥글게
      bevelThickness: 0.6,
      bevelSize: 0.5,
      bevelSegments: 10
    };
    
    // 지오메트리 생성 및 중심점 맞추기
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); 
    return geometry;
  }, []);


  // --- 2. 둥둥 떠다니는 애니메이션 ---
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const yOffset = Math.sin(time * 2) * 0.1;
    groupRef.current.position.y = position[1] + yOffset;
  });


  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation} 
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      
      {/* === 흰색 말풍선 몸통 === */}
      <group>
        {/* 몸통 */}
        <RoundedBox args={[6, 4.5, 1.2]} radius={0.6} smoothness={8}>
          <meshPhysicalMaterial 
            color="#FFFFFF" // 흰색 변경
            roughness={0.1} 
            metalness={0.05} 
            clearcoat={1.0} 
            clearcoatRoughness={0.1}
          />
        </RoundedBox>
        {/* 꼬리 */}
        <mesh position={[0, -2.8, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[1.0, 2.0, 3]} /> 
          <meshPhysicalMaterial 
            color="#FFFFFF" // 흰색 변경
            roughness={0.1} 
            metalness={0.05} 
            clearcoat={1.0}
          />
        </mesh>
      </group>

      {/* === 빨간색 하트 === */}
      <mesh 
        geometry={heartGeometry} 
        position={[0, 0.2, 0.6]} // 말풍선 앞쪽 중앙에 배치
        scale={0.2} // 하트 크기 조절
        rotation={[Math.PI, 0, 0]} // 하트가 뒤집혀 있어서 180도 회전
      >
        <meshPhysicalMaterial 
          color="#FF0000" // 빨간색
          roughness={0.3} 
          metalness={0.1}
          clearcoat={0.8}
          emissive="#550000" // 약간의 자체 발광 추가
        />
      </mesh>

      {/* === 호버 툴팁 (기존 동일) === */}
      {hovered && (
        <Html position={[0, 4.5, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)', // 툴팁 배경도 밝게 변경
            color: '#333', // 글씨색 어둡게
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '8px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0px 4px 15px rgba(0,0,0,0.1)'
          }}>
            채팅방으로 이동 💬
          </div>
        </Html>
      )}
      
    </group>
  );
}