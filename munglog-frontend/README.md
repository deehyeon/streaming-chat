# 멍로그 프론트엔드

유기견 보호소 봉사 신청 플랫폼 프론트엔드

## 환경 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
cp .env.example .env
```

`.env` 파일에 카카오 맵 API 키를 설정하세요:

```
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

### 2. 카카오 맵 API 키 발급

1. [카카오 디벨로퍼스](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 설정 > 플랫폼 설정에서 웹 플랫폼 추가
4. 사이트 도메인 등록 (개발: `http://localhost:3001`, 운영: 실제 도메인)
5. 앱 키 > JavaScript 키를 `.env` 파일에 추가

**⚠️ 보안 주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- 카카오 디벨로퍼스에서 반드시 도메인 제한을 설정하세요

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 기능

- 실시간 채팅
- 보호소 찾기 (카카오 맵 연동)
- 봉사 신청
- 입양 공고
- 실종 신고
