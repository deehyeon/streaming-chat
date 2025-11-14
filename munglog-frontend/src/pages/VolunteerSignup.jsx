import React, { useState } from 'react';

export default function VolunteerSignup({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [formData, setFormData] = useState({
    email: '',
    emailDomain: 'custom',
    password: '',
    passwordConfirm: '',
    nickname: ''
  });

  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
    robot: false
  });

  const emailDomains = ['선택해주세요', 'gmail.com', 'naver.com', 'daum.net', 'kakao.com', '직접입력'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgreementChange = (name) => {
    if (name === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        age: newValue,
        terms: newValue,
        privacy: newValue,
        marketing: newValue,
        robot: newValue
      });
    } else {
      const newAgreements = {
        ...agreements,
        [name]: !agreements[name]
      };
      // Check if all required agreements are checked
      newAgreements.all = newAgreements.age && newAgreements.terms && newAgreements.privacy && newAgreements.marketing && newAgreements.robot;
      setAgreements(newAgreements);
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`${provider} 회원가입`);
    setIsLoggedIn(true);
    setUserType('volunteer');
    setCurrentPage('home');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 약관 체크 확인
    if (!agreements.age || !agreements.terms || !agreements.privacy || !agreements.robot) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    console.log('회원가입 데이터:', formData, agreements);
    alert('회원가입이 완료되었습니다!');
    
    // 회원가입 성공 시 자동 로그인
    setIsLoggedIn(true);
    setUserType('volunteer');
    setCurrentPage('home');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-800 mb-8">회원가입</h1>

          {/* SNS 회원가입 */}
          <div className="mb-8">
            <p className="text-center text-gray-600 mb-4">SNS계정으로 간편하게 회원가입</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSocialSignup('Facebook')}
                className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                f
              </button>
              <button
                onClick={() => handleSocialSignup('Kakao')}
                className="w-14 h-14 rounded-full bg-[#FEE500] text-gray-800 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                K
              </button>
              <button
                onClick={() => handleSocialSignup('Naver')}
                className="w-14 h-14 rounded-full bg-[#03C75A] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                N
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">이메일</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="이메일"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                  required
                />
                <select
                  name="emailDomain"
                  value={formData.emailDomain}
                  onChange={handleInputChange}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                >
                  {emailDomains.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="w-full mt-2 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이메일 인증하기
              </button>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">비밀번호</label>
              <p className="text-xs text-gray-500 mb-2">영문, 숫자를 포함한 8자 이상의 비밀번호를 입력해주세요.</p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                placeholder="비밀번호 확인"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">닉네임</label>
              <p className="text-xs text-gray-500 mb-2">다른 유저와 겹치지 않도록 입력해주세요. (2~20자)</p>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="별명 (2~20자)"
                minLength={2}
                maxLength={20}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* 약관동의 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">약관동의</h3>
              
              {/* 전체동의 */}
              <label className="flex items-center gap-3 p-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={() => handleAgreementChange('all')}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                />
                <span className="font-semibold text-gray-800">전체동의</span>
                <span className="text-sm text-gray-500">선택항목에 대한 동의 포함</span>
              </label>

              <div className="space-y-2">
                {/* 만 14세 이상 */}
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.age}
                    onChange={() => handleAgreementChange('age')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="text-gray-700">만 14세 이상입니다</span>
                  <span className="text-sm text-blue-600">(필수)</span>
                </label>

                {/* 이용약관 */}
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="flex-1 text-gray-700">이용약관</span>
                  <span className="text-sm text-blue-600">(필수)</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </label>

                {/* 개인정보 마케팅 활용 */}
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="flex-1 text-gray-700">개인정보 마케팅 활용 동의</span>
                  <span className="text-sm text-gray-500">(선택)</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </label>

                {/* SMS 수신 동의 */}
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={() => handleAgreementChange('marketing')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="flex-1 text-gray-700">이벤트, 쿠폰, 특가 알림 메일 및 SMS 등 수신</span>
                  <span className="text-sm text-gray-500">(선택)</span>
                </label>

                {/* 로봇이 아닙니다 */}
                <label className="flex items-center gap-3 p-4 cursor-pointer bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.robot}
                    onChange={() => handleAgreementChange('robot')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="font-semibold text-gray-800">로봇이 아닙니다.</span>
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full py-4 bg-yellow-400 text-gray-800 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-md"
            >
              회원가입하기
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 아이디가 있으신가요?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
