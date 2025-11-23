// src/pages/Login.jsx
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

import Fence from '../components/Fence';
import Island from '../components/Island';
import Cloud from '../components/Cloud';
import LoginForm from '../components/LoginForm';
import Header from '../components/Header';

// 3D 씬
function Scene({ onLogin, onSocialLogin, onNavigateSignup }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 8]} />
      <OrbitControls
         enableZoom={false}
         enablePan={false}
         enableRotate={false}   // ← 회전 금지
         enableDamping={false}  // ← 부드러운 관성도 제거
         autoRotate={false}     // ← 자동 회전도 끔
         target={[0, 1, 0]}
      />

      {/* 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* 3D 로그인 폼 */}
      <LoginForm
          position={[0, 1.2, 4]}
          scale={0.25}
          onLogin={onLogin}
          onSocialLogin={onSocialLogin}
          onNavigateSignup={onNavigateSignup}
        />

      <hemisphereLight intensity={0.4} groundColor="#7EC0EE" />

      {/* 섬 / 땅 */}
      <Island scale={1} position={[0, -2, 0]} />

      {/* 울타리 */}
      <Fence position={[-3, 0, -5]} rotation={[0, 0, 0]} />
      <Fence position={[3, 0, -5]} rotation={[0, 0, 0]} />
      <Fence position={[-5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Fence position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* 구름 */}
      <Cloud position={[-3, 4, 0]} />
      <Cloud position={[4, 3, 3]} />
      <Cloud position={[0, 3.5, 2]} />
      <Cloud position={[2, 3.5, 0]} />
    </>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = ({ email, password }) => {
    // TODO: 실제 로그인 로직
    console.log('Login:', { email, password });
    alert('로그인 처리 중...');
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} 로그인 처리 중...`);
  };

  const handleNavigateSignup = () => {
    navigate('/signup');
  };


  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)'
    }}>
      {/* 3D 씬 */}
      <Canvas shadows style={{ position: 'absolute', top: 0, left: 0 }}>
        <Scene 
          onLogin={handleLogin}
          onSocialLogin={handleSocialLogin}
          onNavigateSignup={handleNavigateSignup}
        />
      </Canvas>

      {/* ✅ 공통 Header: 오른쪽 버튼은 감춤 */}
      <Header isLoggedIn={false} showRight={false} />

      {/* 하단 저작권 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: '#666',
        zIndex: 10,
        textShadow: '0 1px 2px rgba(255,255,255,0.8)'
      }}>
        © MongLog. All Rights Reserved
      </div>
    </div>
  );
}
