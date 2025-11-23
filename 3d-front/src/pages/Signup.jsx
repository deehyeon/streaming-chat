// src/pages/Signup.jsx
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

import Fence from '../components/Fence';
import Island from '../components/Island';
import Cloud from '../components/Cloud';
import SignupTypeSelectorForm from '../components/SignupTypeSelectorForm';
import VolunteerSignupForm from '../components/VolunteerSignupForm';
import ShelterSignupForm from '../components/ShelterSignupForm';

// 3D 씬
function Scene({ signupStep, onSelectVolunteer, onSelectShelter, onSignup, onSocialLogin, onNavigateLogin }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 8]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}   // ← 회전 금지
        enableDamping={false}  // ← 부드러운 관성도 제거
        autoRotate={false}     // ← 자동 회전도 끔
        target={[0, 1.6, 0]}
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

      {/* 조건부 렌더링: 회원가입 단계에 따라 다른 폼 표시 */}
      <Suspense fallback={null}>
        {signupStep === 'select' && (
          <SignupTypeSelectorForm
            position={[0, 1.7, 4]}
            scale={0.22}
            onSelectVolunteer={onSelectVolunteer}
            onSelectShelter={onSelectShelter}
            onNavigateLogin={onNavigateLogin}
          />
        )}

        {signupStep === 'volunteer' && (
          <VolunteerSignupForm
            position={[0, 1.7, 4]}
            scale={0.25}
            onSignup={onSignup}
            onSocialLogin={onSocialLogin}
            onNavigateLogin={onNavigateLogin}
          />
        )}

        {signupStep === 'shelter' && (
          <ShelterSignupForm
            position={[0, 1.7, 4]}
            scale={0.25}
            onSignup={onSignup}
            onSocialLogin={onSocialLogin}
            onNavigateLogin={onNavigateLogin}
          />
        )}
      </Suspense>
    </>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [signupStep, setSignupStep] = useState('select'); // 'select', 'volunteer', 'shelter'

  // 봉사자 선택
  const handleSelectVolunteer = () => {
    setSignupStep('volunteer');
  };

  // 보호소 선택
  const handleSelectShelter = () => {
    setSignupStep('shelter');
  };

  // 회원가입 처리
  const handleSignup = (userData) => {
    console.log('Signup data:', userData);
    console.log('Signup type:', signupStep);
    
    // TODO: 실제 회원가입 API 호출
    alert(`${signupStep === 'volunteer' ? '봉사자' : '보호소'} 회원가입이 완료되었습니다!`);
    navigate('/login');
  };

  // SNS 로그인
  const handleSocialLogin = (provider) => {
    console.log('Social signup:', provider, 'Type:', signupStep);
    alert(`${provider} ${signupStep === 'volunteer' ? '봉사자' : '보호소'} 회원가입`);
  };

  // 로그인 페이지로 이동
  const handleNavigateLogin = () => {
    navigate('/login');
  };

  // 뒤로가기 (유형 선택으로)
  const handleBack = () => {
    setSignupStep('select');
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)',
      }}
    >
      {/* 3D 씬 */}
      <Canvas shadows style={{ position: 'absolute', top: 0, left: 0, isolation: 'isolate', }}>
        <Scene
          signupStep={signupStep}
          onSelectVolunteer={handleSelectVolunteer}
          onSelectShelter={handleSelectShelter}
          onSignup={handleSignup}
          onSocialLogin={handleSocialLogin}
          onNavigateLogin={handleNavigateLogin}
        />
      </Canvas>

      {/* 상단 로고 */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <div
          style={{
            fontSize: '40px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          🐕
        </div>
        <span
          style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#FF6B9D',
            textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
          }}
        >
          멍로그
        </span>
      </div>

      {/* 뒤로가기 버튼 (유형 선택 화면이 아닐 때만 표시) */}
      {signupStep !== 'select' && (
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            right: '30px',
            padding: '20px 50px',
            borderRadius: '14px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#666',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 182, 193, 0.2)';
            e.target.style.color = '#FF6B9D';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            e.target.style.color = '#666';
          }}
        >
          ← 유형 선택으로
        </button>
      )}

      {/* 하단 저작권 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: '#666',
          zIndex: 10,
          textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        }}
      >
        © MongLog. All Rights Reserved
      </div>
    </div>
  );
}
