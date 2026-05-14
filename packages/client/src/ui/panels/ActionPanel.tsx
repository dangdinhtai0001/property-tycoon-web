import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Phase, TileType, type Property } from '@property-tycoon/shared';
import { canMortgage, canUnmortgage } from '../../game-engine/rules/financeRules';
import { canBuild, getBuildingCost } from '../../game-engine/rules/buildingRules';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Home, Ban, Landmark, Coins, CheckCircle, Info, Handshake, RotateCcw, ArrowRight } from 'lucide-react';
import { rollDice } from '../../game-engine/rules/diceRules';
import { BUILDING_LEVEL_NAMES } from '@property-tycoon/shared';

export const ActionPanel: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const { setShowTradeModal } = useUIStore();
  const { enqueue, isAnimating, queue } = useAnimationQueue();
  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
  const currentTile = state.board[currentPlayer.position];
  
  const [isRolling, setIsRolling] = React.useState(false);

  // Block actions if any animation is playing or in queue
  const isBlocked = isRolling || isAnimating || queue.length > 0;

  const handleRollDice = () => {
    if (isBlocked) return;
    setIsRolling(true);
    
    const result = rollDice();
    enqueue({
      type: 'DICE_ROLL',
      payload: { result },
      onComplete: async () => {
        try {
          dispatch({ type: 'ROLL_DICE', payload: { dice: result } });
          const totalSteps = result[0] + result[1];
          for (let i = 0; i < totalSteps; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            dispatch({ type: 'MOVE_ONE_STEP' });
          }
          await new Promise(resolve => setTimeout(resolve, 300));
          dispatch({ type: 'RESOLVE_TILE' });
        } finally {
          setIsRolling(false);
        }
      }
    });
  };

  const renderPrimaryAction = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return (
          <motion.button
            whileHover={!isBlocked ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isBlocked ? { scale: 0.98 } : {}}
            disabled={isBlocked}
            onClick={handleRollDice}
            className="w-full py-3 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-200 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dices size={24} />
            <span className="text-sm tracking-wider uppercase">{isBlocked ? 'Đang xử lý...' : 'Đổ xúc xắc'}</span>
          </motion.button>
        );

      case Phase.BUY_DECISION: {
        const property = currentTile as Property;
        const canAfford = currentPlayer.cash >= property.price;
        return (
          <motion.button
            whileHover={canAfford ? { scale: 1.02, y: -2 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
            // Remove isBlocked check here, phase BUY_DECISION is a stable state
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
            className="w-full py-3 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={24} />
            <span className="text-sm tracking-wider uppercase">Mua {property.name} (${property.price})</span>
          </motion.button>
        );
      }

      case Phase.BUILD_DECISION: {
        const prop = currentTile as Property;
        const currentCost = getBuildingCost(state, prop);
        const canAfford = currentPlayer.cash >= currentCost;
        const nextLevel = prop.buildingLevel + 1;
        const nextBuildingName = BUILDING_LEVEL_NAMES[nextLevel];
        const isLandmark = nextLevel === 5;

        return (
          <div className="flex flex-col gap-2 w-full">
            <motion.button
              whileHover={canAfford && !isBlocked ? { scale: 1.02, y: -2 } : {}}
              whileTap={canAfford && !isBlocked ? { scale: 0.98 } : {}}
              disabled={!canAfford || isBlocked}
              onClick={() => {
                enqueue({
                  type: isLandmark ? 'LANDMARK_COMPLETE' : 'BUILDING_SPARKLE',
                  payload: { 
                    propertyName: prop.name, 
                    buildingName: nextBuildingName,
                    level: nextLevel,
                    playerId: currentPlayer.id,
                    color: currentPlayer.color
                  },
                  onComplete: () => dispatch({ type: 'BUILD', payload: { propertyId: prop.id } })
                });
              }}
              className={`w-full py-4 font-black rounded-3xl shadow-xl flex flex-col items-center justify-center gap-1 transition-all ${
                isLandmark 
                  ? 'bg-amber-500 text-white shadow-amber-200' 
                  : 'bg-orange-500 text-white shadow-orange-200'
              } disabled:opacity-40`}
            >
              {isLandmark ? <Landmark size={24} /> : <Home size={24} />}
              <span className="text-sm tracking-wider uppercase">Xây {nextBuildingName} (${currentCost})</span>
            </motion.button>
            <motion.button
              whileHover={!isBlocked ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isBlocked ? { scale: 0.98 } : {}}
              disabled={isBlocked}
              onClick={() => dispatch({ type: 'END_TURN' })}
              className="w-full py-2 bg-slate-100 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase"
            >
              <ArrowRight size={16} /> Bỏ qua & Kết thúc lượt
            </motion.button>
          </div>
        );
      }

      case Phase.DEBT_RESOLUTION: {
        const debtAmount = state.debtState?.amount || 0;
        const canPay = currentPlayer.cash >= debtAmount;
        return (
          <motion.button
            whileHover={canPay && !isBlocked ? { scale: 1.02, y: -2 } : {}}
            whileTap={canPay && !isBlocked ? { scale: 0.98 } : {}}
            disabled={!canPay || isBlocked}
            onClick={() => dispatch({ type: 'RESOLVE_DEBT' })}
            className="w-full py-3 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
          >
            <Coins size={24} />
            <span className="text-sm tracking-wider uppercase">Trả nợ (${debtAmount})</span>
          </motion.button>
        );
      }

      case Phase.END_TURN:
        return (
          <motion.button
            whileHover={!isBlocked ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isBlocked ? { scale: 0.98 } : {}}
            disabled={isBlocked}
            onClick={() => dispatch({ type: 'END_TURN' })}
            className="w-full py-3 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
          >
            <CheckCircle size={24} />
            <span className="text-sm tracking-wider uppercase">Kết thúc lượt</span>
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
          disabled={currentPlayer.cash < 50 || isBlocked}
          className="flex-1 min-w-[120px] p-3 bg-amber-100 text-amber-700 font-black rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-[10px] disabled:opacity-50"
        >
          <Coins size={14} /> RA TÙ (50$)
        </button>
      );
    }    // Skip Buying
    if (state.phase === Phase.BUY_DECISION) {
      actions.push(
        <button
          key="skip-buy"
          onClick={() => dispatch({ type: 'DECLINE_BUY_PROPERTY' })}
          // Never disable skip during BUY_DECISION phase
          disabled={false} 
          className="flex-1 min-w-[120px] p-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 flex items-center justify-center gap-2 text-[10px] disabled:opacity-50"
        >
          <Ban size={14} /> Bỏ qua
        </button>
      );
    }
    // Trading
    if (state.phase === Phase.WAITING_TO_ROLL || state.phase === Phase.END_TURN) {
      actions.push(
        <button
          key="trade"
          onClick={() => setShowTradeModal(true)}
          disabled={isBlocked}
          className="flex-1 min-w-[120px] p-3 bg-white text-blue-600 font-bold rounded-2xl border border-blue-100 hover:bg-blue-50 flex items-center justify-center gap-2 text-[10px] shadow-sm disabled:opacity-50"
        >
          <Handshake size={14} /> GIAO DỊCH
        </button>
      );
    }

    // Property Management (Build/Mortgage) - Show if property is owned by current player
    const isOwnedByCurrent = currentTile.type === TileType.PROPERTY && (currentTile as Property).ownerId === currentPlayer.id;
    if ((state.phase === Phase.END_TURN || state.phase === Phase.DEBT_RESOLUTION) && isOwnedByCurrent) {
      const prop = currentTile as Property;
      
      // Build
      if (!prop.isMortgaged && canBuild(state, prop.id)) {
        const nextLevel = prop.buildingLevel + 1;
        const nextBuildingName = BUILDING_LEVEL_NAMES[nextLevel];
        const isLandmark = nextLevel === 5;

        actions.push(
          <button
            key="build"
            onClick={() => {
              enqueue({
                type: isLandmark ? 'LANDMARK_COMPLETE' : 'BUILDING_SPARKLE',
                payload: { 
                  propertyName: prop.name, 
                  buildingName: nextBuildingName,
                  level: nextLevel,
                  playerId: currentPlayer.id,
                  color: currentPlayer.color
                },
                onComplete: () => dispatch({ type: 'BUILD', payload: { propertyId: prop.id } })
              });
            }}
            disabled={isBlocked}
            className={`flex-1 min-w-[120px] p-3 font-bold rounded-2xl border flex items-center justify-center gap-2 text-[10px] transition-all duration-300 ${
              isLandmark 
                ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse' 
                : 'bg-orange-100 text-orange-700 border-orange-200'
            } disabled:opacity-50`}
          >
            {isLandmark ? <Landmark size={14} className="fill-amber-500" /> : <Home size={14} />} 
            {isLandmark ? `XÂY ${nextBuildingName.toUpperCase()}` : `XÂY ${nextBuildingName.toUpperCase()}`}
          </button>
        );
      }

      // Mortgage/Unmortgage
      if (!prop.isMortgaged) {
        actions.push(
          <button
            key="mortgage"
            onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', payload: { propertyId: prop.id } })}
            disabled={!canMortgage(state, prop.id) || isBlocked}
            className="flex-1 min-w-[120px] p-3 bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-[10px] disabled:opacity-50"
          >
            <Landmark size={14} /> THẾ CHẤP
          </button>
        );
      } else {
        actions.push(
          <button
            key="unmortgage"
            onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', payload: { propertyId: prop.id } })}
            disabled={!canUnmortgage(state, prop.id) || isBlocked}
            className="flex-1 min-w-[120px] p-3 bg-emerald-100 text-emerald-700 font-bold rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-[10px] disabled:opacity-50"
          >
            <RotateCcw size={14} /> GIẢI CHẤP
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
          disabled={isBlocked}
          className="flex-1 min-w-[120px] p-3 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-[10px] shadow-lg disabled:opacity-50"
        >
          <CheckCircle size={14} /> KẾT THÚC LƯỢT
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
      case Phase.BUILD_DECISION: {
        const prop = currentTile as Property;
        const cost = getBuildingCost(state, prop);
        const nextLevel = prop.buildingLevel + 1;
        const nextBuildingName = BUILDING_LEVEL_NAMES[nextLevel];
        return currentPlayer.cash >= cost
          ? `Chào mừng trở về! Bạn có muốn nâng cấp ${prop.name} lên ${nextBuildingName} với giá $${cost}?`
          : `Bạn đã về đến nhà, nhưng hiện tại không đủ $${cost} để nâng cấp lên ${nextBuildingName}.`;
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
    <div className="flex flex-col gap-3">
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

      <div 
        className="backdrop-blur-sm p-3 flex flex-col gap-3 transition-all duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          borderRadius: 'var(--panel-radius)',
          border: '1px solid var(--panel-border)',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
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
        <div className="flex flex-col gap-2">
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
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info size={14} className="text-blue-600" />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Gợi ý lượt chơi</span>
            <p className="text-[11px] font-bold text-slate-600 leading-tight mt-1">{getPhaseHint()}</p>
          </div>
        </div>
      </div>
      {state.config.enableDebug && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors">
              <span>Chế độ Debug</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Nhảy đến ô (0-39)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="39"
                    defaultValue="0"
                    id="debug-jump-input"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                  />
                  <button 
                    onClick={() => {
                      const val = parseInt((document.getElementById('debug-jump-input') as HTMLInputElement).value);
                      if (!isNaN(val)) dispatch({ type: 'TELEPORT_PLAYER', payload: { position: val } });
                    }}
                    className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase"
                  >
                    Go
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Tiền mặt</label>
                <button 
                  onClick={() => dispatch({ type: 'DEBUG_ADD_CASH', payload: { amount: 1000 } })}
                  className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg py-1 text-[10px] font-black uppercase hover:bg-emerald-100 transition-colors"
                >
                  + $1000
                </button>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

