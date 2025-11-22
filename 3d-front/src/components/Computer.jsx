import React from 'react';
import { useGLTF } from '@react-three/drei';

export default function Computer(props) {
  const { scene } = useGLTF('/computer.glb');

  return (
    <primitive 
      object={scene} 
      {...props} 
    />
  );
}