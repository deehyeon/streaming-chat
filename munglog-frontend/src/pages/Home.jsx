import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import * as THREE from 'three';

const colors = {
  primary: '#FFB701',
  secondary: '#FEDF04',
  light: '#FEF79E'
};

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xB8E6F0);
    scene.fog = new THREE.Fog(0xB8E6F0, 10, 30);
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.5), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight * 0.5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xFFF8E1, 0.5);
    directionalLight.position.set(8, 12, 8);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const grassGeometry = new THREE.CircleGeometry(18, 64);
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x9CCC65 });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    const createTree = (x, z) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 2, 12),
        new THREE.MeshLambertMaterial({ color: 0x8D6E63 })
      );
      trunk.position.y = 1;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshLambertMaterial({ color: 0x66BB6A })
      );
      foliage.position.y = 2.3;
      foliage.scale.set(1, 0.9, 1);
      foliage.castShadow = true;
      treeGroup.add(foliage);

      const applePositions = [
        [1.0, 2.8, 0],
        [-1.0, 2.6, 0],
        [0, 2.9, 1.0],
        [0.7, 2.4, 0.7],
        [-0.7, 2.5, -0.7],
      ];
      
      applePositions.forEach(([x, y, z]) => {
        const apple = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 16, 16),
          new THREE.MeshLambertMaterial({ color: 0xFF0000 })
        );
        apple.position.set(x, y, z);
        apple.castShadow = true;
        treeGroup.add(apple);
        
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
          new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        );
        stem.position.set(x, y + 0.2, z);
        treeGroup.add(stem);
        
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 12),
          new THREE.MeshLambertMaterial({ color: 0x228B22 })
        );
        leaf.position.set(x + 0.08, y + 0.25, z);
        leaf.scale.set(1.5, 0.3, 0.8);
        leaf.rotation.z = 0.5;
        treeGroup.add(leaf);
      });

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    [[-7, -4], [8, -5], [-9, 4], [7, 5]].forEach(([x, z]) => scene.add(createTree(x, z)));

    const createFlower = (x, z, color) => {
      const flowerGroup = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.025, 0.5, 8),
        new THREE.MeshLambertMaterial({ color: 0x7CB342 })
      );
      stem.position.y = 0.25;
      flowerGroup.add(stem);

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 12, 12),
          new THREE.MeshLambertMaterial({ color: color })
        );
        petal.position.set(Math.cos(angle) * 0.15, 0.52, Math.sin(angle) * 0.15);
        petal.scale.set(1, 0.6, 0.7);
        flowerGroup.add(petal);
      }

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xFFF59D })
      );
      center.position.y = 0.52;
      flowerGroup.add(center);

      flowerGroup.position.set(x, 0, z);
      flowerGroup.userData.swayPhase = Math.random() * Math.PI * 2;
      return flowerGroup;
    };

    const flowers = [];
    const flowerColors = [0xF48FB1, 0xCE93D8, 0x90CAF9, 0xFFCC80, 0xFFAB91];
    for (let i = 0; i < 20; i++) {
      const flower = createFlower(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 24,
        flowerColors[Math.floor(Math.random() * flowerColors.length)]
      );
      flowers.push(flower);
      scene.add(flower);
    }

    const createDog = (x, z, color) => {
      const dogGroup = new THREE.Group();
      
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshLambertMaterial({ color: color })
      );
      body.position.y = 0.4;
      body.scale.set(1, 0.8, 1.3);
      body.castShadow = true;
      dogGroup.add(body);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshLambertMaterial({ color: color })
      );
      head.position.set(0, 0.6, 0.35);
      head.castShadow = true;
      dogGroup.add(head);

      const earColor = new THREE.Color(color).multiplyScalar(0.8);
      [[-0.2, 0.8, 0.3], [0.2, 0.8, 0.3]].forEach(([px, py, pz], idx) => {
        const ear = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 12, 12),
          new THREE.MeshLambertMaterial({ color: earColor })
        );
        ear.position.set(px, py, pz);
        ear.scale.set(0.7, 1.3, 0.6);
        ear.rotation.z = idx === 0 ? 0.4 : -0.4;
        dogGroup.add(ear);
      });

      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x000000 })
      );
      nose.position.set(0, 0.55, 0.65);
      dogGroup.add(nose);

      const tail = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshLambertMaterial({ color: color })
      );
      tail.position.set(0, 0.5, -0.4);
      tail.scale.set(0.7, 0.8, 1.2);
      dogGroup.add(tail);

      [[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.1], [0.2, -0.1]].forEach(([px, pz]) => {
        const leg = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 12, 12),
          new THREE.MeshLambertMaterial({ color: color })
        );
        leg.position.set(px, 0.1, pz);
        leg.scale.set(0.8, 1.5, 0.8);
        leg.castShadow = true;
        dogGroup.add(leg);
      });

      dogGroup.position.set(x, 0, z);
      dogGroup.userData = { speedX: 0, speedZ: 0 };
      return dogGroup;
    };

    const createButterfly = (x, y, z) => {
      const butterflyGroup = new THREE.Group();
      
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0x000000 })
      );
      body.scale.set(0.5, 2, 0.5);
      butterflyGroup.add(body);

      const wingColors = [0xFFB6C1, 0xDDA0DD, 0x87CEEB, 0xFFDAB9];
      const wingColor = wingColors[Math.floor(Math.random() * wingColors.length)];
      
      const leftWing = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshLambertMaterial({ color: wingColor, side: THREE.DoubleSide })
      );
      leftWing.position.set(-0.15, 0, 0);
      leftWing.scale.set(1.2, 0.3, 1.5);
      leftWing.rotation.y = Math.PI / 8;
      butterflyGroup.add(leftWing);
      
      const rightWing = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshLambertMaterial({ color: wingColor, side: THREE.DoubleSide })
      );
      rightWing.position.set(0.15, 0, 0);
      rightWing.scale.set(1.2, 0.3, 1.5);
      rightWing.rotation.y = -Math.PI / 8;
      butterflyGroup.add(rightWing);

      butterflyGroup.position.set(x, y, z);
      butterflyGroup.userData = { speedX: 0, speedZ: 0, wingPhase: Math.random() * Math.PI * 2 };
      return butterflyGroup;
    };

    const createCloud = (x, y, z) => {
      const cloudGroup = new THREE.Group();
      
      const positions = [
        [0, 0, 0, 1.2],
        [-0.8, 0.1, 0.2, 1.0],
        [0.8, 0.1, 0.2, 1.0],
        [-0.4, 0.3, 0, 0.8],
        [0.4, 0.3, 0, 0.8],
      ];
      
      positions.forEach(([px, py, pz, scale]) => {
        const cloudPart = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 })
        );
        cloudPart.position.set(px, py, pz);
        cloudPart.scale.set(scale, scale * 0.7, scale * 0.8);
        cloudGroup.add(cloudPart);
      });
      
      cloudGroup.position.set(x, y, z);
      cloudGroup.userData = { speedX: 0, originalY: y, floatPhase: Math.random() * Math.PI * 2 };
      return cloudGroup;
    };

    const dogs = [
      { obj: createDog(-6, 5, 0xF4A460), speedX: 0.01, speedZ: 0.008 },
      { obj: createDog(6, -5, 0xDEB887), speedX: -0.009, speedZ: 0.01 },
      { obj: createDog(-5, -6, 0xD2B48C), speedX: 0.011, speedZ: -0.008 },
      { obj: createDog(7, 4, 0xE6C9A8), speedX: 0.01, speedZ: 0.009 },
      { obj: createDog(-7, -3, 0xF5DEB3), speedX: -0.008, speedZ: -0.01 },
      { obj: createDog(5, 6, 0xD2691E), speedX: 0.009, speedZ: 0.011 },
      { obj: createDog(-4, 7, 0xCD853F), speedX: -0.01, speedZ: -0.009 },
      { obj: createDog(7, -4, 0xDEB887), speedX: 0.008, speedZ: -0.01 },
      { obj: createDog(-6, -5, 0xF4A460), speedX: -0.011, speedZ: 0.008 },
      { obj: createDog(4, -7, 0xE6C9A8), speedX: 0.01, speedZ: 0.01 },
    ];

    dogs.forEach(dog => {
      dog.obj.userData.speedX = dog.speedX;
      dog.obj.userData.speedZ = dog.speedZ;
      scene.add(dog.obj);
    });

    const butterflies = [
      { obj: createButterfly(-4, 2.5, 2), speedX: 0.015, speedZ: 0.012 },
      { obj: createButterfly(4, 2, -2), speedX: -0.013, speedZ: 0.016 },
      { obj: createButterfly(1, 3, 3), speedX: 0.018, speedZ: -0.011 },
    ];

    butterflies.forEach(butterfly => {
      butterfly.obj.userData.speedX = butterfly.speedX;
      butterfly.obj.userData.speedZ = butterfly.speedZ;
      scene.add(butterfly.obj);
    });

    const clouds = [
      { obj: createCloud(-8, 4, -3), speedX: 0.008 },
      { obj: createCloud(6, 4.5, -5), speedX: 0.006 },
      { obj: createCloud(-2, 5, -4), speedX: 0.007 },
      { obj: createCloud(8, 4.2, -6), speedX: 0.009 },
      { obj: createCloud(0, 4.8, -5), speedX: 0.0065 },
    ];

    clouds.forEach(cloud => {
      cloud.obj.userData.speedX = cloud.speedX;
      scene.add(cloud.obj);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      dogs.forEach(({ obj }) => {
        obj.position.x += obj.userData.speedX;
        obj.position.z += obj.userData.speedZ;

        if (obj.position.x > 10 || obj.position.x < -10) {
          obj.userData.speedX *= -1;
          obj.rotation.y += Math.PI;
        }
        if (obj.position.z > 10 || obj.position.z < -10) {
          obj.userData.speedZ *= -1;
          obj.rotation.y += Math.PI;
        }

        obj.position.y = Math.abs(Math.sin(time * 4)) * 0.08;
      });

      butterflies.forEach(({ obj }) => {
        obj.position.x += obj.userData.speedX;
        obj.position.y += Math.sin(time * 3 + obj.userData.wingPhase) * 0.008;
        obj.position.z += obj.userData.speedZ;

        if (obj.position.x > 9 || obj.position.x < -9) obj.userData.speedX *= -1;
        if (obj.position.z > 9 || obj.position.z < -9) obj.userData.speedZ *= -1;

        obj.userData.wingPhase += 0.12;
        const wingAngle = Math.sin(obj.userData.wingPhase) * 0.5;
        if (obj.children[1]) obj.children[1].rotation.y = Math.PI / 8 + wingAngle;
        if (obj.children[2]) obj.children[2].rotation.y = -Math.PI / 8 - wingAngle;
      });

      flowers.forEach(flower => {
        flower.userData.swayPhase += 0.015;
        flower.rotation.z = Math.sin(flower.userData.swayPhase) * 0.1;
      });

      clouds.forEach(({ obj }) => {
        obj.position.x += obj.userData.speedX;
        
        if (obj.position.x > 12) {
          obj.position.x = -12;
        }
        
        obj.userData.floatPhase += 0.02;
        obj.position.y = obj.userData.originalY + Math.sin(obj.userData.floatPhase) * 0.3;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight * 0.5;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div>
      <div className="relative mb-8">
        <div ref={mountRef} className="w-full rounded-2xl overflow-hidden shadow-lg" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="max-w-3xl w-full px-4 sm:px-6 pointer-events-auto">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2 drop-shadow-lg">
                유기견 보호소 봉사 신청 서비스
              </h2>
              <p className="text-center text-gray-800 font-semibold mb-6 drop-shadow">근처 보호소를 찾아보세요! 🐾</p>
              <div className="relative">
                <input type="text" placeholder="지역명 또는 보호소명을 입력하세요" className="w-full px-6 py-4 pr-14 rounded-full border-2 focus:outline-none focus:ring-2 shadow-sm bg-white" 
                  style={{ borderColor: colors.light }}
                  onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary}`}
                  onBlur={(e) => e.target.style.boxShadow = 'none'} />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-gray-900 rounded-full" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">멍로그만의 특징</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl shadow-lg" style={{ background: `linear-gradient(to br, ${colors.primary}, ${colors.secondary})` }}>
              🐶
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">안전한 보호소 인증</h3>
            <p className="text-gray-600">검증된 보호소만</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl shadow-lg" style={{ background: `linear-gradient(to br, ${colors.secondary}, ${colors.primary})` }}>
              🐕
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">활발한 커뮤니티</h3>
            <p className="text-gray-600">따뜻한 경험</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl shadow-lg" style={{ background: `linear-gradient(to br, ${colors.primary}, ${colors.light})` }}>
              🦮
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">투명한 분양</h3>
            <p className="text-gray-600">가족의 만남</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl shadow-lg" style={{ background: `linear-gradient(to br, ${colors.secondary}, ${colors.light})` }}>
              🐕‍🦺
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">후원 시스템</h3>
            <p className="text-gray-600">보호소 지원</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-10 shadow-sm" style={{ background: `linear-gradient(to right, ${colors.light}, ${colors.light})` }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">멍로그는 이런 서비스입니다</h2>
        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            <span className="font-bold" style={{ color: colors.primary }}>멍로그</span>는 유기견 보호소와 봉사자, 분양 희망자를 연결하는 종합 플랫폼입니다.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl text-gray-900 mb-3">🏠 보호소 찾기</h3>
              <p>내 주변의 검증된 유기견 보호소를 쉽게 찾고, 봉사 신청을 할 수 있습니다. 보호소의 운영시간, 위치, 연락처 정보를 한눈에 확인하세요.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl text-gray-900 mb-3">🔍 분실/보호 게시판</h3>
              <p>실종된 반려견을 찾거나, 보호 중인 유기견 정보를 공유할 수 있는 커뮤니티입니다. 빠른 정보 공유로 더 많은 아이들이 가족을 찾을 수 있습니다.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl text-gray-900 mb-3">💝 분양하기</h3>
              <p>새로운 가족을 기다리는 아이들의 정보를 확인하고 분양 신청을 할 수 있습니다. 투명한 절차로 안전하고 책임감 있는 분양을 지원합니다.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl text-gray-900 mb-3">🤝 후원 시스템</h3>
              <p>보호소를 직접 후원하여 유기견들이 더 나은 환경에서 지낼 수 있도록 도와주세요. 모든 후원 내역은 투명하게 공개됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}