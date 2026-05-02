import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType, type Property } from '../../game-engine/types/game';
import { canMortgage, canUnmortgage, canSellBuilding } from '../../game-engine/rules/financeRules';
import { canBuild } from '../../game-engine/rules/buildingRules';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { motion } from 'framer-motion';
import { Dices, Home, Ban, Landmark, Coins, CheckCircle, Info, Handshake, RotateCcw } from 'lucide-react';
import { rollDice } from '../../game-engine/rules/diceRules';

export const ActionPanel: React.FC = () => {
  const { state, dispatch, setShowTradeModal } = useGameStore();
  const { enqueue } = useAnimationQueue();
  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
  const currentTile = state.board[currentPlayer.position];

  return (
    <div className="flex flex-col gap-5 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 min-h-[200px]">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hành động</h2>
        {state.lastDiceRoll && (
          <div className="flex gap-2">
            {state.lastDiceRoll.map((d, i) => (
              <motion.div
                key={`${state.currentPlayerId}-${i}-${d}`}
                initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black shadow-lg"
              >
                {d}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {state.phase === Phase.WAITING_TO_ROLL && currentPlayer.jailTurns > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'PAY_FINE' })}
            disabled={currentPlayer.cash < 50}
            className="flex-1 min-w-[150px] px-6 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 disabled:opacity-40 transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
          >
            <Coins size={20} />
            RA TÙ (50$)
          </motion.button>
        )}

        {state.phase === Phase.WAITING_TO_ROLL && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const result = rollDice();
              enqueue({
                type: 'DICE_ROLL',
                payload: { result },
                onComplete: async () => {
                  dispatch({ type: 'ROLL_DICE', payload: { dice: result } });
                  
                  const totalSteps = result[0] + result[1];
                  for (let i = 0; i < totalSteps; i++) {
                    await new Promise(resolve => setTimeout(resolve, 400));
                    dispatch({ type: 'MOVE_ONE_STEP' });
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 300));
                  dispatch({ type: 'RESOLVE_TILE' });
                }
              });
            }}
            className="flex-1 min-w-[150px] px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Dices size={24} />
            {currentPlayer.jailTurns > 0 ? 'ĐỔ ĐỂ RA TÙ' : 'ĐỔ XÚC XẮC'}
          </motion.button>
        )}

        {state.phase === Phase.BUY_DECISION && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                enqueue({
                  type: 'PURCHASE_SPARKLE',
                  payload: { propertyName: currentTile.name, color: currentPlayer.color },
                  onComplete: () => dispatch({ type: 'BUY_PROPERTY', payload: { propertyId: currentTile.id } })
                });
              }}
              disabled={currentPlayer.cash < (currentTile as Property).price}
              className="flex-1 px-6 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 disabled:opacity-40 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              MUA (${ (currentTile as Property).price })
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'DECLINE_BUY_PROPERTY' })}
              className="px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Ban size={20} />
              BỎ QUA
            </motion.button>
          </>
        )}

        {(state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (currentTile.type === TileType.PROPERTY) {
                dispatch({ type: 'BUILD', payload: { propertyId: currentTile.id } });
              }
            }}
            className="px-6 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-40 flex items-center justify-center gap-2"
            disabled={currentTile.type !== TileType.PROPERTY || !canBuild(state, currentTile.id)}
          >
            <Home size={20} />
            XÂY NHÀ
          </motion.button>
        )}

        {(state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN) && currentTile.type === TileType.PROPERTY && (currentTile as Property).ownerId === currentPlayer.id && (
          <>
            {! (currentTile as Property).isMortgaged ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyId: currentTile.id } })}
                disabled={!canMortgage(state, currentTile.id)}
                className="px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Landmark size={20} />
                THẾ CHẤP
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyId: currentTile.id } })}
                disabled={!canUnmortgage(state, currentTile.id)}
                className="px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                GIẢI CHẤP
              </motion.button>
            )}
            
            {(currentTile as Property).buildingLevel > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch({ type: 'SELL_BUILDING', payload: { propertyId: currentTile.id } })}
                disabled={!canSellBuilding(state, currentTile.id)}
                className="px-6 py-4 bg-amber-100 text-amber-700 font-bold rounded-2xl hover:bg-amber-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Coins size={20} />
                BÁN NHÀ
              </motion.button>
            )}
          </>
        )}

        {(state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTradeModal(true)}
            className="px-6 py-4 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-50 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Handshake size={20} />
            GIAO DỊCH
          </motion.button>
        )}

        {state.phase === Phase.END_TURN && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch({ type: 'END_TURN' })}
            className="flex-1 min-w-[200px] px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            KẾT THÚC LƯỢT
          </motion.button>
        )}

        {state.phase === Phase.GAME_OVER && (
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
          >
            CHƠI LẠI
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-400 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
        <div>
          {state.phase === Phase.WAITING_TO_ROLL && currentPlayer.jailTurns > 0 && `Bạn đang ở tù (lượt ${currentPlayer.jailTurns}/3).`}
          {state.phase === Phase.WAITING_TO_ROLL && currentPlayer.jailTurns === 0 && 'Chờ bạn đổ xúc xắc để di chuyển.'}
          {state.phase === Phase.ROLLING && 'Máy đang tung xúc xắc cho bạn...'}
          {state.phase === Phase.MOVING && 'Quân cờ đang di chuyển trên bàn.'}
          {state.phase === Phase.BUY_DECISION && `Giá mua ${(currentTile as Property).name} là $${(currentTile as Property).price}.`}
          {state.phase === Phase.END_TURN && 'Mọi hành động đã xong, hãy kết thúc lượt.'}
          {state.phase === Phase.GAME_OVER && `Người thắng cuộc là ${state.players.find(p => p.id === state.winnerId)?.name}.`}
          {state.phase === Phase.DEBT_RESOLUTION && 'Bạn đang trong quá trình xử lý nợ.'}
        </div>
      </div>
    </div>
  );
};
