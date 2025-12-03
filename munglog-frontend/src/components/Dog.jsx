import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D, Center,  useTexture, useGLTF, RoundedBox, Html} from '@react-three/drei';
import * as THREE from 'three';

export default function Dog({ 
  position, 
  color, 
  onClick, 
  message,
  rotation = [0, 0, 0],   // ✅ 새로 추가된 파라미터 (기본값)
}) {
  const dogRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (dogRef.current) {
      // 둥둥 떠다니기
      dogRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.03;
      
      // 호버 시 쫀득하게 커지는 효과
      const scale = hovered ? 1.15 : 1;
      dogRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      
      // 꼬리 살랑살랑
      const tail = dogRef.current.getObjectByName("tail");
      if (tail) {
        tail.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }

      // 호버시 고개 갸웃 (z축만 살짝 건드림)
      if (hovered) {
        dogRef.current.rotation.z = THREE.MathUtils.lerp(dogRef.current.rotation.z, 0.1, 0.1);
      } else {
        dogRef.current.rotation.z = THREE.MathUtils.lerp(dogRef.current.rotation.z, 0, 0.1);
      }
    }
  });

  return (
    <group 
      ref={dogRef} 
      position={position}
      rotation={rotation}               // ✅ 외부에서 받은 회전 적용
      onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
      onPointerOut={() => { document.body.style.cursor = 'default'; setHovered(false); }}
    >
      {/* === 1. 몸통 === */}
      <group position={[0, 0.25, 0]}>
        <RoundedBox args={[0.45, 0.4, 0.6]} radius={0.15} smoothness={4}>
          <meshStandardMaterial color={color} />
        </RoundedBox>
      </group>
      
      {/* === 2. 머리 === */}
      <group position={[0, 0.65, 0.25]}>
        <RoundedBox args={[0.5, 0.45, 0.45]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color={color} />
        </RoundedBox>

        {/* 귀 */}
        <group position={[-0.28, 0.1, 0]}>
          <mesh rotation={[0, 0, 0.5]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
        <group position={[0.28, 0.1, 0]}>
          <mesh rotation={[0, 0, -0.5]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>

        {/* 눈 */}
        <mesh position={[-0.12, 0.05, 0.21]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.21]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* 눈 반짝임 */}
        <mesh position={[-0.1, 0.08, 0.25]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" />
        </mesh>
        <mesh position={[0.14, 0.08, 0.25]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" />
        </mesh>

        {/* 코 */}
        <mesh position={[0, -0.05, 0.22]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* 볼터치 */}
        <mesh position={[-0.18, -0.08, 0.18]} rotation={[0, -0.2, 0]}>
          <circleGeometry args={[0.05, 16]} />
          <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.18, -0.08, 0.18]} rotation={[0, 0.2, 0]}>
          <circleGeometry args={[0.05, 16]} />
          <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* === 3. 다리 === */}
      {[[-0.15, 0.15], [0.15, 0.15], [-0.15, -0.15], [0.15, -0.15]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.1, pos[1]]} castShadow>
          <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      
      {/* === 4. 꼬리 === */}
      <group name="tail" position={[0, 0.4, -0.3]}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* 💖 호버 말풍선 */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center distanceFactor={8}>
          <div style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '12px',
            border: `2px solid ${color}`,
            color: '#333',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            transform: 'translate3d(0,0,0)',
          }}>
            {message}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${color}`,
            }} />
          </div>
        </Html>
      )}
    </group>
  );
}
