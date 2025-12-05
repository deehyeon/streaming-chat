// src/pages/VolunteerApplicationCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createVolunteerApplication } from '../api/volunteerApi';

export default function VolunteerApplicationCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ShelterDetail에서 전달받은 데이터
  const { shelterId, shelterName, shelterAddress } = location.state || {};

  const [formData, setFormData] = useState({
    shelterId: shelterId || '',
    volunteerDate: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // shelterId가 없으면 보호소 목록으로 리다이렉트
  useEffect(() => {
    if (!shelterId) {
      alert('보호소 정보가 없습니다.');
      navigate('/shelters');
    }
  }, [shelterId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 날짜 검증
    if (!formData.volunteerDate) {
      newErrors.volunteerDate = '봉사 날짜를 선택해주세요.';
    } else {
      const selectedDate = new Date(formData.volunteerDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.volunteerDate = '과거 날짜로는 신청할 수 없습니다.';
      }
    }

    // 시작 시간 검증
    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요.';
    }

    // 종료 시간 검증
    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요.';
    }

    // 시간 논리 검증
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        shelterId: formData.shelterId,
        volunteerDate: formData.volunteerDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description || null
      };

      console.log('📤 봉사 신청 데이터:', requestData);

      const response = await createVolunteerApplication(requestData);

      console.log('✅ 봉사 신청 성공:', response);

      if (response.result === 'SUCCESS') {
        alert('봉사 신청이 완료되었습니다!');
        // 신청 내역 페이지로 이동
        navigate('/volunteer-applications/me');
      } else {
        throw new Error(response.message || '봉사 신청에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 봉사 신청 실패:', err);
      alert(err.response?.data?.message || err.message || '봉사 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 오늘 날짜 (최소 선택 가능 날짜)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 뒤로 가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        뒤로 가기
      </button>

      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">봉사 신청하기</h1>
        <p className="text-gray-600">보호소에 봉사를 신청합니다</p>
      </div>

      {/* 보호소 정보 */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-200 rounded-2xl flex items-center justify-center text-3xl">
            🏠
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{shelterName}</h2>
            {shelterAddress && (
              <p className="text-sm text-gray-600 mt-1">
                {shelterAddress.streetAddress} {shelterAddress.detailAddress}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 신청 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
        {/* 봉사 날짜 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            봉사 날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="volunteerDate"
            value={formData.volunteerDate}
            onChange={handleChange}
            min={today}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.volunteerDate 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-orange-500'
            }`}
          />
          {errors.volunteerDate && (
            <p className="mt-1 text-sm text-red-500">{errors.volunteerDate}</p>
          )}
        </div>

        {/* 시간 선택 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 시작 시간 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              시작 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.startTime 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
            )}
          </div>

          {/* 종료 시간 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              종료 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.endTime 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* 신청 내용 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            신청 내용 (선택)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="봉사 활동에 참여하고 싶은 이유나 메시지를 작성해주세요. (선택사항)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            maxLength={500}
          />
          <p className="mt-1 text-sm text-gray-500 text-right">
            {formData.description.length} / 500
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-bold mb-2">신청 전 확인해주세요</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>같은 날짜에 같은 보호소에 중복 신청은 불가능합니다.</li>
                <li>과거 날짜로는 신청할 수 없습니다.</li>
                <li>보호소 승인 후 봉사 활동이 확정됩니다.</li>
                <li>신청 후 마이페이지에서 신청 내역을 확인할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '신청 중...' : '봉사 신청하기'}
          </button>
        </div>
      </form>
    </div>
  );
}