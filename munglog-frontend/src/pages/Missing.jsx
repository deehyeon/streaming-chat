import React, { useState } from 'react';
import MissingDetailModal from '../components/MissingDetailModal';
import ProtectedDetailModal from '../components/ProtectedDetailModal';

export default function Missing({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('missing');
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [sortOrder, setSortOrder] = useState('최신순');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleCreatePost = () => {
    if (activeTab === 'missing') {
      setCurrentPage('missing-post-create');
    } else {
      setCurrentPage('protected-post-create');
    }
  };

  // 게시글 데이터 (예시)
  const missingPosts = [
    {
      id: 1,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '수컷',
      status: '실종',
      description: '비숑 프리제 수컷 3살입니다. 경기도 동탄시 오포동 농협은행 건너편에서 실종되었습니다. 목에 파란색 목줄을 하고 있었으며, 사람을 좋아하는 성격입니다. 발견하신 분은 꼭 연락 부탁드립니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 2,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 3,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 4,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 5,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 6,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 7,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 8,
      title: '비숑 프리제를 찾습니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      age: '3세',
      gender: '비숑 프리제',
      status: '실종',
      description: '실종된 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    }
  ];

  const protectedPosts = [
    {
      id: 1,
      title: '비숑 프리제를 보호중입니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      breed: '비숑 프리제',
      sex: '수컷',
      gender: '비숑 프리제',
      status: '보호',
      description: '비숑 프리제 수컷을 보호중입니다. 경기도 동탄시 오포동 농협은행 근처에서 발견하여 현재 보호소에서 보호하고 있습니다. 목에 파란색 목줄을 착용하고 있었으며 사람을 잘 따릅니다. 주인을 찾습니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 2,
      title: '비숑 프리제를 보호중입니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      breed: '비숑 프리제',
      sex: '암컷',
      gender: '비숑 프리제',
      status: '보호',
      description: '보호중인 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    },
    {
      id: 3,
      title: '비숑 프리제를 보호중입니다.',
      foundLocation: '경기도 동탄시 오포동 농협은행 건너',
      foundDate: '2021.05.18',
      breed: '비숑 프리제',
      sex: '수컷',
      gender: '비숑 프리제',
      status: '보호',
      description: '보호중인 반려견에 대한 자세한 설명입니다.',
      image: '/images/dog-character.png'
    }
  ];

  const currentPosts = activeTab === 'missing' ? missingPosts : protectedPosts;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">실종 동물을 찾습니다.</h1>
          <div className="flex justify-center mb-4">
            <img 
              src="/images/dog-character.png" 
              alt="강아지 캐릭터" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">🐶</text></svg>';
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            동물이 실종되었다면 '<span className="text-red-500 font-semibold">실종 게시판</span>'에, 
            발견하여 보호중이라면 '<span className="text-red-500 font-semibold">보호게시판</span>'에 글을 작성해주세요
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('missing')}
            className={`pb-4 font-bold text-base transition-all relative ${
              activeTab === 'missing'
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          >
            실종 게시판 (28)
            {activeTab === 'missing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('protected')}
            className={`pb-4 font-bold text-base transition-all relative ${
              activeTab === 'protected'
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          >
            보호 게시판 (3)
            {activeTab === 'protected' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
            )}
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50">
            강남구
          </button>
          
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <option>최신순</option>
            <option>오래된순</option>
            <option>인기순</option>
          </select>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="검색하기"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </button>
          </div>

          <button 
            onClick={handleCreatePost}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
          >
            게시글 작성
          </button>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span>주인을 찾은 강아지도 보기</span>
        </label>

        {/* Posts Grid */}
        <div className="space-y-4">
          {currentPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex gap-4">
                {/* Dog Image */}
                <div className="flex-shrink-0">
                  <img
                    src={post.image}
                    alt="강아지"
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="60" font-size="60">🐶</text></svg>';
                    }}
                  />
                </div>

                {/* Post Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-2">{post.title}</h3>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-20">발견시간 & 장소 :</span>
                        <span>{post.foundLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-20">발견시각 날짜 :</span>
                        <span>{post.foundDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-20">{activeTab === 'missing' ? '나이' : '종'} :</span>
                        <span>{activeTab === 'missing' ? post.age : post.breed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-20">성별 :</span>
                        <span>{post.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-2">
                    <button className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1">
                      자세히 보기
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Status Button */}
                <div className="flex-shrink-0">
                  <button className="px-4 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                    {post.status}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white text-sm font-medium">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm">
            4
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 text-sm">
            5
          </button>
          <span className="text-gray-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            &gt;
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeTab === 'missing' ? (
        <MissingDetailModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={selectedPost}
        />
      ) : (
        <ProtectedDetailModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={selectedPost}
        />
      )}
    </>
  );
}
