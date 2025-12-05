const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
    throw new Error(error.error?.message || error.message || '요청이 실패했습니다.');
  }

  return response.json();
}

/**
 * 봉사 신청하기
 */
export async function createVolunteerApplication(applicationData) {
  return apiCall('/v1/volunteer-applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
}

/**
 * 내가 신청한 봉사 목록 조회
 */
export async function getMyApplications(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/v1/volunteer-applications/me${queryString ? `?${queryString}` : ''}`;
  
  return apiCall(endpoint);
}

/**
 * 내가 신청한 봉사 상태별 조회
 */
export async function getMyApplicationsByStatus(status, params = {}) {
  const queryParams = new URLSearchParams();
  
  queryParams.append('status', status);
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/v1/volunteer-applications/me/status?${queryString}`;
  
  return apiCall(endpoint);
}

/**
 * 봉사 신청 상세 조회
 */
export async function getApplicationDetail(applicationId) {
  return apiCall(`/v1/volunteer-applications/${applicationId}`);
}

/**
 * 봉사 신청 취소
 */
export async function cancelApplication(applicationId) {
  return apiCall(`/v1/volunteer-applications/${applicationId}`, {
    method: 'DELETE',
  });
}

/**
 * 우리 보호소에 신청받은 봉사 목록 조회 (보호소 소유자용)
 */
export async function getApplicationsToMyShelter(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/v1/volunteer-applications/shelter/me${queryString ? `?${queryString}` : ''}`;
  
  return apiCall(endpoint);
}

/**
 * 우리 보호소 신청 상태별 조회 (보호소 소유자용)
 */
export async function getShelterApplicationsByStatus(status, params = {}) {
  const queryParams = new URLSearchParams();
  
  queryParams.append('status', status);
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/v1/volunteer-applications/shelter/me/status?${queryString}`;
  
  return apiCall(endpoint);
}

/**
 * 봉사 신청 승인 (보호소 소유자용)
 */
export async function approveApplication(applicationId) {
  return apiCall(`/v1/volunteer-applications/${applicationId}/approve`, {
    method: 'POST',
  });
}

/**
 * 봉사 신청 거절 (보호소 소유자용)
 */
export async function rejectApplication(applicationId) {
  return apiCall(`/v1/volunteer-applications/${applicationId}/reject`, {
    method: 'POST',
  });
}