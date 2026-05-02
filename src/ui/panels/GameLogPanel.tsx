import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';

export const GameLogPanel: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-900 text-green-400 rounded-lg shadow-md h-[200px] overflow-hidden">
      <h2 className="text-sm font-mono border-b border-gray-700 pb-1 mb-1">Nhật ký trò chơi</h2>
      <div className="flex flex-col-reverse gap-1 overflow-y-auto font-mono text-[12px]">
        {state.log.map((entry, index) => (
          <div key={index} className="opacity-80 hover:opacity-100">
            <span className="text-gray-500 mr-2">[{state.log.length - index}]</span>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
};
