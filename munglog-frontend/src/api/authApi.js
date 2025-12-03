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

// 회원가입
export async function signUp(signUpData) {
  const response = await apiCall('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signUpData),
  });

  // 회원가입 성공 시 토큰 저장
  if (response.data?.tokenInfo) {
    localStorage.setItem('accessToken', response.data.tokenInfo.accessToken);
    localStorage.setItem('refreshToken', response.data.tokenInfo.refreshToken);
  }

  return response;
}

// 로그인
export async function login(loginData) {
  const response = await apiCall('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

  // 로그인 성공 시 토큰 저장
  if (response.data?.tokenInfo) {
    localStorage.setItem('accessToken', response.data.tokenInfo.accessToken);
    localStorage.setItem('refreshToken', response.data.tokenInfo.refreshToken);
  }

  return response;
}

// 토큰 갱신
export async function refreshToken() {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  if (!refreshTokenValue) {
    throw new Error('리프레시 토큰이 없습니다.');
  }

  try {
    const response = await apiCall('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    // 토큰 갱신 성공 시 새 토큰 저장
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  } catch (err) {
    // 리프레시 토큰도 만료된 경우 로그아웃 처리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw err;
  }
}

// 로그아웃 (클라이언트 측)
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// 현재 로그인한 사용자 정보 가져오기 (토큰에서 파싱 또는 별도 API 호출)
export function getCurrentUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    // JWT 토큰 파싱 (페이로드 부분만)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      memberId: payload.memberId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (err) {
    console.error('토큰 파싱 실패:', err);
    return null;
  }
}

// 로그인 상태 확인
export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}