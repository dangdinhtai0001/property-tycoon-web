import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Trophy, Home, DollarSign, RotateCcw } from 'lucide-react';
import { clearSave } from '../../storage/gameStorage';

export const EndGameScreen: React.FC = () => {
  const { state } = useGameStore();
  const winner = state.players.find(p => p.id === state.winnerId);

  if (!winner) return null;

  const handleRestart = () => {
    clearSave();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full py-12 flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Victory Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-white p-8 rounded-full shadow-2xl border-8 border-yellow-100">
            <Trophy size={80} className="text-yellow-500" />
          </div>
        </div>

        {/* Announcement */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-400 uppercase tracking-[0.3em]">Kết thúc ván đấu</h1>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
            <span className="text-blue-600">{winner.name}</span> CHIẾN THẮNG!
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {state.players.sort((a, b) => b.cash - a.cash).map((player, index) => (
            <div 
              key={player.id}
              className={`p-6 rounded-3xl border-2 flex flex-col gap-4 transition-all ${
                player.id === winner.id 
                  ? 'bg-white border-yellow-200 shadow-xl shadow-yellow-50' 
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{ backgroundColor: player.color }}>
                  {index + 1}
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-900 uppercase text-xs tracking-wider">Người chơi</div>
                  <div className="font-bold text-slate-600">{player.name}</div>
                </div>
                {player.id === winner.id && <Trophy size={20} className="ml-auto text-yellow-500 fill-current" />}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100/50 p-3 rounded-2xl flex items-center gap-2">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="font-black text-slate-700">${player.cash}</span>
                </div>
                <div className="bg-slate-100/50 p-3 rounded-2xl flex items-center gap-2">
                  <Home size={16} className="text-blue-600" />
                  <span className="font-black text-slate-700">
                    {state.board.filter(t => (t as any).ownerId === player.id).length} ô
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={handleRestart}
          className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transform hover:-translate-y-1"
        >
          <RotateCcw size={24} />
          QUAY LẠI TRANG CHỦ
        </button>

      </div>
    </div>
  );
};
