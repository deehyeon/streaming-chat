import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShelterIsland from './pages/shelter-island'; // 메인 페이지
import ChatPage from './pages/ChatPage'; // 채팅 페이지
import Login from './pages/Login';
import Signup from './pages/Signup'
import Shelters from './pages/Shelters';

export default function App() {
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