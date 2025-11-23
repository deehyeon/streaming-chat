// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo/돈이 캐릭터 2.svg';

const colors = {
  primary: '#FFB701',
  secondary: '#FEDF04',
};

export default function Header({ userName, isLoggedIn, showRight = true }) {
  // 👆 showRight 기본값: true (평소 페이지에서는 오른쪽 영역 보임)
  const navigate = useNavigate();

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'none',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <div 
        style={{
          width: '100%',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 로고 */}
        <div
          className="flex flex-row items-center gap-3 cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer', 
            transition: 'all 0.2s ease', // ← 부드러운 애니메이션
          }}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <img
            src={logo}
            alt="멍로그 로고"
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          />

          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{
              margin: 0,
              background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              fontSize: '20px'
            }}
          >
            멍로그
          </h1>
        </div>


        {/* 오른쪽 영역: showRight 가 true일 때만 렌더링 */}
        {showRight && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 80px',
            }}
          >
            {isLoggedIn ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 200px',
                  borderRadius: '12px',
                  background: 'rgba(255, 183, 1, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  🐕
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                  }}
                >
                  {userName || '홍길동'}님
                </span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#1f2937',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 183, 1, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 183, 1, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 183, 1, 0.3)';
                }}
              >
                로그인
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
