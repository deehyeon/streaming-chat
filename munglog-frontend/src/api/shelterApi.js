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
    throw new Error(error.message || '요청이 실패했습니다.');
  }

  return response.json();
}

// 보호소 목록 조회 (페이징, 지역 필터링)
export async function getShelters(params = {}) {
  const { region, page = 0, size = 10, sort = 'createdAt,desc' } = params;
  const queryParams = new URLSearchParams({
    page,
    size,
    sort,
    ...(region && { region })
  });

  return apiCall(`/v1/shelters?${queryParams}`);
}

// 보호소 상세 조회
export async function getShelterDetail(shelterId) {
  return apiCall(`/v1/shelters/${shelterId}`);
}

// 보호소 이름으로 검색
export async function searchSheltersByName(name, page = 0, size = 20) {
  const queryParams = new URLSearchParams({
    name,
    page,
    size,
    sort: 'name'
  });

  return apiCall(`/v1/shelters/search?${queryParams}`);
}

// 내 보호소 조회
export async function getMyShelter() {
  return apiCall('/v1/shelters/me');
}

// 보호소 등록
export async function createShelter(shelterData) {
  return apiCall('/v1/shelters', {
    method: 'POST',
    body: JSON.stringify(shelterData),
  });
}

// 보호소 정보 수정
export async function updateShelter(shelterData) {
  return apiCall('/v1/shelters/me', {
    method: 'PATCH',
    body: JSON.stringify(shelterData),
  });
}

// 보호소 주소 수정
export async function updateShelterAddress(shelterId, addressData) {
  return apiCall(`/v1/shelters/${shelterId}/address`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
}

// 보호소 삭제
export async function deleteShelter(shelterId) {
  return apiCall(`/v1/shelters/${shelterId}`, {
    method: 'DELETE',
  });
}