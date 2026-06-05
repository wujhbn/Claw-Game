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
  toyType?: string; // New: 'shima_enaga' | 'bear' | 'bunny' | 'cat' | 'duck'
}

export const ShimaEnaga = ({
  position,
  rotation,
  scale = 1,
  color = '#FFFFFF',
  variant = 'round',
  toyType = 'shima_enaga'
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

  const computedToyType = toyType || 'shima_enaga';

  // Character coloring & theme variables
  let bodyColor = color;
  let bellyColor = '#FFFFFF';
  const wingColor = '#5A5652'; // Soft brown-dark gray
  const eyeColor = '#1A1817';  // Jet black
  const cheekColor = '#FFB6C1'; // Light pink blush
  let hasCheeks = true;

  if (computedToyType === 'bear') {
    if (color === '#FFFFFF' || color === '#ffffff') {
      bodyColor = '#8D6E63'; // Teddy brown
    }
    bellyColor = '#D7CCC8'; // Lighter brown/cream snout area
  } else if (computedToyType === 'bunny') {
    if (color === '#FFFFFF' || color === '#ffffff') {
      bodyColor = '#F8BBD0'; // Cute bubblegum pink
    }
    bellyColor = '#FFFFFF';
  } else if (computedToyType === 'cat') {
    if (color === '#FFFFFF' || color === '#ffffff') {
      bodyColor = '#FFA726'; // Orange tabby
    }
    bellyColor = '#FFF9C4'; // Creamy cat belly
  } else if (computedToyType === 'duck') {
    if (color === '#FFFFFF' || color === '#ffffff') {
      bodyColor = '#FFEE58'; // Yellow duck
    }
    bellyColor = '#FFEE58';
  }

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

      {/* 1.5 CUTE WHITE FACE/BELLY OVERLAY PATCH (Only if not duck, or with different scale) */}
      {computedToyType !== 'duck' && (
        variant === 'square' ? (
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
        )
      )}

      {/* 1.8 CUSTOM TOY TYPE EARS */}
      {computedToyType === 'bear' && (
        <group position={[0, 0.45, 0]}>
          {/* Left Bear Ear */}
          <mesh position={[-0.34, 0.45, 0]} rotation={[0, 0, 0.3]} castShadow>
            <sphereGeometry args={[0.15, 16, 12]} scale={[1, 1, 0.5]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.34, 0.45, 0.03]} rotation={[0, 0, 0.3]} scale={[0.1, 0.1, 0.03]}>
            <sphereGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
          {/* Right Bear Ear */}
          <mesh position={[0.34, 0.45, 0]} rotation={[0, 0, -0.3]} castShadow>
            <sphereGeometry args={[0.15, 16, 12]} scale={[1, 1, 0.5]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.34, 0.45, 0.03]} rotation={[0, 0, -0.3]} scale={[0.1, 0.1, 0.03]}>
            <sphereGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
        </group>
      )}

      {computedToyType === 'bunny' && (
        <group position={[0, 0.45, 0]}>
          {/* Left Bunny Ear */}
          <mesh position={[-0.18, 0.58, -0.05]} rotation={[0.1, 0, 0.15]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.18, 0.58, -0.02]} rotation={[0.1, 0, 0.15]} scale={[0.04, 0.35, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
          {/* Right Bunny Ear */}
          <mesh position={[0.18, 0.58, -0.05]} rotation={[0.1, 0, -0.15]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.18, 0.58, -0.02]} rotation={[0.1, 0, -0.15]} scale={[0.04, 0.35, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
        </group>
      )}

      {computedToyType === 'cat' && (
        <group position={[0, 0.45, 0]}>
          {/* Left Cat Ear */}
          <mesh position={[-0.26, 0.44, 0]} rotation={[0.05, 0.1, 0.4]} castShadow>
            <coneGeometry args={[0.13, 0.28, 4]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[-0.23, 0.42, 0.02]} rotation={[0.05, 0.1, 0.4]} scale={[0.09, 0.18, 0.02]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
          {/* Right Cat Ear */}
          <mesh position={[0.26, 0.44, 0]} rotation={[0.05, -0.1, -0.4]} castShadow>
            <coneGeometry args={[0.13, 0.28, 4]} />
            <meshStandardMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.23, 0.42, 0.02]} rotation={[0.05, -0.1, -0.4]} scale={[0.09, 0.18, 0.02]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#FFCDD2" roughness={0.8} />
          </mesh>
        </group>
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
        {hasCheeks && (
          <>
            <mesh position={[-0.26, -0.08, 0.02]} rotation={[0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
              <meshStandardMaterial color={cheekColor} roughness={0.9} transparent opacity={0.75} />
            </mesh>
            <mesh position={[0.26, -0.08, 0.02]} rotation={[0.2, 0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
              <meshStandardMaterial color={cheekColor} roughness={0.9} transparent opacity={0.75} />
            </mesh>
          </>
        )}

        {/* Dynamic Beak, Snout or Mouth based on toyType */}
        {computedToyType === 'shima_enaga' && (
          <mesh position={[0, -0.04, 0.08]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.045, 0.08, 4]} />
            <meshStandardMaterial color="#FF9800" roughness={0.4} />
          </mesh>
        )}

        {computedToyType === 'duck' && (
          <mesh position={[0, -0.05, 0.08]} rotation={[0.1, 0, 0]} scale={[1.4, 0.6, 1]}>
            <sphereGeometry args={[0.06, 16, 12]} />
            <meshStandardMaterial color="#FF9800" roughness={0.4} />
          </mesh>
        )}

        {computedToyType === 'bear' && (
          <group position={[0, -0.05, 0.04]}>
            <mesh position={[0, 0, 0.01]} rotation={[0.1, 0, 0]} scale={[1.2, 0.8, 0.4]}>
              <sphereGeometry args={[0.09, 16, 12]} />
              <meshStandardMaterial color="#EFEBE9" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0.04]} scale={[1.2, 0.8, 0.8]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshStandardMaterial color="#1A1817" roughness={0.2} />
            </mesh>
          </group>
        )}

        {computedToyType === 'bunny' && (
          <group position={[0, -0.05, 0.04]}>
            <mesh position={[0, 0, 0.01]} rotation={[0.1, 0, 0]} scale={[1, 0.8, 0.4]}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0.03]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.02, 0.03, 3]} />
              <meshStandardMaterial color="#E91E63" roughness={0.4} />
            </mesh>
          </group>
        )}

        {computedToyType === 'cat' && (
          <group position={[0, -0.05, 0.04]}>
            <mesh position={[0, 0, 0.01]} rotation={[0.1, 0, 0]} scale={[1.1, 0.8, 0.4]}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.015, 0.03]}>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshStandardMaterial color="#E91E63" roughness={0.3} />
            </mesh>
            {/* Whiskers */}
            <mesh position={[-0.15, 0.01, 0.02]} rotation={[0, 0, 0.1]} scale={[0.15, 0.006, 0.006]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#1A1817" />
            </mesh>
            <mesh position={[-0.15, -0.02, 0.02]} rotation={[0, 0, -0.05]} scale={[0.13, 0.006, 0.006]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#1A1817" />
            </mesh>
            <mesh position={[0.15, 0.01, 0.02]} rotation={[0, 0, -0.1]} scale={[0.15, 0.006, 0.006]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#1A1817" />
            </mesh>
            <mesh position={[0.15, -0.02, 0.02]} rotation={[0, 0, 0.05]} scale={[0.13, 0.006, 0.006]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#1A1817" />
            </mesh>
          </group>
        )}
      </group>

      {/* 3. WINGS OR ARMS (Left & Right) */}
      {computedToyType === 'shima_enaga' || computedToyType === 'duck' ? (
        <>
          {/* Left Wing */}
          <mesh 
            position={variant === 'square' ? [-0.47, 0.4, 0.05] : [-0.43, 0.42, 0.05]} 
            rotation={[0.1, 0, 0.25]} 
            castShadow
          >
            <sphereGeometry args={[0.11, 16, 12]} scale={[0.6, 1.4, 1]} />
            <meshStandardMaterial color={computedToyType === 'duck' ? bodyColor : wingColor} roughness={0.8} />
          </mesh>
          
          {/* Right Wing */}
          <mesh 
            position={variant === 'square' ? [0.47, 0.4, 0.05] : [0.43, 0.42, 0.05]} 
            rotation={[0.1, 0, -0.25]}
            castShadow
          >
            <sphereGeometry args={[0.11, 16, 12]} scale={[0.6, 1.4, 1]} />
            <meshStandardMaterial color={computedToyType === 'duck' ? bodyColor : wingColor} roughness={0.8} />
          </mesh>
        </>
      ) : (
        <>
          {/* Paw arms */}
          <mesh 
            position={variant === 'square' ? [-0.34, 0.32, 0.22] : [-0.28, 0.31, 0.24]} 
            rotation={[0.4, 0.2, 0.5]} 
            castShadow
          >
            <sphereGeometry args={[0.075, 12, 12]} scale={[1, 1, 1.4]} />
            <meshStandardMaterial color={bodyColor} roughness={0.8} />
          </mesh>
          <mesh 
            position={variant === 'square' ? [0.34, 0.32, 0.22] : [0.28, 0.31, 0.24]} 
            rotation={[0.4, -0.2, -0.5]} 
            castShadow
          >
            <sphereGeometry args={[0.075, 12, 12]} scale={[1, 1, 1.4]} />
            <meshStandardMaterial color={bodyColor} roughness={0.8} />
          </mesh>
        </>
      )}

      {/* 4. TAIL */}
      {computedToyType === 'shima_enaga' && (
        <mesh 
          position={[0, 0.25, -0.42]} 
          rotation={[-Math.PI / 8, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.12, 0.05, 0.45]} />
          <meshStandardMaterial color="#2B2725" roughness={0.8} />
        </mesh>
      )}

      {computedToyType === 'bear' && (
        <mesh position={[0, 0.18, -0.4]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      )}

      {computedToyType === 'bunny' && (
        <mesh position={[0, 0.18, -0.4]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
      )}

      {computedToyType === 'cat' && (
        <mesh position={[0, 0.18, -0.4]} rotation={[Math.PI / 6, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.4, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      )}

      {computedToyType === 'duck' && (
        <mesh position={[0, 0.22, -0.4]} rotation={[-Math.PI / 10, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.15]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      )}

      {/* 5. TINY SWEET FEET */}
      <mesh position={[-0.14, 0.04, 0.08]} rotation={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.13]} />
        <meshStandardMaterial color={computedToyType === 'duck' ? '#FF5722' : '#3A322C'} roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.04, 0.08]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.13]} />
        <meshStandardMaterial color={computedToyType === 'duck' ? '#FF5722' : '#3A322C'} roughness={0.8} />
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
