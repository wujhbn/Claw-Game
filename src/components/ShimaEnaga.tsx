/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShimaProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string; // Color from server (value grouping)
  variant?: 'round' | 'square' | 'fancy' | 'giant';
}

export const ShimaEnaga = ({
  position,
  rotation,
  scale = 1,
  color = '#FFFFFF',
  variant = 'round'
}: ShimaProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Bobbing animation for local idle rotation or movement styling
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle organic breathing scale
      const breath = Math.sin(state.clock.getElapsedTime() * 2 + (position ? position[0] : 0)) * 0.02;
      groupRef.current.scale.setScalar((typeof scale === 'number' ? scale : 1) + breath);
    }
  });

  // Color theme variables
  const bodyColor = color;
  const bellyColor = '#FFFFFF';
  const wingColor = '#5A5652'; // Soft brown-dark gray
  const eyeColor = '#1A1817';  // Jet black
  const beakColor = '#FF9800'; // Cute orange beak
  const cheekColor = '#FFB6C1'; // Light pink blush
  
  // Ribbon, scarf, or crown color
  const accentColor = color;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 1. MAIN BODY */}
      {variant === 'square' ? (
        // Cuboid/Squishmallow-style plushie
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[0.85, 0.85, 0.8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.1} />
        </mesh>
      ) : variant === 'giant' ? (
        // Large round body
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.65, 32, 24]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.15} />
        </mesh>
      ) : (
        // Standard round sphere body, slightly flattened vertically
        <mesh castShadow receiveShadow position={[0, 0.45, 0]} scale={[1, 0.95, 1]}>
          <sphereGeometry args={[0.48, 32, 24]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.1} />
        </mesh>
      )}

      {/* 1.5 CUTE WHITE FACE/BELLY OVERLAY PATCH */}
      {variant === 'square' ? (
        <mesh castShadow receiveShadow position={[0, 0.45, 0.05]}>
          <boxGeometry args={[0.65, 0.65, 0.72]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
        </mesh>
      ) : variant === 'giant' ? (
        <mesh castShadow receiveShadow position={[0, 0.58, 0.12]} scale={[1, 0.95, 1]}>
          <sphereGeometry args={[0.54, 32, 24]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
      ) : (
        <mesh castShadow receiveShadow position={[0, 0.43, 0.09]} scale={[1, 0.95, 1]}>
          <sphereGeometry args={[0.40, 32, 24]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
        </mesh>
      )}

      {/* 2. CUTE FACE FEATURES */}
      {/* Eyes */}
      <group position={[0, 0.48, 0.38]}>
        {/* Left eye */}
        <mesh position={[-0.18, 0, 0.05]} castShadow>
          <sphereGeometry args={[0.045, 16, 11]} />
          <meshStandardMaterial color={eyeColor} roughness={0.1} metalness={0.2} />
        </mesh>
        
        {/* Right eye */}
        <mesh position={[0.18, 0, 0.05]} castShadow>
          <sphereGeometry args={[0.045, 16, 11]} />
          <meshStandardMaterial color={eyeColor} roughness={0.1} metalness={0.2} />
        </mesh>

        {/* Blush Cheeks */}
        <mesh position={[-0.26, -0.08, 0.02]} rotation={[0.2, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
          <meshStandardMaterial color={cheekColor} roughness={0.9} transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.26, -0.08, 0.02]} rotation={[0.2, 0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
          <meshStandardMaterial color={cheekColor} roughness={0.9} transparent opacity={0.75} />
        </mesh>

        {/* Small Triangular Beak */}
        <mesh position={[0, -0.04, 0.08]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.045, 0.08, 4]} />
          <meshStandardMaterial color={beakColor} roughness={0.4} />
        </mesh>
      </group>

      {/* 3. WINGS (Left & Right) */}
      {/* Left Wing */}
      <mesh 
        position={variant === 'square' ? [-0.47, 0.4, 0.05] : [-0.43, 0.42, 0.05]} 
        rotation={[0.1, 0, 0.25]} 
        castShadow
      >
        <sphereGeometry args={[0.11, 16, 12]} scale={[0.6, 1.4, 1]} />
        <meshStandardMaterial color={wingColor} roughness={0.8} />
      </mesh>
      
      {/* Right Wing */}
      <mesh 
        position={variant === 'square' ? [0.47, 0.4, 0.05] : [0.43, 0.42, 0.05]} 
        rotation={[0.1, 0, -0.25]}
        castShadow
      >
        <sphereGeometry args={[0.11, 16, 12]} scale={[0.6, 1.4, 1]} />
        <meshStandardMaterial color={wingColor} roughness={0.8} />
      </mesh>

      {/* 4. LONG BLACK TAIL (Extending from the back bottom pointing upwards) */}
      <mesh 
        position={[0, 0.25, -0.42]} 
        rotation={[-Math.PI / 8, 0, 0]} 
        castShadow
      >
        <boxGeometry args={[0.12, 0.05, 0.45]} />
        <meshStandardMaterial color="#2B2725" roughness={0.8} />
      </mesh>

      {/* 5. TINY SWEET FEET */}
      <mesh position={[-0.14, 0.04, 0.08]} rotation={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.13]} />
        <meshStandardMaterial color="#3A322C" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.04, 0.08]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.13]} />
        <meshStandardMaterial color="#3A322C" roughness={0.8} />
      </mesh>

      {/* 6. CHARACTER VARIANT DECORATIONS */}
      {variant === 'fancy' && (
        // Beautiful neck scarf / ribbon
        <group position={[0, 0.22, 0.12]} rotation={[0.1, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.3, 0.06, 8, 24]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} />
          </mesh>
          {/* Scarf tails */}
          <mesh position={[0.12, -0.12, 0.1]} rotation={[0.2, 0.1, -0.3]} castShadow>
            <boxGeometry args={[0.07, 0.22, 0.03]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} />
          </mesh>
        </group>
      )}

      {variant === 'round' && (
        // Head accessory (sweet headphones/earmuffs or a ribbon tie)
        <group position={[0, 0.72, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.42, 0.04, 8, 24, Math.PI]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </mesh>
          {/* Left Earpad */}
          <mesh position={[-0.43, -0.1, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </mesh>
          {/* Right Earpad */}
          <mesh position={[0.43, -0.1, 0]} rotation={[0, 0, -Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </mesh>
        </group>
      )}

      {variant === 'giant' && (
        // Royal Crown!
        <group position={[0, 1.15, 0]}>
          {/* Crown Base Ring */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Crown Spikes */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.14, 0.1, 5]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Jewel Orb on top */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#EA4335" metalness={0.8} roughness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
};
