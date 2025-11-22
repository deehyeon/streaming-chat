import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Computer from '../components/Computer';
import Ground from '../components/Ground'; 

export default function ChatPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* 1. 조명 설정 (컴퓨터가 잘 보이도록) */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* 2. 배경 (Ground) */}
        <Ground />
        
        {/* 3. 밤하늘 효과 (선택사항: 컴퓨터 분위기랑 잘 어울림) */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* 4. 주인공: 컴퓨터 모델 */}
        {/* 위치와 크기는 모델에 따라 조절해주세요 */}
        <Computer position={[0, 0.5, 0]} scale={[0.5, 0.5, 0.5]} />

        {/* 5. 카메라 컨트롤 */}
        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>
      
      {/* (선택사항) HTML 채팅 UI를 3D 위에 띄우려면 여기에 작성 */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, 0)', color: 'white', textAlign: 'center' }}>
        <h1>💻 채팅방</h1>
        <p>컴퓨터 앞에 오신 것을 환영합니다.</p>
      </div>
    </div>
  );
}