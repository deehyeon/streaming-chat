// src/pages/VolunteerApplicationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationDetail, cancelApplication } from '../api/volunteerApi';

// 상태별 스타일 매핑
const statusStyles = {
  PENDING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    label: '대기중',
    icon: '⏳',
    description: '보호소의 승인을 기다리고 있습니다.'
  },
  APPROVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    label: '승인됨',
    icon: '✅',
    description: '봉사 신청이 승인되었습니다! 날짜와 시간을 확인해주세요.'
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    label: '거절됨',
    icon: '❌',
    description: '봉사 신청이 거절되었습니다.'
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: '취소됨',
    icon: '🚫',
    description: '봉사 신청이 취소되었습니다.'
  }
};

export default function VolunteerApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getApplicationDetail(applicationId);

      if (response.result === 'SUCCESS') {
        setApplication(response.data);
      } else {
        throw new Error('신청 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching application detail:', err);
      setError(err.response?.data?.message || err.message || '신청 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('정말 이 봉사 신청을 취소하시겠습니까?\n취소 후에는 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelApplication(applicationId);

      if (response.result === 'SUCCESS') {
        alert('봉사 신청이 취소되었습니다.');
        // 상태 업데이트
        setApplication(prev => ({
          ...prev,
          status: 'CANCELLED'
        }));
      } else {
        throw new Error('신청 취소에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error cancelling application:', err);
      alert(err.response?.data?.message || err.message || '신청 취소에 실패했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600">신청 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/volunteer-applications/me')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          신청 목록으로 돌아가기
        </button>
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg font-medium">{error}</p>
          <button
            onClick={fetchApplicationDetail}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const status = statusStyles[application.status];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 뒤로 가기 */}
      <button
        onClick={() => navigate('/volunteer-applications/me')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        신청 목록으로 돌아가기
      </button>

      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">봉사 신청 상세</h1>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${status.bg} ${status.text} flex items-center gap-2`}>
            <span>{status.icon}</span>
            <span>{status.label}</span>
          </span>
        </div>
        <p className="text-gray-600">{status.description}</p>
      </div>

      {/* 보호소 정보 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>🏠</span>
          <span>보호소 정보</span>
        </h2>
        
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-orange-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🏠
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {application.shelterName || '보호소 이름'}
              </h3>
              
              {application.shelterAddress && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 font-medium">📍 주소:</span>
                    <span className="text-gray-800">
                      {application.shelterAddress.streetAddress} {application.shelterAddress.detailAddress}
                      {application.shelterAddress.postalCode && ` (우: ${application.shelterAddress.postalCode})`}
                    </span>
                  </div>
                </div>
              )}

              {application.shelterPhone && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="text-gray-600 font-medium">📞 전화:</span>
                  <span className="text-gray-800">{application.shelterPhone}</span>
                </div>
              )}

              <button
                onClick={() => navigate(`/shelters/${application.shelterId}`)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                보호소 상세보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 봉사 일정 정보 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📅</span>
          <span>봉사 일정</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 날짜 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📅</div>
              <p className="text-sm text-gray-600 mb-2">봉사 날짜</p>
              <p className="text-2xl font-bold text-gray-800">
                {application.volunteerDate}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {formatDateToKorean(application.volunteerDate)}
              </p>
            </div>
          </div>

          {/* 시간 */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⏰</div>
              <p className="text-sm text-gray-600 mb-2">봉사 시간</p>
              <p className="text-2xl font-bold text-gray-800">
                {application.startTime} ~ {application.endTime}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                총 {calculateDuration(application.startTime, application.endTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 신청 내용 */}
      {application.description && (
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>💬</span>
            <span>신청 내용</span>
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {application.description}
            </p>
          </div>
        </div>
      )}

      {/* 신청자 정보 (본인 확인용) */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>👤</span>
          <span>신청자 정보</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {application.volunteerName && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm font-bold text-gray-800">{application.volunteerName}</p>
              </div>
            </div>
          )}

          {application.volunteerEmail && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm font-bold text-gray-800">
                  {typeof application.volunteerEmail === 'object' 
                    ? application.volunteerEmail.email 
                    : application.volunteerEmail}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 신청 이력 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📜</span>
          <span>신청 이력</span>
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">신청 완료</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(application.createdAt)}
                </p>
              </div>
            </div>
            <span className="text-green-500 text-xl">✓</span>
          </div>

          {application.status === 'APPROVED' && application.modifiedAt && (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">승인 완료</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(application.modifiedAt)}
                  </p>
                </div>
              </div>
              <span className="text-green-500 text-xl">✓</span>
            </div>
          )}

          {application.status === 'REJECTED' && application.modifiedAt && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">거절됨</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(application.modifiedAt)}
                  </p>
                </div>
              </div>
              <span className="text-red-500 text-xl">✗</span>
            </div>
          )}

          {application.status === 'CANCELLED' && application.modifiedAt && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">취소됨</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(application.modifiedAt)}
                  </p>
                </div>
              </div>
              <span className="text-gray-500 text-xl">⊘</span>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/volunteer-applications/me')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            목록으로 돌아가기
          </button>

          {application.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={`flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors ${
                cancelling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {cancelling ? '취소 중...' : '신청 취소하기'}
            </button>
          )}

          {application.status === 'APPROVED' && (
            <button
              onClick={() => navigate(`/shelters/${application.shelterId}`)}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
            >
              보호소 상세보기
            </button>
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      {application.status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <div className="text-yellow-500 text-xl">💡</div>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-bold mb-2">대기 중입니다</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>보호소에서 신청을 검토하고 있습니다.</li>
                <li>승인 또는 거절 결과는 이메일로 알림을 받으실 수 있습니다.</li>
                <li>신청을 취소하려면 '신청 취소하기' 버튼을 클릭하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {application.status === 'APPROVED' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <div className="text-green-500 text-xl">🎉</div>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-bold mb-2">승인되었습니다!</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>봉사 날짜와 시간을 다시 한번 확인해주세요.</li>
                <li>당일 보호소에 시간에 맞춰 방문해주세요.</li>
                <li>문의사항이 있으시면 보호소에 직접 연락해주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 유틸리티 함수들

/**
 * 날짜를 한국어 형식으로 변환
 * 예: 2025-01-15 -> 2025년 1월 15일 (수)
 */
function formatDateToKorean(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = days[date.getDay()];
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * 시작 시간과 종료 시간으로 봉사 시간 계산
 * 예: 09:00, 12:00 -> 3시간
 */
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '';
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${minutes}분`;
}

/**
 * ISO 날짜를 한국어 형식으로 변환
 * 예: 2025-01-15T10:30:00 -> 2025년 1월 15일 10:30
 */
function formatDateTime(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}