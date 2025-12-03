import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://158.180.75.249:8080';

export default function Login({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.result === 'SUCCESS' && data.data) {
        const { tokenInfo, memberInfo } = data.data;

        // 토큰 저장 (localStorage)
        localStorage.setItem('accessToken', tokenInfo.accessToken);
        localStorage.setItem('refreshToken', tokenInfo.refreshToken);
        localStorage.setItem('memberId', memberInfo.memberId);
        localStorage.setItem('memberRole', memberInfo.role);

        // 상태 업데이트
        setIsLoggedIn(true);
        
        // 역할에 따라 userType 설정
        if (memberInfo.role === 'VOLUNTEER') {
          setUserType('volunteer');
        } else if (memberInfo.role === 'SHELTER') {
          setUserType('shelter');
        } else {
          setUserType('volunteer'); // 기본값
        }

        // 홈으로 이동
        setCurrentPage('home');
      } else {
        // 에러 처리
        setError(data.error?.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('서버와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: SNS 로그인 로직 구현
    alert(`${provider} 로그인 기능은 준비 중입니다.`);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐶</div>
          <h1 className="text-3xl font-bold text-gray-800">멍로그</h1>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                required
                disabled={loading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                required
                disabled={loading}
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-yellow-400 text-gray-800 rounded-lg font-bold transition-colors shadow-md ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-yellow-500'
              }`}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 링크들 */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-600">
            <button
              onClick={() => alert('비밀번호 재설정 기능은 준비 중입니다.')}
              className="hover:text-gray-800 transition-colors"
            >
              비밀번호 재설정
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => setCurrentPage('signup')}
              className="hover:text-gray-800 transition-colors"
            >
              회원가입
            </button>
          </div>

          {/* 구분선 */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  SNS계정으로 간편 로그인/회원가입
                </span>
              </div>
            </div>
          </div>

          {/* SNS 로그인 버튼들 */}
          <div className="flex justify-center gap-4">
            {/* Facebook */}
            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              aria-label="Facebook 로그인"
              disabled={loading}
            >
              f
            </button>

            {/* Kakao */}
            <button
              onClick={() => handleSocialLogin('Kakao')}
              className="w-14 h-14 rounded-full bg-[#FEE500] text-gray-800 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              aria-label="Kakao 로그인"
              disabled={loading}
            >
              K
            </button>

            {/* Naver */}
            <button
              onClick={() => handleSocialLogin('Naver')}
              className="w-14 h-14 rounded-full bg-[#03C75A] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              aria-label="Naver 로그인"
              disabled={loading}
            >
              N
            </button>
          </div>

          {/* 추가 링크 */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-500">
              로그인에 문제가 있으신가요?
            </p>
            <button
              onClick={() => alert('비회원 주문 조회 기능은 준비 중입니다.')}
              className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              비회원 주문 조회하기
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © MongLog. All Rights Reserved
        </div>
      </div>
    </div>
  );
}