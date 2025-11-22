// src/components/chat/MunglogChatLayout.jsx
import React, { useState } from 'react';

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: '푸름이네 보호소',
    lastMessage: '내일 입소 준비 도와주실 수 있을까요?',
    time: '1분 전',
    unread: 2,
    avatarColor: '#22c55e',
  },
  {
    id: 2,
    name: '멍로그 운영팀',
    lastMessage: '봉사 일정 안내드립니다.',
    time: '어제',
    unread: 0,
    avatarColor: '#3b82f6',
  },
  {
    id: 3,
    name: '댕댕하우스',
    lastMessage: '산책 봉사 일정 조율 가능하실까요?',
    time: '2일 전',
    unread: 1,
    avatarColor: '#f97316',
  },
  {
    id: 4,
    name: '사랑의 보호소',
    lastMessage: '사료 후원 감사합니다 🙏',
    time: '3일 전',
    unread: 0,
    avatarColor: '#ec4899',
  },
  {
    id: 5,
    name: '행복한 동물의 집',
    lastMessage: '다음 주 목요일 가능하신가요?',
    time: '5일 전',
    unread: 0,
    avatarColor: '#8b5cf6',
  },
];

const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      sender: 'them',
      name: '푸름이네 보호소',
      text: '파일럿 산책 봉사 함께해주셔서 감사합니다 🙏',
      time: '오후 1:08',
    },
    {
      id: 2,
      sender: 'me',
      name: '나',
      text: '아니에요! 저도 즐거웠어요 😄',
      time: '오후 1:09',
    },
    {
      id: 3,
      sender: 'them',
      name: '푸름이네 보호소',
      text: '혹시 다음 주 주말에도 가능하실까요?',
      time: '오후 5:51',
    },
    {
      id: 4,
      sender: 'me',
      name: '나',
      text: '네! 일정 확인해보고 알려드릴게요.',
      time: '오후 5:52',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'them',
      name: '멍로그 운영팀',
      text: '안녕하세요, 멍로그 운영팀입니다.',
      time: '오전 10:12',
    },
    {
      id: 2,
      sender: 'them',
      name: '멍로그 운영팀',
      text: '봉사 일정 안내드립니다.',
      time: '오전 10:13',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'them',
      name: '댕댕하우스',
      text: '새로 온 아이들 산책 도와주실 수 있을까요?',
      time: '오후 3:22',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'them',
      name: '사랑의 보호소',
      text: '사료 후원 감사합니다 🙏',
      time: '오후 2:30',
    },
  ],
  5: [
    {
      id: 1,
      sender: 'them',
      name: '행복한 동물의 집',
      text: '다음 주 목요일 가능하신가요?',
      time: '오전 11:45',
    },
  ],
};

export default function MunglogChatLayout() {
  const [selectedId, setSelectedId] = useState(1);
  const [input, setInput] = useState('');

  const conversations = MOCK_CONVERSATIONS;
  const messages = MOCK_MESSAGES[selectedId] ?? [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // TODO: 여기에서 서버로 메시지 전송 API/WebSocket 호출
    console.log('send message:', input);
    setInput('');
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '900px',
          height: '550px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 상단 헤더 */}
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid #ececec',
            background: '#ffffff',
          }}
        >
          {/* 좌측 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              멍
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                멍로그 채팅
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>
                보호소와 봉사자를 연결합니다
              </span>
            </div>
          </div>

          {/* 우측 프로필 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f9fafb',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              봉
            </div>
            <span style={{ fontSize: 12, color: '#111827', fontWeight: 600 }}>
              봉사자 닉네임
            </span>
          </div>
        </div>

        {/* 메인 영역 */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* 좌측: 채팅 목록 */}
          <div
            style={{
              width: '300px',
              borderRight: '1px solid #ececec',
              background: '#fafafa',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 목록 헤더 */}
            <div
              style={{
                padding: '14px 16px 12px',
                borderBottom: '1px solid #ececec',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#111827',
                  }}
                >
                  메시지
                </span>
                <button
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  안읽은 메시지만
                </button>
              </div>
            </div>

            {/* 채팅 리스트 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: '1px solid #ececec',
                    background: c.id === selectedId ? '#fff5ed' : '#ffffff',
                    borderLeft:
                      c.id === selectedId ? '3px solid #fb923c' : '3px solid transparent',
                    display: 'flex',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* 아바타 */}
                  <div
                    style={{
                      minWidth: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: c.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {c.name[0]}
                  </div>

                  {/* 정보 */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#111827',
                        }}
                      >
                        {c.name}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#9ca3af',
                          fontWeight: 500,
                        }}
                      >
                        {c.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: c.unread > 0 ? '#4b5563' : '#9ca3af',
                        fontWeight: c.unread > 0 ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.lastMessage}
                    </div>
                  </div>

                  {/* 뱃지 */}
                  {c.unread > 0 && (
                    <div
                      style={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: '10px',
                        background: '#fb923c',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}
                    >
                      {c.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 우측: 채팅방 */}
          <div
            style={{
              flex: 1,
              background: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 채팅방 헤더 */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #ececec',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: selectedConversation?.avatarColor ?? '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {selectedConversation?.name[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    {selectedConversation?.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                    보호소 · 산책 봉사 매칭
                  </span>
                </div>
              </div>

              {/* 옵션 버튼 */}
              <button
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                ⋯
              </button>
            </div>

            {/* 메시지 영역 */}
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '60%',
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe
                          ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                          : '#ffffff',
                        color: isMe ? '#fff' : '#111827',
                        fontSize: 12,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      {m.text}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: '#9ca3af',
                        fontWeight: 500,
                      }}
                    >
                      {m.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 입력 영역 */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #ececec',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <button
                type="button"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                📎
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력해주세요..."
                style={{
                  flex: 1,
                  fontSize: 12,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  outline: 'none',
                  background: '#f9fafb',
                }}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  background: input.trim()
                    ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                    : '#e5e7eb',
                  color: input.trim() ? '#ffffff' : '#9ca3af',
                  cursor: input.trim() ? 'pointer' : 'default',
                }}
              >
                전송
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}