# 멍로그 (MongLog)

유기견 보호소 봉사 신청 서비스 웹 애플리케이션

![멍로그](https://img.shields.io/badge/MongLog-FFB701?style=for-the-badge&logo=dog&logoColor=white)

## 📋 주요 기능

- 🏠 **보호소 찾기**: 지역별 유기견 보호소 검색 및 필터링
- 🐕 **분실/보호 게시판**: 실종 및 보호 동물 정보 공유
- 💝 **분양하기**: 유기견 입양 정보 제공
- 🎨 **3D 인터랙티브 UI**: Three.js를 활용한 동적인 홈 화면

## 🛠️ 기술 스택

- **Frontend**: React 18.2.0
- **3D Graphics**: Three.js (r128)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: React Scripts

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/deehyeon/munglog-frontend.git
cd munglog-frontend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 자동으로 열립니다.

## 📦 빌드

프로덕션 빌드를 생성하려면:
```bash
npm run build
```

빌드된 파일은 `build` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
munglog-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   └── common/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── DogLogo.jsx
│   │       └── LocationModal.jsx
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── Home.jsx
│   │   ├── Shelters.jsx
│   │   ├── Missing.jsx
│   │   └── Adoption.jsx
│   ├── constants/        # 상수 및 데이터
│   │   ├── colors.js
│   │   └── mockData.js
│   ├── App.js           # 메인 앱 컴포넌트
│   ├── index.js         # 진입점
│   └── index.css        # 전역 스타일
├── package.json
└── README.md
```

## 🎨 컬러 팔레트

- **Primary**: `#FFB701` - 메인 강조 색상
- **Secondary**: `#FEDF04` - 보조 색상
- **Light**: `#FEF79E` - 밝은 강조 색상
- **Gray**: `#ABADA7` - 중립 색상

## ✨ 주요 화면

### 홈 화면
- 3D 인터랙티브 씬 (강아지, 나비, 구름 애니메이션)
- 사과나무가 있는 풍경
- 멍로그만의 특징 소개

### 보호소 찾기
- 지도 기반 보호소 검색
- 지역별 필터링
- 보호소 상세 정보

### 분실/보호 게시판
- 실종 게시판
- 보호 게시판
- 게시물 필터링

### 분양하기
- 분양 가능한 강아지 목록
- 나이/성별/견종 필터링
- 분양 신청

## 🤝 기여하기

Pull Request를 환영합니다!

## 👤 개발자

**deehyeon**

## 📄 라이선스

MIT

---

Made with ❤️ for rescue dogs 🐕