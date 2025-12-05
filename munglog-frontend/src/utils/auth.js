// src/utils/auth.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

/**
 * 로그인 여부 확인
 */
export function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return false;
  }

  // JWT 토큰 만료 확인
  try {
    const payload = parseJwt(token);
    const currentTime = Date.now() / 1000;
    
    // 토큰이 만료되었으면 false
    if (payload.exp && payload.exp < currentTime) {
      // 만료된 토큰 제거
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return false;
  }
}

/**
 * JWT 토큰 파싱
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 사용자 정보 가져오기 (localStorage에서)
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    // userInfo가 없으면 토큰에서 파싱 시도
    return getCurrentUser();
  }
  
  try {
    return JSON.parse(userInfo);
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return getCurrentUser();
  }
}

/**
 * 현재 로그인한 사용자 정보 (토큰에서 파싱)
 */
export function getCurrentUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const payload = parseJwt(token);
    return {
      memberId: payload.memberId || payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (err) {
    console.error('토큰 파싱 실패:', err);
    return null;
  }
}

/**
 * 사용자 ID 가져오기
 */
export function getUserId() {
  const userInfo = getUserInfo();
  if (userInfo?.memberId) {
    return userInfo.memberId;
  }
  
  // userInfo가 없으면 토큰에서 파싱
  const user = getCurrentUser();
  return user?.memberId || null;
}

/**
 * 액세스 토큰 가져오기
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * 리프레시 토큰 가져오기
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

/**
 * 인증 정보 저장
 */
export function setAuth(accessToken, refreshToken, userInfo) {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
}

/**
 * 인증 정보 초기화
 */
export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
}

/**
 * 토큰 갱신
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.result === 'SUCCESS' && data.data) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      // auth-change 이벤트 발생
      window.dispatchEvent(new Event('auth-change'));
      
      return data.data.accessToken;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    clearAuth();
    window.location.href = '/login';
    throw error;
  }
}

/**
 * 로그아웃
 */
export function logout() {
  clearAuth();
  
  // auth-change 이벤트 발생
  window.dispatchEvent(new Event('auth-change'));
  
  window.location.href = '/';
}

// API 호출 헬퍼 함수 (인증 필요한 API용)
export async function authenticatedFetch(endpoint, options = {}) {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // 401 Unauthorized - 토큰 만료 시 갱신 시도
    if (response.status === 401) {
      try {
        // 토큰 갱신
        token = await refreshAccessToken();
        
        // 갱신된 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...defaultHeaders,
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
          throw new Error(error.error?.message || error.message || '요청이 실패했습니다.');
        }

        return retryResponse.json();
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        logout();
        throw refreshError;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      throw new Error(error.error?.message || error.message || '요청이 실패했습니다.');
    }

    return response.json();
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
}