import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { getShelters, searchSheltersByName } from '../api/shelterApi';
import KakaoMap from '../components/KakaoMap';

export default function Shelters() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    setIsLocationModalOpen,
    selectedRegion
  } = useOutletContext();

  // URL에서 파라미터 읽기
  const regionParam = searchParams.get('region') || selectedRegion || '강남구';
  const pageParam = parseInt(searchParams.get('page') || '0');
  const searchParam = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [activeFilter, setActiveFilter] = useState('volunteer');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(0);
  const [likedItems, setLikedItems] = useState(new Set());

  const filters = [
    { id: 'volunteer', label: '🤝 봉사가능' },
    { id: 'shelter', label: '🏠 보호소' },
    { id: 'consulting', label: '👨‍⚕️ 컨설팅' },
    { id: 'distance', label: '📍 거리순' }
  ];

  const fetchShelters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getShelters({
        region: regionParam === '전국' ? null : regionParam,
        page: currentPage,
        size: 10
      });

      setShelters(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('보호소 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching shelters:', err);
    } finally {
      setLoading(false);
    }
  }, [regionParam, currentPage]);

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await searchSheltersByName(searchQuery, currentPage);
      setShelters(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('검색에 실패했습니다.');
      console.error('Error searching shelters:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = {};
    if (regionParam !== '전국') params.region = regionParam;
    if (currentPage > 0) params.page = currentPage.toString();
    if (searchQuery) params.search = searchQuery;
    
    setSearchParams(params);
  }, [regionParam, currentPage, searchQuery, setSearchParams]);

  // 보호소 목록 조회
  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  // 검색어 변경 시 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        fetchShelters();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch, fetchShelters]);

  const handleShelterClick = (shelterId) => {
    navigate(`/shelters/${shelterId}`);
  };

  const toggleLike = (shelterId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shelterId)) {
        newSet.delete(shelterId);
      } else {
        newSet.add(shelterId);
      }
      return newSet;
    });
  };

  // 거리 계산 (임시)
  const calculateDistance = (address) => {
    return `${(Math.random() * 5).toFixed(1)}km`;
  };

  if (loading && shelters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🐕</div>
          <p className="text-gray-600">보호소 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 overflow-hidden">
        <div className="absolute top-10 left-20 text-2xl opacity-40">🐾</div>
        <div className="absolute top-32 right-32 text-2xl opacity-40">🐾</div>
        <div className="absolute bottom-20 left-1/4 text-2xl opacity-40">🐾</div>
        <div className="absolute bottom-32 right-20 text-2xl opacity-40">🐾</div>

        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-block bg-yellow-400 text-gray-800 px-8 py-4 rounded-full font-bold text-lg shadow-lg">
              당신과 함께 갈 보호소를 찾아볼까요? 🐕
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold">보호소 지킴이도</span>
                <span className="text-2xl">🐾</span>
              </div>
              <p className="text-gray-600 text-sm">
                신뢰할 지역의 보호소 위치가 표시됩니다
              </p>
            </div>
          </div>

          {/* Kakao Map */}
          <div className="w-full h-96 bg-white rounded-lg shadow-md overflow-hidden">
            <KakaoMap shelters={shelters} height="384px" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-yellow-400 transition-colors font-medium"
          >
            📍 {regionParam}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="보호소 이름으로 검색"
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:border-yellow-400 focus:outline-none"
            />
            <svg 
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-yellow-400 text-gray-800 shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchShelters}
            className="mt-2 text-red-500 hover:text-red-700 font-medium text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Shelter List */}
      {shelters.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-gray-600 text-lg font-medium">보호소를 찾을 수 없습니다</p>
          <p className="text-gray-500 text-sm mt-2">다른 지역을 선택하거나 검색어를 변경해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shelters.map((shelter) => (
            <div
              key={shelter.shelterId}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleShelterClick(shelter.shelterId)}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  🏠
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-800">
                      {shelter.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(shelter.shelterId);
                      }}
                      className="text-xl hover:scale-110 transition-transform"
                    >
                      {likedItems.has(shelter.shelterId) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 font-semibold">
                        📍 {calculateDistance(shelter.address)}
                      </span>
                      <span>
                        {shelter.address?.streetAddress || shelter.address?.detailAddress || '주소 정보 없음'}
                      </span>
                    </div>
                    {shelter.openingHours && (
                      <div className="flex items-center gap-2">
                        <span>🕐 {shelter.openingHours}</span>
                      </div>
                    )}
                    {shelter.volunteerInfo && (
                      <div className="flex items-center gap-2">
                        <span>🤝 {shelter.volunteerInfo.substring(0, 50)}{shelter.volunteerInfo.length > 50 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="font-bold text-gray-800 text-sm">-</span>
                      <span className="text-gray-500 text-xs">(리뷰 준비중)</span>
                    </div>
                    <button className="text-yellow-500 hover:text-yellow-600 font-medium text-sm flex items-center gap-1 group">
                      자세히
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            이전
          </button>
          <span className="px-4 py-2 text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}