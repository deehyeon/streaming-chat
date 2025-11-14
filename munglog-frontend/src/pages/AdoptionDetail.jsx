import React, { useState } from 'react';
import dogCharacter from '../components/logo/돈이 캐릭터 5.svg';

export default function AdoptionDetail({ setCurrentPage, selectedDogId }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 실제로는 selectedDogId로 데이터를 가져와야 하지만 지금은 하드코딩
  const dog = {
    id: 1,
    name: '뽀삐',
    breed: '말티즈',
    region: '강남구',
    shelter: '강남 사랑 보호소',
    age: '2년',
    gender: '여아',
    weight: '3kg',
    description: '안녕하세요! 저는 밝고 활발한 성격의 뽀삐입니다. 사람을 정말 좋아하고 다른 강아지들과도 잘 어울려요. 산책을 좋아하고 간식을 먹는 것을 가장 좋아합니다. 새로운 가족을 만나는 그 날을 손꼽아 기다리고 있어요!',
    characteristics: ['활발함', '사람 좋아함', '산책 좋아함', '사교적'],
    health: '건강 상태 양호',
    vaccinated: '접종 완료',
    neutered: '중성화 완료',
    images: [
      dogCharacter,
      dogCharacter,
      dogCharacter,
      dogCharacter
    ]
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => setCurrentPage('adoption')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">목록으로 돌아가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Images */}
        <div className="flex gap-4">
          {/* Thumbnail Column */}
          <div className="flex flex-col gap-3">
            {dog.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? 'border-yellow-400 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${dog.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = dogCharacter;
                  }}
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1">
            <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="aspect-square flex items-center justify-center p-12">
                <img
                  src={dog.images[selectedImageIndex]}
                  alt={dog.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = dogCharacter;
                  }}
                />
              </div>
              <button className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Information */}
        <div className="space-y-4">
          {/* Shelter Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{dog.shelter}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {dog.name} - {dog.breed}
            </h1>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700">{dog.region}</span>
          </div>

          {/* Info Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">분양 상담 가능</p>
                <p className="text-xs text-yellow-700">보호소 방문 예약 후 직접 만나보실 수 있습니다</p>
              </div>
            </div>
          </div>

          {/* Basic Info Cards */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">나이</p>
                <p className="text-base font-bold text-gray-900">{dog.age}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">성별</p>
                <p className="text-base font-bold text-gray-900">{dog.gender}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">체중</p>
                <p className="text-base font-bold text-gray-900">{dog.weight}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">건강 상태</p>
                <p className="text-base font-bold text-green-600">{dog.health}</p>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">건강 관리</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{dog.vaccinated}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{dog.neutered}</span>
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">성격 특징</h3>
            <div className="flex flex-wrap gap-2">
              {dog.characteristics.map((char, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                >
                  #{char}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">소개</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{dog.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-6 space-y-3 border-t border-gray-200 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <button className="py-4 bg-white border-2 border-yellow-400 text-yellow-600 rounded-xl font-bold hover:bg-yellow-50 transition-colors">
                상담하기
              </button>
              <button className="py-4 bg-yellow-400 text-gray-800 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md">
                분양 신청
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Dogs Section */}
      <div className="mt-20 border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">비슷한 친구들</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={dogCharacter}
                  alt="Similar dog"
                  className="w-36 h-36 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">강아지 {item}</h3>
                <p className="text-sm text-gray-600 mb-2">말티즈 • 2년</p>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-600">4.8</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
