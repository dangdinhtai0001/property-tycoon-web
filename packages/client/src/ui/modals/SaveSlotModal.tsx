import React from 'react';
import { listSaves } from '../../storage/gameStorage';
import { X, Save, Trash2, Calendar, Users } from 'lucide-react';

interface SaveSlotModalProps {
  mode: 'save' | 'load';
  onSelect: (slotId: string) => void;
  onClose: () => void;
  onDelete?: (slotId: string) => void;
}

export const SaveSlotModal: React.FC<SaveSlotModalProps> = ({ mode, onSelect, onClose, onDelete }) => {
  const saves = listSaves();
  const slots = ['1', '2', '3', '4', '5'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'save' ? 'LƯU GAME' : 'TẢI GAME'}
            </h2>
            <p className="text-slate-500 font-medium">Chọn một vị trí lưu trữ</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
            <X size={28} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {slots.map((slotId) => {
            const save = saves.find((s) => s.id === slotId);
            return (
              <div 
                key={slotId}
                className={`group relative flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                  save 
                    ? 'border-slate-100 bg-white hover:border-blue-400 hover:shadow-xl' 
                    : 'border-dashed border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex-1 cursor-pointer" onClick={() => onSelect(slotId)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      save ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Save size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Vị trí {slotId}</h3>
                      {save ? (
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                            <Calendar size={14} />
                            {new Date(save.date).toLocaleString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                            <Users size={14} />
                            {save.playerCount} người chơi • {save.currentPlayerName}
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-medium italic">Trống</p>
                      )}
                    </div>
                  </div>
                </div>

                {save && onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(slotId); }}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={22} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
