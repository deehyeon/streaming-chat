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

// 내 정보 조회
export async function getMyInfo() {
  return apiCall('/v1/members/me');
}

// 회원 정보 수정
export async function updateMyInfo(updateData) {
  return apiCall('/v1/members/me', {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
}

// 비밀번호 변경
export async function changePassword(passwordData) {
  return apiCall('/v1/members/me/password', {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  });
}

// 전화번호 변경
export async function changePhone(phoneData) {
  return apiCall('/v1/members/me/phone', {
    method: 'PATCH',
    body: JSON.stringify(phoneData),
  });
}

// 이름 변경
export async function changeName(nameData) {
  return apiCall('/v1/members/me/name', {
    method: 'PATCH',
    body: JSON.stringify(nameData),
  });
}

// 회원 탈퇴
export async function deleteMember() {
  return apiCall('/v1/members/me', {
    method: 'DELETE',
  });
}