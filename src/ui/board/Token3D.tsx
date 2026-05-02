import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { type Player } from '../../game-engine/types/game';
import * as THREE from 'three';

interface Token3DProps {
  player: Player;
  targetPosition3D: [number, number, number];
  index: number;
}

export const Token3D: React.FC<Token3DProps> = ({ player, targetPosition3D, index }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Offset slightly based on player index so tokens don't overlap perfectly
  const offsetX = (index % 3) * 0.4 - 0.4;
  const offsetZ = Math.floor(index / 3) * 0.4 - 0.4;
  
  const targetX = targetPosition3D[0] + offsetX;
  const targetY = targetPosition3D[1] + 0.5; // Hover slightly above tile
  const targetZ = targetPosition3D[2] + offsetZ;

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth interpolation towards target position
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 5 * delta);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 5 * delta);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 5 * delta);
    }
  });

  return (
    <group ref={groupRef} position={[targetX, targetY + 2, targetZ]}>
      {/* Token Body (Cylinder) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
        <meshStandardMaterial color={player.color} metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Player Initial */}
      <Text
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {player.name.charAt(0)}
      </Text>
    </group>
  );
};
