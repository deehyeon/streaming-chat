import React, { useEffect, useRef } from 'react';

const KakaoMap = ({ address, shelters = [], height = '384px' }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // 카카오 맵 SDK가 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('Kakao Maps SDK not loaded');
      return;
    }

    const kakao = window.kakao;

    // 지도 초기화
    const initMap = () => {
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
          }
        });
      }
      // 여러 보호소가 있는 경우 (Shelters용)
      else if (shelters && shelters.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        let markersAdded = 0;

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
              if (markersAdded === shelters.length || markersAdded >= 10) {
                map.setBounds(bounds);
              }
            }
          });
        });

        // 마커가 하나도 추가되지 않은 경우를 대비한 타임아웃
        setTimeout(() => {
          if (markersAdded > 0) {
            map.setBounds(bounds);
          }
        }, 1000);
      }
    };

    // 카카오 맵 SDK 로드 대기
    if (kakao.maps) {
      kakao.maps.load(() => {
        initMap();
      });
    } else {
      initMap();
    }
  }, [address, shelters]);

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