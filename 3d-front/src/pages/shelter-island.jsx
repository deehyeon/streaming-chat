import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D, Center,  useTexture, useGLTF, RoundedBox, Html} from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

import Dog from '../components/Dog';
import Island from '../components/Island';
import Isabelle from '../components/Isabelle';
import Cloud from '../components/Cloud';
import Fence from "../components/Fence";
import ChatIcon from '../components/ChatIcon';

// 메인 씬
function Scene({ onDogClick, onChatClick, onIsabelleClick, showIsabelleModal }) {
  return (
    <>
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
      
      {/* 땅 */}
      <Island scale={1} position={[0, -2, 0]} />

      {/* 울타리 */}
      <Fence position={[-3, 0, -5]} rotation={[0, 0, 0]} />
      <Fence position={[3, 0, -5]} rotation={[0, 0, 0]} />
      <Fence position={[-5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Fence position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* 구름들 */}
      <Cloud position={[-3, 4, 0]} />
      <Cloud position={[4, 3, 3]} />
      <Cloud position={[0, 3.5, 2]} />
      <Cloud position={[2, 3.5, 0]} />
      
      {/* 강아지들 */}
      <Dog position={[-2, 0, 2]} color="#DEB887" onClick={() => onDogClick('/login')} message="회원가입/로그인 🐶" />
      <Dog position={[2, 0, 2]} color="#F4A460" onClick={() => onDogClick('/mypage')} message="마이페이지 🐶"/>
      <Dog position={[-1, 0, 3]} color="#FFFFFF" onClick={() => onDogClick('/shelters')} message="보호소 둘러보기 🐶"/>
      <Dog position={[1, 0, 3]} color="#8B4513" onClick={() => onDogClick('/board')} message="게시판 🐶"/>

      {/* 👇 여울이(Isabelle) 추가! */}
      <Isabelle 
        position={[0, 0, 3]} 
        scale={0.02} 
        rotation={[0, 0, 0]} 
        onClick={onIsabelleClick}
        showModal={showIsabelleModal}
      />

      {/* 채팅 알람 아이콘*/}
      <ChatIcon position={[1.5, 1.6, 1.5]} scale={0.1} rotation={[0, 0, 0]} onClick={onChatClick}/>
    </>
  );
}

// 메인 앱 컴포넌트
export default function ShelterIsland() {
  const [selectedDog, setSelectedDog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showIsabelleModal, setShowIsabelleModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: 실제 로그인 상태로 교체
  const navigate = useNavigate();

  // Dog 클릭 핸들러 - 페이지 이동
  const handleDogClick = (path) => {
    navigate(path);
  };

  const handleVolunteer = () => {
    alert(`${selectedDog} 친구와 함께하는 봉사 신청이 완료되었습니다! 🐕`);
    setShowModal(false);
  };

  // 이사벨 클릭 핸들러
  const handleIsabelleClick = () => {
    setShowIsabelleModal(true);
  };

  // 로그인/회원가입 버튼 클릭
  const handleLogin = () => {
    // TODO: 실제 로그인 페이지로 이동
    alert('로그인 페이지로 이동합니다!');
    setShowIsabelleModal(false);
    navigate('/login');
  };

  const handleSignup = () => {
    // TODO: 실제 회원가입 페이지로 이동
    alert('회원가입 페이지로 이동합니다!');
    setShowIsabelleModal(false);
    navigate('/signup');
  };

  // 마이페이지 이동
  const handleGoToMyPage = () => {
    alert('마이페이지로 이동합니다!');
    setShowIsabelleModal(false);
    // navigate('/mypage');
  };

  // Footer 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    switch(page) {
      case 'home':
        navigate('/');
        break;
      case 'shelters':
        navigate('/shelters');
        break;
      case 'missing':
        navigate('/missing');
        break;
      case 'adoption':
        navigate('/adoption');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'signup':
        navigate('/signup');
        break;
      case 'mypage':
        navigate('/mypage');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}>
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 3, 10]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.2}
        />
        <Suspense fallback={null}>
          <Scene 
              onDogClick={handleDogClick}
              onChatClick={() => navigate('/chat')}
              onIsabelleClick={handleIsabelleClick}
              showIsabelleModal={showIsabelleModal}
           />
        </Suspense>
      </Canvas>

      {/* UI 오버레이 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px 30px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#FF6B9D' }}>🏡 멍로그 아일랜드</h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>강아지를 클릭해서 친구가 되어주세요!</p>
      </div>

      {/* 오른쪽 상단 프로필/로그인 안내 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        fontFamily: 'Arial, sans-serif',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '200px'
      }}>
        {isLoggedIn ? (
          <>
            {/* 로그인 상태 */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFB6C1 0%, #FF6B9D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 2px 8px rgba(255, 107, 157, 0.3)'
            }}>
              🐕
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '2px'
              }}>
                홍길동님
              </div>
              <div style={{
                fontSize: '11px',
                color: '#999'
              }}>
                환영합니다! 🎉
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 로그아웃 상태 */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.4'
              }}>
                캐릭터를 클릭해<br/>
                로그인을 진행해주세요!
              </div>
            </div>
          </>
        )}
      </div>

      {/* 안내 텍스트 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.85)',
        padding: '10px 20px',
        borderRadius: '15px',
        fontSize: '16px',
        color: '#666',
        backdropFilter: 'blur(5px)'
      }}>
        🖱️ 마우스로 드래그하여 둘러보세요 | 🔍 휠로 확대/축소
      </div>

      {/* 강아지 선택 모달 */}
      {showModal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '350px',
          textAlign: 'center',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <h2 style={{ color: '#FF6B9D', marginTop: '0' }}>🐕 {selectedDog}</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            {selectedDog} 친구가 당신을 기다리고 있어요!<br/>
            함께 산책하고 놀아주시겠어요?
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={handleVolunteer}
              style={{
                background: '#FF6B9D',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#FF4081'}
              onMouseLeave={(e) => e.target.style.background = '#FF6B9D'}
            >
              봉사 신청하기
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: '#E0E0E0',
                color: '#666',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#BDBDBD'}
              onMouseLeave={(e) => e.target.style.background = '#E0E0E0'}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 이사벨 클릭 모달 */}
      {showIsabelleModal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '35px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '380px',
          textAlign: 'center',
          animation: 'slideIn 0.3s ease-out',
          border: '3px solid #FFB6C1'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎵</div>
          <h2 style={{ color: '#FF6B9D', marginTop: '0', marginBottom: '15px' }}>
            {isLoggedIn ? '안녕하세요!' : '환영합니다!'}
          </h2>
          
          {isLoggedIn ? (
            <>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>
                마이페이지에서 내 정보를<br/>
                확인하고 관리하실 수 있어요!
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleGoToMyPage}
                  style={{
                    background: 'linear-gradient(135deg, #FFB6C1 0%, #FF6B9D 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 157, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.3)';
                  }}
                >
                  마이페이지로 이동
                </button>
                <button
                  onClick={() => setShowIsabelleModal(false)}
                  style={{
                    background: '#E0E0E0',
                    color: '#666',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#BDBDBD'}
                  onMouseLeave={(e) => e.target.style.background = '#E0E0E0'}
                >
                  닫기
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>
                멍로그 아일랜드에 오신 것을 환영합니다!<br/>
                로그인하고 더 많은 기능을 사용해보세요 🐶
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleLogin}
                  style={{
                    background: 'linear-gradient(135deg, #FFB6C1 0%, #FF6B9D 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 157, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.3)';
                  }}
                >
                  로그인
                </button>
                <button
                  onClick={handleSignup}
                  style={{
                    background: 'white',
                    color: '#FF6B9D',
                    border: '2px solid #FFB6C1',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#FFF0F5';
                    e.target.style.borderColor = '#FF6B9D';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#FFB6C1';
                  }}
                >
                  회원가입
                </button>
                <button
                  onClick={() => setShowIsabelleModal(false)}
                  style={{
                    background: 'transparent',
                    color: '#999',
                    border: 'none',
                    padding: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '5px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#666'}
                  onMouseLeave={(e) => e.target.style.color = '#999'}
                >
                  나중에 하기
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 모달 배경 */}
      {(showModal || showIsabelleModal) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999
          }}
          onClick={() => {
            setShowModal(false);
            setShowIsabelleModal(false);
          }}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        body {
          margin: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
