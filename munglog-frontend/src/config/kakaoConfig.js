// Vite 환경변수에서 카카오 맵 API 키 가져오기
export const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

// API 키 유효성 검사
export const isKakaoMapApiKeyValid = () => {
  return KAKAO_MAP_API_KEY && KAKAO_MAP_API_KEY.length > 0;
};
