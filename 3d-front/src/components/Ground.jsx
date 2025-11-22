import React, { Suspense, useRef, useState, useMemo } from 'react';

export default function Ground() {
    // 🌸 꽃 데이터 대량 생성
    const flowers = useMemo(() => {
      const temp = [];
      // 반복 횟수를 늘려 꽃 개수 증가 (20 -> 300)
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        
        // 💡 Math.sqrt를 써야 바깥쪽까지 골고루 퍼집니다 (안 쓰면 중앙에 뭉침)
        const radius = Math.sqrt(Math.random()) * 8; // 반지름 14까지 꽉 채우기
  
        // 집이 있는 중앙(반지름 4 이내)은 비워두기
        if (radius < 4) continue; 
  
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 크기도 약간씩 다르게 해서 자연스럽게
        const scale = 0.8 + Math.random() * 0.4;
  
        temp.push({ x, z, color, scale });
      }
      return temp;
    }, []);
  
    return (
      <group position={[0, -0.5, 0]}>
        {/* 1. 메인 땅 (잔디 영역) */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[15, 15, 1, 64]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
  
        {/* 2. 땅 아래 흙 부분 */}
        <mesh receiveShadow position={[0, -1.5, 0]}>
          <cylinderGeometry args={[15, 12, 2, 64]} /> 
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* 3. 꽃들 대량 렌더링 */}
        {flowers.map((flower, i) => (
          <group key={`flower-${i}`} position={[flower.x, 0.6, flower.z]} scale={[flower.scale, flower.scale, flower.scale]}>
            {/* 꽃잎 */}
            {[0, 1, 2, 3].map((petal) => (
              <mesh 
                key={petal} 
                position={[
                  Math.cos(petal * Math.PI / 2) * 0.08,
                  0,
                  Math.sin(petal * Math.PI / 2) * 0.08
                ]}
                castShadow
              >
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={flower.color} />
              </mesh>
            ))}
            {/* 꽃 중심 */}
            <mesh castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
            {/* 줄기 */}
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        ))}
  
        {/* 4. 돌 장식 */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 14.5; 
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <mesh key={`stone-${i}`} position={[x, 0.5, z]} castShadow>
              <dodecahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color="#808080" />
            </mesh>
          );
        })}
      </group>
    );
  }