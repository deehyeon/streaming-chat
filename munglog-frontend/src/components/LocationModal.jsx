import React from 'react';
import { Search, MapPin } from 'lucide-react';

const regions = [
  { city: '서울특별시', district: '강남구', dong: '역삼동' },
  { city: '서울특별시', district: '서초구', dong: '서초동' },
  { city: '서울특별시', district: '송파구', dong: '잠실동' },
  { city: '서울특별시', district: '강동구', dong: '천호동' },
  { city: '경기도', district: '성남시', dong: '분당구' },
];

export default function LocationModal({ onClose, setSelectedRegion }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">지역 변경</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="relative mb-6">
            <input type="text" placeholder="시역이나 동네로 검색하기" className="w-full px-5 py-3 pr-12 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-6 h-6" />
            </button>
          </div>
          <button className="w-full py-3 px-5 bg-yellow-50 text-yellow-700 rounded-xl font-semibold mb-6 flex items-center justify-center gap-2 hover:bg-yellow-100">
            <MapPin className="w-5 h-5" />
            현재 내 위치 사용하기
          </button>
          <div>
            <h3 className="text-sm font-bold text-yellow-700 mb-4">추천</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {regions.map((region, idx) => (
                <button key={idx} onClick={() => { setSelectedRegion(region.district); onClose(); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-gray-900">
                  {region.city}, {region.district}, {region.dong}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}