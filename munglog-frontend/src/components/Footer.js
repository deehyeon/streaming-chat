import React from 'react';
import logo from './logo/돈이 캐릭터 5.svg';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <img src={logo} alt="멍로그 로고" style={{ width: 24, height: 24 }} />
              고객센터
            </h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">1670-0876</p>
              <p className="text-sm text-gray-400">09:00~18:00</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">회사소개</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition">회사정보</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition">채용정보</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">제휴/광고 문의</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition">사업자정보 안내</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">이용약관</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-400">
            (주)멍로그 | 대표이사 이름 | 서울 지구 우주일로 265호, 2층
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ©2024 MongLog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};