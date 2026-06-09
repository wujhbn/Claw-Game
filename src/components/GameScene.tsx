/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Canvas, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { ClawMachine } from './ClawMachine';
import { Claw } from './Claw';
import { Prizes } from './Prizes';
import { ShimaEnaga } from './ShimaEnaga';
import { useGameStore } from '../store';
import { useEffect, Suspense } from 'react';

const CameraSetup = ({ isLocal }: { isLocal: boolean }) => {
  const { camera, size } = useThree();

  useEffect(() => {
    const isMobile = size.width < 768 || size.width / size.height < 0.8;
    if (isLocal) {
      // Front view when playing
      if (isMobile) {
        camera.position.set(0, 9, 38);
      } else {
        camera.position.set(0, 8, 26);
      }
    } else {
      // Diagonal view when spectating
      if (isMobile) {
        camera.position.set(24, 12, 24);
      } else {
        camera.position.set(18, 8, 18);
      }
    }
    camera.lookAt(0, 4, 0);
  }, [isLocal, camera, size]);

  return null;
};

export const GameScene = () => {
  const activePlayer = useGameStore(state => state.activePlayer);
  const myId = useGameStore(state => state.myId);
  const isLocal = activePlayer === myId && myId !== null;

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[18, 8, 22]} fov={45} />
        <CameraSetup isLocal={isLocal} />
        <ambientLight intensity={2.5} />
        <pointLight position={[0, 9, 0]} intensity={4.0} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />

        <Physics>
          <ClawMachine />
          <Claw isLocal={isLocal} />
          <Prizes isLocal={isLocal} />
        </Physics>

        <ShimaEnaga variant="giant" position={[0, 10.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={1.5} color="#FBBC04" />

        <Environment files="/google-office.jpg" background blur={0.02} environmentIntensity={1.5} backgroundRotation={[0, Math.PI * 0.725, 0]} environmentRotation={[0, Math.PI * 1.2, 0]} />
      </Suspense>
    </Canvas>
  );
};
