import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://158.180.75.249:8080';

export default function ShelterSignup({ setCurrentPage, setIsLoggedIn, setUserType }) {
  const [step, setStep] = useState(1); // 1: 기본 정보, 2: 보호소 정보
  
  const [formData, setFormData] = useState({
    // 1단계: 기본 회원 정보
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    postalCode: '',
    streetAddress: '',
    detailAddress: '',
    
    // 2단계: 보호소 정보
    shelterName: '',
    shelterPhone: '',
    shelterEmail: '',
    websiteLinks: [''],
    description: '',
    openingHours: '',
    volunteerInfo: '',
    shelterPostalCode: '',
    shelterStreetAddress: '',
    shelterDetailAddress: ''
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

  const addWebsiteLink = () => {
    if (formData.websiteLinks.length < 10) {
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

  const handleSocialSignup = (provider) => {
    alert(`${provider} 보호소 회원가입 기능은 준비 중입니다.`);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다.');
      return;
    }

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    // 필수 필드 검증
    if (!formData.shelterName || !formData.shelterPhone || !formData.shelterEmail) {
      setError('보호소 필수 정보를 모두 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^0\d{1,2}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(formData.shelterPhone)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)');
      return;
    }

    setLoading(true);

    try {
      // 1단계: 회원가입
      const signupBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'SHELTER',
        address: {
          postalCode: formData.postalCode,
          streetAddress: formData.streetAddress,
          detailAddress: formData.detailAddress
        }
      };

      const signupResponse = await fetch(`${API_BASE_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupBody),
      });

      const signupData = await signupResponse.json();

      if (signupData.result !== 'SUCCESS' || !signupData.data) {
        setError(signupData.error?.message || '회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      const { tokenInfo, memberInfo } = signupData.data;

      // 토큰 저장
      localStorage.setItem('accessToken', tokenInfo.accessToken);
      localStorage.setItem('refreshToken', tokenInfo.refreshToken);
      localStorage.setItem('memberId', memberInfo.memberId);
      localStorage.setItem('memberRole', memberInfo.role);

      // 2단계: 보호소 등록
      const shelterBody = {
        name: formData.shelterName,
        phone: formData.shelterPhone,
        email: formData.shelterEmail,
        urls: formData.websiteLinks.filter(link => link.trim() !== ''),
        description: formData.description || null,
        openingHours: formData.openingHours || null,
        volunteerInfo: formData.volunteerInfo || null,
        address: {
          postalCode: formData.shelterPostalCode,
          streetAddress: formData.shelterStreetAddress,
          detailAddress: formData.shelterDetailAddress
        },
        shelterImageUrls: null,
        shelterDogsImageUrls: null
      };

      const shelterResponse = await fetch(`${API_BASE_URL}/v1/shelters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenInfo.accessToken}`
        },
        body: JSON.stringify(shelterBody),
      });

      const shelterData = await shelterResponse.json();

      if (shelterData.result !== 'SUCCESS') {
        setError(shelterData.error?.message || '보호소 등록에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 상태 업데이트
      setIsLoggedIn(true);
      setUserType('shelter');

      alert('보호소 센터 회원가입이 완료되었습니다! 자동으로 로그인됩니다.');
      setCurrentPage('home');

    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('서버와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
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

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
                      담당자 이름 <span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      이메일 (아이디로 사용) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="shelter@example.com" 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                      required 
                      disabled={loading}
                    />
                  </div>

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
                </div>

                {/* 담당자 주소 */}
                <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📍 담당자 주소</h3>
                  
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
                  다음 단계로
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* 보호소 기본 정보 */}
              <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 보호소 기본 정보</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 이름 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="shelterName" 
                    value={formData.shelterName} 
                    onChange={handleInputChange}
                    placeholder="사랑 동물 보호소"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="shelterPhone" 
                    value={formData.shelterPhone} 
                    onChange={handleInputChange}
                    placeholder="02-1234-5678"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">형식: 0X-XXXX-XXXX 또는 0XX-XXX-XXXX</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 이메일 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="shelterEmail" 
                    value={formData.shelterEmail} 
                    onChange={handleInputChange}
                    placeholder="shelter@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    required 
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    홈페이지/SNS 링크 (최대 10개)
                  </label>
                  <div className="space-y-2">
                    {formData.websiteLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="url" 
                          value={link} 
                          onChange={(e) => handleWebsiteLinkChange(index, e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                          disabled={loading}
                        />
                        {formData.websiteLinks.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeWebsiteLink(index)}
                            disabled={loading}
                            className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.websiteLinks.length < 10 && (
                    <button 
                      type="button" 
                      onClick={addWebsiteLink}
                      disabled={loading}
                      className="mt-2 text-yellow-500 text-sm hover:text-yellow-600"
                    >
                      + 링크 추가
                    </button>
                  )}
                </div>
              </div>

              {/* 보호소 운영 정보 */}
              <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ 운영 정보</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    운영 시간
                  </label>
                  <input 
                    type="text" 
                    name="openingHours" 
                    value={formData.openingHours} 
                    onChange={handleInputChange}
                    placeholder="평일 09:00-18:00, 주말 10:00-17:00"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    봉사 안내 정보
                  </label>
                  <textarea 
                    name="volunteerInfo" 
                    value={formData.volunteerInfo} 
                    onChange={handleInputChange}
                    placeholder="봉사는 사전 예약이 필요합니다. 평일 오전 10시부터 가능합니다."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none" 
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    보호소 상세 설명
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    placeholder="유기동물을 사랑으로 보살피는 보호소입니다."
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none" 
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 보호소 주소 */}
              <div className="border border-yellow-300 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📍 보호소 주소</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    우편번호 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="shelterPostalCode" 
                    value={formData.shelterPostalCode} 
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
                    name="shelterStreetAddress" 
                    value={formData.shelterStreetAddress} 
                    onChange={handleInputChange}
                    placeholder="경기도 수원시 영통구 매향로"
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
                    name="shelterDetailAddress" 
                    value={formData.shelterDetailAddress} 
                    onChange={handleInputChange}
                    placeholder="1층"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setStep(1);
                    window.scrollTo(0, 0);
                  }}
                  disabled={loading}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  이전 단계로
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`flex-1 py-4 bg-yellow-400 text-gray-800 rounded-lg font-bold text-lg transition-colors shadow-md ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
                  }`}
                >
                  {loading ? '처리 중...' : '회원가입 완료'}
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