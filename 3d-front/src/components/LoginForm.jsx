// src/components/LoginForm.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function LoginForm({ 
  position = [0, 0, 0], 
  scale = 1,
  onLogin, 
  onSocialLogin,
  onNavigateSignup 
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 부드러운 둥둥 떠다니는 애니메이션
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin({ email, password });
    }
  };

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 메인 로그인 카드 배경 */}
      <RoundedBox
        args={[8, 9, 0.3]}
        radius={0.3}
        smoothness={10}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
            opacity={0.9}
            transparent
          />
      </RoundedBox>

      {/* 핑크 테두리 */}
      <RoundedBox
        args={[8.15, 9.15, 0.25]}
        radius={0.32}
        smoothness={10}
        position={[0, 0, -0.15]}
      >
        <meshStandardMaterial
          color="#FFB6C1"
          transparent
          opacity={0.6}
        />
      </RoundedBox>

      {/* 상단 장식용 몽글몽글한 구름들 */}
      <group position={[-2, 3.5, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
      </group>

      <group position={[2, 3.5, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
        <mesh position={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFE4E1" />
        </mesh>
      </group>

      {/* 강아지 발바닥 장식 (하단) */}
      <group position={[0, -3.5, 0.2]}>
        {/* 왼쪽 발바닥 */}
        <group position={[-0.8, 0, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[-0.08, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[-0.06, -0.08, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[0.06, -0.08, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
        </group>

        {/* 오른쪽 발바닥 */}
        <group position={[0.8, 0, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[-0.08, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[-0.06, -0.08, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[0.06, -0.08, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
        </group>
      </group>

      {/* HTML 폼 오버레이 */}
      <Html
        occlude
        position={[-3.5, 3, 0.2]}
        distanceFactor={4}
        style={{
          width: '600px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '600px',
            padding: '40px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div
              style={{
                fontSize: '48px',
                marginBottom: '10px',
                animation: 'bounce 2s infinite',
              }}
            >
              🐶
            </div>
            <h1
              style={{
                margin: '0',
                fontSize: '24px',
                color: '#333',
                fontWeight: 'bold',
              }}
            >
              멍로그
            </h1>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="email"
                placeholder="이메일 (예: volunteer@test.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFB6C1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 182, 193, 0.1)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#fafafa';
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFB6C1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 182, 193, 0.1)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#fafafa';
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#333',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                marginBottom: '12px',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
              }}
            >
              로그인
            </button>
          </form>

          {/* 비밀번호 찾기 / 회원가입 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px',
              fontSize: '15px',
            }}
          >
            <a href="#" style={{ color: '#666', textDecoration: 'none' }}>
              비밀번호 재설정
            </a>
            <span style={{ color: '#ddd' }}>|</span>
            <a
              href="#"
              style={{
                color: '#FF6B9D',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateSignup) onNavigateSignup();
              }}
            >
              회원가입
            </a>
          </div>

          {/* 구분선 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              gap: '8px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            <span style={{ color: '#999', fontSize: '14px' }}>
              SNS계정으로 간편 로그인
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
          </div>

          {/* SNS 로그인 버튼들 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <button
              onClick={() => onSocialLogin && onSocialLogin('Facebook')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: '#1877F2',
                color: 'white',
                fontSize: '25px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: '0 4px 10px rgba(24, 119, 242, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 15px rgba(24, 119, 242, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 10px rgba(24, 119, 242, 0.3)';
              }}
            >
              f
            </button>

            <button
              onClick={() => onSocialLogin && onSocialLogin('Kakao')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: '#FEE500',
                color: '#000000',
                fontSize: '25px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: '0 4px 10px rgba(254, 229, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 15px rgba(254, 229, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 10px rgba(254, 229, 0, 0.3)';
              }}
            >
              K
            </button>

            <button
              onClick={() => onSocialLogin && onSocialLogin('Naver')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: '#03C75A',
                color: 'white',
                fontSize: '25px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: '0 4px 10px rgba(3, 199, 90, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 15px rgba(3, 199, 90, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 10px rgba(3, 199, 90, 0.3)';
              }}
            >
              N
            </button>
          </div>

          {/* 추가 링크 */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#999',
            }}
          >
            <div style={{ marginBottom: '4px' }}>로그인에 문제가 있으신가요?</div>
            <a
              href="#"
              style={{ color: '#666', textDecoration: 'underline' }}
              onClick={(e) => {
                e.preventDefault();
                alert('비밀번호 찾기 페이지로 이동합니다.');
              }}
            >
              비밀번호 찾기 도움말
            </a>
          </div>

          {/* 애니메이션 */}
          <style>{`
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-8px);
              }
            }
          `}</style>
        </div>
      </Html>
    </group>
  );
}
