import React from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
export default function Cabin({ position, rotation }) {
    // 파일 경로를 '/파일명'으로 수정했습니다. public 폴더 기준입니다.
    const materials = useLoader(MTLLoader, '/ac house red.mtl');
    const obj = useLoader(OBJLoader, '/ac house red.obj', (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    });
  
    return (
      <primitive 
        object={obj} 
        position={position} 
        rotation={rotation} // 회전값 props로 받아서 적용
        scale={0.3} 
      />
    );
  }