import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Bell, User } from 'lucide-react';
import logo from './logo/돈이 캐릭터 5.svg';
import { colors } from '../../constants/colors';

export const Header = ({ isLoggedIn, userType, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 회원가입/로그인 페이지에서는 네비게이션 숨김
  const hideNavigation = currentPath === '/signup' || 
                         currentPath === '/login' || 
                         currentPath.startsWith('/signup/');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* 로고 */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
            <img src={logo} alt="멍로그 로고" style={{ width: 48, height: 48 }} />
            <h1 className="text-xl sm:text-2xl font-bold" style={{ 
              background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              멍로그
            </h1>
          </div>

          {/* 네비게이션 메뉴 */}
          {!hideNavigation && (
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/shelters')} 
                className="text-base font-semibold transition hover:text-yellow-500"
                style={{ 
                  color: currentPath.startsWith('/shelters') ? colors.primary : '#1f2937' 
                }}
              >
                보호소 찾기
              </button>
              <button 
                onClick={() => navigate('/missing')} 
                className="text-base font-semibold transition hover:text-yellow-500"
                style={{ 
                  color: currentPath.startsWith('/missing') ? colors.primary : '#1f2937' 
                }}
              >
                분실/보호
              </button>
              <button 
                onClick={() => navigate('/adoption')} 
                className="text-base font-semibold transition hover:text-yellow-500"
                style={{ 
                  color: currentPath.startsWith('/adoption') ? colors.primary : '#1f2937' 
                }}
              >
                분양하기
              </button>
            </nav>
          )}
        </div>

        {/* 로그인/회원가입 또는 사용자 메뉴 */}
        {!hideNavigation && (
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  onClick={() => {
                    // userType에 따라 다른 마이페이지로 이동
                    if (userType === 'volunteer') {
                      navigate('/mypage/volunteer');
                    } else if (userType === 'shelter') {
                      navigate('/mypage/shelter');
                    } else {
                      navigate('/mypage');
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-4 py-2 text-sm font-semibold text-gray-700 transition hover:text-yellow-500"
                >
                  로그인
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-5 py-2 text-gray-900 text-sm font-bold rounded-lg transition shadow-md hover:shadow-lg"
                  style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
