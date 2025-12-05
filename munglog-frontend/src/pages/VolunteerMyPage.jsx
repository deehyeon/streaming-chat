import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getMyInfo } from '../api/memberApi';
import { 
  getMyApplications, 
  getMyApplicationsByStatus, 
  getApplicationDetail,
  cancelApplication 
} from '../api/volunteerApplicationApi';

export default function VolunteerMyPage() {
  const navigate = useNavigate();
  const { handleLogout } = useOutletContext();
  const [activeMenu, setActiveMenu] = useState('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const userData = {
        memberId: localStorage.getItem('memberId'),
        memberEmail: localStorage.getItem('memberEmail'),
        memberName: localStorage.getItem('memberName'),
        memberPhoneNumber: localStorage.getItem('memberPhone'),
        memberRole: localStorage.getItem('userType') === 'volunteer' ? 'VOLUNTEER' : 'SHELTER_OWNER'
      };
      
      console.log('📥 Loaded user data from localStorage:', userData);
      
      if (!userData.memberEmail || !userData.memberName) {
        console.warn('⚠️ Incomplete user data, trying API...');
        // API 호출 시도
        try {
          const response = await getMyInfo();
          console.log('🔍 API Response:', response);
          
          if (response.result === 'SUCCESS') {
            // 🔥 백엔드 응답 데이터 변환
            const transformedData = {
              memberId: response.data.id,
              memberEmail: response.data.email?.email || '',  // 중첩된 email 객체 처리
              memberName: response.data.name,
              memberPhoneNumber: response.data.phoneNumber || '',
              memberRole: response.data.role
            };
            
            console.log('✅ Transformed data:', transformedData);
            
            // 🔥 localStorage에도 저장
            localStorage.setItem('memberId', transformedData.memberId);
            localStorage.setItem('memberEmail', transformedData.memberEmail);
            localStorage.setItem('memberName', transformedData.memberName);
            localStorage.setItem('memberPhone', transformedData.memberPhoneNumber);
            
            setUserData(transformedData);
            setError(null);
            return;
          }
        } catch (apiErr) {
          console.error('API call failed:', apiErr);
        }
      }
      
      setUserData(userData);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('회원 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex -mx-6 -my-6">
      {/* Sidebar */}
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
        {activeMenu === 'info' && userData && (
          <MyInfo 
            userData={userData}
            setShowPasswordModal={setShowPasswordModal}
            setShowPhoneModal={setShowPhoneModal}
            setShowNameModal={setShowNameModal}
            onUpdate={fetchUserData}
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
        <PasswordChangeModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
      {showPhoneModal && userData && (
        <PhoneChangeModal 
          currentPhone={userData.memberPhoneNumber}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => {
            setShowPhoneModal(false);
            fetchUserData();
          }}
        />
      )}
      {showNameModal && userData && (
        <NameChangeModal 
          currentName={userData.memberName}
          onClose={() => setShowNameModal(false)}
          onSuccess={() => {
            setShowNameModal(false);
            fetchUserData();
          }}
        />
      )}
    </div>
  );
}

// 내 정보 탭 - API 연동
function MyInfo({ userData, setShowPasswordModal, setShowPhoneModal, setShowNameModal }) {
  const [emailNotification, setEmailNotification] = useState(false);
  const [smsNotification, setSmsNotification] = useState(false);

  console.log('localStorage data:', {
    memberId: localStorage.getItem('memberId'),
    memberEmail: localStorage.getItem('memberEmail'),
    memberName: localStorage.getItem('memberName'),
    memberPhone: localStorage.getItem('memberPhone')
  });

  // 🔥 userData가 없을 때 처리
  if (!userData) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">회원 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 이메일 마스킹 함수
  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    
    try {
      const [username, domain] = email.split('@');
      if (!username || !domain) return email;
      if (username.length <= 2) return email;
      
      const visiblePart = username.substring(0, 2);
      const maskedPart = '*'.repeat(Math.min(username.length - 2, 7));
      const [domainName, domainExt] = domain.split('.');
      
      if (!domainName || !domainExt) return email;
      
      const maskedDomain = domainName.substring(0, 1) + '*'.repeat(Math.min(domainName.length - 1, 4));
      
      return `${visiblePart}${maskedPart}@${maskedDomain}.${domainExt}`;
    } catch (err) {
      console.error('Email masking error:', err);
      return email;
    }
  };

  // 전화번호 마스킹 함수
  const maskPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '';
    
    try {
      // 010-1234-5678 형식
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length !== 11) return phone;
      
      return `${cleaned.substring(0, 3)}-****-${cleaned.substring(7)}`;
    } catch (err) {
      console.error('Phone masking error:', err);
      return phone;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">기본 정보</h1>

      {/* 이메일 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이메일</h3>
            <p className="text-gray-600 text-sm">{maskEmail(userData.memberEmail)}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (이메일)</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">• 멍로그 및 제휴사의 소식/혜택/이벤트 광고 정보를 받으실 수 있습니다.</p>
            <p className="text-xs text-gray-400">• 광고 및 혜택의 운영방침은 수시 변경 여부와 상관없이 발송됩니다.</p>
          </div>
        </div>
      </div>

      {/* 이름 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이름</h3>
            <p className="text-gray-600 text-sm">{userData.memberName || '정보 없음'}</p>
          </div>
          <button
            onClick={() => setShowNameModal(true)}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
          >
            변경하기
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
            <p className="text-gray-600 text-sm">{maskPhone(userData.memberPhoneNumber) || '정보 없음'}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (앱 알림 또는 문자 메시지)</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={smsNotification}
                  onChange={(e) => setSmsNotification(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">• 앱 알림 또는 문자 메시지가 발송될 수 있습니다.</p>
            <p className="text-xs text-gray-400">• 멍로그 및 제휴사의 소식/혜택/이벤트-광고 정보를 받으실 수 있습니다.</p>
          </div>
          <button
            onClick={() => setShowPhoneModal(true)}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
          >
            변경하기
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
          className="flex items-center justify-between w-full hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-800">비밀번호 변경</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 서비스 이용약관 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <h3 className="text-base font-semibold text-gray-800">서비스 이용약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 개인정보 수집 및 이용 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <h3 className="text-base font-semibold text-gray-800">개인정보 수집 및 이용</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 저작권에 관한 약관 */}
      <div className="mb-6">
        <button className="flex items-center justify-between w-full hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
          <h3 className="text-base font-semibold text-gray-800">저작권에 관한 약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 봉사 신청 정보 탭 - API 연동
function VolunteerApplicationInfo() {
  const [activeTab, setActiveTab] = useState('applied');
  const [applications, setApplications] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // 상태별 카운트를 위한 state
  const [appliedCount, setAppliedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, [activeTab, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'applied') {
        // 신청한 봉사 내역 (PENDING, APPROVED, REJECTED 상태)
        response = await getMyApplications({
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc'
        });
      } else {
        // 완료된 봉사 내역 (APPROVED 상태만)
        response = await getMyApplicationsByStatus('APPROVED', {
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc'
        });
      }

      if (response.result === 'SUCCESS') {
        setApplications(response.data.content);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        
        // 탭별 카운트 설정
        if (activeTab === 'applied') {
          setAppliedCount(response.data.totalElements);
        } else {
          setCompletedCount(response.data.totalElements);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('봉사 신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('봉사 신청을 취소하시겠습니까?')) {
      return;
    }

    try {
      await cancelApplication(applicationId);
      alert('봉사 신청이 취소되었습니다.');
      fetchApplications(); // 목록 새로고침
    } catch (err) {
      console.error('Error cancelling application:', err);
      alert('봉사 신청 취소에 실패했습니다.');
    }
  };

  const handleShowDetail = async (applicationId) => {
    try {
      const response = await getApplicationDetail(applicationId);
      if (response.result === 'SUCCESS') {
        setSelectedApplication(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching application detail:', err);
      alert('상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': { text: '승인 전', color: 'bg-white border border-gray-300 text-gray-700' },
      'APPROVED': { text: '승인 완료', color: 'bg-green-100 text-green-700' },
      'REJECTED': { text: '승인 거절', color: 'bg-red-100 text-red-700' },
      'CANCELLED': { text: '취소됨', color: 'bg-gray-100 text-gray-600' }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (timeStr) => {
    return timeStr ? timeStr.substring(0, 5) : ''; // HH:mm 형식으로
  };

  // 승인 완료된 가장 가까운 봉사 찾기
  const getUpcomingApprovedApplication = () => {
    const approved = applications.filter(app => app.status === 'APPROVED');
    if (approved.length === 0) return null;
    
    const upcoming = approved.find(app => new Date(app.applicationDate) >= new Date());
    return upcoming || approved[0];
  };

  const upcomingApplication = getUpcomingApprovedApplication();

  if (loading && applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchApplications}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">봉사 신청 정보</h1>
      
      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button 
          onClick={() => {
            setActiveTab('applied');
            setCurrentPage(0);
          }}
          className={`pb-3 font-bold text-base ${
            activeTab === 'applied'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400'
          }`}
        >
          신청한 봉사 내역 ({appliedCount})
        </button>
        <button 
          onClick={() => {
            setActiveTab('completed');
            setCurrentPage(0);
          }}
          className={`pb-3 font-bold text-base ${
            activeTab === 'completed'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-400'
          }`}
        >
          완료된 봉사 내역 ({completedCount})
        </button>
      </div>

      {/* Upcoming Notification */}
      {upcomingApplication && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <p className="text-sm text-blue-700 font-medium">
            승인 완료된 봉사 신청 내역이 있습니다!
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {upcomingApplication.shelter.shelterName} | 
            봉사 일정 : {formatDate(upcomingApplication.applicationDate)} | 
            봉사 시간 : {formatTime(upcomingApplication.startTime)} ~ {formatTime(upcomingApplication.endTime)}
          </p>
        </div>
      )}

      {/* Volunteer List */}
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">신청한 봉사 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const statusDisplay = getStatusDisplay(application.status);
            
            return (
              <div
                key={application.applicationId}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {application.shelter.shelterImageUrl ? (
                      <img 
                        src={application.shelter.shelterImageUrl} 
                        alt={application.shelter.shelterName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-blue-500 text-xs">사진</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-gray-800">
                        {application.shelter.shelterName}
                      </h3>
                      <button className={`px-3 py-1 ${statusDisplay.color} rounded-full text-xs font-medium`}>
                        {statusDisplay.text}
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>봉사 날짜: {formatDate(application.applicationDate)}</p>
                      <p>봉사 시간: {formatTime(application.startTime)} ~ {formatTime(application.endTime)}</p>
                      {application.description && (
                        <p className="text-gray-500 mt-2">{application.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button 
                        onClick={() => handleShowDetail(application.applicationId)}
                        className="ml-auto px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200"
                      >
                        상세보기
                      </button>
                      {application.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancelApplication(application.applicationId)}
                          className="px-4 py-1 bg-red-500 text-white rounded-full text-xs font-medium hover:bg-red-600"
                        >
                          취소하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
            if (pageNum >= totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  currentPage === pageNum
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 3 && (
            <span className="text-gray-400">...</span>
          )}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <VolunteerDetailModal 
          application={selectedApplication}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
          onCancel={() => {
            handleCancelApplication(selectedApplication.applicationId);
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}

// Password Change Modal - API 연동
function PasswordChangeModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
      setError('비밀번호는 8-20자 사이여야 합니다.');
      return;
    }

    // 비밀번호 강도 체크 (영문, 숫자, 특수문자 조합)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('영문, 숫자, 특수문자를 조합하여 8-20자로 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const { changePassword } = await import('../api/memberApi');
      
      const response = await changePassword({
        currentPassword,
        newPassword
      });

      if (response.result === 'SUCCESS') {
        alert('비밀번호가 변경되었습니다.');
        onClose();
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">비밀번호 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="영문, 숫자, 특수문자 조합하여 8-20자"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 mb-3 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '변경 중...' : '변경완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Phone Change Modal - API 연동
function PhoneChangeModal({ currentPhone, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('올바른 전화번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      // TODO: 인증번호 전송 API 호출
      // await sendVerificationCode(phoneNumber);
      
      setIsCodeSent(true);
      setError('');
      alert('인증번호가 전송되었습니다.');
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError(err.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (!verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const { changePhone } = await import('../api/memberApi');
      
      const response = await changePhone({
        phoneNumber: phoneNumber.replace(/\D/g, ''), // 숫자만 추출
        verificationCode
      });

      if (response.result === 'SUCCESS') {
        alert('전화번호가 변경되었습니다.');
        onSuccess();
      }
    } catch (err) {
      console.error('Error changing phone:', err);
      setError(err.message || '전화번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">전화번호 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="전화번호 입력 (- 없이)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
              />
              <button 
                onClick={handleSendCode}
                disabled={loading || isCodeSent}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCodeSent ? '전송완료' : '인증번호 전송'}
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button 
            onClick={handleVerifyAndChange}
            disabled={loading || !isCodeSent || !verificationCode}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '변경 중...' : '변경완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Name Change Modal - API 연동
function NameChangeModal({ currentName, onClose, onSuccess }) {
  const [name, setName] = useState(currentName || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || name.trim().length < 2) {
      setError('이름은 2자 이상 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const { changeName } = await import('../api/memberApi');
      
      const response = await changeName({
        memberName: name.trim()
      });

      if (response.result === 'SUCCESS') {
        alert('이름이 변경되었습니다.');
        onSuccess();
      }
    } catch (err) {
      console.error('Error changing name:', err);
      setError(err.message || '이름 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">이름 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              이름 변경 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '변경 중...' : '변경 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// VolunteerMyPage.jsx 파일 맨 아래에 추가

// Volunteer Detail Modal - API 연동
function VolunteerDetailModal({ application, onClose, onCancel }) {
  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': { text: '승인 전', color: 'bg-white border border-gray-300 text-gray-700' },
      'APPROVED': { text: '승인 완료', color: 'bg-green-100 text-green-700' },
      'REJECTED': { text: '승인 거절', color: 'bg-red-100 text-red-700' },
      'CANCELLED': { text: '취소됨', color: 'bg-gray-100 text-gray-600' }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (timeStr) => {
    return timeStr ? timeStr.substring(0, 5) : '';
  };

  const statusDisplay = getStatusDisplay(application.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">봉사 신청 상세</h2>
          <button className={`px-4 py-2 ${statusDisplay.color} rounded-full text-sm font-medium`}>
            {statusDisplay.text}
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            {application.shelter.shelterImageUrl ? (
              <img 
                src={application.shelter.shelterImageUrl} 
                alt={application.shelter.shelterName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-blue-500">사진</span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {application.shelter.shelterName}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">봉사 날짜</span>
                <span className="text-gray-800">{formatDate(application.applicationDate)}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">봉사 시간</span>
                <span className="text-gray-800">
                  {formatTime(application.startTime)} ~ {formatTime(application.endTime)}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">보호소 위치</span>
                <span className="text-gray-800">{application.shelter.shelterAddress}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 font-medium">연락처</span>
                <span className="text-gray-800">{application.shelter.shelterPhoneNumber}</span>
              </div>
              {application.description && (
                <div className="flex">
                  <span className="w-24 text-gray-600 font-medium">신청 메시지</span>
                  <span className="text-gray-800">{application.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {application.status === 'PENDING' && (
            <button 
              onClick={onCancel}
              className="flex-1 py-3 border border-red-300 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              봉사 신청 취소하기
            </button>
          )}
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

// VolunteerHistoryCalendar 컴포넌트도 추가
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
              기억에 남는 순간을 글자로 남겨보세요
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