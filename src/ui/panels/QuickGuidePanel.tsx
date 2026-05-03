import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';

export const QuickGuidePanel: React.FC = () => {
  const { state } = useGameStore();
  const [isExpanded, setIsExpanded] = React.useState(true);
  // track turns to auto-collapse
  React.useEffect(() => {
    // This is a simplification, we could track actual turns in state
    // But for now let's just assume some time has passed or use a simple count
    // In a real app we might use state.turnNumber if it existed
  }, []);

  const getPhaseHint = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return {
          title: 'Đến lượt bạn',
          text: 'Tung xúc xắc để bắt đầu di chuyển trên bàn cờ.',
          icon: <Lightbulb className="text-amber-500" size={18} />,
          color: 'border-amber-200 bg-amber-50/50'
        };
      case Phase.BUY_DECISION:
        return {
          title: 'Quyết định mua',
          text: 'Sở hữu đất giúp bạn thu tiền thuê từ người khác.',
          icon: <Info className="text-blue-500" size={18} />,
          color: 'border-blue-200 bg-blue-50/50'
        };
      case Phase.BUILD_DECISION:
        return {
          title: 'Nâng cấp tài sản',
          text: 'Xây nhà khi đủ bộ màu để tăng mạnh tiền thuê.',
          icon: <HelpCircle className="text-emerald-500" size={18} />,
          color: 'border-emerald-200 bg-emerald-50/50'
        };
      case Phase.DEBT_RESOLUTION:
        return {
          title: 'Giải quyết nợ',
          text: 'Thế chấp hoặc bán tài sản để trả nợ. Tránh phá sản!',
          icon: <AlertTriangle className="text-rose-500" size={18} />,
          color: 'border-rose-200 bg-rose-50/50'
        };
      default:
        return {
          title: 'Mẹo chơi',
          text: 'Cố gắng thu thập đủ bộ màu để có quyền xây nhà.',
          icon: <HelpCircle className="text-slate-400" size={18} />,
          color: 'border-slate-200 bg-white/80'
        };
    }
  };

  const hint = getPhaseHint();

  return (
    <motion.div 
      layout
      className={`relative border backdrop-blur-md rounded-3xl shadow-xl transition-all duration-500 overflow-hidden ${hint.color}`}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          {hint.icon}
          <span className="font-black text-xs uppercase tracking-wider">{hint.title}</span>
        </div>
        <HelpCircle size={16} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180 opacity-40' : 'rotate-0'}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
              {hint.text}
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-200/50">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Ghi chú nhanh</h4>
              <ul className="text-[10px] space-y-1.5 text-slate-500">
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Mua đủ bộ màu để xây nhà.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Thế chấp khi thiếu tiền mặt.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
