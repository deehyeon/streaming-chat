import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShelterIsland from './pages/shelter-island'; // 메인 페이지
import ChatPage from './pages/ChatPage'; // 채팅 페이지
import Login from './pages/Login';
import Signup from './pages/Signup'
import Shelters from './pages/Shelters';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'volunteer', 'shelter', null
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
  
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 화면 */}
        <Route path="/" element={<ShelterIsland />} />
        
        {/* 채팅방 화면 (주소: /chat) */}
        <Route path="/chat" element={<ChatPage />} />

        {/* 로그인 화면 */}
        <Route path="/login" element={<Login/>}/>

        {/* 회원가입 화면 */}
        <Route path="/signup" element={<Signup/>}/>

        {/* 회원가입 화면 */}
        <Route path="/shelters" element={<Shelters/>}/>
      </Routes>
    </BrowserRouter>
  );
}