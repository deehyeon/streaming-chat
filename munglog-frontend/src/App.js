import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
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
import VolunteerApplicationCreate from './pages/VolunteerApplicationCreate';
import MyVolunteerApplications from './pages/MyVolunteerApplications';
import VolunteerApplicationDetail from './pages/VolunteerApplicationDetail';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ShelterIsland - Full screen without layout */}
        <Route path="/" element={<ShelterIsland />} />
        
        {/* Pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/shelters/:shelterId" element={<ShelterDetail />} />
          <Route path="/missing" element={<Missing />} />
          <Route path="/missing/create" element={<MissingPostCreate />} />
          <Route path="/protected/create" element={<ProtectedPostCreate />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/adoption/:dogId" element={<AdoptionDetail />} />
          <Route path="/adoption/create" element={<AdoptionPostCreate />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/volunteer" element={<VolunteerSignup />} />
          <Route path="/signup/shelter" element={<ShelterSignup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/shelters/:shelterId" element={<ShelterDetail />} />
          
          {/* 봉사 신청 */}
          <Route path="/volunteer-application/create" element={<VolunteerApplicationCreate />} />
          
          {/* 내 봉사 신청 목록 */}
          <Route path="/volunteer-applications/me" element={<MyVolunteerApplications />} />
          
          {/* 봉사 신청 상세 (optional) */}
          <Route path="/volunteer-applications/:applicationId" element={<VolunteerApplicationDetail />} />
          
          {/* Protected Routes */}
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage/volunteer"
            element={
              <ProtectedRoute>
                <VolunteerMyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage/shelter"
            element={
              <ProtectedRoute>
                <ShelterMyPage />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}