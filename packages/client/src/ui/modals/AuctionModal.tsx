import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { type Property } from '../../game-engine/types/game';
import { Gavel, TrendingUp, User, X } from 'lucide-react';

export const AuctionModal: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const auction = state.auctionState;

  if (!auction) return null;

  const property = state.board.find(t => (t as any).id === auction.propertyId) as Property;
  const bidderId = auction.biddingPlayerIds[auction.turnIndex];
  const currentBidder = state.players.find(p => p.id === bidderId)!;
  const highestBidder = auction.highestBidderId ? state.players.find(p => p.id === auction.highestBidderId) : null;

  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);

  const handleBid = () => {
    dispatch({ type: 'BID', payload: { amount: bidAmount } });
    setBidAmount(bidAmount + 10);
  };

  const handlePass = () => {
    dispatch({ type: 'PASS_BID' });
    setBidAmount(auction.currentBid + 10);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-6">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
              <Gavel size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">ĐẤU GIÁ</h2>
              <p className="text-slate-500 font-medium">{property.name}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Current Bid Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Giá hiện tại</p>
              <p className="text-4xl font-black text-blue-600 tracking-tighter">{auction.currentBid}$</p>
              {highestBidder && (
                <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
                  <User size={14} /> {highestBidder.name}
                </p>
              )}
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Đang đấu giá</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: currentBidder.color }} />
                <p className="text-xl font-black text-slate-800">{currentBidder.name}</p>
              </div>
              <p className="text-sm font-bold text-slate-400 mt-2">Tiền mặt: {currentBidder.cash}$</p>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-3xl border-2 border-blue-100">
              <div className="flex-1 flex items-center gap-4">
                <button 
                  onClick={() => setBidAmount(Math.max(auction.currentBid + 1, bidAmount - 10))}
                  className="w-12 h-12 flex items-center justify-center bg-white text-blue-600 rounded-2xl font-black text-2xl hover:bg-blue-100 transition-colors shadow-sm"
                >
                  -
                </button>
                <input 
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="flex-1 bg-transparent text-center text-3xl font-black text-blue-700 outline-none"
                />
                <button 
                  onClick={() => setBidAmount(bidAmount + 10)}
                  className="w-12 h-12 flex items-center justify-center bg-white text-blue-600 rounded-2xl font-black text-2xl hover:bg-blue-100 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleBid}
                disabled={bidAmount <= auction.currentBid || bidAmount > currentBidder.cash}
                className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
              >
                <TrendingUp size={20} /> ĐẶT GIÁ
              </button>
            </div>

            <button 
              onClick={handlePass}
              className="w-full py-4 bg-white text-slate-400 font-black rounded-2xl border-2 border-slate-100 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <X size={20} /> BỎ QUA PHIÊN ĐẤU GIÁ
            </button>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Người chơi còn lại</p>
            <div className="flex flex-wrap gap-2">
              {auction.biddingPlayerIds.map(id => {
                const p = state.players.find(pl => pl.id === id)!;
                return (
                  <div 
                    key={id}
                    className={`px-3 py-2 rounded-xl flex items-center gap-2 border-2 transition-all ${
                      id === bidderId ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
