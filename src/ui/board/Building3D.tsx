import React from 'react';

interface Building3DProps {
  level: number;
  position3D: [number, number, number];
  rotationY: number;
}

export const Building3D: React.FC<Building3DProps> = ({ level, position3D, rotationY }) => {
  if (level <= 0) return null;

  const width = 0.3;
  const height = 0.3;
  const depth = 0.3;
  
  // Place buildings along the color bar
  const startX = -0.5;
  const zOffset = -0.7; // towards the color bar

  return (
    <group position={position3D} rotation={[0, rotationY, 0]}>
      {Array.from({ length: level }).map((_, i) => (
        <mesh key={i} position={[startX + i * 0.35, height / 2 + 0.2, zOffset]} castShadow>
          <boxGeometry args={[width, height, depth]} />
          {/* 5th level is usually a hotel (red), 1-4 are houses (green) */}
          <meshStandardMaterial color={level === 5 ? '#dc2626' : '#16a34a'} />
        </mesh>
      ))}
    </group>
  );
};
