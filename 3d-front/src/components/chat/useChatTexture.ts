// useChatTexture.ts
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useChatTexture(messages: { id: number; text: string; from: 'me' | 'them' }[]) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  if (!canvasRef.current) {
    canvasRef.current = document.createElement('canvas');
    canvasRef.current.width = 900;
    canvasRef.current.height = 550;
  }
  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;

    // 배경
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, w, h);

    // 상단 바 (멍로그)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 56);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, system-ui';
    ctx.fillText('멍로그', 60, 34);

    // 좌측 패널 구분선
    const leftWidth = 280;
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(leftWidth + 0.5, 56);
    ctx.lineTo(leftWidth + 0.5, h);
    ctx.stroke();

    // 오른쪽 채팅 영역 배경
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(leftWidth, 56, w - leftWidth, h - 56);

    // 아주 단순한 말풍선 렌더링 (오른쪽/왼쪽)
    const startY = 80;
    let y = startY;
    const lineHeight = 26;
    const paddingX = 14;
    const maxWidth = w - leftWidth - 60;

    messages.forEach((m) => {
      const isMe = m.from === 'me';
      ctx.font = '13px -apple-system, BlinkMacSystemFont, system-ui';

      // 말풍선 텍스트 줄바꿈 처리 (간단 버전)
      const words = m.text.split(' ');
      let line = '';
      const lines: string[] = [];

      words.forEach((word) => {
        const testLine = line.length ? line + ' ' + word : word;
        const { width } = ctx.measureText(testLine);
        if (width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      });
      if (line) lines.push(line);

      const bubbleWidth =
        Math.min(
          maxWidth,
          Math.max(...lines.map((l) => ctx.measureText(l).width)) + paddingX * 2,
        );
      const bubbleHeight = lines.length * lineHeight + 12;

      const x = isMe ? w - bubbleWidth - 20 : leftWidth + 20;

      ctx.fillStyle = isMe ? '#fb923c' : '#e5e7eb';
      ctx.strokeStyle = 'transparent';
      const radius = 16;

      // 둥근 말풍선
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + bubbleWidth - radius, y);
      ctx.quadraticCurveTo(
        x + bubbleWidth,
        y,
        x + bubbleWidth,
        y + radius,
      );
      ctx.lineTo(
        x + bubbleWidth,
        y + bubbleHeight - radius,
      );
      ctx.quadraticCurveTo(
        x + bubbleWidth,
        y + bubbleHeight,
        x + bubbleWidth - radius,
        y + bubbleHeight,
      );
      ctx.lineTo(x + radius, y + bubbleHeight);
      ctx.quadraticCurveTo(
        x,
        y + bubbleHeight,
        x,
        y + bubbleHeight - radius,
      );
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      // 텍스트
      ctx.fillStyle = isMe ? '#ffffff' : '#111827';
      lines.forEach((l, lineIndex) => {
        ctx.fillText(
          l,
          x + paddingX,
          y + 20 + lineIndex * lineHeight,
        );
      });

      y += bubbleHeight + 12;
    });

    textureRef.current!.needsUpdate = true;
  }, [messages]);

  return textureRef.current!;
}
