// src/api/chatApi.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://158.180.75.249';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
    throw new Error(error.error?.message || error.message || '요청이 실패했습니다.');
  }

  return response.json();
}

// 1:1 채팅방 생성 또는 기존 roomId 반환
export async function createPrivateChatRoom(otherMemberId) {
  return apiCall(`/v1/chat/rooms/private?otherMemberId=${otherMemberId}`, {
    method: 'POST'
  });
}

// 그룹 채팅방 생성
export async function createGroupChatRoom(otherMemberIds) {
  const params = otherMemberIds.map(id => `otherMemberIds=${id}`).join('&');
  return apiCall(`/v1/chat/rooms/group?${params}`, {
    method: 'POST'
  });
}

// 내 채팅방 목록 조회
export async function getMyChatRooms() {
  return apiCall('/v1/chat/rooms/me');
}

export async function getChatParticipants(roonId) {
  return apiCall(`/v1/chat/rooms/${roonId}/participants`);
}

// 채팅방 나가기
export async function leaveChatRoom(roomId) {
  return apiCall(`/v1/chat/rooms/${roomId}`, {
    method: 'DELETE'
  });
}

// 그룹 채팅방 참여
export async function joinGroupChatRoom(roomId) {
  return apiCall(`/v1/chat/rooms/${roomId}`, {
    method: 'POST'
  });
}

// ============================================================================
// 채팅 메시지 API
// ============================================================================

/**
 * 채팅 메시지 목록 조회 (페이지네이션)
 * GET /v1/chat/rooms/{roomId}/messages
 * @param {number} roomId - 채팅방 ID
 * @param {Object} params - 쿼리 파라미터
 * @param {number} [params.page=0] - 페이지 번호
 * @param {number} [params.size=50] - 페이지 크기
 * @returns {Promise<{result: string, data: Object}>} 메시지 목록
 */
export async function getChatMessages(roomId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/v1/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`;
  
  return apiCall(endpoint);
}

/**
 * 읽지 않은 메시지 수 조회
 * GET /v1/chat/rooms/{roomId}/unread-count
 * @param {number} roomId - 채팅방 ID
 * @returns {Promise<{result: string, data: number}>} 읽지 않은 메시지 수
 */
export async function getUnreadMessageCount(roomId) {
  return apiCall(`/v1/chat/rooms/${roomId}/unread-count`);
}

/**
 * 메시지 읽음 처리
 * POST /v1/chat/rooms/{roomId}/read
 * @param {number} roomId - 채팅방 ID
 */
export async function markMessagesAsRead(roomId) {
  return apiCall(`/v1/chat/rooms/${roomId}/read`, {
    method: 'POST'
  });
}

/**
 * 전체 읽지 않은 메시지 수 조회
 * GET /v1/chat/unread-total
 * @returns {Promise<{result: string, data: number}>} 전체 읽지 않은 메시지 수
 */
export async function getTotalUnreadCount() {
  return apiCall('/v1/chat/unread-total');
}