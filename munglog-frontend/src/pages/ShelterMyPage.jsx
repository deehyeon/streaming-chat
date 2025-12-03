import React, { useState, useEffect } from 'react';
import { getMyShelter, updateShelter, updateShelterAddress, deleteShelter } from '../api/shelterApi';
import { getMyInfo, changeName, changePhone, changePassword } from '../api/memberApi';
import { logout as logoutApi } from '../api/authApi';

export default function ShelterMyPage({ setCurrentPage, handleLogout }) {
  const [activeMenu, setActiveMenu] = useState('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getMyInfo();
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      alert('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logoutApi();
    if (handleLogout) {
      handleLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex -mx-6 -my-6">
      {/* Sidebar - 화면 제일 왼쪽에 고정 */}
      <div className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">마이페이지</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveMenu('info')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'info'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">👤</span> 내 정보
            </button>
            <button
              onClick={() => setActiveMenu('shelter')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'shelter'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">🏠</span> 보호소 정보
            </button>
            <button
              onClick={() => setActiveMenu('volunteer-dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'volunteer-dashboard'
                  ? 'bg-red-50 text-red-500 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">📊</span> 봉사 대시보드
            </button>
          </nav>
          
          <button 
            onClick={handleLogoutClick}
            className="w-full mt-8 px-4 py-3 text-left text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center gap-2"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </div>

      {/* Main Content - 중앙에 넓게 */}
      <div className="flex-1 py-8 px-12 max-w-7xl mx-auto">
        {activeMenu === 'info' && (
          <MyInfo 
            userData={userData}
            onRefresh={fetchUserData}
            setShowPasswordModal={setShowPasswordModal}
            setShowPhoneModal={setShowPhoneModal}
            setShowNameModal={setShowNameModal}
          />
        )}

        {activeMenu === 'shelter' && (
          <ShelterInfo />
        )}

        {activeMenu === 'volunteer-dashboard' && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">봉사 대시보드</h1>
            <p className="text-gray-600">봉사 대시보드 기능이 추가될 예정입니다.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => setShowPasswordModal(false)}
          onRefresh={fetchUserData}
        />
      )}
      {showPhoneModal && (
        <PhoneChangeModal 
          onClose={() => setShowPhoneModal(false)}
          onRefresh={fetchUserData}
        />
      )}
      {showNameModal && (
        <NameChangeModal 
          onClose={() => setShowNameModal(false)}
          onRefresh={fetchUserData}
        />
      )}
    </div>
  );
}

// 보호소 정보 탭
function ShelterInfo() {
  const [shelterData, setShelterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    urls: [''],
    description: '',
    openingHours: '',
    volunteerInfo: '',
  });

  useEffect(() => {
    fetchMyShelter();
  }, []);

  const fetchMyShelter = async () => {
    try {
      setLoading(true);
      const response = await getMyShelter();
      setShelterData(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        email: response.data.email?.email || '',
        urls: response.data.urls || [''],
        description: response.data.description || '',
        openingHours: response.data.openingHours || '',
        volunteerInfo: response.data.volunteerInfo || '',
      });
      setError(null);
    } catch (err) {
      if (err.message.includes('404')) {
        setError('등록된 보호소가 없습니다.');
      } else {
        setError('보호소 정보를 불러오는데 실패했습니다.');
      }
      console.error('Error fetching my shelter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...formData.urls];
    newUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      urls: newUrls
    }));
  };

  const addUrlField = () => {
    if (formData.urls.length < 10) {
      setFormData(prev => ({
        ...prev,
        urls: [...prev.urls, '']
      }));
    }
  };

  const removeUrlField = (index) => {
    if (formData.urls.length > 1) {
      const newUrls = formData.urls.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        urls: newUrls
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // URL 필터링 (빈 값 제거)
      const filteredUrls = formData.urls.filter(url => url.trim() !== '');
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        urls: filteredUrls.length > 0 ? filteredUrls : null,
        description: formData.description,
        openingHours: formData.openingHours,
        volunteerInfo: formData.volunteerInfo,
      };

      await updateShelter(updateData);
      await fetchMyShelter();
      setIsEditing(false);
      alert('보호소 정보가 수정되었습니다.');
    } catch (err) {
      alert('보호소 정보 수정에 실패했습니다.');
      console.error('Error updating shelter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 보호소를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteShelter(shelterData.shelterId);
      alert('보호소가 삭제되었습니다.');
      setShelterData(null);
      setError('등록된 보호소가 없습니다.');
    } catch (err) {
      alert('보호소 삭제에 실패했습니다.');
      console.error('Error deleting shelter:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shelterData) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-4">🏠</div>
            <p className="text-gray-600">보호소 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-gray-600 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.href = '/shelter/register'}
            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
          >
            보호소 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">보호소 정보</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
              >
                삭제
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium disabled:opacity-50"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchMyShelter();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 보호소 이름 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            보호소 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50"
            maxLength={100}
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            placeholder="02-1234-5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            placeholder="shelter@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            URL (최대 10개)
          </label>
          {formData.urls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                disabled={!isEditing}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50"
              />
              {isEditing && formData.urls.length > 1 && (
                <button
                  onClick={() => removeUrlField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          {isEditing && formData.urls.length < 10 && (
            <button
              onClick={addUrlField}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              + URL 추가
            </button>
          )}
        </div>

        {/* 운영 시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            운영 시간
          </label>
          <input
            type="text"
            value={formData.openingHours}
            onChange={(e) => handleInputChange('openingHours', e.target.value)}
            disabled={!isEditing}
            placeholder="평일 09:00-18:00, 주말 10:00-17:00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50"
            maxLength={200}
          />
        </div>

        {/* 봉사 안내 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            봉사 안내 정보
          </label>
          <textarea
            value={formData.volunteerInfo}
            onChange={(e) => handleInputChange('volunteerInfo', e.target.value)}
            disabled={!isEditing}
            placeholder="봉사는 사전 예약이 필요합니다."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50 min-h-[100px]"
            maxLength={2000}
          />
        </div>

        {/* 상세 설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            상세 설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={!isEditing}
            placeholder="유기동물을 사랑으로 보살피는 보호소입니다."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 disabled:bg-gray-50 min-h-[200px]"
            maxLength={2000}
          />
        </div>

        {/* 주소 정보 (읽기 전용) */}
        {shelterData.address && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              주소
            </label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
              <p className="text-gray-700">
                [{shelterData.address.postalCode}] {shelterData.address.streetAddress}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {shelterData.address.detailAddress}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 주소는 별도 API를 통해 수정할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 내 정보 탭
function MyInfo({ userData, onRefresh, setShowPasswordModal, setShowPhoneModal, setShowNameModal }) {
  if (!userData) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">기본 정보</h1>

      {/* 이메일 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이메일</h3>
            <p className="text-gray-600 text-sm">{userData.email || '-'}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (이메일)</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">• CONIC 및 제휴사의 소식/혜택/이벤트 광고 정보를 받으실 수 있습니다.</p>
            <p className="text-xs text-gray-400">• 광고 및 혜택의 운영방침은 수시 변경 여부와 상관없이 발송됩니다.</p>
          </div>
        </div>
      </div>

      {/* 이름 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">이름</h3>
            <p className="text-gray-600 text-sm">{userData.name || '-'}</p>
          </div>
          <button
            onClick={() => setShowNameModal(true)}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
          >
            변경
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 전화번호 */}
      {userData.phone && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-800 mb-2">전화번호</h3>
              <p className="text-gray-600 text-sm">{userData.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500">혜택/이벤트 정보 알림 수신 (앱 알림 또는 문자 메시지)</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">• CONIC 또는 문자 메시지를 발송이 발송될 수 있습니다.</p>
              <p className="text-xs text-gray-400">• CONIC 및 제휴사의 소식/혜택/이벤트-광고 정보를 받으실 수 있습니다.</p>
            </div>
            <button
              onClick={() => setShowPhoneModal(true)}
              className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
            >
              변경
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 역할 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">역할</h3>
            <p className="text-gray-600 text-sm">
              {userData.role === 'VOLUNTEER' ? '봉사자' : 
               userData.role === 'SHELTER_OWNER' ? '보호소 운영자' : 
               userData.role || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 주소 */}
      {userData.address && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-800 mb-2">주소</h3>
              <p className="text-gray-600 text-sm">
                [{userData.address.postalCode}] {userData.address.streetAddress}
              </p>
              {userData.address.detailAddress && (
                <p className="text-gray-500 text-xs mt-1">
                  {userData.address.detailAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-base font-semibold text-gray-800">비밀번호 변경</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 서비스 이용약관 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">서비스 이용약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 개인정보 수집 및 이용 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">개인정보 수집 및 이용</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 저작권에 관한 약관 */}
      <div className="mb-6">
        <button className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold text-gray-800">저작권에 관한 약관</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Password Change Modal
function PasswordChangeModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    // 유효성 검사
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 규칙 검증
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+|\-=\[\]{};:',.<>/?])[A-Za-z\d!@#$%^&*()_+|\-=\[\]{};:',.<>/?]{8,20}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      alert('비밀번호가 변경되었습니다.');
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">비밀번호 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="현재 비밀번호를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="영문, 숫자, 특수문자 조합하여 8-20자"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 mb-3 text-sm"
            />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="비밀번호 확인"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '변경 중...' : '변경완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Phone Change Modal
function PhoneChangeModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendCode = async () => {
    if (!formData.phone) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // TODO: 인증번호 전송 API 호출
      // await sendVerificationCode(formData.phone);
      setCodeSent(true);
      alert('인증번호가 전송되었습니다.');
    } catch (err) {
      setError(err.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // TODO: 인증번호 확인 API 호출
      // await verifyCode(formData.phone, formData.verificationCode);
      setVerified(true);
      alert('인증이 완료되었습니다.');
    } catch (err) {
      setError(err.message || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!verified) {
      setError('전화번호 인증을 완료해주세요.');
      return;
    }

    try {
      setLoading(true);
      await changePhone({ phone: formData.phone });
      alert('전화번호가 변경되었습니다.');
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || '전화번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">전화번호 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                disabled={codeSent}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-100"
              />
              <button 
                onClick={handleSendCode}
                disabled={loading || codeSent}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-300 disabled:opacity-50"
              >
                {codeSent ? '전송완료' : '인증번호 전송'}
              </button>
            </div>
          </div>

          {codeSent && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="인증번호 입력"
                  disabled={verified}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-100"
                />
                <button 
                  onClick={handleVerifyCode}
                  disabled={loading || verified}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-300 disabled:opacity-50"
                >
                  {verified ? '인증완료' : '인증번호 확인'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !verified}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '변경 중...' : '변경완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Name Change Modal
function NameChangeModal({ onClose, onRefresh }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await changeName({ name: name.trim() });
      alert('이름이 변경되었습니다.');
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || '이름 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">이름 변경</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '변경 중...' : '변경 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}