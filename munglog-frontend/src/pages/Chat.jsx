import React, { useState } from 'react';

export default function Chat({ setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // 채팅 목록 데이터
  const chatList = [
    {
      id: 1,
      name: '당근',
      lastMessage: '네 잘부탁드려요~~ 그 쪽했습니다.',
      time: '오전 07:03',
      unread: 1,
      verified: true,
      temperature: 38.2,
      hasImage: true
    },
    {
      id: 2,
      name: '푸른하늘투르네',
      lastMessage: '네 감사합니다~!!',
      time: '3월 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 3,
      name: '당근페이',
      lastMessage: '계좌로 보냈어요. 📱 토스나는 3734...',
      time: '3일 전',
      unread: 0,
      temperature: 36.5,
      isPay: true,
      hasImage: true
    },
    {
      id: 4,
      name: '미미머',
      lastMessage: '네 감사합니다다~!!',
      time: '평처들 · 1주 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 5,
      name: '무항철구',
      lastMessage: '스타몰을 보냈어요.',
      time: '광처들 · 1주 전',
      unread: 2,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 6,
      name: 'yukdkd',
      lastMessage: '아~ 네',
      time: '매대들 · 1일 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 7,
      name: '달콩고수',
      lastMessage: '안전이요.',
      time: '희대들 · 1일 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 8,
      name: '노녹',
      lastMessage: '감사합니다~!!!! 쪽 쓰겠습니다!!',
      time: '유한들 · 1일 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 9,
      name: '현양성영',
      lastMessage: '도움 거듭합각니다',
      time: '매대들 · 2일 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    },
    {
      id: 10,
      name: '수빈이',
      lastMessage: '넵',
      time: '스물금 · 2일 전',
      unread: 0,
      temperature: 36.5,
      hasImage: true
    }
  ];

  // 메시지 데이터 (선택된 채팅방에 대한)
  const messages = [
    {
      id: 1,
      type: 'product',
      product: {
        image: '📱',
        title: '파이썬 개발 서적 판매합니다',
        price: '10,000원'
      },
      time: '오후 1:08',
      isMe: false
    },
    {
      id: 2,
      text: '네, 쿠파테크에요.',
      time: '오후 1:08',
      isMe: false
    },
    {
      id: 3,
      type: 'image',
      image: '🐻',
      text: '감사해요',
      time: '오후 1:09',
      isMe: false
    },
    {
      id: 4,
      date: '2025년 9월8일'
    },
    {
      id: 5,
      text: '네, 확인 감사드려요!',
      time: '오후 5:51',
      isMe: true
    },
    {
      id: 6,
      text: '혹시 클개발 가능해요 네고 조금 가능하까요...?',
      time: '오후 5:52',
      isMe: false
    },
    {
      id: 7,
      text: '엄마 가능하실거까요?',
      time: '오전 12:47',
      isMe: false
    },
    {
      id: 8,
      text: '엄마로 저하세요??',
      time: '오전 12:45',
      isMe: true
    },
    {
      id: 9,
      text: '확인했습니다!',
      time: '오전 12:45',
      isMe: true,
      status: '전송됨'
    },
    {
      id: 10,
      text: '확인이에요',
      time: '오전 10:58',
      isMe: false,
      status: '읽음'
    }
  ];

  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = chatList.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // 메시지 전송 로직
      console.log('Sending:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-lg overflow-hidden -mx-6">
      {/* 왼쪽 채팅 리스트 */}
      <div className="w-[380px] border-r border-gray-200 flex flex-col">
        {/* 상단 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="text-lg font-bold">뽕뽕뽕</h2>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              placeholder="안위된 메시지만 보기"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedChat === chat.id ? 'bg-orange-50' : ''
              }`}
            >
              {/* 프로필 이미지 */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                </div>
              </div>

              {/* 채팅 정보 */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-gray-900">{chat.name}</span>
                    {chat.verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {chat.isPay && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">pay</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>

              {/* 썸네일 이미지 */}
              {chat.hasImage && (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200"></div>
                </div>
              )}

              {/* 읽지 않은 메시지 수 */}
              {chat.unread > 0 && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="p-3 border-t border-gray-200 text-center">
          <button className="text-xs text-gray-500 hover:underline">
            자주묻는 질문 →
          </button>
        </div>
      </div>

      {/* 오른쪽 채팅 상세 */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* 상단 헤더 */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">{selectedChatData?.name}</span>
                {selectedChatData?.temperature && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                    {selectedChatData.temperature}℃
                  </span>
                )}
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => {
              // 날짜 구분선
              if (msg.date) {
                return (
                  <div key={msg.id} className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {msg.date}
                    </div>
                  </div>
                );
              }

              // 상품 메시지
              if (msg.type === 'product') {
                return (
                  <div key={msg.id} className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="max-w-[60%]">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl flex-shrink-0">
                            {msg.product.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1">{msg.product.title}</p>
                            <p className="text-sm font-bold text-gray-900">{msg.product.price}</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{msg.time}</span>
                    </div>
                  </div>
                );
              }

              // 이미지 메시지
              if (msg.type === 'image') {
                return (
                  <div key={msg.id} className={`flex items-start gap-2 ${
                    msg.isMe ? 'flex-row-reverse' : ''
                  }`}>
                    {!msg.isMe && <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>}
                    <div className={`max-w-[60%] ${msg.isMe ? 'items-end' : ''}`}>
                      <div className="bg-white rounded-lg p-2 inline-block">
                        <div className="text-6xl mb-2">{msg.image}</div>
                        {msg.text && (
                          <p className="text-sm text-gray-900">{msg.text}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{msg.time}</span>
                    </div>
                  </div>
                );
              }

              // 일반 텍스트 메시지
              return (
                <div key={msg.id} className={`flex items-start gap-2 ${
                  msg.isMe ? 'flex-row-reverse' : ''
                }`}>
                  {!msg.isMe && <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>}
                  <div className={`flex items-end gap-1 max-w-[60%] ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.isMe 
                        ? 'bg-orange-500 text-white rounded-br-sm' 
                        : 'bg-white text-gray-900 rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-500 whitespace-nowrap">
                      {msg.status && <span className="mb-0.5">{msg.status}</span>}
                      <span>{msg.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 입력창 */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              {/* 추가 기능 버튼 */}
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              {/* 메시지 입력 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력해주세요"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {messageInput.length}/1000
                </span>
              </div>

              {/* 전송 버튼 */}
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  messageInput.trim()
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-base">채팅할 상대를 선택해주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}
