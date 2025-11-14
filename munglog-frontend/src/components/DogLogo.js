import React from 'react';

export const DogLogo = ({ size = 48 }) => (
  <div style={{ width: size, height: size }} className="flex items-center justify-center">
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="45" rx="28" ry="30" fill="#E8B17A"/>
      <ellipse cx="32" cy="22" rx="12" ry="16" fill="#C89055" transform="rotate(-30 32 22)"/>
      <ellipse cx="68" cy="22" rx="12" ry="16" fill="#C89055" transform="rotate(30 68 22)"/>
      <ellipse cx="50" cy="55" rx="18" ry="14" fill="#F5D9B8"/>
      <circle cx="42" cy="42" r="6" fill="white"/>
      <circle cx="42" cy="42" r="4" fill="#2C1810"/>
      <circle cx="43" cy="41" r="1.5" fill="white"/>
      <circle cx="58" cy="42" r="6" fill="white"/>
      <circle cx="58" cy="42" r="4" fill="#2C1810"/>
      <circle cx="59" cy="41" r="1.5" fill="white"/>
      <ellipse cx="50" cy="53" rx="3.5" ry="3" fill="#8B4513"/>
      <path d="M 50 56 Q 46 58 44 56" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 50 56 Q 54 58 56 56" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="38" cy="36" r="2" fill="#C89055"/>
      <circle cx="62" cy="36" r="2" fill="#C89055"/>
    </svg>
  </div>
);