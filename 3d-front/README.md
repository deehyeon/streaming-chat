# 🏡 멍로그 아일랜드 - Animal Crossing 스타일 유기견 보호소 봉사 플랫폼

모여라 동물의 숲 스타일의 귀여운 3D 인터랙티브 웹 플랫폼입니다. 

## ✨ 주요 기능

- 🎮 **인터랙티브 3D 환경**: 마우스 드래그로 자유롭게 카메라를 회전하고 줌 인/아웃 가능
- 🐕 **귀여운 3D 강아지들**: 5마리의 서로 다른 색상의 강아지들이 살아있는 듯한 애니메이션과 함께 등장
- 🏠 **Animal Crossing 스타일**: 부드러운 파스텔톤 색상과 로우폴리 3D 디자인
- 🌳 **자연스러운 환경**: 나무, 울타리, 꽃, 구름 등 다양한 환경 요소
- 💫 **실시간 애니메이션**: 강아지의 움직임, 구름의 흐름 등 부드러운 애니메이션 효과
- 📱 **반응형 UI**: 강아지를 클릭하면 봉사 신청 모달이 표시됩니다

## 🚀 설치 및 실행

### 1. 필수 요구사항
- Node.js 16.x 이상
- npm 또는 yarn

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

서버가 실행되면 자동으로 브라우저가 열립니다 (기본 포트: 3000)

### 4. 프로덕션 빌드
```bash
npm run build
```

### 5. 빌드 결과 미리보기
```bash
npm run preview
```

## 🎮 사용 방법

1. **화면 회전**: 마우스 왼쪽 버튼을 누른 채로 드래그
2. **확대/축소**: 마우스 휠 스크롤
3. **화면 이동**: 마우스 오른쪽 버튼을 누른 채로 드래그
4. **강아지 선택**: 강아지를 클릭하면 봉사 신청 모달이 나타납니다

## 🐕 등장 강아지

- **베이지** (DEB887): 차분한 베이지색 강아지
- **샌디** (F4A460): 밝은 샌디 브라운 강아지
- **스노우** (FFFFFF): 순백색 강아지
- **브라운** (8B4513): 진한 브라운 강아지
- **까망이** (000000): 검은색 강아지

## 🛠 기술 스택

- **React 18**: 최신 React 프레임워크
- **Three.js**: 3D 그래픽 렌더링
- **@react-three/fiber**: React를 위한 Three.js 렌더러
- **@react-three/drei**: Three.js 헬퍼 컴포넌트 모음
- **Vite**: 빠른 빌드 도구

## 📁 프로젝트 구조

```
shelter-island/
├── index.html          # HTML 진입점
├── main.jsx           # React 진입점
├── App.jsx            # 메인 App 컴포넌트
├── shelter-island.jsx # 3D 씬 및 메인 로직
├── package.json       # 프로젝트 의존성
├── vite.config.js     # Vite 설정
└── README.md          # 프로젝트 문서
```

## 🎨 커스터마이징

### 강아지 색상 변경
`shelter-island.jsx`의 `Scene` 컴포넌트에서 `Dog` 컴포넌트의 `color` prop을 수정하세요:

```jsx
<Dog position={[-2, 0, 1]} color="#YOUR_COLOR" onClick={() => onDogClick('이름')} />
```

### 카메라 각도 조정
`OrbitControls`의 속성을 수정하세요:

```jsx
<OrbitControls
  minDistance={5}      // 최소 줌 거리
  maxDistance={15}     // 최대 줌 거리
  maxPolarAngle={Math.PI / 2.2}  // 최대 각도
/>
```

### 조명 변경
`Scene` 컴포넌트에서 조명 컴포넌트의 `intensity` 값을 조정하세요:

```jsx
<ambientLight intensity={0.6} />
<directionalLight position={[10, 10, 5]} intensity={0.8} />
```

## 🔧 문제 해결

### 화면이 검게 나타나는 경우
- GPU 가속이 활성화되어 있는지 확인하세요
- 최신 버전의 브라우저를 사용하세요 (Chrome, Firefox, Edge 권장)

### 성능이 느린 경우
- 강아지나 나무의 수를 줄여보세요
- 그림자 품질을 낮추세요 (`shadow-mapSize` 값 조정)

### 패키지 설치 오류
```bash
# node_modules 폴더 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📝 라이선스

이 프로젝트는 교육 및 개인 프로젝트용으로 제작되었습니다.

## 🤝 기여

버그 리포트나 기능 제안은 언제든 환영합니다!

---

Made with ❤️ for 유기견 보호소
