// src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LocationModal from './LocationModal';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [userType, setUserType] = useState(
    localStorage.getItem('userType') || null
  );

  // 디버깅 로그 추가
  console.log('🎨 Layout render - isLoggedIn:', isLoggedIn, 'userType:', userType);

  useEffect(() => {
    // 다른 탭에서의 변경 감지 (기존 코드)
    const handleStorageChange = () => {
      console.log('📦 Storage event fired');
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setUserType(localStorage.getItem('userType') || null);
    };

    // 같은 탭에서의 변경 감지 (새로 추가)
    const handleAuthChange = () => {
      console.log('🔄 AuthChange event fired');
      const newIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const newUserType = localStorage.getItem('userType') || null;
      
      console.log('📥 Updating state:', {
        isLoggedIn: newIsLoggedIn,
        userType: newUserType
      });
      
      setIsLoggedIn(newIsLoggedIn);
      setUserType(newUserType);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange); // 커스텀 이벤트

    console.log('👂 Event listeners registered');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      console.log('🔇 Event listeners removed');
    };
  }, []);

  const handleLogout = () => {
    console.log('🚪 Logging out');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isLoggedIn={isLoggedIn}
        userType={userType}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6">
        {isLocationModalOpen && (
          <LocationModal
            onClose={() => setIsLocationModalOpen(false)}
            setSelectedRegion={setSelectedRegion}
          />
        )}
        
        <Outlet context={{ 
          isLocationModalOpen, 
          setIsLocationModalOpen,
          selectedRegion,
          setSelectedRegion,
          isLoggedIn,
          setIsLoggedIn,
          userType,
          setUserType,
          handleLogout
        }} />
      </main>

      <Footer />
    </div>
  );
}