import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { type Property, TileType, Phase } from '../../game-engine/types/game';
import { Handshake, ArrowRightLeft, X, Check, Trash2, Plus } from 'lucide-react';

interface TradeModalProps {
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ onClose }) => {
  const { state, dispatch } = useGameStore();
  const isViewingOffer = state.phase === Phase.TRADE && state.tradeOffer;
  
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const otherPlayers = state.players.filter(p => p.id !== currentPlayer.id && !p.isBankrupt);

  // State for building offer
  const [targetPlayerId, setTargetPlayerId] = useState(otherPlayers[0]?.id || '');
  const [offeredCash, setOfferedCash] = useState(0);
  const [offeredPropertyIds, setOfferedPropertyIds] = useState<string[]>([]);
  const [requestedCash, setRequestedCash] = useState(0);
  const [requestedPropertyIds, setRequestedPropertyIds] = useState<string[]>([]);

  if (isViewingOffer) {
    const offer = state.tradeOffer!;
    const offerer = state.players.find(p => p.id === offer.offererId)!;
    const target = state.players.find(p => p.id === offer.targetId)!;
    
    // Only target can see the "Accept/Reject" buttons, others see "Waiting"
    const isTarget = currentPlayer.id === target.id;

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[120] p-6">
        <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <Handshake size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">GIAO DỊCH</h2>
                <p className="text-slate-500 font-medium">Lời đề nghị từ {offerer.name}</p>
              </div>
            </div>
          </div>

          <div className="p-10 grid grid-cols-2 gap-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-xl">
              <ArrowRightLeft size={24} />
            </div>

            {/* Offerer Side */}
            <div className="space-y-6">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{offerer.name} đưa ra</p>
              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 space-y-4 min-h-[100px]">
                <p className="text-3xl font-black text-blue-600">{offer.offeredCash}$</p>
                <div className="space-y-2">
                  {offer.offeredPropertyIds.map(id => {
                    const prop = state.board.find(t => (t as any).id === id) as Property;
                    return (
                      <div key={id} className="p-3 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: prop.color || '#ccc' }} />
                        <span className="text-sm font-bold text-slate-700">{prop.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Target Side */}
            <div className="space-y-6 text-right">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Đổi lấy từ {target.name}</p>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-4 min-h-[100px]">
                <p className="text-3xl font-black text-slate-600">{offer.requestedCash}$</p>
                <div className="space-y-2">
                  {offer.requestedPropertyIds.map(id => {
                    const prop = state.board.find(t => (t as any).id === id) as Property;
                    return (
                      <div key={id} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 justify-end">
                        <span className="text-sm font-bold text-slate-700">{prop.name}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: prop.color || '#ccc' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            {isTarget ? (
              <>
                <button 
                  onClick={() => dispatch({ type: 'ACCEPT_TRADE' })}
                  className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                >
                  <Check /> ĐỒNG Ý
                </button>
                <button 
                  onClick={() => dispatch({ type: 'REJECT_TRADE' })}
                  className="flex-1 py-5 bg-white text-red-600 font-black rounded-[1.5rem] border-2 border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                >
                  <X /> TỪ CHỐI
                </button>
              </>
            ) : (
              <div className="w-full text-center py-4 text-slate-400 font-bold italic">
                Đang chờ {target.name} phản hồi...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create Mode Logic
  const handlePropose = () => {
    dispatch({ 
      type: 'PROPOSE_TRADE', 
      payload: { 
        offer: {
          offererId: currentPlayer.id,
          targetId: targetPlayerId,
          offeredCash,
          offeredPropertyIds,
          requestedCash,
          requestedPropertyIds
        } 
      } 
    });
  };

  const myProperties = state.board.filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === currentPlayer.id) as Property[];
  const targetPlayer = state.players.find(p => p.id === targetPlayerId);
  const targetProperties = targetPlayer ? state.board.filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === targetPlayer.id) as Property[] : [];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[120] p-6">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Handshake size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">ĐỀ NGHỊ GIAO DỊCH</h2>
              <p className="text-slate-500 font-medium">Bạn đang tạo một lời đề nghị</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
            <X size={28} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto">
          {/* My Side */}
          <div className="space-y-6">
            <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Tài sản của bạn</h3>
            <div className="space-y-4 p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50">
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tiền mặt đề nghị</label>
                <input 
                  type="number"
                  value={offeredCash}
                  onChange={(e) => setOfferedCash(Math.min(currentPlayer.cash, Number(e.target.value)))}
                  className="w-full p-4 bg-white border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none font-black text-2xl text-blue-600 shadow-inner"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Chọn bất động sản ({offeredPropertyIds.length})</label>
                <div className="flex flex-wrap gap-2">
                  {myProperties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => offeredPropertyIds.includes(p.id) 
                        ? setOfferedPropertyIds(offeredPropertyIds.filter(id => id !== p.id))
                        : setOfferedPropertyIds([...offeredPropertyIds, p.id])
                      }
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-2 ${
                        offeredPropertyIds.includes(p.id)
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white opacity-50" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Their Side */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Yêu cầu từ</h3>
              <select 
                value={targetPlayerId}
                onChange={(e) => {
                  setTargetPlayerId(e.target.value);
                  setRequestedPropertyIds([]);
                }}
                className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-700 outline-none"
              >
                {otherPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền mặt yêu cầu</label>
                <input 
                  type="number"
                  value={requestedCash}
                  onChange={(e) => setRequestedCash(Math.min(targetPlayer?.cash || 10000, Number(e.target.value)))}
                  className="w-full p-4 bg-white border-2 border-transparent focus:border-slate-400 rounded-2xl outline-none font-black text-2xl text-slate-600 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn bất động sản ({requestedPropertyIds.length})</label>
                <div className="flex flex-wrap gap-2">
                  {targetProperties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => requestedPropertyIds.includes(p.id) 
                        ? setRequestedPropertyIds(requestedPropertyIds.filter(id => id !== p.id))
                        : setRequestedPropertyIds([...requestedPropertyIds, p.id])
                      }
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center gap-2 ${
                        requestedPropertyIds.includes(p.id)
                          ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white opacity-50" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex gap-4">
          <button 
            onClick={handlePropose}
            disabled={!targetPlayerId || (offeredCash === 0 && offeredPropertyIds.length === 0 && requestedCash === 0 && requestedPropertyIds.length === 0)}
            className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-3 transition-all"
          >
            <Handshake /> GỬI LỜI ĐỀ NGHỊ
          </button>
        </div>
      </div>
    </div>
  );
};
