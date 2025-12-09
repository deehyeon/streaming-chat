// Vite 환경변수에서 카카오 맵 API 키 가져오기
// Vite에서는 import.meta.env를 사용해야 합니다

// API 키를 가져오는 함수
export const getKakaoMapApiKey = () => {
  return import.meta.env.VITE_KAKAO_MAP_API_KEY;
};

// API 키 유효성 검사
export const isKakaoMapApiKeyValid = () => {
  const apiKey = getKakaoMapApiKey();
  return apiKey && apiKey.length > 0 && apiKey !== 'your_kakao_map_api_key_here';
};
