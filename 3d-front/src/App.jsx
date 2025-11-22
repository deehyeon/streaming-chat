import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShelterIsland from './pages/shelter-island'; // 기존 메인 페이지
import ChatPage from './pages/ChatPage'; // 방금 만든 채팅 페이지

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 화면 */}
        <Route path="/" element={<ShelterIsland />} />
        
        {/* 채팅방 화면 (주소: /chat) */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}