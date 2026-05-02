import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { type GameConfig } from '../../game-engine/types/game';
import { DEFAULT_CONFIG } from '../../game-engine/state/setupGame';
import { Settings, Users, Shield, Zap } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const SetupGameScreen: React.FC = () => {
  const { dispatch } = useGameStore();
  const [players, setPlayers] = useState<{ name: string; color: string; avatarUrl?: string }[]>([
    { name: 'Người chơi 1', color: COLORS[0], avatarUrl: '/assets/avatars/player1.png' },
    { name: 'Người chơi 2', color: COLORS[1], avatarUrl: '/assets/avatars/player2.png' },
  ]);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { 
        name: `Người chơi ${players.length + 1}`, 
        color: COLORS[players.length],
        avatarUrl: `/assets/avatars/player${players.length + 1}.png`
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: 'name' | 'color' | 'avatarUrl', value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME', payload: { players, config } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6 bg-slate-50">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">Cài đặt trò chơi</h2>
        <p className="text-slate-400 font-semibold uppercase tracking-widest">Sẵn sàng bước vào thương trường</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Player List */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-black">Người chơi ({players.length}/6)</h3>
          </div>

          <div className="space-y-4">
            {players.map((p, idx) => (
              <div key={idx} className="flex gap-3 items-center group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="relative">
                  <input 
                    type="color" 
                    value={p.color} 
                    onChange={(e) => updatePlayer(idx, 'color', e.target.value)}
                    className="w-12 h-12 rounded-2xl cursor-pointer border-4 border-white shadow-md hover:scale-105 transition-transform appearance-none"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={p.name}
                    onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                    placeholder="Tên người chơi"
                  />
                  <input 
                    type="text" 
                    value={p.avatarUrl || ''}
                    onChange={(e) => updatePlayer(idx, 'avatarUrl', e.target.value)}
                    className="w-full p-2 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none text-[10px] font-medium text-slate-500 transition-all"
                    placeholder="Đường dẫn Avatar (URL)"
                  />
                </div>
                {players.length > 2 && (
                  <button 
                    onClick={() => removePlayer(idx)}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}

            {players.length < 6 && (
              <button 
                onClick={addPlayer}
                className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-2xl hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all"
              >
                + THÊM NGƯỜI CHƠI
              </button>
            )}
          </div>
        </div>

        {/* Rule Config */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Shield size={20} />
            </div>
            <h3 className="text-xl font-black">Luật chơi</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Tiền khởi điểm</label>
                <span className="font-black text-slate-700 text-xl">{config.startingCash}$</span>
              </div>
              <input 
                type="range" min="500" max="3000" step="100"
                value={config.startingCash}
                onChange={(e) => setConfig({...config, startingCash: Number(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Thưởng qua ô START</label>
                <span className="font-black text-slate-700 text-xl">{config.passStartBonus}$</span>
              </div>
              <input 
                type="range" min="0" max="500" step="50"
                value={config.passStartBonus}
                onChange={(e) => setConfig({...config, passStartBonus: Number(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="pt-4 space-y-4">
              <label className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <Zap size={16} />
                  </div>
                  <div>
                    <span className="block font-black text-slate-700">Chế độ chơi nhanh (x2 tiền thuê)</span>
                    <span className="text-xs text-slate-400 font-medium italic">Tiền thuê tăng gấp đôi</span>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={config.quickModeMultiplier === 2}
                    onChange={(e) => setConfig({...config, quickModeMultiplier: e.target.checked ? 2 : 1})}
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <Settings size={16} />
                  </div>
                  <div>
                    <span className="block font-black text-slate-700">Bật đấu giá (Auction)</span>
                    <span className="text-xs text-slate-400 font-medium italic">Đấu giá khi có người từ chối mua</span>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={config.enableAuction}
                    onChange={(e) => setConfig({...config, enableAuction: e.target.checked})}
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>

          <button 
            onClick={handleStartGame}
            className="mt-auto w-full py-5 bg-blue-600 text-white text-xl font-black rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all transform hover:-translate-y-1"
          >
            BẮT ĐẦU CHƠI
          </button>
        </div>
      </div>
    </div>
  );
};
