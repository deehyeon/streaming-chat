import React from 'react';
import { useNavigate } from 'react-router-dom';

const colors = {
  primary: '#FFB701',
  secondary: '#FEDF04',
};

export default function Header({ userName, isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <div 
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 왼쪽: 로고 */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 2px 8px rgba(255, 183, 1, 0.3)',
          }}>
            🐕
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            멍로그
          </span>
        </div>

        {/* 오른쪽: 회원 이름 또는 로그인 버튼 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {isLoggedIn ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 183, 1, 0.1)',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                🐕
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
              }}>
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
      </div>
    </header>
  );
}
