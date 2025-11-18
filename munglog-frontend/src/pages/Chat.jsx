import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// API Base URL (환경변수로 관리하는 것을 권장)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export default function Chat({ setCurrentPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const currentRoomIdRef = useRef(null);

  // WebSocket 연결 설정
  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // 인증 토큰 가져오기
    
    if (!token) {
      console.error('인증 토큰이 없습니다.');
      return;
    }

    // STOMP 클라이언트 생성
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket 연결 성공');
        setIsConnected(true);
        
        // 채팅방 목록 로드
        loadChatRooms();
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket 연결 종료');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (currentRoomIdRef.current) {
        unsubscribeFromRoom(currentRoomIdRef.current);
      }
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  // 채팅방 선택 시 구독 처리
  useEffect(() => {
    if (selectedChat && isConnected) {
      // 이전 채팅방 구독 해제
      if (currentRoomIdRef.current && currentRoomIdRef.current !== selectedChat) {
        unsubscribeFromRoom(currentRoomIdRef.current);
      }
      
      // 새 채팅방 구독
      subscribeToRoom(selectedChat);
      loadMessages(selectedChat);
      currentRoomIdRef.current = selectedChat;
    }

    // 채팅방 변경 시 이전 방 구독 해제
    return () => {
      if (currentRoomIdRef.current && currentRoomIdRef.current !== selectedChat) {
        unsubscribeFromRoom(currentRoomIdRef.current);
      }
    };
  }, [selectedChat, isConnected]);

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const rooms = await response.json();
        setChatList(rooms);
      }
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    }
  };

  // 채팅방 메시지 로드
  const loadMessages = async (roomId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const msgs = await response.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 채팅방 구독
  const subscribeToRoom = (roomId) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.error('STOMP 클라이언트가 연결되지 않았습니다.');
      return;
    }

    // 이미 구독 중인 경우 해제
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // 새로운 구독 시작
    subscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/rooms/${roomId}`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    );

    console.log(`채팅방 ${roomId} 구독 완료`);
  };

  // 채팅방 구독 해제 및 읽음 처리
  const unsubscribeFromRoom = async (roomId) => {
    // 구독 해제
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      console.log(`채팅방 ${roomId} 구독 해제`);
    }

    // 읽음 처리 API 호출
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`채팅방 ${roomId} 읽음 처리 완료`);
      } else {
        console.error(`채팅방 ${roomId} 읽음 처리 실패:`, response.status);
      }
    } catch (error) {
      console.error('읽음 처리 API 호출 실패:', error);
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat || !stompClientRef.current?.connected) {
      return;
    }

    const message = {
      roomId: selectedChat,
      content: messageInput,
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.publish({
      destination: `/app/chat/rooms/${selectedChat}/messages`,
      body: JSON.stringify(message)
    });

    setMessageInput('');
  };

  const filteredChats = chatList.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = chatList.find(chat => chat.id === selectedChat);

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
              <h2 className="text-lg font-bold">채팅</h2>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} title={isConnected ? '연결됨' : '연결 끊김'}></div>
            </div>
          </div>
          
          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              placeholder="채팅방 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>채팅방이 없습니다</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
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
                    <span className="font-semibold text-sm text-gray-900">{chat.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>

                {/* 읽지 않은 메시지 수 */}
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))
          )}
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
              <span className="font-semibold text-base">{selectedChatData?.name}</span>
            </div>
            <button 
              onClick={() => setSelectedChat(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 ${
                msg.isMe ? 'flex-row-reverse' : ''
              }`}>
                {!msg.isMe && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                )}
                <div className={`flex items-end gap-1 max-w-[60%] ${
                  msg.isMe ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.isMe 
                      ? 'bg-orange-500 text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 입력창 */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력해주세요"
                  disabled={!isConnected}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-100"
                />
              </div>

              {/* 전송 버튼 */}
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  messageInput.trim() && isConnected
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
