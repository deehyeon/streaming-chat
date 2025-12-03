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

  useEffect(() => {
    // Listen to storage changes
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setUserType(localStorage.getItem('userType') || null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
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
        currentPage={location.pathname}
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