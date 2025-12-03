// src/components/SignupForm.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function VolunteerSignupForm({ 
  position = [0, 0, 0], 
  scale = 1,
  onSignup, 
  onSocialLogin,
  onNavigateLogin 
}) {
  const groupRef = useRef();
  const [formData, setFormData] = useState({
    email: '',
    emailDomain: '@gmail.com',
    password: '',
    passwordConfirm: '',
    nickname: '',
    agreeAll: false,
    agreeTerms: false,
    agreeAge: false,
    agreePrivacy: false,
    agreeMarketing: false,
    agreeNotification: false,
  });

  // 부드러운 둥둥 떠다니는 애니메이션
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgreeAll = (checked) => {
    setFormData(prev => ({
      ...prev,
      agreeAll: checked,
      agreeTerms: checked,
      agreeAge: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
      agreeNotification: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 약관 체크
    if (!formData.agreeTerms || !formData.agreeAge || !formData.agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (onSignup) {
      onSignup({
        email: formData.email + formData.emailDomain,
        password: formData.password,
        nickname: formData.nickname,
        agreeMarketing: formData.agreeMarketing,
        agreeNotification: formData.agreeNotification,
      });
    }
  };

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 메인 회원가입 카드 배경 */}
      <RoundedBox
        args={[8, 13, 0.3]}
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
        args={[8.15, 13.15, 0.25]}
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
      <group position={[-2, 5.5, 0.2]}>
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

      <group position={[2, 5.5, 0.2]}>
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
      <group position={[0, -5.5, 0.2]}>
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

      {/* HTML 폼 오버레이 */}
      <Html
        occlude
        position={[-3.8, 5.8, 0.2]}
        distanceFactor={3}
        style={{
          width: '700px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '700px',
            padding: '40px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            maxHeight: '1200px',
            overflowY: 'auto',
          }}
        >
          {/* 제목 */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                color: '#333',
                fontWeight: 'bold',
              }}
            >
              회원가입
            </h1>
            <p style={{ margin: 0, fontSize: '16px', color: '#999' }}>
              봉사자로 가입하기
            </p>
          </div>

          {/* SNS 간편 가입 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', fontSize: '15px', color: '#666', marginBottom: '10px' }}>
              SNS계정으로 간편하게 회원가입
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <button
                onClick={() => onSocialLogin && onSocialLogin('Facebook')}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#1877F2',
                  color: 'white',
                  fontSize: '22px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
                }}
              >
                f
              </button>
              <button
                onClick={() => onSocialLogin && onSocialLogin('Kakao')}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#FEE500',
                  color: '#000',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(254, 229, 0, 0.3)',
                }}
              >
                K
              </button>
              <button
                onClick={() => onSocialLogin && onSocialLogin('Naver')}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#03C75A',
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(3, 199, 90, 0.3)',
                }}
              >
                N
              </button>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                이메일
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#fafafa',
                  }}
                />
                <select
                  value={formData.emailDomain}
                  onChange={(e) => handleChange('emailDomain', e.target.value)}
                  style={{
                    width: '180px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <option value="@gmail.com" fontSize='16px'>@gmail.com</option>
                  <option value="@naver.com">@naver.com</option>
                  <option value="@kakao.com">@kakao.com</option>
                  <option value="@daum.net">@daum.net</option>
                </select>
              </div>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  background: '#fff',
                  fontSize: '15px',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                이메일 인증하기
              </button>
            </div>

            {/* 비밀번호 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                비밀번호
              </label>
              <p style={{ fontSize: '14px', color: '#999', margin: '0 0 6px 0' }}>
                영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.
              </p>
              <input
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa',
                }}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={formData.passwordConfirm}
                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa',
                }}
              />
            </div>

            {/* 닉네임 */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                닉네임
              </label>
              <p style={{ fontSize: '14px', color: '#999', margin: '0 0 6px 0' }}>
                다른 유저와 겹치지 않도록 입력해주세요. (2~20자)
              </p>
              <input
                type="text"
                placeholder="별명 (2~20자)"
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa',
                }}
              />
            </div>

            {/* 약관동의 */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>
                약관동의
              </label>

              {/* 전체 동의 */}
              <div style={{ 
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #FFD700',
                backgroundColor: '#FFFEF0',
                marginBottom: '10px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeAll}
                    onChange={(e) => handleAgreeAll(e.target.checked)}
                    style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '17px', fontWeight: 600, color: '#333' }}>
                    전체동의
                  </span>
                </label>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 24px' }}>
                  선택항목에 대한 동의 포함
                </p>
              </div>

              {/* 개별 약관 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeAge}
                    onChange={(e) => handleChange('agreeAge', e.target.checked)}
                    style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#333' }}>만 14세 이상입니다</span>
                  <span style={{ color: '#FF6B9D', marginLeft: '4px' }}>(필수)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.agreePrivacy}
                      onChange={(e) => handleChange('agreePrivacy', e.target.checked)}
                      style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#333' }}>이용약관</span>
                    <span style={{ color: '#FF6B9D', marginLeft: '4px' }}>(필수)</span>
                  </div>
                  <span style={{ color: '#999', cursor: 'pointer' }}>›</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                      style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#333' }}>개인정보 마케팅 활용 동의</span>
                    <span style={{ color: '#999', marginLeft: '4px' }}>(선택)</span>
                  </div>
                  <span style={{ color: '#999', cursor: 'pointer' }}>›</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeNotification}
                    onChange={(e) => handleChange('agreeNotification', e.target.checked)}
                    style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#333' }}>이벤트, 쿠폰, 특가 알림 메일 및 SMS 등 수신</span>
                  <span style={{ color: '#999', marginLeft: '4px' }}>(선택)</span>
                </label>
              </div>

              {/* 로봇 체크 */}
              <div style={{ 
                marginTop: '12px',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #FFD700',
                backgroundColor: '#FFFEF0'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: '#333' }}>로봇이 아닙니다.</span>
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#333',
                fontSize: '19px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                marginBottom: '12px',
              }}
            >
              회원가입하기
            </button>
          </form>

          {/* 로그인 링크 */}
          <div style={{ textAlign: 'center', fontSize: '15px', color: '#999' }}>
            이미 가입되어 있으신가요?{' '}
            <a
              href="#"
              style={{ color: '#FF6B9D', fontWeight: 'bold', textDecoration: 'none' }}
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