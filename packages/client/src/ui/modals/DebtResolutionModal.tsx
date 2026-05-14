import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType, type Property } from '../../game-engine/types/game';
import { canMortgage, canSellBuilding } from '../../game-engine/rules/financeRules';

export const DebtResolutionModal: React.FC = () => {
  const { state, dispatch } = useGameStore();
  
  if (state.phase !== Phase.DEBT_RESOLUTION || !state.debtState) return null;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const debt = state.debtState;
  const creditor = debt.oweTo === 'BANK' ? 'Ngân hàng' : state.players.find(p => p.id === debt.oweTo)?.name;

  const playerProperties = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).ownerId === currentPlayer.id
  ) as Property[];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-red-600 p-6 text-white">
          <h2 className="text-2xl font-black tracking-tight uppercase">Xử lý nợ</h2>
          <p className="text-red-100 opacity-90">Bạn đang nợ {creditor} một khoản tiền.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Financial Summary */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 font-medium">Số nợ:</span>
                  <span className="text-red-600 font-black text-xl">${debt.amount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 font-medium">Tiền mặt hiện có:</span>
                  <span className="text-slate-900 font-black text-xl">${currentPlayer.cash}</span>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Còn thiếu:</span>
                  <span className="text-red-600 font-black text-2xl">
                    ${Math.max(0, debt.amount - currentPlayer.cash)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => dispatch({ type: 'RESOLVE_DEBT' })}
                  disabled={currentPlayer.cash < debt.amount}
                  className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200 uppercase tracking-wide"
                >
                  Trả nợ
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn tuyên bố phá sản? Tất cả tài sản sẽ được chuyển giao.')) {
                      dispatch({ type: 'DECLARE_BANKRUPTCY' });
                    }
                  }}
                  className="w-full py-3 bg-white text-red-600 font-bold rounded-xl border-2 border-red-100 hover:bg-red-50 transition-all uppercase text-sm"
                >
                  Tuyên bố phá sản
                </button>
              </div>
            </div>

            {/* Right: Assets Management */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2">Tài sản của bạn</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {playerProperties.length === 0 ? (
                  <p className="text-slate-400 italic text-sm py-4">Bạn không còn tài sản nào.</p>
                ) : (
                  playerProperties.map(p => (
                    <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {p.buildingLevel > 0 ? `${p.buildingLevel} nhà` : (p.isMortgaged ? 'Đã thế chấp' : 'Đất trống')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {p.buildingLevel > 0 && (
                          <button
                            onClick={() => dispatch({ type: 'SELL_BUILDING', payload: { propertyId: p.id } })}
                            disabled={!canSellBuilding(state, p.id)}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-bold hover:bg-orange-200 disabled:opacity-30"
                            title="Bán nhà"
                          >
                            Bán (+${Math.floor(p.buildingCost / 2)})
                          </button>
                        )}
                        {!p.isMortgaged && p.buildingLevel === 0 && (
                          <button
                            onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyId: p.id } })}
                            disabled={!canMortgage(state, p.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold hover:bg-blue-200 disabled:opacity-30"
                            title="Thế chấp"
                          >
                            Cầm (+${p.mortgageValue})
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
