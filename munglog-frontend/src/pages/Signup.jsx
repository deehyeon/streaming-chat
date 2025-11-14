import React from 'react';

export default function Signup({ setCurrentPage }) {
  const handleSignup = (type) => {
    if (type === 'volunteer') {
      setCurrentPage('volunteer-signup');
    } else if (type === 'shelter') {
      setCurrentPage('shelter-signup');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🐶</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            멍로그에 오신 것을 환영합니다!
          </h1>
          <p className="text-gray-600">어떤 형태로 가입하시겠어요?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center text-5xl">
                👩
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                봉사자로 가입하기
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                보호소에서 봉사하고,<br />
                실종/보호 게시판을 이용하며,<br />
                분양 신청을 할 수 있어요
              </p>
              <button
                onClick={() => handleSignup('volunteer')}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-full font-bold hover:border-yellow-400 hover:bg-yellow-50 transition-all"
              >
                봉사자로 시작하기
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center text-5xl">
                🏠
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                보호소 센터 가입하기
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                보호소 정보를 등록하고,<br />
                봉사자를 모집하며,<br />
                분양 공고를 올릴 수 있어요
              </p>
              <button
                onClick={() => handleSignup('shelter')}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-full font-bold hover:border-yellow-400 hover:bg-yellow-50 transition-all"
              >
                보호소로 시작하기
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            이미 가입되어 있으신가요?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
            >
              로그인하기 →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}