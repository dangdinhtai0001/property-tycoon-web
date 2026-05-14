import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase } from '@property-tycoon/shared';
import { HelpCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface QuickGuidePanelProps {
  isExpanded: boolean;
}

export const QuickGuidePanel: React.FC<QuickGuidePanelProps> = ({ isExpanded }) => {
  const { state } = useGameStore();

  const getPhaseHint = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return {
          title: 'Đến lượt bạn',
          text: 'Tung xúc xắc để bắt đầu di chuyển trên bàn cờ.',
          icon: <Lightbulb className="text-amber-500" size={18} />,
          color: 'border-amber-200 bg-amber-50/90'
        };
      case Phase.BUY_DECISION:
        return {
          title: 'Quyết định mua',
          text: 'Sở hữu đất giúp bạn thu tiền thuê từ người khác.',
          icon: <Info className="text-blue-500" size={18} />,
          color: 'border-blue-200 bg-blue-50/90'
        };
      case Phase.BUILD_DECISION:
        return {
          title: 'Nâng cấp tài sản',
          text: 'Xây nhà khi đủ bộ màu để tăng mạnh tiền thuê.',
          icon: <HelpCircle className="text-emerald-500" size={18} />,
          color: 'border-emerald-200 bg-emerald-50/90'
        };
      case Phase.DEBT_RESOLUTION:
        return {
          title: 'Giải quyết nợ',
          text: 'Thế chấp hoặc bán tài sản để trả nợ. Tránh phá sản!',
          icon: <AlertTriangle className="text-rose-500" size={18} />,
          color: 'border-rose-200 bg-rose-50/90'
        };
      default:
        return {
          title: 'Mẹo chơi',
          text: 'Cố gắng thu thập đủ bộ màu để có quyền xây nhà.',
          icon: <HelpCircle className="text-slate-400" size={18} />,
          color: 'border-slate-200 bg-white/90'
        };
    }
  };

  if (!isExpanded) return null;

  const hint = getPhaseHint();

  return (
    <div className={`border backdrop-blur-md rounded-3xl shadow-xl overflow-hidden ${hint.color}`}>
      <div className="p-4 flex items-center gap-3">
        {hint.icon}
        <span className="font-black text-xs uppercase tracking-wider text-slate-700">{hint.title}</span>
      </div>
      <div className="px-5 pb-5">
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
      </div>
    </div>
  );
};
