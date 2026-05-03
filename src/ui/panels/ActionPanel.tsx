import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType, type Property } from '../../game-engine/types/game';
import { canMortgage, canUnmortgage } from '../../game-engine/rules/financeRules';
import { canBuild } from '../../game-engine/rules/buildingRules';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Home, Ban, Landmark, Coins, CheckCircle, Info, Handshake, RotateCcw } from 'lucide-react';
import { rollDice } from '../../game-engine/rules/diceRules';

export const ActionPanel: React.FC = () => {
  const { state, dispatch, setShowTradeModal } = useGameStore();
  const { enqueue } = useAnimationQueue();
  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
  const currentTile = state.board[currentPlayer.position];

  const handleRollDice = () => {
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
  };

  const renderPrimaryAction = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRollDice}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-200 flex flex-col items-center justify-center gap-1.5"
          >
            <Dices size={28} />
            <span className="text-base tracking-wider uppercase">Đổ xúc xắc</span>
          </motion.button>
        );

      case Phase.BUY_DECISION: {
        const property = currentTile as Property;
        const canAfford = currentPlayer.cash >= property.price;
        return (
          <motion.button
            whileHover={canAfford ? { scale: 1.02, y: -2 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
            disabled={!canAfford}
            onClick={() => {
              const remainingCash = currentPlayer.cash - property.price;
              enqueue({
                type: 'PURCHASE_SPARKLE',
                payload: { 
                  propertyName: property.name, 
                  color: currentPlayer.color,
                  price: property.price,
                  rent: property.rent,
                  remainingCash: remainingCash
                },
                onComplete: () => dispatch({ type: 'BUY_PROPERTY', payload: { propertyId: property.id } })
              });
            }}
            className="w-full py-4 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-200 flex flex-col items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={28} />
            <span className="text-base tracking-wider uppercase">Mua {property.name} (${property.price})</span>
          </motion.button>
        );
      }

      case Phase.DEBT_RESOLUTION: {
        const debtAmount = state.debtState?.amount || 0;
        const canPay = currentPlayer.cash >= debtAmount;
        return (
          <motion.button
            whileHover={canPay ? { scale: 1.02, y: -2 } : {}}
            whileTap={canPay ? { scale: 0.98 } : {}}
            disabled={!canPay}
            onClick={() => dispatch({ type: 'RESOLVE_DEBT' })}
            className="w-full py-4 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-200 flex flex-col items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Coins size={28} />
            <span className="text-base tracking-wider uppercase">Trả nợ (${debtAmount})</span>
          </motion.button>
        );
      }

      case Phase.END_TURN:
        return (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'END_TURN' })}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-200 flex flex-col items-center justify-center gap-1.5"
          >
            <CheckCircle size={28} />
            <span className="text-base tracking-wider uppercase">Kết thúc lượt</span>
          </motion.button>
        );

      case Phase.ROLLING:
      case Phase.MOVING:
        return (
          <div className="w-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <RotateCcw size={32} className="text-slate-400" />
            </motion.div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang xử lý...</span>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSecondaryActions = () => {
    const actions = [];

    // Jail Fine
    if (state.phase === Phase.WAITING_TO_ROLL && currentPlayer.jailTurns > 0) {
      actions.push(
        <button
          key="jail-fine"
          onClick={() => dispatch({ type: 'PAY_FINE' })}
          disabled={currentPlayer.cash < 50}
          className="flex-1 min-w-[120px] p-4 bg-amber-100 text-amber-700 font-black rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-xs"
        >
          <Coins size={16} /> RA TÙ (50$)
        </button>
      );
    }

    // Skip Buying
    if (state.phase === Phase.BUY_DECISION) {
      actions.push(
        <button
          key="skip-buy"
          onClick={() => dispatch({ type: 'DECLINE_BUY_PROPERTY' })}
          className="flex-1 min-w-[120px] p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 flex items-center justify-center gap-2 text-xs"
        >
          <Ban size={16} /> BỎ QUA
        </button>
      );
    }

    // Trading
    if (state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN) {
      actions.push(
        <button
          key="trade"
          onClick={() => setShowTradeModal(true)}
          className="flex-1 min-w-[120px] p-4 bg-white text-blue-600 font-bold rounded-2xl border border-blue-100 hover:bg-blue-50 flex items-center justify-center gap-2 text-xs shadow-sm"
        >
          <Handshake size={16} /> GIAO DỊCH
        </button>
      );
    }

    // Property Management (Build/Mortgage) - Show if property is owned by current player
    const isOwnedByCurrent = currentTile.type === TileType.PROPERTY && (currentTile as Property).ownerId === currentPlayer.id;
    if ((state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN || state.phase === Phase.DEBT_RESOLUTION) && isOwnedByCurrent) {
      const prop = currentTile as Property;
      
      // Build
      if (!prop.isMortgaged && canBuild(state, prop.id)) {
        actions.push(
          <button
            key="build"
            onClick={() => dispatch({ type: 'BUILD', payload: { propertyId: prop.id } })}
            className="flex-1 min-w-[120px] p-4 bg-orange-100 text-orange-700 font-bold rounded-2xl border border-orange-200 flex items-center justify-center gap-2 text-xs"
          >
            <Home size={16} /> XÂY NHÀ
          </button>
        );
      }

      // Mortgage/Unmortgage
      if (!prop.isMortgaged) {
        actions.push(
          <button
            key="mortgage"
            onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyId: prop.id } })}
            disabled={!canMortgage(state, prop.id)}
            className="flex-1 min-w-[120px] p-4 bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs"
          >
            <Landmark size={16} /> THẾ CHẤP
          </button>
        );
      } else {
        actions.push(
          <button
            key="unmortgage"
            onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyId: prop.id } })}
            disabled={!canUnmortgage(state, prop.id)}
            className="flex-1 min-w-[120px] p-4 bg-emerald-100 text-emerald-700 font-bold rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-xs"
          >
            <RotateCcw size={16} /> GIẢI CHẤP
          </button>
        );
      }
    }

    // End Turn (Always available as a fallback after moving)
    const canEndTurn = (state.phase === Phase.END_TURN || state.phase === Phase.BUILD_DECISION) && state.phase !== Phase.END_TURN;
    if (canEndTurn) {
      actions.push(
        <button
          key="end-turn-secondary"
          onClick={() => {
            dispatch({ type: 'END_TURN' });
          }}
          className="flex-1 min-w-[120px] p-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg"
        >
          <CheckCircle size={16} /> KẾT THÚC LƯỢT
        </button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-2">
        {actions}
      </div>
    ) : null;
  };

  const getPhaseHint = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return currentPlayer.jailTurns > 0 
          ? `Bạn đang ở tù (lượt ${currentPlayer.jailTurns}/3). Đổ xúc xắc để tìm vận may.`
          : 'Tung xúc xắc để di chuyển quân cờ của bạn.';
      case Phase.BUY_DECISION: {
        const prop = currentTile as Property;
        const remaining = currentPlayer.cash - prop.price;
        return remaining >= 0 
          ? `Sau khi mua ${prop.name}, bạn sẽ còn $${remaining.toLocaleString()}.`
          : `Bạn thiếu $${Math.abs(remaining).toLocaleString()} để mua tài sản này.`;
      }
      case Phase.DEBT_RESOLUTION: {
        const debt = state.debtState?.amount || 0;
        const missing = debt - currentPlayer.cash;
        return missing > 0 
          ? `Bạn còn thiếu $${missing.toLocaleString()}. Hãy thế chấp tài sản hoặc bán nhà để trả nợ.`
          : `Bạn đã đủ tiền để trả nợ $${debt.toLocaleString()}.`;
      }
      case Phase.END_TURN:
        return 'Tất cả hành động đã hoàn tất. Chúc mừng một lượt chơi thành công!';
      default:
        return 'Vui lòng chờ lượt xử lý của hệ thống...';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase italic">Bảng điều khiển</h2>
        {state.lastDiceRoll && state.phase !== Phase.WAITING_TO_ROLL && (
          <div className="flex gap-1.5">
            {state.lastDiceRoll.map((d, i) => (
              <div key={i} className="w-6 h-6 bg-slate-100 border border-slate-200 text-slate-600 rounded-md flex items-center justify-center text-[10px] font-black">
                {d}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-4 border border-white shadow-2xl flex flex-col gap-4">
        {/* Primary Action Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {renderPrimaryAction()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Secondary Actions Area */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Hành động bổ sung</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          {renderSecondaryActions() || (
            <div className="text-center py-2">
              <span className="text-[10px] font-bold text-slate-400 italic">Không có hành động bổ sung</span>
            </div>
          )}
        </div>

        {/* Dynamic Hint Area */}
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info size={16} className="text-blue-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Gợi ý lượt chơi</span>
            <p className="text-xs font-bold text-slate-600 leading-relaxed">{getPhaseHint()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

