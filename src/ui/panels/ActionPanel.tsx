import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType, type Property } from '../../game-engine/types/game';

export const ActionPanel: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId)!;
  const currentTile = state.board[currentPlayer.position];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md min-h-[150px]">
      <h2 className="text-xl font-bold">Hành động</h2>
      
      <div className="flex flex-wrap gap-2">
        {state.phase === Phase.WAITING_TO_ROLL && (
          <button
            onClick={() => dispatch({ type: 'ROLL_DICE' })}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đổ xúc xắc
          </button>
        )}

        {state.phase === Phase.BUY_DECISION && (
          <>
            <button
              onClick={() => dispatch({ type: 'BUY_PROPERTY', payload: { propertyId: currentTile.id } })}
              disabled={currentPlayer.cash < (currentTile as Property).price}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              Mua ({ (currentTile as Property).price }$)
            </button>
            <button
              onClick={() => dispatch({ type: 'DECLINE_BUY_PROPERTY' })}
              className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Bỏ qua
            </button>
          </>
        )}

        {state.phase === Phase.END_TURN && (
          <button
            onClick={() => dispatch({ type: 'END_TURN' })}
            className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Kết thúc lượt
          </button>
        )}

        {state.phase === Phase.GAME_OVER && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Chơi lại
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 italic">
        {state.phase === Phase.WAITING_TO_ROLL && 'Chờ bạn đổ xúc xắc...'}
        {state.phase === Phase.ROLLING && 'Đang đổ xúc xắc...'}
        {state.phase === Phase.MOVING && 'Đang di chuyển...'}
        {state.phase === Phase.BUY_DECISION && `Bạn có muốn mua ${(currentTile as Property).name}?`}
        {state.phase === Phase.END_TURN && 'Lượt của bạn đã xong.'}
        {state.phase === Phase.GAME_OVER && `Trò chơi kết thúc! Người thắng là ${state.players.find(p => p.id === state.winnerId)?.name}`}
      </div>
    </div>
  );
};
