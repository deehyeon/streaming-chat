import React, { useState } from 'react';

export default function AdoptionPostCreate({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    breed: '',
    age: '',
    gender: '',
    region: '',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    console.log('Images:', images);
    alert('게시글이 작성되었습니다.');
    setCurrentPage('adoption');
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까?')) {
      setCurrentPage('adoption');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">새로운 가족을 찾아요</h1>
        <div className="flex justify-center mb-4">
          <img 
            src="/logo/돈이 캐릭터 5.svg" 
            alt="강아지 캐릭터" 
            className="w-32 h-32 object-contain"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="60" font-size="60">🐶</text></svg>';
            }}
          />
        </div>
        <p className="text-sm text-gray-600">
          따뜻한 가정에서 사랑받을 반려견들이 기다리고 있어요!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">분양 게시글 작성하기</h2>

          {/* 게시글 제목 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              게시글 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="게시글 제목을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              required
            />
          </div>

          {/* 이름 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              이름
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="주소 검색"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 견종 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              견종
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="분양하는 반려견 견종을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>

          {/* 나이 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              나이
            </label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="분양하는 반려견의 나이를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>

          {/* 성별 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              성별
            </label>
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              placeholder="분양하는 반려견의 성별을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>

          {/* 지역 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              지역
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="분양하는 반려견의 성별을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>

          {/* 상세 설명 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              상세 설명
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="[선택]글 보다 더한 정보를 전달할 수 있게 상세 설명을 작성해주세요."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none h-32"
                maxLength={1000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {formData.description.length}/1000
              </div>
            </div>
          </div>

          {/* 사진 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              사진 업로드
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">파일 업로드</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black bg-opacity-50 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-red-500 mt-2">
              [선택]글을 보다 더 잘나올 수 있게 사진을 올려주세요
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            취소하기
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            게시하기
          </button>
        </div>
      </form>
    </div>
  );
}
