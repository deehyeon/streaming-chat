export const shelters = [
  { id: 1, name: '서울 강남 동물보호센터', location: '서울시 강남구 역삼1동', phone: '02-1234-5678', hours: '평일 09:00~18:00', rating: 4.8, reviews: 24, emoji: '🏠', distance: '500m' },
  { id: 2, name: '강남 한마음 보호소', location: '서울시 강남구 역삼2동', phone: '02-5678-9012', hours: '토일 10:00~16:00', rating: 4.6, reviews: 18, emoji: '🏢', distance: '800m' },
  { id: 3, name: '세인트 애견보호센터', location: '서울시 강남구 강남역', phone: '02-9876-5432', hours: '화목 13:00~18:00', rating: 4.9, reviews: 32, emoji: '🏛️', distance: '1.2km' },
  { id: 4, name: '꼬리쏘옥 보호소', location: '서울시 강남구 역삼1동', phone: '02-3456-7890', hours: '월수금 15:00~18:00', rating: 4.7, reviews: 15, emoji: '🏘️', distance: '350m' },
];

export const adoptionDogs = [
  { id: 1, name: '뽀삐', breed: '말티즈', age: '2년', gender: '여아', location: '강남구', weight: '3kg', image: '🐕', status: '분양가능' },
  { id: 2, name: '초코', breed: '푸들', age: '1년', gender: '남아', location: '서초구', weight: '4kg', image: '🐩', status: '분양가능' },
  { id: 3, name: '버터', breed: '골든 리트리버', age: '3년', gender: '남아', location: '송파구', weight: '25kg', image: '🦮', status: '분양가능' },
  { id: 4, name: '하늘', breed: '시츄', age: '4년', gender: '여아', location: '강동구', weight: '5kg', image: '🐕', status: '분양완료' },
  { id: 5, name: '별이', breed: '진돗개', age: '2년', gender: '여아', location: '광진구', weight: '15kg', image: '🐕', status: '분양가능' },
  { id: 6, name: '구름', breed: '포메라니안', age: '1년', gender: '남아', location: '성동구', weight: '2.5kg', image: '🐶', status: '분양가능' },
  { id: 7, name: '코코', breed: '푸들', age: '6년', gender: '여아', location: '강남구', weight: '4.5kg', image: '🐩', status: '분양가능' },
  { id: 8, name: '몽이', breed: '말티즈', age: '5년', gender: '남아', location: '서초구', weight: '3.5kg', image: '🐕', status: '분양가능' },
];

export const missingPosts = [
  { id: 1, type: 'missing', title: '강남역 근처에서 말티즈 잃어버렸어요', location: '강남구 역삼동', date: '2024.10.14', status: '실종', image: '🐕', likes: 12, comments: 8, found: false },
  { id: 2, type: 'protection', title: '보호 중인 푸들입니다', location: '서초구 서초동', date: '2024.10.13', status: '보호중', image: '🐩', likes: 15, comments: 10, found: false },
  { id: 3, type: 'missing', title: '진돗개 찾습니다', location: '송파구 잠실동', date: '2024.10.12', status: '실종', image: '🐕', likes: 8, comments: 5, found: false },
  { id: 4, type: 'missing', title: '포메라니안을 찾습니다', location: '강남구 대치동', date: '2024.10.10', status: '주인찾음', image: '🐶', likes: 24, comments: 15, found: true },
  { id: 5, type: 'protection', title: '시츄 보호중입니다', location: '서초구 반포동', date: '2024.10.08', status: '주인찾음', image: '🐕', likes: 18, comments: 12, found: true },
];

export const regions = [
  { city: '서울특별시', district: '강남구', dong: '역삼동' },
  { city: '서울특별시', district: '서초구', dong: '서초동' },
  { city: '서울특별시', district: '송파구', dong: '잠실동' },
  { city: '서울특별시', district: '강동구', dong: '천호동' },
  { city: '경기도', district: '성남시', dong: '분당구' },
];