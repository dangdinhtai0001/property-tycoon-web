import React from 'react';
import { Board } from './ui/board/Board';
import { PlayerListPanel } from './ui/panels/PlayerListPanel';
import { ActionPanel } from './ui/panels/ActionPanel';
import { GameLogPanel } from './ui/panels/GameLogPanel';
import { useGameStore } from './app/store/useGameStore';

function App() {
  const { state } = useGameStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Header */}
        <header className="lg:col-span-12 flex items-baseline justify-between mb-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              PROPERTY <span className="text-blue-600">TYCOON</span>
            </h1>
            <p className="text-slate-500 font-medium">Phase 0 — Playable Prototype</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Phase</span>
            <div className="text-blue-600 font-black">{state.phase}</div>
          </div>
        </header>

        {/* Left Side: Board */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <Board />
          <GameLogPanel />
        </main>

        {/* Right Side: Panels */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <PlayerListPanel />
          <ActionPanel />
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
            <h3 className="font-bold mb-1">Hướng dẫn P0:</h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Mục tiêu: Đổ xúc xắc và mua đất.</li>
              <li>Nếu dẫm vào đất người khác, bạn phải trả tiền thuê.</li>
              <li>Hết tiền = Phá sản = Kết thúc.</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default App;
