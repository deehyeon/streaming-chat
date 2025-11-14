import React, { useState } from 'react';

export default function ShelterSignup({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [step, setStep] = useState(1); // 1: 기본 정보, 2: 보호소 정보
  
  const [formData, setFormData] = useState({
    // 1단계: 기본 회원 정보
    email: '',
    password: '',
    passwordConfirm: '',
    
    // 2단계: 보호소 정보
    shelterName: '',
    address: '',
    managerName: '',
    websiteLinks: [''],
    operatingStatus: '', // 운영 여부
    openingHours: '', // 운영 시간
    volunteerAvailable: '', // 봉사 가능 여부
    volunteerTime: '', // 봉사 가능 시간
    shelterArea: '', // 보호소 면적
    description: '' // 상세 설명
  });

  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
    robot: false
  });

  const [verification, setVerification] = useState({
    emailVerified: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addWebsiteLink = () => {
    if (formData.websiteLinks.length < 5) {
      setFormData(prev => ({
        ...prev,
        websiteLinks: [...prev.websiteLinks, '']
      }));
    }
  };

  const removeWebsiteLink = (index) => {
    if (formData.websiteLinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        websiteLinks: prev.websiteLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleWebsiteLinkChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      websiteLinks: prev.websiteLinks.map((link, i) => i === index ? value : link)
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

  const handleEmailVerification = () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    alert('인증 이메일이 발송되었습니다.');
    setVerification(prev => ({ ...prev, emailVerified: true }));
  };

  const handleSocialSignup = (provider) => {
    console.log(`${provider} 보호소 회원가입`);
    // 소셜 로그인 후 2단계(보호소 정보 입력)로 이동
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    if (!verification.emailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    if (!agreements.age || !agreements.terms || !agreements.privacy || !agreements.robot) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    // 1단계 완료, 2단계로 이동
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.shelterName || !formData.address || !formData.managerName) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    // 회원가입 완료
    console.log('보호소 회원가입 완료:', formData);
    
    // 자동 로그인 처리
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'shelter');
    localStorage.setItem('userEmail', formData.email);
    
    // 부모 컴포넌트의 상태 업데이트
    if (setIsLoggedIn) setIsLoggedIn(true);
    if (setUserType) setUserType('shelter');
    
    alert('보호소 센터 회원가입이 완료되었습니다! 자동으로 로그인됩니다.');
    setCurrentPage('home');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏠</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">보호소 센터 회원가입</h1>
            <p className="text-gray-600">
              {step === 1 ? '기본 정보를 입력해주세요' : '보호소 정보를 등록해주세요'}
            </p>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 1 ? 'bg-yellow-400 text-gray-800' : 'bg-green-500 text-white'
              }`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step === 2 ? 'bg-yellow-400 text-gray-800' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {step === 1 && (
            <>
              {/* SNS 간편가입 */}
              <div className="mb-6">
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

              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">또는 이메일로 가입</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* 계정 정보 */}
                <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🔐 계정 정보</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      이메일 (아이디로 사용) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="shelter@example.com" 
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                        required 
                        disabled={verification.emailVerified}
                      />
                      <button 
                        type="button" 
                        onClick={handleEmailVerification} 
                        disabled={verification.emailVerified}
                        className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                          verification.emailVerified 
                            ? 'bg-green-500 text-white cursor-not-allowed' 
                            : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                        }`}
                      >
                        {verification.emailVerified ? '✓ 인증완료' : '이메일 인증'}
                      </button>
                    </div>
                    {verification.emailVerified && (
                      <p className="text-sm text-green-600 mt-1">✓ 이메일 인증이 완료되었습니다.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
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
                      />
                      <span className="flex-1 text-gray-700">이용약관</span>
                      <span className="text-sm text-red-600">(필수)</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </label>

                    <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={agreements.privacy} 
                        onChange={() => handleAgreementChange('privacy')} 
                        className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" 
                      />
                      <span className="flex-1 text-gray-700">개인정보 수집 및 이용 동의</span>
                      <span className="text-sm text-red-600">(필수)</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </label>

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

                    <label className="flex items-center gap-3 p-4 cursor-pointer bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={agreements.robot} 
                        onChange={() => handleAgreementChange('robot')} 
                        className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" 
                      />
                      <span className="font-semibold text-gray-800">로봇이 아닙니다.</span>
                      <span className="text-sm text-red-600">(필수)</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-yellow-400 text-gray-800 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-md"
                >
                  다음 단계로
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* 보호소 정보 */}
              <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 보호소 정보</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 이름 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="shelterName" 
                    value={formData.shelterName} 
                    onChange={handleInputChange}
                    placeholder="강남 보호소"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 주소 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    placeholder="경기도 수원시 영통구 매향로"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    담당자 이름 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="managerName" 
                    value={formData.managerName} 
                    onChange={handleInputChange}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    홈페이지/SNS 링크 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {formData.websiteLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="url" 
                          value={link} 
                          onChange={(e) => handleWebsiteLinkChange(index, e.target.value)}
                          placeholder="보호소 이용을 알려주세요."
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                        />
                        {formData.websiteLinks.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeWebsiteLink(index)}
                            className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    onClick={addWebsiteLink}
                    className="mt-2 text-red-500 text-lg hover:text-red-600"
                  >
                    +
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 운영 여부 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="operatingStatus" 
                    value={formData.operatingStatus} 
                    onChange={handleInputChange}
                    placeholder="소자만 입력해주세요."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 운영 시간 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="openingHours" 
                    value={formData.openingHours} 
                    onChange={handleInputChange}
                    placeholder="소자만 입력해주세요."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    봉사 가능 여부 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="volunteerAvailable" 
                    value={formData.volunteerAvailable} 
                    onChange={handleInputChange}
                    placeholder="소자만 입력해주세요."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    봉사 가능 시간 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="volunteerTime" 
                    value={formData.volunteerTime} 
                    onChange={handleInputChange}
                    placeholder="소자만 입력해주세요."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 면적 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="shelterArea" 
                    value={formData.shelterArea} 
                    onChange={handleInputChange}
                    placeholder="소자만 입력해주세요."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 상세 설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    placeholder="보호소 상세 설명을 입력해주세요."
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none" 
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  이전 단계로
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-yellow-400 text-gray-800 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-md"
                >
                  회원가입 완료
                </button>
              </div>
            </form>
          )}

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
