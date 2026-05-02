import React from 'react';
import { Text } from '@react-three/drei';
import { TileType, PropertyGroup, type Property, type BoardTile } from '../../game-engine/types/game';

interface Tile3DProps {
  tile: BoardTile;
  position3D: [number, number, number];
  rotationY: number;
}

const getGroupColorHex = (groupId?: PropertyGroup) => {
  switch (groupId) {
    case PropertyGroup.BROWN: return '#78350f';
    case PropertyGroup.LIGHT_BLUE: return '#93c5fd';
    case PropertyGroup.PINK: return '#f472b6';
    case PropertyGroup.ORANGE: return '#f97316';
    case PropertyGroup.RED: return '#dc2626';
    case PropertyGroup.YELLOW: return '#facc15';
    case PropertyGroup.GREEN: return '#16a34a';
    case PropertyGroup.DARK_BLUE: return '#1e40af';
    default: return '#e5e7eb'; // default tile color
  }
};

export const Tile3D: React.FC<Tile3DProps> = ({ tile, position3D, rotationY }) => {
  const isProperty = tile.type === TileType.PROPERTY;
  const property = isProperty ? (tile as Property) : null;
  const isMortgaged = property?.isMortgaged;
  
  const width = 1.9;
  const depth = 1.9;
  const height = 0.2;

  const hasColorBar = isProperty && property?.groupId && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY;
  const groupColor = hasColorBar ? getGroupColorHex(property.groupId) : '#e5e7eb';

  return (
    <group position={position3D} rotation={[0, rotationY, 0]}>
      {/* Base tile */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={isMortgaged ? '#9ca3af' : '#f9fafb'} />
      </mesh>
      
      {/* Tile border */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.02, height - 0.01, depth + 0.02]} />
        <meshBasicMaterial color="#374151" wireframe />
      </mesh>

      {/* Color Bar */}
      {hasColorBar && (
        <mesh position={[0, height + 0.001, -depth / 2 + 0.2]}>
          <boxGeometry args={[width - 0.1, 0.01, 0.4]} />
          <meshStandardMaterial color={isMortgaged ? '#4b5563' : groupColor} />
        </mesh>
      )}

      {/* Title Text */}
      <Text
        position={[0, height + 0.01, hasColorBar ? 0 : -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color={isMortgaged ? '#4b5563' : '#1f2937'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.6}
        textAlign="center"
      >
        {tile.name}
      </Text>

      {/* Price Text */}
      {isProperty && (
        <Text
          position={[0, height + 0.01, depth / 2 - 0.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.18}
          color={isMortgaged ? '#ef4444' : '#4b5563'}
          anchorX="center"
          anchorY="middle"
        >
          {isMortgaged ? 'MORTGAGED' : `$${property.price}`}
        </Text>
      )}
    </group>
  );
};
