// src/pages/ShelterDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShelterDetail } from '../api/shelterApi';
import { createPrivateChatRoom } from '../api/chatApi';
import KakaoMap from '../components/KakaoMap';

export default function ShelterDetail() {
  const { shelterId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('info');
  const [shelterPhotoPage, setShelterPhotoPage] = useState(1);
  const [dogPhotoPage, setDogPhotoPage] = useState(1);
  const [shelterData, setShelterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const fetchShelterDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getShelterDetail(shelterId);
      
      if (response.result === 'SUCCESS') {
        setShelterData(response.data);
        setError(null);
      } else {
        setError('보호소 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('보호소 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching shelter detail:', err);
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    if (shelterId) {
      fetchShelterDetail();
    }
  }, [shelterId, fetchShelterDetail]);

  // 🔥 1:1 채팅방 생성 및 이동
  const handleCreateChat = async () => {
    try {
      // 로그인 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      // 보호소 소유자 memberId 확인
      if (!shelterData.shelterOwnerId) {
        alert('보호소 담당자 정보를 찾을 수 없습니다.');
        return;
      }

      setCreatingChat(true);
      console.log('🔄 채팅방 생성 중...', { shelterOwnerId: shelterData.shelterOwnerId });

      // 1:1 채팅방 생성 또는 기존 roomId 가져오기
      const response = await createPrivateChatRoom(shelterData.shelterOwnerId);
      
      console.log('✅ 채팅방 생성 응답:', response);

      if (response.result === 'SUCCESS') {
        const roomId = response.data;
        console.log('📬 채팅방 ID:', roomId);
        
        // 채팅 페이지로 이동하면서 roomId 전달
        navigate('/chat', { state: { roomId, autoOpen: true } });
      } else {
        throw new Error('채팅방 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 채팅방 생성 실패:', err);
      alert(err.message || '채팅방 생성에 실패했습니다.');
    } finally {
      setCreatingChat(false);
    }
  };

  // 🔥 봉사 신청하기 페이지로 이동
  const handleVolunteerApplication = () => {
    // 로그인 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 봉사 신청 페이지로 이동 (shelterId와 shelterName 전달)
    navigate(`/volunteer-application/create`, { 
      state: { 
        shelterId: shelterData.shelterId,
        shelterName: shelterData.name,
        shelterAddress: shelterData.address
      } 
    });
  };

  const itemsPerPage = 8;
  
  const shelterPhotos = shelterData?.shelterImageUrls || [];
  const dogPhotos = shelterData?.shelterDogsImageUrls || [];
  
  const totalShelterPages = Math.ceil(shelterPhotos.length / itemsPerPage);
  const totalDogPages = Math.ceil(dogPhotos.length / itemsPerPage);

  const currentShelterPhotos = shelterPhotos.slice(
    (shelterPhotoPage - 1) * itemsPerPage,
    shelterPhotoPage * itemsPerPage
  );

  const currentDogPhotos = dogPhotos.slice(
    (dogPhotoPage - 1) * itemsPerPage,
    dogPhotoPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-gray-600">보호소 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !shelterData) {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/shelters')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          보호소 목록으로 돌아가기
        </button>
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg font-medium">{error}</p>
          <button
            onClick={fetchShelterDetail}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 주소 문자열 생성
  const fullAddress = shelterData.address ? 
    `${shelterData.address.streetAddress || ''} ${shelterData.address.detailAddress || ''}`.trim() : 
    null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={() => navigate('/shelters')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        보호소 목록으로 돌아가기
      </button>

      {/* 상단 프로필 섹션 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex gap-6 mb-8">
          {/* 로고 */}
          <div className="w-32 h-32 bg-orange-100 rounded-3xl flex items-center justify-center text-6xl flex-shrink-0">
            🏠
          </div>

          {/* 기본 정보 */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{shelterData.name}</h1>
            <div className="space-y-2 text-sm">
              {shelterData.address && (
                <div className="flex items-center">
                  <span className="w-32 text-gray-600 font-medium">주소</span>
                  <span className="text-gray-800">
                    {shelterData.address.streetAddress} {shelterData.address.detailAddress}
                  </span>
                </div>
              )}
              {shelterData.phone && (
                <div className="flex items-center">
                  <span className="w-32 text-gray-600 font-medium">대표자 전화번호</span>
                  <span className="text-gray-800">{shelterData.phone}</span>
                </div>
              )}
              {shelterData.email && (
                <div className="flex items-center">
                  <span className="w-32 text-gray-600 font-medium">이메일</span>
                  <span className="text-gray-800">
                    {typeof shelterData.email === 'object' ? shelterData.email.email : shelterData.email}
                  </span>
                </div>
              )}
              {shelterData.urls && shelterData.urls.length > 0 && (
                shelterData.urls.map((url, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-32 text-gray-600 font-medium">URL {index + 1}</span>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 cursor-pointer hover:underline"
                    >
                      {url}
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 오른쪽 버튼 */}
          <div className="flex flex-row gap-2 items-start">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              찜
            </button>
            <button 
              onClick={handleCreateChat}
              disabled={creatingChat}
              className={`px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 whitespace-nowrap ${
                creatingChat ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {creatingChat ? '생성 중...' : '1:1 채팅'}
            </button>
            <button 
              onClick={handleVolunteerApplication}
              className="px-4 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 whitespace-nowrap"
            >
              봉사 신청하기
            </button>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">보호소 운영 시간</p>
            <p className="text-lg font-bold text-gray-800">
              {shelterData.openingHours || '정보 없음'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">봉사 안내</p>
            <p className="text-sm font-bold text-gray-800">
              {shelterData.volunteerInfo ? 
                (shelterData.volunteerInfo.length > 30 ? 
                  shelterData.volunteerInfo.substring(0, 30) + '...' : 
                  shelterData.volunteerInfo
                ) : '정보 없음'}
            </p>
          </div>
        </div>
      </div>
      {/* 탭 */}
      <div className="flex gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-4 font-bold text-lg transition-all relative ${
            activeTab === 'info'
              ? 'text-red-500'
              : 'text-gray-400'
          }`}
        >
          보호소 정보
          {activeTab === 'info' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`pb-4 font-bold text-lg transition-all relative ${
            activeTab === 'review'
              ? 'text-red-500'
              : 'text-gray-400'
          }`}
        >
          리뷰 (0)
          {activeTab === 'review' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
          )}
        </button>
      </div>

      {/* 보호소 정보 탭 */}
      {activeTab === 'info' && (
        <>
          {/* 보호소 소개글 */}
          {shelterData.description && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 underline">보호소 소개글</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {shelterData.description}
              </div>
            </div>
          )}

          {/* 지도 */}
          {fullAddress && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h3 className="text-base font-bold text-gray-800 mb-4">
                {shelterData.address.streetAddress} {shelterData.address.detailAddress}
                {shelterData.address.postalCode && ` (우: ${shelterData.address.postalCode})`}
              </h3>
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <KakaoMap address={fullAddress} height="384px" />
              </div>
            </div>
          )}

          {/* 보호소 사진 */}
          {shelterPhotos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">보호소 사진</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {currentShelterPhotos.map((photoUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <img 
                      src={photoUrl} 
                      alt={`보호소 사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🏠</div>';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalShelterPages > 1 && (
                <Pagination 
                  currentPage={shelterPhotoPage}
                  totalPages={totalShelterPages}
                  onPageChange={setShelterPhotoPage}
                />
              )}
            </div>
          )}

          {/* 강아지 사진 */}
          {dogPhotos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">강아지 사진</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {currentDogPhotos.map((photoUrl, index) => (
                  <div
                    key={index}
                    className="border-2 border-yellow-300 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img 
                        src={photoUrl} 
                        alt={`강아지 사진 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🐶</div>';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalDogPages > 1 && (
                <Pagination 
                  currentPage={dogPhotoPage}
                  totalPages={totalDogPages}
                  onPageChange={setDogPhotoPage}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* 리뷰 탭 */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-600 text-base font-medium">아직 리뷰가 없습니다</p>
          <p className="text-gray-500 text-sm mt-2">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}

// 페이지네이션 컴포넌트
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
      >
        &lt;
      </button>
      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
        const pageNum = i + 1;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
              currentPage === pageNum
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      {totalPages > 5 && (
        <>
          <span className="text-gray-400">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
      >
        &gt;
      </button>
    </div>
  );
}