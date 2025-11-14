import React, { useState } from 'react';

export default function VolunteerMyPage({ setCurrentPage, handleLogout }) {
  const [activeMenu, setActiveMenu] = useState('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  const userData = {
    email: 'hs*******@n****.com',
    name: '홍길동',
    phone: '010-****-9217'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex -mx-6 -my-6">
      {/* Sidebar - 화면 제일 왼쪽에 고정 */}
      <div className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">마이페이지</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveMenu('info')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'info'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">👤</span> 내 정보
            </button>
            <button
              onClick={() => setActiveMenu('volunteer')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'volunteer'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">🤝</span> 봉사 신청 정보
            </button>
            <button
              onClick={() => setActiveMenu('history')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'history'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">📝</span> 봉사 활동 기록
            </button>
            <button
              onClick={() => setActiveMenu('shelter')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'shelter'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">🐕</span> 캠핑 보호소
            </button>
          </nav>
          
          <button 
            onClick={handleLogout}
            className="w-full mt-8 px-4 py-3 text-left text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-2"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 px-12 max-w-7xl mx-auto">
        {activeMenu === 'info' && (
          <MyInfo 
            userData={userData}
            setShowPasswordModal={setShowPasswordModal}
            setShowPhoneModal={setShowPhoneModal}
            setShowNameModal={setShowNameModal}
          />
        )}

        {activeMenu === 'volunteer' && (
          <VolunteerApplicationInfo />
        )}

        {activeMenu === 'history' && (
          <VolunteerHistoryCalendar />
        )}
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showPhoneModal && (
        <PhoneChangeModal onClose={() => setShowPhoneModal(false)} />
      )}
      {showNameModal && (
        <NameChangeModal onClose={() => setShowNameModal(false)} />
      )}
    </div>
  );
}

// 내 정보 탭
function MyInfo({ userData, setShowPasswordModal, setShowPhoneModal, setShowNameModal }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">기본 정보</h1>

      {/* 이메일 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이메일</h3>
            <p className="text-gray-600 text-sm">{userData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (이메일)</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">• CONIC 및 제휴사의 소식/혜택/이벤트 광고 정보를 받으실 수 있습니다.</p>
            <p className="text-xs text-gray-400">• 광고 및 혜택의 운영방침은 수시 변경 여부와 상관없이 발송됩니다.</p>
          </div>
        </div>
      </div>

      {/* 이름 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이름</h3>
            <p className="text-gray-600 text-sm">{userData.name}</p>
          </div>
          <button
            onClick={() => setShowNameModal(true)}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
          >
            홍길동
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 전화번호 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">전화번호</h3>
            <p className="text-gray-600 text-sm">{userData.phone}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (앱 알림 또는 문자 메시지)</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">• CONIC 또는 문자 메시지를 발송이 발송될 수 있습니다.</p>
            <p className="text-xs text-gray-400">• CONIC 및 제휴사의 소식/혜택/이벤트-광고 정보를 받으실 수 있습니다.</p>
          </div>
          <button
            onClick={() => setShowPhoneModal(true)}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
          >
            {userData.phone}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-base font-semibold text-gray-800">비밀번호 변경</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 서비스 이용약관 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">서비스 이용약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 개인정보 수집 및 이용 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">개인정보 수집 및 이용</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 저작권에 관한 약관 */}
      <div className="mb-6">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">저작권에 관한 약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 봉사 신청 정보 탭
function VolunteerApplicationInfo() {
  const [activeTab, setActiveTab] = useState('applied');
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">봉사 신청 정보</h1>
      
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('applied')}
          className={`pb-3 font-bold text-base ${
            activeTab === 'applied'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400'
          }`}
        >
          신청한 봉사 내역 (28)
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 font-bold text-base ${
            activeTab === 'completed'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400'
          }`}
        >
          완료된 봉사 내역 (3)
        </button>
      </div>

      {/* Notification */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <p className="text-sm text-blue-700 font-medium">
          승인 완료된 봉사 신청 내역이 있습니다!
        </p>
        <p className="text-xs text-blue-600 mt-1">
          강남 보호소 | 봉사 일정 : 2025.09.02(화) | 봉사 시간 : 10:00 ~ 14:00
        </p>
      </div>

      {/* Volunteer List */}
      <div className="space-y-4">
        {[
          { id: 1, status: '승인 전', statusColor: 'bg-white border border-gray-300 text-gray-700' },
          { id: 2, status: '승인 거절', statusColor: 'bg-gray-100 text-gray-600' },
          { id: 3, status: '승인 완료', statusColor: 'bg-gray-100 text-gray-600' }
        ].map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-xs">사진</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-800">강남 보호소</h3>
                  <button className={`px-3 py-1 ${item.statusColor} rounded-full text-xs font-medium`}>
                    {item.status}
                  </button>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>봉사 날짜: 2025. 08. 0{item.id}(월)</p>
                  <p>봉사 시간: 10:00 ~ 14:00</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-gray-400">♡</span>
                  <span className="text-xs text-gray-600">123</span>
                  <button 
                    onClick={() => setShowDetailModal(true)}
                    className="ml-auto px-4 py-1 bg-red-500 text-white rounded-full text-xs font-medium hover:bg-red-600"
                  >
                    취소하기
                  </button>
                </div>
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
        <button className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full text-sm font-medium">1</button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm">2</button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm">3</button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm">4</button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full text-sm">5</button>
        <span className="text-gray-400">...</span>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
          &gt;
        </button>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <VolunteerDetailModal onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}

// 봉사 활동 기록 탭 (캘린더)
function VolunteerHistoryCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 8)); // 2025년 10월 8일
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 2)); // 2024년 3월

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    '01월', '02월', '03월', '04월', '05월', '06월',
    '07월', '08월', '09월', '10월', '11월', '12월'
  ];

  const volunteeredDays = [15, 27]; // 봉사 활동한 날짜

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">봉사 활동 기록</h1>

      {/* 상단 메시지 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="text-2xl">🐕</span>
          <p>
            <span className="font-bold">##</span> 님은 지금까지 
            <span className="font-bold text-red-500"> n 회의 봉사를 진행</span>하였어요!
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* 캘린더 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              &lt;
            </button>
            <h2 className="text-xl font-bold">
              {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              &gt;
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isVolunteered = volunteeredDays.includes(day);
              
              return (
                <button
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium relative ${
                    isVolunteered
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {day}
                  {isVolunteered && (
                    <div className="absolute bottom-1 right-1 text-xl">🐕</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 선택된 날짜 상세 정보 */}
        <div className="w-96 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            2025년 10월 8일
          </h3>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-xs">사진</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1">강남 보호소</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>봉사 날짜: 2025.08.02</p>
                  <p>봉사 시간: 10:00 ~ 14:00</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">보호소 위치</p>
              <p className="text-xs text-gray-600">경기도 광주시 어메고 지메고</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 placeholder-gray-400">
              기억에 남는 순간을 알자로 남겨보세요
            </p>
          </div>

          <button className="w-full mt-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg transition-colors">
            봉사 일지 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}

// Password Change Modal
function PasswordChangeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">비밀번호 변경</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="현재 비밀번호를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="영문, 숫자, 특수문자 조합하여 8-20자"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 mb-3 text-sm"
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">
            변경완료
          </button>
        </div>
      </div>
    </div>
  );
}

// Phone Change Modal
function PhoneChangeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">전화번호 변경</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="전화번호 입력"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              />
              <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-300">
                인증번호 전송
              </button>
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="인증번호 입력"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              />
              <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-300">
                인증번호 확인
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">
            변경완료
          </button>
        </div>
      </div>
    </div>
  );
}

// Name Change Modal
function NameChangeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">이름 변경</h2>
        
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            이름 변경 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="이름을 입력해주세요."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">
            변경 완료
          </button>
        </div>
      </div>
    </div>
  );
}

// Volunteer Detail Modal
function VolunteerDetailModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">봉사 신청 내역</h2>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            승인 전
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-500">사진</span>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">강남 보호소</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">봉사 날짜</span>
                <span className="text-gray-800">2025.08.02</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">봉사 시간</span>
                <span className="text-gray-800">10:00 ~ 14:00</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">보호소 위치</span>
                <span className="text-gray-800">경기도 광주시 어메고 지메고</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">
            봉사 신청 취소하기
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
