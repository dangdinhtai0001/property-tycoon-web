import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';

export const PlayerListPanel: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Người chơi</h2>
      {state.players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-3 rounded-md border-l-4 ${
            state.currentPlayerId === player.id ? 'bg-blue-50' : 'bg-gray-50'
          }`}
          style={{ borderLeftColor: player.color }}
        >
          <div className="flex flex-col">
            <span className="font-bold flex items-center gap-2">
              {player.name}
              {state.currentPlayerId === player.id && (
                <span className="text-[10px] bg-blue-500 text-white px-1 rounded">Lượt này</span>
              )}
              {player.jailTurns > 0 && (
                <span className="text-[10px] bg-yellow-500 text-white px-1 rounded">Ở tù ({player.jailTurns}/3)</span>
              )}
            </span>
            <span className="text-sm text-gray-600">Vị trí: {player.position}</span>
          </div>
          <span className={`text-lg font-mono font-bold ${player.cash < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ${player.cash}
          </span>
        </div>
      ))}
    </div>
  );
};
