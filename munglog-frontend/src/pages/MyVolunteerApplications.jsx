// src/pages/MyVolunteerApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications, getMyApplicationsByStatus, cancelApplication } from '../api/volunteerApi';

// 상태별 스타일 매핑
const statusStyles = {
  PENDING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: '대기중'
  },
  APPROVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: '승인됨'
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: '거절됨'
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: '취소됨'
  }
};

export default function MyVolunteerApplications() {
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size: 10,
        sort: 'createdAt,desc'
      };

      let response;
      if (selectedStatus === 'ALL') {
        response = await getMyApplications(params);
      } else {
        response = await getMyApplicationsByStatus(selectedStatus, params);
      }

      if (response.result === 'SUCCESS') {
        setApplications(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        throw new Error('신청 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || '신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('정말 이 봉사 신청을 취소하시겠습니까?')) {
      return;
    }

    try {
      const response = await cancelApplication(applicationId);
      
      if (response.result === 'SUCCESS') {
        alert('봉사 신청이 취소되었습니다.');
        fetchApplications();
      } else {
        throw new Error('신청 취소에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error canceling application:', err);
      alert(err.response?.data?.message || err.message || '신청 취소에 실패했습니다.');
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPage(0);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600">신청 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">내 봉사 신청 내역</h1>
        <p className="text-gray-600">보호소에 신청한 봉사 활동 내역을 확인할 수 있습니다</p>
      </div>

      {/* 상태 필터 */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'ALL'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'PENDING'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            대기중
          </button>
          <button
            onClick={() => handleStatusFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'APPROVED'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            승인됨
          </button>
          <button
            onClick={() => handleStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'REJECTED'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            거절됨
          </button>
          <button
            onClick={() => handleStatusFilter('CANCELLED')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'CANCELLED'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            취소됨
          </button>
        </div>
      </div>

      {/* 신청 목록 */}
      {error ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg font-medium">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600 text-lg font-medium">신청 내역이 없습니다</p>
          <p className="text-gray-500 text-sm mt-2">보호소에 봉사를 신청해보세요!</p>
          <button
            onClick={() => navigate('/shelters')}
            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
          >
            보호소 둘러보기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application.applicationId}
              application={application}
              onCancel={handleCancelApplication}
              onViewDetail={() => navigate(`/volunteer-applications/${application.applicationId}`)}
            />
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-30"
              >
                이전
              </button>
              <span className="px-4 py-2 text-gray-700">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-30"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 신청 카드 컴포넌트
function ApplicationCard({ application, onCancel, onViewDetail }) {
  const status = statusStyles[application.status];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        {/* 왼쪽: 보호소 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
              🏠
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {application.shelterName || '보호소 이름'}
              </h3>
              <p className="text-sm text-gray-500">
                {application.shelterAddress?.streetAddress || '주소 정보 없음'}
              </p>
            </div>
          </div>

          {/* 봉사 일정 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">📅 날짜:</span>
              <span className="text-gray-800">{application.volunteerDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">⏰ 시간:</span>
              <span className="text-gray-800">
                {application.startTime} ~ {application.endTime}
              </span>
            </div>
            {application.description && (
              <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">💬</span>
                <span className="text-gray-700 flex-1">{application.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 상태 및 액션 */}
        <div className="flex flex-col items-end gap-3 ml-6">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.bg} ${status.text}`}>
            {status.label}
          </span>

          <div className="flex flex-col gap-2">
            <button
              onClick={onViewDetail}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              상세보기
            </button>
            
            {application.status === 'PENDING' && (
              <button
                onClick={() => onCancel(application.applicationId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 whitespace-nowrap"
              >
                신청 취소
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            신청일: {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}