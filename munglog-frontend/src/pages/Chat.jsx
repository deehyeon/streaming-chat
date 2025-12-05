// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import webstomp from 'webstomp-client';
import { getUserId, getAccessToken } from '../utils/auth';
import { getChatParticipants } from '../api/chatApi';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const currentUserId = getUserId();
  const accessToken = getAccessToken();
  
  // WebSocket 관련 refs
  const stompClientRef = useRef(null);
  const roomSubRef = useRef(null);
  const personalSubRef = useRef(null);
  const previousRoomIdRef = useRef(null);

  // 무한 스크롤 관련
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [nextBeforeSeq, setNextBeforeSeq] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // WebSocket 연결
  useEffect(() => {
    if (!accessToken || !currentUserId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  // URL state로 전달된 roomId 처리
  useEffect(() => {
    if (location.state?.roomId && location.state?.autoOpen && wsConnected) {
      console.log('🎯 자동으로 채팅방 열기:', location.state.roomId);
      handleSelectRoom(location.state.roomId);
      
      // state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state, wsConnected]);

  // 선택된 채팅방 변경 시
  useEffect(() => {
    if (selectedRoom && wsConnected) {
      loadMessages(selectedRoom.roomId);
      subscribeToRoom(selectedRoom.roomId);
      markAsRead(selectedRoom.roomId);
    }

    return () => {
      if (selectedRoom && roomSubRef.current) {
        roomSubRef.current.unsubscribe();
        roomSubRef.current = null;
      }
    };
  }, [selectedRoom]);

  // 메시지 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 페이지 떠날 때 읽음 처리
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (selectedRoom) {
        await markAsRead(selectedRoom.roomId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedRoom]);

  const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
      if (!accessToken) {
        reject(new Error('No access token'));
        return;
      }

      console.log('🔌 WebSocket 연결 시도...');
      const socket = new SockJS(`${API_BASE_URL}/connect`);
      const client = webstomp.over(socket);
      
      client.heartbeat.outgoing = 10000;
      client.heartbeat.incoming = 10000;
      
      client.connect(
        { 'Authorization': `Bearer ${accessToken}` },
        async (frame) => {
          console.log('✅ WebSocket 연결 성공:', frame);
          setWsConnected(true);
          stompClientRef.current = client;
          
          // 개인 토픽 구독 (채팅방 요약 업데이트)
          const personalTopic = `/topic/user.${currentUserId}.room-summary`;
          
          try {
            personalSubRef.current = client.subscribe(
              personalTopic,
              (frame) => {
                try {
                  const summary = JSON.parse(frame.body);
                  const roomId = summary.roomId ?? summary.id;
                  const preview = summary.lastMessagePreview ?? summary.preview ?? '';
                  const ts = summary.lastMessageAt ?? summary.ts ?? summary.createdAt ?? Date.now();
                  let unread = (typeof summary.unreadCount === 'number') 
                    ? summary.unreadCount 
                    : (typeof summary.unread === 'number') 
                    ? summary.unread 
                    : undefined;
                  
                  // 현재 보고 있는 채팅방이면 읽음 처리
                  if (roomId === selectedRoom?.roomId) {
                    unread = 0;
                  }
                  
                  if (roomId != null) {
                    updateRoomSummary(roomId, { preview, ts, unread });
                  }
                } catch (e) {
                  console.error('❌ room-summary parse error', e);
                }
              },
              { 'Authorization': `Bearer ${accessToken}` }
            );
            
            console.log('✅ 개인 토픽 구독 완료:', personalTopic);
          } catch (error) {
            console.error('❌ 개인 토픽 구독 실패', error);
          }
          
          await loadRooms();
          resolve(frame);
        },
        (error) => {
          console.error('❌ WebSocket 연결 실패:', error);
          setWsConnected(false);
          alert('WebSocket 연결 실패');
          reject(error);
        }
      );
    });
  };

  const disconnectWebSocket = async () => {
    if (selectedRoom) {
      await markAsRead(selectedRoom.roomId);
    }
    
    if (stompClientRef.current) {
      if (roomSubRef.current) {
        roomSubRef.current.unsubscribe();
        roomSubRef.current = null;
      }
      if (personalSubRef.current) {
        personalSubRef.current.unsubscribe();
        personalSubRef.current = null;
      }
      stompClientRef.current.disconnect();
      stompClientRef.current = null;
    }
    
    setWsConnected(false);
  };

  const updateRoomSummary = (roomId, { preview, ts, unread }) => {
    setChatRooms((prevRooms) => {
      const idx = prevRooms.findIndex(r => r.roomId === roomId);
      
      if (idx !== -1) {
        const base = prevRooms[idx];
        const updated = {
          ...base,
          lastMessagePreview: preview ?? base.lastMessagePreview,
          lastMessageAt: ts ?? base.lastMessageAt
        };
        
        if (roomId === selectedRoom?.roomId) {
          updated.unreadCount = 0;
        } else if (unread !== undefined) {
          updated.unreadCount = unread;
        }
        
        const newRooms = [...prevRooms];
        newRooms.splice(idx, 1, updated);
        return sortRoomsByTime(newRooms);
      } else {
        const newRoom = {
          roomId,
          type: 'PRIVATE',
          lastMessagePreview: preview ?? '',
          lastMessageAt: ts ?? Date.now(),
          unreadCount: (roomId === selectedRoom?.roomId) ? 0 : (unread ?? 0)
        };
        return sortRoomsByTime([...prevRooms, newRoom]);
      }
    });
  };

  const sortRoomsByTime = (rooms) => {
    return [...rooms].sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });
  };

  const loadRooms = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/chat/rooms/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error('채팅방 목록 로드 실패');
      }

      const responseData = await response.json();
      let roomList = [];
      
      if (Array.isArray(responseData)) {
        roomList = responseData;
      } else if (Array.isArray(responseData.data)) {
        roomList = responseData.data;
      } else if (Array.isArray(responseData.result)) {
        roomList = responseData.result;
      }

      // 각 채팅방의 참가자 정보를 가져와서 이름 설정
      const roomsWithNames = await Promise.all(
        roomList.map(async (r) => {
          try {
            // getChatParticipants API 사용
            const participantsResponse = await getChatParticipants(r.roomId);
            const participantIds = participantsResponse.data || participantsResponse.result || [];
            
            // 참가자 정보 조회
            if (participantIds.length > 0) {
              const memberInfoPromises = participantIds.map(async (memberId) => {
                try {
                  const memberResponse = await fetch(
                    `${API_BASE_URL}/v1/members/${memberId}`,
                    {
                      headers: { 'Authorization': `Bearer ${accessToken}` }
                    }
                  );
                  
                  if (memberResponse.ok) {
                    const memberData = await memberResponse.json();
                    return memberData.data?.name || memberData.result?.name || `사용자${memberId}`;
                  }
                } catch (err) {
                  console.error(`멤버 ${memberId} 정보 조회 실패:`, err);
                }
                return `사용자${memberId}`;
              });

              const memberNames = await Promise.all(memberInfoPromises);
              
              // 이름 설정: 1명이면 이름만, 여러명이면 쉼표로 구분
              const displayName = memberNames.length === 1 
                ? memberNames[0] 
                : memberNames.join(', ');

              return {
                roomId: r.roomId,
                type: r.type,
                lastMessagePreview: r.lastMessagePreview ?? r.preview ?? '',
                unreadCount: r.unreadCount ?? r.unread ?? 0,
                lastMessageAt: r.lastMessageAt,
                otherMemberName: displayName,
                otherMemberRole: r.otherMemberRole,
                participantCount: memberNames.length
              };
            }
          } catch (err) {
            console.error(`채팅방 ${r.roomId} 참가자 조회 실패:`, err);
          }

          // 실패 시 기본값 사용
          return {
            roomId: r.roomId,
            type: r.type,
            lastMessagePreview: r.lastMessagePreview ?? r.preview ?? '',
            unreadCount: r.unreadCount ?? r.unread ?? 0,
            lastMessageAt: r.lastMessageAt,
            otherMemberName: r.otherMemberName || '사용자',
            otherMemberRole: r.otherMemberRole,
            participantCount: 1
          };
        })
      );

      setChatRooms(sortRoomsByTime(roomsWithNames));
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = async (roomId) => {
    if (!stompClientRef.current || !wsConnected) {
      alert('WebSocket 연결이 끊어졌습니다.');
      return;
    }

    // 이전 채팅방 읽음 처리
    if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
      console.log('🚪 이전 채팅방 나가기 - 읽음 처리:', previousRoomIdRef.current);
      await markAsRead(previousRoomIdRef.current);
    }

    previousRoomIdRef.current = selectedRoom?.roomId;
    
    // 선택된 채팅방 정보 설정
    const room = chatRooms.find(r => r.roomId === roomId);
    if (room) {
      setSelectedRoom(room);
      
      // 읽지 않은 메시지 수 초기화
      setChatRooms((prevRooms) => 
        prevRooms.map(r => 
          r.roomId === roomId ? { ...r, unreadCount: 0 } : r
        )
      );
    }
    
    // 메시지 초기화
    setMessages([]);
    setNextBeforeSeq(null);
    setHasMoreMessages(true);
    setIsFirstLoad(true);

    // 이전 구독 해제
    if (roomSubRef.current) {
      roomSubRef.current.unsubscribe();
      roomSubRef.current = null;
    }
  };

  const subscribeToRoom = (roomId) => {
    if (!stompClientRef.current || !wsConnected) {
      console.error('❌ WebSocket이 연결되지 않았습니다.');
      return;
    }

    const subscriptionPath = `/topic/chat/room/${roomId}`;
    
    try {
      roomSubRef.current = stompClientRef.current.subscribe(
        subscriptionPath,
        (message) => {
          try {
            const chatMessage = JSON.parse(message.body);
            console.log('📩 새 메시지 수신:', chatMessage);
            
            setMessages((prev) => [...prev, chatMessage]);
          } catch (error) {
            console.error('❌ 메시지 파싱 실패:', error);
          }
        },
        { 'Authorization': `Bearer ${accessToken}` }
      );
      
      console.log(`✅ 채팅방 ${roomId} 구독 완료:`, subscriptionPath);
    } catch (error) {
      console.error('❌ 방 구독 실패:', error);
    }
  };

  const loadMessages = async (roomId, beforeSeq = null) => {
    if (!accessToken || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      
      let url = `${API_BASE_URL}/v1/chat/rooms/${roomId}/messages?size=50`;
      if (beforeSeq) url += `&beforeSeq=${beforeSeq}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const responseData = await response.json();
        const messageList = responseData.data?.content || responseData.result?.content || responseData.content || [];
        const hasNext = responseData.data?.hasNext ?? responseData.result?.hasNext ?? false;

        if (isFirstLoad) {
          setMessages(messageList);
          setIsFirstLoad(false);
        } else {
          // 이전 메시지를 앞에 추가
          const scrollHeight = messagesContainerRef.current?.scrollHeight || 0;
          setMessages((prev) => [...messageList, ...prev]);
          
          // 스크롤 위치 유지
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = 
                messagesContainerRef.current.scrollHeight - scrollHeight;
            }
          }, 0);
        }
        
        setHasMoreMessages(hasNext);
        if (hasNext && messageList.length > 0) {
          setNextBeforeSeq(messageList[0].seq);
        }
      }
    } catch (error) {
      console.error('❌ 메시지 로드 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMoreMessages) return;
    
    if (messagesContainerRef.current.scrollTop < 100) {
      loadMessages(selectedRoom.roomId, nextBeforeSeq);
    }
  };

  const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content || !selectedRoom || !stompClientRef.current || !wsConnected) {
      return;
    }

    setSending(true);

    const message = {
      roomId: selectedRoom.roomId,
      senderId: currentUserId,
      type: 'TEXT',
      content: content,
      fileUrl: null,
      fileName: null,
      fileSize: null
    };

    try {
      console.log('📤 메시지 전송:', message);
      stompClientRef.current.send(
        `/publish/${selectedRoom.roomId}`, 
        JSON.stringify(message), 
        { 'content-type': 'application/json' }
      );
      setNewMessage('');
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = async (roomId) => {
    if (!accessToken || !roomId) return;
    
    try {
      console.log('✅ 읽음 처리 API 호출:', roomId);
      const response = await fetch(`${API_BASE_URL}/v1/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ 읽음 처리 완료:', roomId);
        
        // 채팅방 목록의 읽지 않은 메시지 수 업데이트
        setChatRooms((prev) =>
          prev.map((room) =>
            room.roomId === roomId ? { ...room, unreadCount: 0 } : room
          )
        );
      } else {
        console.error('❌ 읽음 처리 실패:', response.status);
      }
    } catch (e) {
      console.error('❌ 읽음 처리 API 호출 실패:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return formatTime(timestamp);
      } else if (days === 1) {
        return '어제';
      } else if (days < 7) {
        return `${days}일 전`;
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'numeric',
          day: 'numeric'
        });
      }
    } catch (err) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 px-4 py-4">
      {/* 채팅방 목록 */}
      <div className="w-80 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>💬</span>
            <span>채팅</span>
          </h2>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">
              {wsConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-600 text-sm">채팅방이 없습니다</p>
              <button
                onClick={() => navigate('/shelters')}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
              >
                보호소 둘러보기
              </button>
            </div>
          ) : (
            chatRooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => handleSelectRoom(room.roomId)}
                className={`w-full p-3 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                  selectedRoom?.roomId === room.roomId ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-lg">
                    {room.otherMemberName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {room.otherMemberName || '사용자'}
                      </p>
                      {room.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(room.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {room.lastMessagePreview || '메시지 없음'}
                    </p>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
        {selectedRoom ? (
          <>
            {/* 채팅방 헤더 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-lg">
                    {selectedRoom.otherMemberName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {selectedRoom.otherMemberName || '사용자'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedRoom.participantCount > 1 
                        ? `${selectedRoom.participantCount + 1}명` 
                        : (selectedRoom.otherMemberRole === 'SHELTER_OWNER' ? '보호소' : '봉사자')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            >
              {isLoadingMore && (
                <div className="text-center text-gray-500 text-sm py-2">
                  이전 메시지 불러오는 중...
                </div>
              )}
              
              {!hasMoreMessages && messages.length > 0 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  처음 메시지입니다
                </div>
              )}

              {messages.map((msg, index) => {
                // senderId를 숫자로 변환하여 비교 (타입 불일치 방지)
                const msgSenderId = typeof msg.senderId === 'string' ? parseInt(msg.senderId, 10) : msg.senderId;
                const currentUserIdNum = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;
                const isMyMessage = msgSenderId === currentUserIdNum;
                
                // 디버깅용 로그
                console.log('메시지 비교:', {
                  messageId: msg.messageId,
                  msgSenderId,
                  currentUserIdNum,
                  isMyMessage,
                  originalSenderId: msg.senderId,
                  originalCurrentUserId: currentUserId
                });
                
                return (
                  <div
                    key={msg.messageId || msg.seq || index}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMyMessage && (
                        <span className="text-xs text-gray-600 mb-1 px-2">
                          {msg.senderName || selectedRoom?.otherMemberName || '상대방'}
                        </span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          isMyMessage
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="p-3 border-t border-gray-200">
              {!wsConnected ? (
                <div className="text-center text-red-600 text-sm py-2">
                  ⚠️ 연결이 끊어졌습니다. 다시 연결 중...
                </div>
              ) : (
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                    rows={1}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={`px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm ${
                      (!newMessage.trim() || sending) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {sending ? '전송 중...' : '전송'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 text-lg">채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
