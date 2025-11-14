import React, { useState } from 'react';
import dogCharacter from '../components/logo/돈이 캐릭터 5.svg';

export default function Adoption({ 
  selectedRegion, 
  setIsLocationModalOpen,
  likedItems,
  toggleLike,
  setCurrentPage,
  setSelectedDogId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const handleDogClick = (dogId) => {
    setSelectedDogId(dogId);
    setCurrentPage('adoption-detail');
  };

  const handleCreatePost = () => {
    setCurrentPage('adoption-post-create');
  };

  const dogs = [
    {
      id: 1,
      name: '뽀삐',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 2,
      name: '초코',
      breed: '푸들',
      region: '강남구',
      age: '0년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 3,
      name: '버터',
      breed: '골든 리트리버',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 4,
      name: '하늘',
      breed: '시츄',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 5,
      name: '봄이',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 6,
      name: '구름',
      breed: '비글',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 7,
      name: '별이',
      breed: '푸들',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 8,
      name: '해피',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 9,
      name: '달이',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 10,
      name: '뽀뽀',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 11,
      name: '몽이',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    },
    {
      id: 12,
      name: '코코',
      breed: '말티즈',
      region: '강남구',
      age: '2년',
      gender: '여아',
      weight: '3kg',
      adopted: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          새로운 가족을 찾아요
        </h1>
        <div className="flex justify-center mb-4">
          <img 
            src={dogCharacter}
            alt="강아지 캐릭터" 
            className="w-32 h-32 object-contain"
          />
        </div>
        <p className="text-gray-600 text-sm">
          따뜻한 가정에서 사랑받을 반려견들이 기다리고 있어요!
        </p>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
        >
          {selectedRegion}
        </button>

        <select
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none"
        >
          <option value="all">나이 전체</option>
          <option value="1">1년 미만</option>
          <option value="1-3">1-3년</option>
          <option value="3+">3년 이상</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none"
        >
          <option value="all">성별 전체</option>
          <option value="male">남아</option>
          <option value="female">여아</option>
        </select>

        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색하기"
            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </button>
        </div>

        <button 
          onClick={handleCreatePost}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 ml-auto whitespace-nowrap"
        >
          게시글 작성
        </button>
      </div>

      {/* Dogs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dogs.map((dog) => (
          <div
            key={dog.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden relative border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleDogClick(dog.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(dog.id);
              }}
              className="absolute top-3 right-3 z-10 text-2xl"
            >
              {likedItems.has(dog.id) ? '❤️' : '🤍'}
            </button>

            {dog.adopted && (
              <div className="absolute top-3 left-3 z-10 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                분양완료
              </div>
            )}

            <div className="h-48 flex items-center justify-center bg-gray-100">
              <img 
                src={dogCharacter}
                alt={dog.name}
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-800">{dog.name}</h3>
                <span className="text-xs text-gray-600">{dog.region}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{dog.breed}</p>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div>
                  <p className="text-gray-500">나이</p>
                  <p className="font-semibold text-gray-800">{dog.age}</p>
                </div>
                <div>
                  <p className="text-gray-500">성별</p>
                  <p className="font-semibold text-gray-800">{dog.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">체중</p>
                  <p className="font-semibold text-gray-800">{dog.weight}</p>
                </div>
              </div>

              <button 
                className="w-full py-2 bg-yellow-400 text-gray-800 rounded-full text-sm font-bold hover:bg-yellow-500 transition-colors"
              >
                자세히 보기
              </button>
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
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
          &gt;
        </button>
      </div>
    </div>
  );
}
