// src/components/NavigationButtons.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NavigationButtons() {
  const navigate = useNavigate();
  const location = useLocation();

  const buttons = [
    {
      id: 'shelters',
      path: '/shelters',
      icon: '🏠',
      label: '보호소 찾기',
      color: 'rgba(252, 180, 241, 0.8)', // 핑크
      activeColor: 'rgba(252, 180, 241, 0.8)',
    },
    {
      id: 'missing',
      path: '/missing',
      icon: '🔍',
      label: '분실/보호',
      color: 'rgba(252, 180, 241, 0.8)', // 스카이블루
      activeColor: 'rgba(252, 180, 241, 0.8)',
    },
    {
      id: 'adoption',
      path: '/adoption',
      icon: '💝',
      label: '분양하기',
      color: 'rgba(252, 180, 241, 0.8)', // 골드
      activeColor: 'rgba(252, 180, 241, 0.8)',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        position: 'fixed',
        left: '200px',
        top: '22%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 100,
        pointerEvents: 'auto',
      }}
    >
      {buttons.map((button) => {
        const active = isActive(button.path);
        return (
          <button
            key={button.id}
            onClick={() => navigate(button.path)}
            style={{
              position: 'relative',
              width: '140px',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '25px',
              background: active
                ? `linear-gradient(135deg, ${button.activeColor} 0%, ${button.color} 100%)`
                : `linear-gradient(135deg, ${button.color} 0%, ${button.color}dd 100%)`,
              color: '#000',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: active
                ? `0 8px 20px ${button.color}80, inset 0 -2px 8px rgba(0,0,0,0.1)`
                : `0 4px 12px ${button.color}60`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backdropFilter: 'blur(10px)',
              transform: active ? 'scale(1.05) translateX(5px)' : 'scale(1)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.transform = 'scale(1.05) translateX(5px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${button.color}80`;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${button.color}60`;
              }
            }}
          >
            {/* 아이콘 */}
            <div
              style={{
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                animation: active ? 'bounce 1s ease-in-out infinite' : 'none',
              }}
            >
              {button.icon}
            </div>

            {/* 라벨 */}
            <span style={{ flex: 1, textAlign: 'left' }}>
              {button.label}
            </span>

            {/* 활성 표시 점 */}
            {active && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            )}

            {/* 반짝이는 효과 */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                  animation: 'twinkle 1.5s ease-in-out infinite',
                }}
              />
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}