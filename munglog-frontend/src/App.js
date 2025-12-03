import React, { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LocationModal from './components/common/LocationModal';
import Home from './pages/Home';
import Shelters from './pages/Shelters';
import ShelterDetail from './pages/ShelterDetail';
import Missing from './pages/Missing';
import MissingPostCreate from './pages/MissingPostCreate';
import ProtectedPostCreate from './pages/ProtectedPostCreate';
import Adoption from './pages/Adoption';
import AdoptionDetail from './pages/AdoptionDetail';
import AdoptionPostCreate from './pages/AdoptionPostCreate';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerSignup from './pages/VolunteerSignup';
import ShelterSignup from './pages/ShelterSignup';
import VolunteerMyPage from './pages/VolunteerMyPage';
import ShelterMyPage from './pages/ShelterMyPage';
import MyPage from './pages/MyPage';
import Chat from './pages/Chat';
import ShelterIsland from './pages/ShelterIsland';

export default function App() {
  const [currentPage, setCurrentPage] = useState('shelter-island'); // 초기 페이지
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [selectedDogId, setSelectedDogId] = useState(null);

  const toggleLike = (itemId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentPage('home');
  };

  const pageProps = {
    currentPage,
    setCurrentPage,
    selectedRegion,
    setSelectedRegion,
    isLocationModalOpen,
    setIsLocationModalOpen,
    likedItems,
    toggleLike,
    isLoggedIn,
    setIsLoggedIn,
    userType,
    setUserType,
    handleLogout,
    selectedShelterId,
    setSelectedShelterId,
    selectedDogId,
    setSelectedDogId
  };

  // ShelterIsland 페이지는 전체 화면으로 렌더링 (Header/Footer 없음)
  if (currentPage === 'shelter-island') {
    return <ShelterIsland setCurrentPage={setCurrentPage} />;
  }

  // 다른 모든 페이지는 Header/Footer와 함께 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        userType={userType}
      />

      <main className="max-w-7xl mx-auto p-6">
        {isLocationModalOpen && (
          <LocationModal 
            onClose={() => setIsLocationModalOpen(false)}
            setSelectedRegion={setSelectedRegion}
          />
        )}

        {currentPage === 'home' && <Home {...pageProps} />}
        {currentPage === 'shelters' && <Shelters {...pageProps} />}
        {currentPage === 'shelter-detail' && <ShelterDetail shelterId={selectedShelterId} setCurrentPage={setCurrentPage} />}
        {currentPage === 'missing' && <Missing {...pageProps} />}
        {currentPage === 'missing-post-create' && <MissingPostCreate setCurrentPage={setCurrentPage} />}
        {currentPage === 'protected-post-create' && <ProtectedPostCreate setCurrentPage={setCurrentPage} />}
        {currentPage === 'adoption' && <Adoption {...pageProps} />}
        {currentPage === 'adoption-detail' && <AdoptionDetail dogId={selectedDogId} setCurrentPage={setCurrentPage} />}
        {currentPage === 'adoption-post-create' && <AdoptionPostCreate setCurrentPage={setCurrentPage} />}
        {currentPage === 'chat' && <Chat {...pageProps} />}
        {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />}
        {currentPage === 'signup' && <Signup setCurrentPage={setCurrentPage} />}
        {currentPage === 'volunteer-signup' && <VolunteerSignup setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />}
        {currentPage === 'shelter-signup' && <ShelterSignup setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />}
        {currentPage === 'mypage' && userType === 'volunteer' && <VolunteerMyPage setCurrentPage={setCurrentPage} handleLogout={handleLogout} />}
        {currentPage === 'mypage' && userType === 'shelter' && <ShelterMyPage setCurrentPage={setCurrentPage} handleLogout={handleLogout} />}
        {currentPage === 'mypage' && !userType && <MyPage setCurrentPage={setCurrentPage} handleLogout={handleLogout} />}
      </main>

      <Footer />
    </div>
  );
}