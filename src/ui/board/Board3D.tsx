import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from '../../app/store/useGameStore';
import { Tile3D } from './Tile3D';
import { Token3D } from './Token3D';
import { Building3D } from './Building3D';
import { type Property, TileType } from '../../game-engine/types/game';

const getTilePositionAndRotation = (position: number): { pos: [number, number, number]; rot: number } => {
  const SIZE = 5;
  
  if (position === 0) return { pos: [SIZE, 0, SIZE], rot: 0 };
  if (position < 10) return { pos: [SIZE - position, 0, SIZE], rot: 0 };
  
  if (position === 10) return { pos: [-SIZE, 0, SIZE], rot: Math.PI / 2 };
  if (position < 20) return { pos: [-SIZE, 0, SIZE - (position - 10)], rot: Math.PI / 2 };
  
  if (position === 20) return { pos: [-SIZE, 0, -SIZE], rot: Math.PI };
  if (position < 30) return { pos: [-SIZE + (position - 20), 0, -SIZE], rot: Math.PI };
  
  if (position === 30) return { pos: [SIZE, 0, -SIZE], rot: -Math.PI / 2 };
  if (position < 40) return { pos: [SIZE, 0, -SIZE + (position - 30)], rot: -Math.PI / 2 };
  
  return { pos: [0, 0, 0], rot: 0 };
};

export const Board3D: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex-1 w-full h-[800px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border-4 border-slate-800">
      <Canvas shadows camera={{ position: [0, 12, 14], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 10]} 
          castShadow 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
            {/* Center Logo/Board Area */}
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Tiles and Buildings */}
            {state.board.map((tile) => {
              const { pos, rot } = getTilePositionAndRotation(tile.position);
              const property = tile.type === TileType.PROPERTY ? (tile as Property) : null;
              
              return (
                <group key={tile.id}>
                  <Tile3D tile={tile} position3D={pos} rotationY={rot} />
                  {property && property.buildingLevel > 0 && (
                    <Building3D 
                      level={property.buildingLevel} 
                      position3D={pos} 
                      rotationY={rot} 
                    />
                  )}
                </group>
              );
            })}

            {/* Players (Tokens) */}
            {state.players.map((player, index) => {
              const { pos } = getTilePositionAndRotation(player.position);
              return (
                <Token3D 
                  key={player.id} 
                  player={player} 
                  targetPosition3D={pos} 
                  index={index} 
                />
              );
            })}
          </group>

          <ContactShadows position={[0, -0.49, 0]} opacity={0.4} scale={20} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 3} 
          minDistance={10} 
          maxDistance={25} 
        />
      </Canvas>
      
      {/* 3D Label Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20">
        3D View Enabled
      </div>
    </div>
  );
};
