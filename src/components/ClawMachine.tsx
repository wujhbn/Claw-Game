/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';
import * as THREE from 'three';

export const ClawMachine = () => {
  const capturePrize = useGameStore(state => state.capturePrize);
  const myId = useGameStore(state => state.myId);
  const activePlayer = useGameStore(state => state.activePlayer);
  const players = useGameStore(state => state.players);
  
  const playerIds = Object.keys(players);
  const isPhysicsHost = (activePlayer === myId && myId !== null) || (!activePlayer && playerIds[0] === myId);

  return (
    <group>
      {/* Machine Base (Hollow) */}
      <RigidBody type="fixed" friction={1}>
        {/* Base Walls (Beautiful Creamy Orange instead of light beige/white) */}
        {/* Left Side Wall */}
        <mesh position={[-5.125, -10, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.25, 20, 10.5]} />
          <meshStandardMaterial color="#FFA726" metalness={0.15} roughness={0.7} />
        </mesh>
        {/* Right Side Wall */}
        <mesh position={[5.125, -10, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.25, 20, 10.5]} />
          <meshStandardMaterial color="#FFA726" metalness={0.15} roughness={0.7} />
        </mesh>
        {/* Back Wall */}
        <mesh position={[0, -10, -5.125]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 20, 0.25]} />
          <meshStandardMaterial color="#FFB74D" metalness={0.1} roughness={0.7} />
        </mesh>
        {/* Front Wall */}
        <mesh position={[0, -10, 5.125]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 20, 0.25]} />
          <meshStandardMaterial color="#FFA726" metalness={0.15} roughness={0.7} />
        </mesh>
        {/* Base Bottom */}
        <mesh position={[0, -19.875, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.25, 10.5]} />
          <meshStandardMaterial color="#FFE0B2" metalness={0.1} roughness={0.9} />
        </mesh>

        {/* ======================================================== */}
        {/* ANIMAL PAINTINGS & SCULPTURES (活潑可愛的動物彩繪) ON THE CABINET */}
        {/* ======================================================== */}
        
        {/* A. FRONT WALL - SUPER CUTE 3D BEAR FACE PAINTING & PAWS */}
        {/* Soft Brown/Beige Bear Snout Base */}
        <mesh position={[0, -8.6, 5.26]} receiveShadow>
          <sphereGeometry args={[1.3, 24, 24]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
        {/* Bear Snout Nose */}
        <mesh position={[0, -8.2, 5.44]} receiveShadow>
          <boxGeometry args={[0.45, 0.3, 0.15]} />
          <meshStandardMaterial color="#3E2723" roughness={0.9} />
        </mesh>
        {/* Bear Smile Lines */}
        <mesh position={[-0.15, -8.5, 5.45]} rotation={[0, 0, Math.PI / 4]} receiveShadow>
          <boxGeometry args={[0.25, 0.06, 0.05]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
        <mesh position={[0.15, -8.5, 5.45]} rotation={[0, 0, -Math.PI / 4]} receiveShadow>
          <boxGeometry args={[0.25, 0.06, 0.05]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
        
        {/* Eyes (Left & Right) */}
        <mesh position={[-1.4, -7.5, 5.27]} receiveShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#212121" roughness={0.9} />
        </mesh>
        <mesh position={[1.4, -7.5, 5.27]} receiveShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#212121" roughness={0.9} />
        </mesh>
        {/* Eye Highlights */}
        <mesh position={[-1.3, -7.4, 5.34]} receiveShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
        <mesh position={[1.5, -7.4, 5.34]} receiveShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
        
        {/* Rosy Pastel Cheeks (Blushing) */}
        <mesh position={[-2.3, -8.2, 5.26]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#FFA3AC" roughness={0.95} transparent opacity={0.8} />
        </mesh>
        <mesh position={[2.3, -8.2, 5.26]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#FFA3AC" roughness={0.95} transparent opacity={0.8} />
        </mesh>

        {/* Cute Animal Paws painted on the bottom corners */}
        {/* Left Paw Print */}
        <mesh position={[-3.3, -13.5, 5.21]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[-3.8, -12.6, 5.21]} receiveShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[-3.3, -12.4, 5.21]} receiveShadow>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[-2.8, -12.6, 5.21]} receiveShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>

        {/* Right Paw Print */}
        <mesh position={[3.3, -13.5, 5.21]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[2.8, -12.6, 5.21]} receiveShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[3.3, -12.4, 5.21]} receiveShadow>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[3.8, -12.6, 5.21]} receiveShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#E8BEAC" roughness={0.9} />
        </mesh>

        {/* B. LEFT SIDE WALL - LOVELY SHIMA ENAGA (鳥兒塗鴉) */}
        <mesh position={[-5.21, -10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
        {/* Soft yellow tail/back feather accent paint */}
        <mesh position={[-5.22, -11.5, -1.8]} rotation={[0, Math.PI / 2, 0.4]} receiveShadow>
          <boxGeometry args={[0.9, 2.0, 0.1]} />
          <meshStandardMaterial color="#FCE5AC" roughness={0.9} />
        </mesh>
        {/* Cute Bird Rosy Cheeks */}
        <mesh position={[-5.22, -10.3, -0.9]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color="#FFBFC4" roughness={0.9} />
        </mesh>
        <mesh position={[-5.22, -10.3, 0.9]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color="#FFBFC4" roughness={0.9} />
        </mesh>
        {/* Cute Bird Eyes */}
        <mesh position={[-5.22, -9.5, -0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
        <mesh position={[-5.22, -9.5, 0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
        {/* Cute Bird Yellow Beak */}
        <mesh position={[-5.23, -9.7, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]} receiveShadow>
          <coneGeometry args={[0.18, 0.45, 4]} />
          <meshStandardMaterial color="#FFA000" roughness={0.4} />
        </mesh>

        {/* C. RIGHT SIDE WALL - CUTE FLUFFY BUNNY (兔子塗鴉) */}
        <mesh position={[5.21, -11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[2.1, 32, 32]} />
          <meshStandardMaterial color="#FFF0F2" roughness={0.9} />
        </mesh>
        {/* Bunny Long Ears */}
        <mesh position={[5.21, -8.1, -0.7]} rotation={[0, Math.PI / 2, 0.12]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#FFF0F2" roughness={0.9} />
        </mesh>
        <mesh position={[5.21, -8.1, 0.7]} rotation={[0, Math.PI / 2, -0.12]} receiveShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#FFF0F2" roughness={0.9} />
        </mesh>
        {/* Bunny Pink Inner Ears */}
        <mesh position={[5.22, -8.1, -0.7]} rotation={[0, Math.PI / 2, 0.12]} receiveShadow>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#FFC4CB" roughness={0.95} />
        </mesh>
        <mesh position={[5.22, -8.1, 0.7]} rotation={[0, Math.PI / 2, -0.12]} receiveShadow>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#FFC4CB" roughness={0.95} />
        </mesh>
        {/* Bunny Eyes */}
        <mesh position={[5.22, -10.4, -0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#311B92" />
        </mesh>
        <mesh position={[5.22, -10.4, 0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#311B92" />
        </mesh>
        {/* Bunny Pink Nose */}
        <mesh position={[5.22, -10.8, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#FF8A80" />
        </mesh>
        {/* Bunny Blushing Cheeks */}
        <mesh position={[5.22, -10.9, -1.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color="#FFBFC4" roughness={0.95} />
        </mesh>
        <mesh position={[5.22, -10.9, 1.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color="#FFBFC4" roughness={0.95} />
        </mesh>

        {/* Front Horizontal Top Trim Border - Vibrant deep orange ribbon */}
        <mesh position={[0, -1.5, 5.18]} receiveShadow castShadow>
          <boxGeometry args={[10.6, 1.5, 0.1]} />
          <meshStandardMaterial color="#E65100" metalness={0.15} roughness={0.7} />
        </mesh>

        {/* Front Horizontal Bottom Accent Border - Warm honey gold ribbon */}
        <mesh position={[0, -18.5, 5.18]} receiveShadow castShadow>
          <boxGeometry args={[10.6, 1.2, 0.1]} />
          <meshStandardMaterial color="#FFB74D" metalness={0.1} roughness={0.7} />
        </mesh>

        {/* Left Side Wall Geometric Circles (re-imagined as cute mini bubbles) */}
        <mesh position={[-5.19, -5, -2.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#FFE0B2" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[-5.19, -5, 2.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#FF9800" metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Right Side Wall Geometric Circles (re-imagined as cute mini bubbles) */}
        <mesh position={[5.19, -5, -2.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#FF9800" metalness={0.1} roughness={0.9} />
        </mesh>
        <mesh position={[5.19, -5, 2.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <meshStandardMaterial color="#FFE0B2" metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Playfield Floor (with hole for chute) */}
        <mesh position={[1.5, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[7, 0.5, 10]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[-3.5, 0, -1.5]} receiveShadow castShadow>
          <boxGeometry args={[3, 0.5, 7]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.8} />
        </mesh>
      </RigidBody>
      
      {/* Roof - Layered Cream & Terracotta Pastel design */}
      <RigidBody type="fixed" friction={0.5}>
        {/* Main Roof Plate - Soft Creamy Orange */}
        <mesh position={[0, 10.25, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.5, 10.5]} />
          <meshStandardMaterial color="#FFE0B2" metalness={0.2} roughness={0.6} />
        </mesh>
        {/* Top Canopy Center Cap - Radiant Pumpkin Orange */}
        <mesh position={[0, 10.6, 0]} receiveShadow castShadow>
          <boxGeometry args={[7.5, 0.3, 7.5]} />
          <meshStandardMaterial color="#FF9800" metalness={0.1} roughness={0.7} />
        </mesh>

        {/* ======================================================== */}
        {/* ROOF TOP 3D SCULPTURED ANIMALS AND ADORABLE DETAILS */}
        {/* ======================================================== */}
        
        {/* Cute Rounded Bear Ears standing proud on top front edge */}
        {/* Left Bear Ear */}
        <mesh position={[-3.6, 11.4, 4.4]} rotation={[Math.PI / 2, 0, -Math.PI / 8]} receiveShadow castShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.35, 32]} />
          <meshStandardMaterial color="#FCFAF6" roughness={0.75} />
        </mesh>
        <mesh position={[-3.6, 11.4, 4.6]} rotation={[Math.PI / 2, 0, -Math.PI / 8]} receiveShadow castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.1, 32]} />
          <meshStandardMaterial color="#FFCCD1" roughness={0.7} />
        </mesh>

        {/* Right Bear Ear */}
        <mesh position={[3.6, 11.4, 4.4]} rotation={[Math.PI / 2, 0, Math.PI / 8]} receiveShadow castShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.35, 32]} />
          <meshStandardMaterial color="#FCFAF6" roughness={0.75} />
        </mesh>
        <mesh position={[3.6, 11.4, 4.6]} rotation={[Math.PI / 2, 0, Math.PI / 8]} receiveShadow castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.1, 32]} />
          <meshStandardMaterial color="#FFCCD1" roughness={0.7} />
        </mesh>

        {/* Adorable white companion mascot bird sitting on the front center of canopy */}
        <mesh position={[0, 11.3, 4.2]} receiveShadow castShadow>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
        </mesh>
        {/* Little Mascot beak */}
        <mesh position={[0, 11.2, 5.25]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <coneGeometry args={[0.13, 0.38, 4]} />
          <meshStandardMaterial color="#FFA000" />
        </mesh>
        {/* Little Mascot Eyes */}
        <mesh position={[-0.32, 11.35, 5.18]} receiveShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#2E1C0C" />
        </mesh>
        <mesh position={[0.32, 11.35, 5.18]} receiveShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#2E1C0C" />
        </mesh>
        {/* Little Mascot rosy cheeks */}
        <mesh position={[-0.55, 11.15, 5.14]} receiveShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#FFA3AC" />
        </mesh>
        <mesh position={[0.55, 11.15, 5.14]} receiveShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#FFA3AC" />
        </mesh>
      </RigidBody>

      {/* Pillars - Vibrant Orange & Honey Columns */}
      {[-5.125, 5.125].map(x => 
        [-5.125, 5.125].map(z => {
          // Decide custom warm orange colors for each column
          let pillarColor = "#FFE0B2"; // soft honey peach cream
          if (x < 0 && z < 0) pillarColor = "#FFB74D"; // sunburst pastel orange
          if (x < 0 && z > 0) pillarColor = "#FFA726"; // rich warm apricot
          if (x > 0 && z < 0) pillarColor = "#FFCC80"; // sweet peach candy
          return (
            <mesh key={`${x}-${z}`} position={[x, 5, z]} receiveShadow castShadow>
              <boxGeometry args={[0.25, 10, 0.25]} />
              <meshStandardMaterial color={pillarColor} metalness={0.3} roughness={0.5} />
            </mesh>
          );
        })
      )}

      {/* Glass Walls */}
      <RigidBody type="fixed" friction={0.5}>
        <mesh position={[-5.25, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, 10, 10]} />
          <meshPhysicalMaterial transparent opacity={0.3} roughness={0} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} color="#ffffff" clearcoat={1} />
        </mesh>
        <mesh position={[5.25, 5, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, 10, 10]} />
          <meshPhysicalMaterial transparent opacity={0.3} roughness={0} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} color="#ffffff" clearcoat={1} />
        </mesh>
        <mesh position={[0, 5, -5.25]} receiveShadow castShadow>
          <boxGeometry args={[10, 10, 0.1]} />
          <meshPhysicalMaterial transparent opacity={0.3} roughness={0} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} color="#ffffff" clearcoat={1} />
        </mesh>
        <mesh position={[0, 5, 5.25]} receiveShadow castShadow>
          <boxGeometry args={[10, 10, 0.1]} />
          <meshPhysicalMaterial transparent opacity={0.3} roughness={0} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} color="#ffffff" clearcoat={1} />
        </mesh>
        
        {/* Invisible thick boundaries to prevent clipping */}
        <mesh position={[-6.2, 5, 0]} visible={false}>
          <boxGeometry args={[2, 12, 12]} />
        </mesh>
        <mesh position={[6.2, 5, 0]} visible={false}>
          <boxGeometry args={[2, 12, 12]} />
        </mesh>
        <mesh position={[0, 5, -6.2]} visible={false}>
          <boxGeometry args={[12, 12, 2]} />
        </mesh>
        <mesh position={[0, 5, 6.2]} visible={false}>
          <boxGeometry args={[12, 12, 2]} />
        </mesh>
        <mesh position={[0, 11, 0]} visible={false}>
          <boxGeometry args={[12, 2, 12]} />
        </mesh>
        
        {/* Chute Walls */}
        <mesh position={[-1.9, 1.75, 3.5]} receiveShadow castShadow>
          <boxGeometry args={[0.2, 3, 3]} />
          <meshStandardMaterial color="#9AA0A6" metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[-3.5, 1.75, 1.9]} receiveShadow castShadow>
          <boxGeometry args={[3, 3, 0.2]} />
          <meshStandardMaterial color="#9AA0A6" metalness={0.2} roughness={0.8} />
        </mesh>
      </RigidBody>
    </group>
  );
};
