import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://158.180.75.249:8080';

export default function VolunteerSignup({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    postalCode: '',
    streetAddress: '',
    detailAddress: ''
  });

  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
    robot: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      newAgreements.all = newAgreements.age && newAgreements.terms && 
                          newAgreements.privacy && newAgreements.marketing && 
                          newAgreements.robot;
      setAgreements(newAgreements);
    }
  };

  const handleSocialSignup = (provider) => {
    alert(`${provider} 회원가입 기능은 준비 중입니다.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!agreements.age || !agreements.terms || !agreements.privacy || !agreements.robot) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    // 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'VOLUNTEER',
        address: {
          postalCode: formData.postalCode,
          streetAddress: formData.streetAddress,
          detailAddress: formData.detailAddress
        }
      };

      const response = await fetch(`${API_BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.result === 'SUCCESS' && data.data) {
        const { tokenInfo, memberInfo } = data.data;

        // 토큰 저장
        localStorage.setItem('accessToken', tokenInfo.accessToken);
        localStorage.setItem('refreshToken', tokenInfo.refreshToken);
        localStorage.setItem('memberId', memberInfo.memberId);
        localStorage.setItem('memberRole', memberInfo.role);

        // 상태 업데이트
        setIsLoggedIn(true);
        setUserType('volunteer');

        alert('봉사자 회원가입이 완료되었습니다! 자동으로 로그인됩니다.');
        setCurrentPage('home');
      } else {
        setError(data.error?.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('서버와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">봉사자 회원가입</h1>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* SNS 회원가입 */}
          <div className="mb-8">
            <p className="text-center text-gray-600 mb-4">SNS계정으로 간편하게 회원가입</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSocialSignup('Facebook')}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                f
              </button>
              <button
                onClick={() => handleSocialSignup('Kakao')}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-[#FEE500] text-gray-800 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                K
              </button>
              <button
                onClick={() => handleSocialSignup('Naver')}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-[#03C75A] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-md"
              >
                N
              </button>
            </div>
          </div>

          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는 이메일로 가입</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="홍길동"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
                disabled={loading}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="volunteer@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
                disabled={loading}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">영문, 숫자, 특수문자를 포함한 8~20자</p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
                disabled={loading}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                placeholder="비밀번호 확인"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                required
                disabled={loading}
              />
            </div>

            {/* 주소 */}
            <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📍 주소</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  도로명 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="서울특별시 강남구 테헤란로"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  상세 주소
                </label>
                <input
                  type="text"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  placeholder="101동 1001호"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 약관동의 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">약관동의</h3>
              
              <label className="flex items-center gap-3 p-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={() => handleAgreementChange('all')}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  disabled={loading}
                />
                <span className="font-semibold text-gray-800">전체동의</span>
                <span className="text-sm text-gray-500">선택항목에 대한 동의 포함</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.age}
                    onChange={() => handleAgreementChange('age')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    disabled={loading}
                  />
                  <span className="text-gray-700">만 14세 이상입니다</span>
                  <span className="text-sm text-red-600">(필수)</span>
                </label>

                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    disabled={loading}
                  />
                  <span className="flex-1 text-gray-700">이용약관</span>
                  <span className="text-sm text-red-600">(필수)</span>
                </label>

                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    disabled={loading}
                  />
                  <span className="flex-1 text-gray-700">개인정보 수집 및 이용 동의</span>
                  <span className="text-sm text-red-600">(필수)</span>
                </label>

                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={() => handleAgreementChange('marketing')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    disabled={loading}
                  />
                  <span className="flex-1 text-gray-700">이벤트, 쿠폰, 특가 알림 메일 및 SMS 등 수신</span>
                  <span className="text-sm text-gray-500">(선택)</span>
                </label>

                <label className="flex items-center gap-3 p-4 cursor-pointer bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <input
                    type="checkbox"
                    checked={agreements.robot}
                    onChange={() => handleAgreementChange('robot')}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    disabled={loading}
                  />
                  <span className="font-semibold text-gray-800">로봇이 아닙니다.</span>
                  <span className="text-sm text-red-600">(필수)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-yellow-400 text-gray-800 rounded-lg font-bold text-lg transition-colors shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
              }`}
            >
              {loading ? '회원가입 처리 중...' : '회원가입하기'}
            </button>
          </form>

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