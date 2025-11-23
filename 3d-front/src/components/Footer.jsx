import React from 'react';
import { Heart, Bell, User, Home, Search, Gift } from 'lucide-react';

const colors = {
  primary: '#FFB701',
  secondary: '#FEDF04',
  gray: '#ABADA7'
};

export default function Footer({ currentPage, setCurrentPage, isLoggedIn }) {
  const navItems = [
    { id: 'home', icon: Home, label: '홈', path: 'home' },
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentPage('home')}
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

        {/* 로그인/회원가입 또는 사용자 메뉴 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {isLoggedIn ? (
            <>
              <IconButton icon={Heart} onClick={() => {}} />
              <IconButton icon={Bell} onClick={() => {}} badge />
              <IconButton icon={User} onClick={() => setCurrentPage('mypage')} />
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: colors.gray,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = colors.gray}
              >
                로그인
              </button>
              <button
                onClick={() => setCurrentPage('signup')}
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
                회원가입
              </button>
            </>
          )}
        </div>
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
