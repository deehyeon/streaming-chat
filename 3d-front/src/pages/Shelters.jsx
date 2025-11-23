// src/pages/SheltersPage.jsx
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

import Fence from '../components/Fence';
import Island from '../components/Island';
import Cloud from '../components/Cloud';
import NavigationButtons from '../components/button/NavigationButtons';
import Header from '../components/Header';

// 3D 씬
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 8]} />
      <OrbitControls
         enableZoom={true}
         enablePan={true}
         enableRotate={true}
         enableDamping={true}
         dampingFactor={0.05}
         minDistance={3}
         maxDistance={15}
         maxPolarAngle={Math.PI / 2}
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

export default function SheltersPage() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('volunteer');

  const shelters = [
    {
      id: 1,
      name: '서울 강남 동물보호센터',
      distance: '500m',
      address: '서울시 강남구 역삼1동',
      phone: '02-1234-5678',
      hours: '평일 09:00-18:00',
      rating: 4.8,
      reviews: 24,
      icon: '🏠'
    },
    {
      id: 2,
      name: '강남 한마음 보호소',
      distance: '800m',
      address: '서울시 강남구 역삼2동',
      phone: '02-5678-9012',
      hours: '토일 10:00-16:00',
      rating: 4.6,
      reviews: 18,
      icon: '🏢'
    },
    {
      id: 3,
      name: '세란트 애견보호센터',
      distance: '1.2km',
      address: '서울시 강남구 삼성동',
      phone: '02-3456-7890',
      hours: '평일 10:00-17:00',
      rating: 4.7,
      reviews: 32,
      icon: '🏛️'
    }
  ];

  const filters = [
    { id: 'volunteer', label: '🤝 봉사가능' },
    { id: 'shelter', label: '🏠 보호소' },
    { id: 'consulting', label: '👨‍⚕️ 컨설팅' },
    { id: 'distance', label: '📍 거리순' }
  ];

  const regions = [
    { city: '서울특별시', districts: ['강남구', '서초구', '송파구', '강동구'] },
    { city: '서울특별시', districts: ['서초구', '서초동'] },
    { city: '서울특별시', districts: ['송파구', '잠실동'] },
    { city: '서울특별시', districts: ['강동구', '천호동'] },
    { city: '경기도', districts: ['성남시', '분당구'] },
  ];

  const toggleLike = (shelterId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shelterId)) {
        newSet.delete(shelterId);
      } else {
        newSet.add(shelterId);
      }
      return newSet;
    });
  };

  const handleShelterClick = (shelterId) => {
    setSelectedShelterId(shelterId);
    // TODO: 상세 페이지로 이동
    navigate(`/shelters/${shelterId}`);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)'
    }}>
      {/* Header 컴포넌트 */}
      <Header isLoggedIn={false} />

      {/* 3D 배경 */}
      <Canvas shadows style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* 왼쪽 네비게이션 버튼 */}
    <div style={{ position: 'absolute', top: '50%', left: '10000px', zIndex: 30 }}>
    <NavigationButtons />
    </div>

      {/* 콘텐츠 영역 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: '100px 20px 80px',
        pointerEvents: 'none', // 배경 조작을 위해 기본적으로 이벤트 차단 해제
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          pointerEvents: 'auto', // 콘텐츠 영역은 클릭 가능하게
        }}>
          {/* Hero Section */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.95), rgba(207, 250, 254, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ position: 'absolute', top: '40px', left: '80px', fontSize: '32px', opacity: 0.4 }}>🐾</div>
            <div style={{ position: 'absolute', top: '128px', right: '128px', fontSize: '32px', opacity: 0.4 }}>🐾</div>
            <div style={{ position: 'absolute', bottom: '80px', left: '25%', fontSize: '32px', opacity: 0.4 }}>🐾</div>
            <div style={{ position: 'absolute', bottom: '128px', right: '80px', fontSize: '32px', opacity: 0.4 }}>🐾</div>

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: '#FFD700',
                color: '#1f2937',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                marginBottom: '24px'
              }}>
                당신하터 갈 보호소를 찾아볼까요? 🐕
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#BFDBFE',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                  🗺️
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#374151', fontWeight: '600' }}>보호소 지킴이도</span>
                  <span style={{ fontSize: '32px' }}>🐾</span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  신뢰할 지역의 보호소 위치가 표시됩니다
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#FFD700'}
                onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                📍 {selectedRegion}
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="보호소 이름으로 검색"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 48px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <svg 
                  style={{
                    width: '20px',
                    height: '20px',
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeFilter === filter.id ? '#FFD700' : '#f3f4f6',
                    color: activeFilter === filter.id ? '#1f2937' : '#6b7280',
                    boxShadow: activeFilter === filter.id ? '0 4px 12px rgba(255, 215, 0, 0.3)' : 'none'
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shelter List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleShelterClick(shelter.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* 보호소 아이콘 */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    flexShrink: 0
                  }}>
                    {shelter.icon}
                  </div>

                  {/* 보호소 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                        {shelter.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(shelter.id);
                        }}
                        style={{
                          fontSize: '20px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        {likedItems.has(shelter.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#F59E0B', fontWeight: '600' }}>📍 {shelter.distance}</span>
                        <span>{shelter.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📞 {shelter.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🕐 {shelter.hours}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>⭐</span>
                        <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px' }}>{shelter.rating}</span>
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>({shelter.reviews})</span>
                      </div>
                      <button 
                        style={{
                          color: '#F59E0B',
                          background: 'none',
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        자세히
                        <svg 
                          style={{ width: '16px', height: '16px', transition: 'transform 0.2s' }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 지역 변경 모달 */}
      {isLocationModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                지역 변경
              </h2>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {/* 검색바 */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <input
                type="text"
                placeholder="시/도/군 등으로 검색하기"
                style={{
                  width: '100%',
                  padding: '12px 20px 12px 48px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>
                🔍
              </span>
            </div>

            {/* 현재 내 위치 사용하기 */}
            <button
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B5 100%)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              <span>📍</span>
              <span>현재 내 위치 사용하기</span>
            </button>

            {/* 추천 지역 */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#fb923c' }}>
                추천
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {regions.map((region, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedRegion(region.districts[0]);
                      setIsLocationModalOpen(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#f9fafb',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '15px',
                      color: '#111827',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = '#f9fafb'}
                  >
                    {region.city}, {region.districts.join(', ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 저작권 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: '#666',
        zIndex: 10,
        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        pointerEvents: 'none', // 배경 조작 방해하지 않도록
      }}>
        © MongLog. All Rights Reserved
      </div>
    </div>
  );
}
