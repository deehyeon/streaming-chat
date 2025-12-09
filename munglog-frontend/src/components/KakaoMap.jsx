import React, { useEffect, useRef, useState } from 'react';
import { getKakaoMapApiKey, isKakaoMapApiKeyValid } from '../config/kakaoConfig';

const KakaoMap = ({ address, shelters = [], height = '384px' }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // API 키 유효성 검사
    if (!isKakaoMapApiKeyValid()) {
      setError('Kakao Map API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
      setIsLoading(false);
      return;
    }

    // API 키 가져오기
    const apiKey = getKakaoMapApiKey();

    // 카카오 맵 스크립트 동적 로드
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드되어 있는 경우
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        script.onerror = () => reject(new Error('카카오 맵 스크립트 로드 실패'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadKakaoMapScript();

        const kakao = window.kakao;
        const container = mapContainer.current;
        const options = {
          center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
          level: 3
        };

        const map = new kakao.maps.Map(container, options);
        mapInstance.current = map;

        // 주소 검색 서비스 초기화
        const geocoder = new kakao.maps.services.Geocoder();

        // 단일 주소가 있는 경우 (ShelterDetail용)
        if (address) {
          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

              // 마커 생성
              const marker = new kakao.maps.Marker({
                map: map,
                position: coords
              });

              // 인포윈도우 생성
              const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding:10px;font-size:12px;">${address}</div>`
              });
              infowindow.open(map, marker);

              // 지도 중심을 결과값으로 이동
              map.setCenter(coords);
              setIsLoading(false);
            } else {
              setError('주소를 찾을 수 없습니다.');
              setIsLoading(false);
            }
          });
        }
        // 여러 보호소가 있는 경우 (Shelters용)
        else if (shelters && shelters.length > 0) {
          const bounds = new kakao.maps.LatLngBounds();
          let markersAdded = 0;
          const totalShelters = shelters.length;

          shelters.forEach((shelter) => {
            const shelterAddress = shelter.address?.streetAddress || shelter.address?.detailAddress;
            if (!shelterAddress) return;

            geocoder.addressSearch(shelterAddress, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                // 마커 생성
                const marker = new kakao.maps.Marker({
                  map: map,
                  position: coords,
                  title: shelter.name
                });

                // 인포윈도우 생성
                const infowindow = new kakao.maps.InfoWindow({
                  content: `<div style="padding:8px;font-size:12px;font-weight:bold;">${shelter.name}</div>`
                });

                // 마커 클릭 이벤트
                kakao.maps.event.addListener(marker, 'click', () => {
                  infowindow.open(map, marker);
                });

                // 마커 위치를 bounds에 추가
                bounds.extend(coords);
                markersAdded++;

                // 모든 마커가 추가된 후 지도 범위 재설정
                if (markersAdded === totalShelters) {
                  map.setBounds(bounds);
                  setIsLoading(false);
                }
              }
            });
          });

          // 마커가 하나도 추가되지 않은 경우를 대비한 타임아웃
          setTimeout(() => {
            if (markersAdded === 0) {
              setError('보호소 위치를 찾을 수 없습니다.');
            }
            setIsLoading(false);
          }, 3000);
        } else {
          // 주소도 없고 보호소 목록도 없는 경우
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Kakao Maps 초기화 실패:', err);
        setError(err.message || '지도를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    initMap();
  }, [address, shelters]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: height,
          borderRadius: '8px',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: height,
          borderRadius: '8px',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
          <p style={{ fontSize: '14px' }}>지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: height,
        borderRadius: '8px'
      }}
    />
  );
};

export default KakaoMap;