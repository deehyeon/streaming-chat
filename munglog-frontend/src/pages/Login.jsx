import React, { useState } from 'react';

export default function Login({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: 실제 로그인 로직 구현
    if (email && password) {
      setIsLoggedIn(true);
      // 테스트를 위해 이메일로 사용자 타입 구분 (실제로는 서버에서 받아와야 함)
      // volunteer로 테스트하려면 이메일에 'volunteer'를 포함
      if (email.includes('volunteer')) {
        setUserType('volunteer');
      } else if (email.includes('shelter')) {
        setUserType('shelter');
      } else {
        // 기본값은 봉사자로 설정
        setUserType('volunteer');
      }
      setCurrentPage('home');
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: SNS 로그인 로직 구현
    console.log(`${provider} 로그인`);
    setIsLoggedIn(true);
    setUserType('volunteer'); // 기본값으로 봉사자 설정
    setCurrentPage('home');
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
            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 (테스트: volunteer@test.com)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                required
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
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 text-gray-800 rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow-md"
            >
              로그인
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
            >
              f
            </button>

            {/* Kakao */}
            <button
              onClick={() => handleSocialLogin('Kakao')}
              className="w-14 h-14 rounded-full bg-[#FEE500] text-gray-800 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              aria-label="Kakao 로그인"
            >
              K
            </button>

            {/* Naver */}
            <button
              onClick={() => handleSocialLogin('Naver')}
              className="w-14 h-14 rounded-full bg-[#03C75A] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              aria-label="Naver 로그인"
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