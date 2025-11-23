// src/pages/ChatPage.jsx
import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import Computer from '../components/Computer';
import Ground from '../components/Ground';
import Tree from '../components/Tree';
import Rock from '../components/Rock';
import Dog from '../components/Dog';
import Cloud from '../components/Cloud';
import Cabin from '../components/Cabin';
import MunglogChatLayout from '../components/chat/MunglogChatLayout';


/* ----------------- 🔧 카메라 컨트롤러 (Canvas 내부용) ----------------- */
function CameraController({ focusMode }) {
  const { camera, controls } = useThree();

  useFrame(() => {
    const targetPos = focusMode
      ? new THREE.Vector3(0, 1, 3.5) // 포커스(줌인) 위치
      : new THREE.Vector3(0, 1, 5);    // 기본 카메라 위치

    camera.position.lerp(targetPos, 0.08);
    const lookAtY = focusMode ? 1 : 1;
    camera.lookAt(0, lookAtY, 0.3);

    if (controls) {
      controls.enabled = !focusMode; // 포커스 중에는 카메라 조작 금지
    }
  });

  return null;
}

/* ----------------- 🖼 Scene: Canvas 안 3D 장면 ----------------- */
function Scene({ focusMode, onScreenClick }) {
  return (
    <>
      {/* 카메라 */}
      <PerspectiveCamera makeDefault position={[0, 2, 2]} />

      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      {/* OrbitControls (한 개만) */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />

      {/* 카메라 줌인/줌아웃 컨트롤러 */}
      <CameraController focusMode={focusMode} />

      {/* 배경 / 바닥 */}
      <Ground />

      {/* 구름들 */}
      <Cloud position={[-3, 3, 0]} scale={0.3}/>
      <Cloud position={[4, 2, 3]} scale={0.3}/>
      <Cloud position={[0, 1.5, 2]} scale={0.3}/>
      <Cloud position={[2, 2.5, 0]} scale={0.3}/>

      {/* 3D 오브젝트들 */}
      <Suspense fallback={null}>
        {/* 메인 컴퓨터 (채팅 화면 제거, 클릭만 감지) */}
        <Computer
          position={[0, 0, 2]}
          scale={[1, 1, 1]}
          onScreenClick={onScreenClick}
          focusMode={focusMode}
        />

        {/* 🏚 Cabin: 뒤쪽 배경 건물 */}
        <Cabin
          position={[ -3.5, -0.1, -2 ]}
          scale={[0.4, 0.4, 0.4]}
          rotation={[0, Math.PI / 6, 0]}
        />

        {/* 🌲 Tree 1: 왼쪽 뒤쪽 */}
        <Tree
          position={[ -1.5, 0, 1 ]}
          scale={[0.4, 0.4, 0.4]}
        />

        {/* 🌲 Tree 2: 오른쪽 뒤쪽 */}
        <Tree
          position={[ -3, 0, 0 ]}
          scale={[0.4, 0.4, 0.4]}
          rotation={[0, -Math.PI / 10, 0]}
        />

        {/* 🐶 Dog: 컴퓨터 왼쪽 앞에 앉아있는 느낌 */}
        <Dog
          position={[ 1.5, 0.1, 2.1 ]}
          color="#DEB887"
          scale={[0.01, 0.01, 0.01]}
          rotation={[0, -Math.PI / 6, 0]}
        />
      </Suspense>
    </>
  );
}

/* ----------------- 🎨 UI 전용 스타일 ----------------- */
function GlobalUIStyles() {
  return (
    <style>{`
      .ui-fade {
        transition: opacity 0.35s ease, transform 0.35s ease;
      }

      .ui-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 999px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        backdrop-filter: blur(4px);
      }

      .ui-button__icon {
        font-size: 18px;
      }

      /* 🏖 워터파크 느낌 그라디언트 + 물결 애니메이션 */
      .ui-button--home {
        color: #ffffff;
        background: linear-gradient(120deg, #38bdf8, #22c55e, #0ea5e9);
        background-size: 200% 200%;
        animation: waterWave 4s ease-in-out infinite;
      }

      @keyframes waterWave {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .ui-button--back {
        color: #ffffff;
        background: rgba(0,0,0,0.65);
      }

      .ui-button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }

      .ui-banner {
        background: rgba(255, 255, 255, 0.9);
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        color: #333;
        text-align: center;
        max-width: 80%;
      }

      /* 채팅 오버레이 애니메이션 */
      .chat-overlay {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
        pointer-events: none;
      }

      .chat-overlay--visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.4);
        pointer-events: auto;
        transition: opacity 2.2s ease, transform 1.5s ease;
      }

      .chat-overlay--hidden {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.6);
        pointer-events: none;
        transition: opacity 0.5s ease-in, transform 0s ease-in;
      }


    `}</style>
  );
}

/* ----------------- 🏠 홈 버튼 ----------------- */
function HomeButton({ visible }) {
  return (
    <button
      onClick={() => (window.location.href = '/')}
      className="ui-button ui-button--home ui-fade"
      style={{
        position: 'absolute',
        fontSize: '16px',
        top: 30,
        left: 30,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 10,
      }}
    >
      <span className="ui-button__icon">🏠</span>
      <span>홈으로</span>
    </button>
  );
}

/* ----------------- 💬 상단 안내 배너 ----------------- */
function TopBanner({ visible }) {
  return (
    <div
      className="ui-banner ui-fade"
      style={{
        position: 'absolute',
        top: '2%',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '20px' }}>💻 채팅방</h1>
      <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: '1.4' }}>
        컴퓨터 앞에 오신 것을 환영합니다! <br />
        화면을 클릭해 채팅을 시작해보세요.
      </p>
    </div>
  );
}

/* ----------------- ← 뒤로가기 버튼 ----------------- */
function BackButton({ visible, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ui-button ui-button--back ui-fade"
      style={{
        position: 'absolute',
        fontSize: '16px',
        top: 30,
        left: 30,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 11, // 홈 버튼보다 위
      }}
    >
      ← 뒤로가기
    </button>
  );
}

/* ----------------- 💬 채팅 오버레이 (2D, 항상 고정 위치) ----------------- */
function ChatOverlay({ visible }) {
  return (
    <div
      className={`chat-overlay ${
        visible ? 'chat-overlay--visible' : 'chat-overlay--hidden'
      }`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 100,
      }}
    >
      <MunglogChatLayout />
    </div>
  );
}

/* ----------------- 📄 메인 ChatPage 컴포넌트 ----------------- */
export default function ChatPage() {
  const [focusMode, setFocusMode] = useState(false);

  const handleComputerScreenClick = () => {
    setFocusMode(true);
  };

  const handleUnfocus = () => {
    setFocusMode(false);
  };

  const isDefaultView = !focusMode;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgb(164, 225, 249) 0%',
      }}
    >
      <GlobalUIStyles />

      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        <Scene
          focusMode={focusMode}
          onScreenClick={handleComputerScreenClick}
        />
      </Canvas>

      {/* 오버레이 UI들 */}
      <HomeButton visible={isDefaultView} />
      <TopBanner visible={isDefaultView} />
      <BackButton visible={focusMode} onClick={handleUnfocus} />
      
      {/* 채팅 화면 (2D 오버레이, 항상 화면 중앙 고정) */}
      <ChatOverlay visible={focusMode} />
    </div>
  );
}