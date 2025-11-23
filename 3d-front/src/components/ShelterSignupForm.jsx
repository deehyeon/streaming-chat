// src/components/ShelterSignupForm.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';

export default function ShelterSignupForm({ 
  position = [0, 0, 0], 
  scale = 1,
  onSignup, 
  onSocialLogin,
  onNavigateLogin 
}) {
  const groupRef = useRef();
  const [step, setStep] = useState(1); // 1 or 2
  
  // Step 1 데이터
  const [step1Data, setStep1Data] = useState({
    email: '',
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

  // Step 2 데이터
  const [step2Data, setStep2Data] = useState({
    shelterName: '',
    shelterAddress: '',
    managerName: '',
    homepage: '',
    operationHours: '',
    operationTime: '',
    availableHours: '',
    availableTime: '',
    phoneNumber: '',
    description: '',
  });

  // 부드러운 둥둥 떠다니는 애니메이션
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
  });

  const handleStep1Change = (field, value) => {
    setStep1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleStep2Change = (field, value) => {
    setStep2Data(prev => ({ ...prev, [field]: value }));
  };

  const handleAgreeAll = (checked) => {
    setStep1Data(prev => ({
      ...prev,
      agreeAll: checked,
      agreeTerms: checked,
      agreeAge: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
      agreeNotification: checked,
    }));
  };

  // Step 1 제출 (다음 단계로)
  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    // 필수 약관 체크
    if (!step1Data.agreeTerms || !step1Data.agreeAge || !step1Data.agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 비밀번호 확인
    if (step1Data.password !== step1Data.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 다음 단계로
    setStep(2);
  };

  // Step 2 제출 (최종 회원가입)
  const handleStep2Submit = (e) => {
    e.preventDefault();
    
    if (onSignup) {
      onSignup({
        ...step1Data,
        ...step2Data,
        type: 'shelter'
      });
    }
  };

  // 이전 단계로
  const handlePrevStep = () => {
    setStep(1);
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
        position={[-3.8, 5.5, 0.2]}
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
            maxHeight: '1000px',
            overflowY: 'auto',
          }}
        >
          {/* 제목 */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏠</div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                color: '#333',
                fontWeight: 'bold',
              }}
            >
              보호소 센터 회원가입
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              {step === 1 ? '기본 정보를 입력해주세요' : '보호소 정보를 등록해주세요'}
            </p>
          </div>

          {/* 진행 단계 표시 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step === 1 ? '#FFD700' : '#22c55e',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {step === 1 ? '1' : '✓'}
            </div>
            <div style={{ width: '60px', height: '3px', background: step === 2 ? '#22c55e' : '#e0e0e0' }} />
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step === 2 ? '#FFD700' : '#e0e0e0',
                color: step === 2 ? '#fff' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              2
            </div>
          </div>

          {/* Step 1: 계정 정보 */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              {/* SNS 간편 가입 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                  SNS계정으로 간편하게 회원가입
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => onSocialLogin && onSocialLogin('Facebook')}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#1877F2',
                      color: 'white',
                      fontSize: '18px',
                      cursor: 'pointer',
                    }}
                  >
                    f
                  </button>
                  <button
                    type="button"
                    onClick={() => onSocialLogin && onSocialLogin('Kakao')}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#FEE500',
                      color: '#000',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    K
                  </button>
                  <button
                    type="button"
                    onClick={() => onSocialLogin && onSocialLogin('Naver')}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#03C75A',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    N
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '14px', color: '#999', margin: '15px 0' }}>
                또는 이메일로 가입
              </div>

                {/* 이메일 */}
                <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                    이메일
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                    type="text"
                    placeholder="이메일"
                    value={step1Data.email}
                    onChange={(e) => handleStep1Change('email', e.target.value)}
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
                value={step1Data.password}
                onChange={(e) => handleStep1Change('password', e.target.value)}
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
                value={step1Data.passwordConfirm}
                onChange={(e) => handleStep1Change('passwordConfirm', e.target.value)}
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
                value={step1Data.nickname}
                onChange={(e) => handleStep1Change('nickname', e.target.value)}
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
                    checked={step1Data.agreeAll}
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
                    checked={step1Data.agreeAge}
                    onChange={(e) => handleStep1Change('agreeAge', e.target.checked)}
                    style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#333' }}>만 14세 이상입니다</span>
                  <span style={{ color: '#FF6B9D', marginLeft: '4px' }}>(필수)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={step1Data.agreePrivacy}
                      onChange={(e) => handleStep1Change('agreePrivacy', e.target.checked)}
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
                      checked={step2Data.agreeTerms}
                      onChange={(e) => handleStep1Change('agreeTerms', e.target.checked)}
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
                    checked={step2Data.agreeNotification}
                    onChange={(e) => handleStep1Change('agreeNotification', e.target.checked)}
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

              {/* 다음 단계 버튼 */}
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
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                }}
              >
                다음 단계로
              </button>
            </form>
          )}

          {/* Step 2: 보호소 정보 */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              {/* 보호소 정보 섹션 */}
                <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  📋 보호소 정보
                </div>

                {/* 보호소 이름 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 이름 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="강남 보호소"
                    value={step2Data.shelterName}
                    onChange={(e) => handleStep2Change('shelterName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 보호소 주소 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 주소 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="경기도 수원시 영통구 매탄로"
                    value={step2Data.shelterAddress}
                    onChange={(e) => handleStep2Change('shelterAddress', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 담당자 이름 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    담당자 이름 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={step2Data.managerName}
                    onChange={(e) => handleStep2Change('managerName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 홈페이지/SNS 링크 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    홈페이지/SNS 링크 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="보호소 이용을 알려주세요."
                    value={step2Data.homepage}
                    onChange={(e) => handleStep2Change('homepage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 보호소 운영 여부 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 운영 여부 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="소지만 입력해주세요."
                    value={step2Data.operationHours}
                    onChange={(e) => handleStep2Change('operationHours', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 보호소 운영 시간 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 운영 시간 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="소지만 입력해주세요."
                    value={step2Data.operationTime}
                    onChange={(e) => handleStep2Change('operationTime', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 봉사 가능 여부 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    봉사 가능 여부 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="소지만 입력해주세요."
                    value={step2Data.availableHours}
                    onChange={(e) => handleStep2Change('availableHours', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 봉사 가능 시간 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    봉사 가능 시간 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="소지만 입력해주세요."
                    value={step2Data.availableTime}
                    onChange={(e) => handleStep2Change('availableTime', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 보호소 연락 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 연락 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="소지만 입력해주세요."
                    value={step2Data.phoneNumber}
                    onChange={(e) => handleStep2Change('phoneNumber', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>

                {/* 보호소 상세 설명 */}
                <div style={{ marginBottom: '0' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                    보호소 상세 설명 <span style={{ color: '#ff0000' }}>*</span>
                  </label>
                  <textarea
                    placeholder="보호소 상세 설명을 입력해주세요."
                    value={step2Data.description}
                    onChange={(e) => handleStep2Change('description', e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

              {/* 버튼들 */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  이전 단계로
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#333',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  회원가입 완료
                </button>
              </div>
            </form>
          )}

          {/* 로그인 링크 */}
          {step === 1 && (
            <div style={{ textAlign: 'center', fontSize: '15px', color: '#999', marginTop: '15px' }}>
              이미 아이디가 있으신가요?{' '}
              <a
                href="#"
                style={{ color: '#FFB6C1', fontWeight: 'bold', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateLogin) onNavigateLogin();
                }}
              >
                로그인
              </a>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}