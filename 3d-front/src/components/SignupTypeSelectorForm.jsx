// src/components/SignupTypeSelector.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';

export default function SignupTypeSelectorForm({ 
  position = [0, 0, 0], 
  scale = 1,
  onSelectVolunteer,
  onSelectShelter,
  onNavigateLogin
}) {
  const groupRef = useRef();

  // 부드러운 둥둥 떠다니는 애니메이션
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 메인 배경 카드 */}
      <RoundedBox
        args={[10, 10, 0.3]}
        radius={0.3}
        smoothness={10}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          opacity={0.9}
          transparent
        />
      </RoundedBox>

      {/* 핑크 테두리 */}
      <RoundedBox
        args={[10.15, 10.15, 0.25]}
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

      {/* 상단 장식용 구름들 */}
      <group position={[-3, 3.5, 0.2]}>
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

      <group position={[3, 3.5, 0.2]}>
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
      <group position={[0, -4.5, 0.2]}>
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

      {/* HTML 콘텐츠 */}
      <Html
        occlude
        position={[-3.8, 4.3, 0.2]}
        distanceFactor={3}
        style={{
          width: '800px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '600px',
            height: '500px',
            padding: '50px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* 상단 강아지 이모지 */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🐶</div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                color: '#333',
                fontWeight: 'bold',
              }}
            >
              멍로그에 오신 것을 환영합니다!
            </h1>
            <p style={{ margin: 0, fontSize: '17px', color: '#999' }}>
              어떤 형태로 가입하시겠어요?
            </p>
          </div>

          {/* 선택 카드들 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            {/* 봉사자로 가입하기 */}
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#FFB6C1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '40px',
                }}
              >
                🙋
              </div>

              <h3
                style={{
                  margin: '0 0 15px 0',
                  fontSize: '22px',
                  color: '#333',
                  fontWeight: 'bold',
                }}
              >
                봉사자로 가입하기
              </h3>

              <p
                style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                보호소에서 봉사하고,
                <br />
                실종/보호 게시판을 이용하며,
                <br />
                분양 신청을 할 수 있어요
              </p>

              <button
                onClick={onSelectVolunteer}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #FFB6C1',
                  background: '#fff',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FFB6C1';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#333';
                }}
              >
                봉사자로 시작하기
              </button>
            </div>

            {/* 보호소 센터 가입하기 */}
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#FFB6C1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '44px',
                }}
              >
                🏠
              </div>

              <h3
                style={{
                  margin: '0 0 15px 0',
                  fontSize: '22px',
                  color: '#333',
                  fontWeight: 'bold',
                }}
              >
                보호소 센터 가입하기
              </h3>

              <p
                style={{
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                보호소 정보를 등록하고,
                <br />
                봉사자를 모집하며,
                <br />
                분양 공고를 올릴 수 있어요
              </p>

              <button
                onClick={onSelectShelter}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #FFB6C1',
                  background: '#fff',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FFB6C1';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#333';
                }}
              >
                보호소로 시작하기
              </button>
            </div>
          </div>

          {/* 로그인 링크 */}
          <div style={{ textAlign: 'center', fontSize: '17px', color: '#999' }}>
            이미 가입되어 있으신가요?{' '}
            <a
              href="#"
              style={{
                color: '#FFB6C1',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateLogin) onNavigateLogin();
              }}
            >
              로그인하기 →
            </a>
          </div>
        </div>
      </Html>
    </group>
  );
}
