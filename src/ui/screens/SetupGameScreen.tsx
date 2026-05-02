import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const SetupGameScreen: React.FC = () => {
  const { dispatch } = useGameStore();
  const [players, setPlayers] = useState<{ name: string; color: string }[]>([
    { name: 'Người chơi 1', color: COLORS[0] },
    { name: 'Người chơi 2', color: COLORS[1] },
  ]);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { name: `Người chơi ${players.length + 1}`, color: COLORS[players.length] }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: 'name' | 'color', value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME', payload: { players } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h2 className="text-4xl font-black text-slate-800">Cài đặt trò chơi</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        {players.map((p, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input 
              type="color" 
              value={p.color} 
              onChange={(e) => updatePlayer(idx, 'color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={p.name}
              onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Tên người chơi"
            />
            {players.length > 2 && (
              <button 
                onClick={() => removePlayer(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                Xóa
              </button>
            )}
          </div>
        ))}

        {players.length < 6 && (
          <button 
            onClick={addPlayer}
            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 transition-colors"
          >
            + Thêm người chơi
          </button>
        )}

        <button 
          onClick={handleStartGame}
          className="mt-4 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors"
        >
          Bắt đầu chơi
        </button>
      </div>
    </div>
  );
};
