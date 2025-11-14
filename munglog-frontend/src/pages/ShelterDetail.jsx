import React, { useState } from 'react';

export default function ShelterDetail({ shelterId, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('info');
  const [shelterPhotoPage, setShelterPhotoPage] = useState(1);
  const [dogPhotoPage, setDogPhotoPage] = useState(1);

  // 보호소 데이터 (예시)
  const shelterData = {
    id: shelterId,
    name: '강남 보호소',
    logo: '🐶',
    address: '주소:',
    managerName: '홍길동',
    email: 'uiuiuiui@naver.com',
    phone: '010-0000-0000',
    instagramUrl: '인스타그램 URL',
    websiteUrl: '홈페이지 URL',
    hours: '09:00 - 18:00',
    volunteerPeriod: '약 3개월',
    volunteerCount: '200건',
    area: '10건',
    description: `코스님은 능가 빙 현저 하였으며, 품에 웃 것은 쓸쓸하럴라 쓸쓸하럴라.

당신은 1999년 설립된 이래 전력 생산, 송전, 배전 및 판자 산업 분야의 최고 품질의 제품 생산을 목표로 하고 있습니다.
기술, 고객 중심 및 품질에 대한 타협하지 않는 관심은 모두 우리 성공의 기본입니다.

코스님은 회사로서 항상 기존 시장 리더의 추종자로서 비즈니스를 추구하기 보다는 자체 의제를 설정하기 위해 노력합니다.
코스님은 기계 및 전력산업의 고용할 수요를 기반으로 비즈닥속 생산 및 가공기술 개발에서 경쟁력을 확보하고 있으며
초고압을 떠다로맘 일할 제품인 등 부스바를 생산하며 지속적인 성장을 기록하고 있습니다.
부품의 정확한 사양과 신뢰성에 대한 설계, 이해, 기술 및 연구 개발을 제공합니다.
날로 복잡해지고 다양해지는 고객의 요구사항에 적절히 대응하고 혁신을 통해 우수한 부가가치 제품을 제공하기 위해 더욱 경쟁력 있고 역동적인 기업이 되도록 향상 노력하겠습니다.`,
    mapAddress: '공공데이터: 충북 청주시 충대로1길 실태 주소',
    reviewCount: 0
  };

  // 보호소 사진 (8개씩 페이지)
  const shelterPhotos = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    image: '🏠'
  }));

  // 강아지 사진 (8개씩 페이지)
  const dogPhotos = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: '강아지 이름',
    gender: '수',
    ageInfo: '나이 / 상태',
    image: '🐶'
  }));

  const itemsPerPage = 8;
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={() => setCurrentPage('shelters')}
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
            {shelterData.logo}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{shelterData.name}</h1>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">주소</span>
                <span className="text-gray-800">{shelterData.address}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">대표자명</span>
                <span className="text-gray-800">{shelterData.managerName}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">대표자 이메일</span>
                <span className="text-gray-800">{shelterData.email}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">대표자 전화번호</span>
                <span className="text-gray-800">{shelterData.phone}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">URL</span>
                <span className="text-blue-600 cursor-pointer hover:underline">{shelterData.instagramUrl}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-600 font-medium">URL</span>
                <span className="text-blue-600 cursor-pointer hover:underline">{shelterData.websiteUrl}</span>
              </div>
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
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              1:1 채팅
            </button>
            <button className="px-4 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 whitespace-nowrap">
              봉사 신청하기
            </button>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">보호소 운영 오일 / 시간</p>
            <p className="text-lg font-bold text-gray-800">{shelterData.hours}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">봉사 가능 오일 / 시간</p>
            <p className="text-lg font-bold text-gray-800">{shelterData.volunteerPeriod}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">봉사 진행 횟수</p>
            <p className="text-lg font-bold text-gray-800">{shelterData.volunteerCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">면적</p>
            <p className="text-lg font-bold text-gray-800">{shelterData.area}</p>
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
          리뷰 ({shelterData.reviewCount})
          {activeTab === 'review' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
          )}
        </button>
      </div>

      {/* 보호소 소개글 */}
      {activeTab === 'info' && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 underline">보호소 소개글</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {shelterData.description}
            </div>
          </div>

          {/* 지도 */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-base font-bold text-gray-800 mb-4">{shelterData.mapAddress}</h3>
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-500">지도 영역</p>
              </div>
            </div>
          </div>

          {/* 보호소 사진 */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">보호소 사진</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {currentShelterPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-5xl hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {photo.image}
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setShelterPhotoPage(Math.max(1, shelterPhotoPage - 1))}
                disabled={shelterPhotoPage === 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, totalShelterPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setShelterPhotoPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      shelterPhotoPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalShelterPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setShelterPhotoPage(totalShelterPages)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm"
                  >
                    {totalShelterPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setShelterPhotoPage(Math.min(totalShelterPages, shelterPhotoPage + 1))}
                disabled={shelterPhotoPage === totalShelterPages}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* 강아지 사진 */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">강아지 사진</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {currentDogPhotos.map((dog) => (
                <div
                  key={dog.id}
                  className="border-2 border-yellow-300 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-6xl mb-3">
                    {dog.image}
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{dog.name}</h4>
                  <p className="text-xs text-gray-500">{dog.gender}</p>
                  <p className="text-xs text-gray-500">{dog.ageInfo}</p>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDogPhotoPage(Math.max(1, dogPhotoPage - 1))}
                disabled={dogPhotoPage === 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, totalDogPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setDogPhotoPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      dogPhotoPage === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalDogPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setDogPhotoPage(totalDogPages)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm"
                  >
                    {totalDogPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setDogPhotoPage(Math.min(totalDogPages, dogPhotoPage + 1))}
                disabled={dogPhotoPage === totalDogPages}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                &gt;
              </button>
            </div>
          </div>
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
