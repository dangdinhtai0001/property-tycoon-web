import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { X, Save, LogOut, RotateCcw } from 'lucide-react';
import { SaveSlotModal } from './SaveSlotModal';
import { saveGame } from '../../storage/gameStorage';

interface PauseMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ isOpen, onClose }) => {
  const { state, activeSlotId, setActiveSlot } = useGameStore();
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (!isOpen) return null;

  const handleQuit = () => {
    if (window.confirm('Bạn có chắc chắn muốn thoát? Game đã được tự động lưu.')) {
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu lại? Dữ liệu lưu hiện tại sẽ bị xóa.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveToSlot = (slotId: string) => {
    saveGame(state, slotId);
    setActiveSlot(slotId);
    setShowSaveModal(false);
    alert(`Đã lưu game vào vị trí ${slotId}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight uppercase">Tạm dừng</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
            >
              TIẾP TỤC
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-50 hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
            >
              <Save size={20} />
              LƯU VÀO SLOT KHÁC
            </button>
            
            <button
              onClick={handleReset}
              className="w-full py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw size={20} className="text-slate-400" />
              CHƠI LẠI TỪ ĐẦU
            </button>

            <button
              onClick={handleQuit}
              className="w-full py-4 bg-white text-red-600 font-bold rounded-2xl border-2 border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={20} />
              THOÁT RA MENU
            </button>
          </div>

          <div className="px-6 pb-6 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Save size={10} />
              Tự động lưu vào vị trí {activeSlotId}
            </p>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <SaveSlotModal 
          mode="save"
          onSelect={handleSaveToSlot}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </>
  );
};
