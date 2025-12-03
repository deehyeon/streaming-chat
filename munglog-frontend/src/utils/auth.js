const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://158.180.75.249:8080';

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
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
      return data.data.accessToken;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    localStorage.clear();
    window.location.href = '/';
    throw error;
  }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/';
};