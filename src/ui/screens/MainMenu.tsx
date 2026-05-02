import React, { useState } from 'react';
import { SetupGameScreen } from './SetupGameScreen';

export const MainMenu: React.FC = () => {
  const [showSetup, setShowSetup] = useState(false);

  if (showSetup) {
    return <SetupGameScreen />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-800 tracking-tight mb-2">
          PROPERTY <span className="text-blue-600">TYCOON</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium">Phase 1 — Core Playable</p>
      </div>

      <div className="flex flex-col gap-4 w-64">
        <button 
          onClick={() => setShowSetup(true)}
          className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Trò chơi mới
        </button>
        <button 
          disabled
          className="w-full py-4 bg-gray-200 text-gray-400 text-xl font-bold rounded-xl cursor-not-allowed"
          title="Tính năng chưa khả dụng trong Phase 1"
        >
          Tải trò chơi
        </button>
      </div>
    </div>
  );
};
