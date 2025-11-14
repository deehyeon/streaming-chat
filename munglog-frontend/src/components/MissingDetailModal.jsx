import React from 'react';
import { X } from 'lucide-react';

const MissingDetailModal = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) return null;

  const handleReportClick = () => {
    alert('제보하기 기능은 준비중입니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {post.title}
          </h2>

          {/* Dog Image */}
          <div className="flex justify-center mb-8">
            <div className="w-80 h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 flex items-center justify-center shadow-inner">
              <img
                src={post.image}
                alt="반려동물"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="60" font-size="60">🐶</text></svg>';
                }}
              />
            </div>
          </div>

          {/* Information Fields */}
          <div className="space-y-4 mb-8">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-32 py-3 px-4 bg-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">일어버린 장소</span>
              </div>
              <div className="flex-1 py-3 px-4 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-800">{post.foundLocation}</span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-32 py-3 px-4 bg-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">일어버린 날짜</span>
              </div>
              <div className="flex-1 py-3 px-4 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-800">{post.foundDate}</span>
              </div>
            </div>

            {/* Age */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-32 py-3 px-4 bg-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">나이</span>
              </div>
              <div className="flex-1 py-3 px-4 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-800">{post.age}</span>
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-32 py-3 px-4 bg-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">성별</span>
              </div>
              <div className="flex-1 py-3 px-4 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-800">{post.gender}</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <div className="w-32 py-3 px-4 bg-gray-200 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">상세 설명</span>
              </div>
              <div className="py-4 px-4 bg-gray-100 rounded-xl min-h-32">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {post.description || '상세 설명이 없습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all text-base"
            >
              닫기
            </button>
            <button
              onClick={handleReportClick}
              className="flex-1 py-4 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl text-base"
              style={{ 
                background: 'linear-gradient(to right, #FFB701, #FEDF04)'
              }}
            >
              제보하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingDetailModal;