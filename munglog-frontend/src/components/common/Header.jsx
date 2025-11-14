import React from 'react';
import { MessageCircle, Bell, User } from 'lucide-react';
import logo from '../logo/돈이 캐릭터 5.svg';
import { colors } from '../../constants/colors';

const Header = ({ currentPage, setCurrentPage, isLoggedIn, userType }) => {
  const handleMyPageClick = () => {
    setCurrentPage('mypage');
  };

  const handleChatClick = () => {
    setCurrentPage('chat');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
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
          {currentPage !== 'signup' && currentPage !== 'login' && (
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => setCurrentPage('shelters')} 
                className="text-base font-semibold transition"
                style={{ color: currentPage === 'shelters' ? colors.primary : '#1f2937' }}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = currentPage === 'shelters' ? colors.primary : '#1f2937'}
              >
                보호소 찾기
              </button>
              <button 
                onClick={() => setCurrentPage('missing')} 
                className="text-base font-semibold transition"
                style={{ color: currentPage === 'missing' ? colors.primary : '#1f2937' }}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = currentPage === 'missing' ? colors.primary : '#1f2937'}
              >
                분실/보호
              </button>
              <button 
                onClick={() => setCurrentPage('adoption')} 
                className="text-base font-semibold transition"
                style={{ color: currentPage === 'adoption' ? colors.primary : '#1f2937' }}
                onMouseEnter={(e) => e.target.style.color = colors.primary}
                onMouseLeave={(e) => e.target.style.color = currentPage === 'adoption' ? colors.primary : '#1f2937'}
              >
                분양하기
              </button>
            </nav>
          )}
        </div>
        {currentPage !== 'signup' && currentPage !== 'login' && currentPage !== 'volunteer-signup' && currentPage !== 'shelter-signup' && (
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button 
                  onClick={handleChatClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="채팅"
                >
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  onClick={handleMyPageClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentPage('login')} 
                  className="px-4 py-2 text-sm font-semibold text-gray-700 transition"
                  style={{ color: colors.gray }}
                  onMouseEnter={(e) => e.target.style.color = colors.primary}
                  onMouseLeave={(e) => e.target.style.color = colors.gray}
                >
                  로그인
                </button>
                <button 
                  onClick={() => setCurrentPage('signup')} 
                  className="px-5 py-2 text-gray-900 text-sm font-bold rounded-lg transition shadow-md"
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