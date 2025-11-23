import React from 'react';
import { Heart, Bell, User, Home, Search, Gift } from 'lucide-react';
import logo from './logo/돈이 캐릭터 2.svg';

const colors = {
  primary: '#FFB701',
  secondary: '#FEDF04',
  gray: '#ABADA7'
};

export default function Footer({ currentPage, setCurrentPage, isLoggedIn }) {
  const navItems = [
    { id: 'shelters', icon: Search, label: '보호소 찾기', path: 'shelters' },
    { id: 'missing', icon: Heart, label: '분실/보호', path: 'missing' },
    { id: 'adoption', icon: Gift, label: '분양하기', path: 'adoption' },
  ];

  return (
    <footer 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
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
        {/* 로고 */}
        <div 
            className="flex flex-row items-center gap-3 cursor-pointer" 
            style={{ display: 'flex', alignItems: 'center' }}  
            onClick={() => setCurrentPage('home')}
          >
            <img 
              src={logo} 
              alt="멍로그 로고" 
              style={{ width: 48, height: 48, flexShrink: 0 }} 
            />

            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{
                margin: 0,
                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                whiteSpace: 'nowrap',          // 텍스트 줄바꿈 방지
              }}
            >
              멍로그
            </h1>
          </div>


        {/* 네비게이션 메뉴 */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.path;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive 
                    ? `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` 
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 183, 1, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <IconComponent 
                  size={20}
                  color={isActive ? colors.primary : '#6b7280'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span style={{
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? colors.primary : '#6b7280',
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: colors.primary,
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}

// 아이콘 버튼 컴포넌트
function IconButton({ icon: Icon, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '8px',
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={20} color="#374151" />
      {badge && (
        <span style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
        }} />
      )}
    </button>
  );
}
