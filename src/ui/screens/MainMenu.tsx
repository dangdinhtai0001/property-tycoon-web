import React, { useState } from 'react';
import { SetupGameScreen } from './SetupGameScreen';
import { loadGame, hasSave, deleteSave } from '../../storage/gameStorage';
import { useGameStore } from '../../app/store/useGameStore';
import { Play, RotateCcw } from 'lucide-react';
import { SaveSlotModal } from '../modals/SaveSlotModal';

export const MainMenu: React.FC = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const { dispatch } = useGameStore();
  const canLoad = hasSave();

  if (showSetup) {
    return <SetupGameScreen />;
  }

  const handleSelectSlot = (slotId: string) => {
    const savedState = loadGame(slotId);
    if (savedState) {
      dispatch({ type: 'LOAD_GAME', payload: savedState, slotId });
      setShowLoadModal(false);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSave(slotId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 bg-slate-50">
      <div className="text-center space-y-2">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
          PROPERTY <span className="text-blue-600">TYCOON</span>
        </h1>
        <p className="text-xl text-slate-400 font-semibold uppercase tracking-[0.2em]">Ambitious MVP</p>
      </div>

      <div className="flex flex-col gap-5 w-80">
        <button 
          onClick={() => setShowSetup(true)}
          className="group w-full py-5 bg-blue-600 text-white text-xl font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          <Play className="fill-current" />
          MỚI
        </button>
        
        <button 
          onClick={() => setShowLoadModal(true)}
          disabled={!canLoad}
          className={`w-full py-5 text-xl font-black rounded-2xl transition-all flex items-center justify-center gap-3 ${
            canLoad 
              ? 'bg-white text-slate-800 border-2 border-slate-200 shadow-lg hover:shadow-xl hover:bg-slate-50 transform hover:-translate-y-1' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <RotateCcw className={canLoad ? 'text-blue-600' : 'text-slate-300'} />
          TIẾP TỤC
        </button>
      </div>

      {showLoadModal && (
        <SaveSlotModal 
          mode="load"
          onSelect={handleSelectSlot}
          onDelete={handleDeleteSlot}
          onClose={() => setShowLoadModal(false)}
        />
      )}

      <div className="mt-12 text-slate-400 text-sm font-medium">
        v1.1 — Finance & Polish Update
      </div>
    </div>
  );
};
