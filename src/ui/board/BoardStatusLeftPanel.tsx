import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TileType } from '../../game-engine/types/game';
import type { BoardTile, Player, Property } from '../../game-engine/types/game';
import { BoardStatusLeftEnvironment } from './BoardStatusLeftEnvironment';

export const BoardStatusLeftPanel: React.FC<{ currentTile?: BoardTile; players: Player[] }> = ({
  currentTile,
  players,
}) => {
  if (!currentTile) return null;

  const palette = getTilePalette(currentTile);
  const property = currentTile.type === TileType.PROPERTY ? (currentTile as Property) : null;
  const owner = property?.ownerId ? players.find((player) => player.id === property.ownerId) : null;
  const effectInfo = getTileEffectInfo(currentTile, property, owner);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTile.id}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        className="board-status-left-panel w-full max-w-[250px] shrink-0 sm:max-w-[270px] lg:max-w-[290px]"
      >
        <BoardStatusLeftEnvironment />

        <div className="board-status-left-content flex min-h-[280px] flex-col justify-between px-4 pb-4 pt-5 md:min-h-[320px] md:px-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: palette.eyebrow }}>
                  Tile Effect
                </p>
                <h3 className="text-base font-black leading-tight text-slate-900 md:text-lg">{currentTile.name}</h3>
              </div>

              <div
                className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] shadow-sm"
                style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
              >
                {effectInfo.badge}
              </div>
            </div>

            <div
              className="rounded-[1.4rem] border border-white/60 p-3 backdrop-blur-[2px] md:p-4"
              style={{ background: palette.panel }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.eyebrow }}>
                {effectInfo.title}
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug text-slate-700">{effectInfo.description}</p>
              <p className="mt-2 text-[11px] font-bold leading-snug text-slate-500">{effectInfo.detail}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 pt-4">
            <div className="max-w-[65%] rounded-2xl border border-white/60 bg-white/72 px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.8)] backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">Ambient Layer</p>
              <p className="mt-1 text-xs font-bold leading-snug text-slate-700">
                Environment động phía sau, nội dung gameplay luôn nằm lớp trên.
              </p>
            </div>

            {currentTile.imageUrl ? (
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.8)] backdrop-blur-sm">
                <img src={currentTile.imageUrl} alt={currentTile.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="h-14 w-14 rounded-2xl shadow-[0_16px_36px_-28px_rgba(15,23,42,0.8)]"
                style={{ background: palette.orb }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const getTilePalette = (tile: BoardTile) => {
  switch (tile.type) {
    case TileType.PROPERTY: {
      const property = tile as Property;
      return {
        panel: `linear-gradient(180deg, ${property.groupId}18 0%, rgba(255,255,255,0.9) 42%, rgba(255,255,255,0.82) 100%)`,
        eyebrow: property.groupId,
        badgeBg: property.groupId,
        badgeText: '#ffffff',
        orb: `radial-gradient(circle at 50% 45%, ${property.groupId} 0%, ${property.groupId}55 36%, transparent 72%)`,
      };
    }
    case TileType.CHANCE:
      return buildSpecialPalette('#2563eb', '#1d4ed8');
    case TileType.FORTUNE:
      return buildSpecialPalette('#8b5cf6', '#7c3aed');
    case TileType.TAX:
      return buildSpecialPalette('#dc2626', '#b91c1c');
    case TileType.JAIL:
    case TileType.GO_TO_JAIL:
      return buildSpecialPalette('#0f172a', '#334155');
    case TileType.REST:
      return buildSpecialPalette('#0f766e', '#0f766e');
    case TileType.START:
    default:
      return buildSpecialPalette('#f59e0b', '#d97706');
  }
};

const buildSpecialPalette = (primary: string, deep: string) => ({
  panel: `linear-gradient(180deg, ${primary}14 0%, rgba(255,255,255,0.9) 42%, rgba(255,255,255,0.82) 100%)`,
  eyebrow: deep,
  badgeBg: `${primary}20`,
  badgeText: deep,
  orb: `radial-gradient(circle at 50% 45%, ${primary} 0%, ${primary}55 36%, transparent 72%)`,
});

const getTileEffectInfo = (tile: BoardTile, property: Property | null, owner?: Player | null) => {
  switch (tile.type) {
    case TileType.PROPERTY:
      return {
        badge: property?.kind === 'UTILITY' ? 'Utility' : property?.kind === 'STATION' ? 'Transit' : 'Property',
        title: owner ? 'Hiệu ứng sẽ phản hồi theo chủ sở hữu' : 'Ô này sẵn sàng để đầu tư',
        description: owner
          ? `Người chơi dừng tại đây sẽ tương tác với tài sản của ${owner.name}.`
          : 'Nếu người chơi dừng ở đây, đây là điểm mua và phát triển tài sản.',
        detail: owner
          ? `Tiền thuê hiện tại ${getPropertyRent(property)}. Cấp xây dựng ${property?.buildingLevel ?? 0}.`
          : `Giá niêm yết ${formatMoney(property?.price)}. Có thể thay background/effect riêng theo tile sau này.`,
      };
    case TileType.CHANCE:
      return {
        badge: 'Chance',
        title: 'Rút thẻ biến động',
        description: 'Người chơi sẽ kích hoạt một thẻ Khí Vận với hiệu ứng ngẫu nhiên.',
        detail: 'Có thể nối thêm animation lật thẻ hoặc burst effect phía trên nền môi trường này.',
      };
    case TileType.FORTUNE:
      return {
        badge: 'Fortune',
        title: 'Rút thẻ sự kiện',
        description: 'Người chơi sẽ nhận một sự kiện Cơ Hội có thể đổi vị trí hoặc tiền.',
        detail: 'Panel này hỗ trợ đặt thêm lớp effect riêng mà không cần đổi layout tổng.',
      };
    case TileType.TAX:
      return {
        badge: 'Tax',
        title: 'Thanh toán bắt buộc',
        description: 'Tile này gây hiệu ứng trừ tiền ngay khi người chơi kết thúc lượt tại đây.',
        detail: 'Có thể thêm layer đỏ hoặc icon động, nhưng nên giữ nền hiện tại ở opacity thấp.',
      };
    case TileType.JAIL:
      return {
        badge: 'Jail',
        title: 'Vùng cách ly',
        description: 'Đây là ô nhà tù hoặc ô thăm tù, không phải lúc nào cũng gây phạt trực tiếp.',
        detail: 'Tile này hợp với mood effect tĩnh hoặc slow pulse thay vì animation mạnh.',
      };
    case TileType.GO_TO_JAIL:
      return {
        badge: 'Penalty',
        title: 'Dịch chuyển vào tù',
        description: 'Người chơi dừng ở đây sẽ bị đưa ngay tới ô nhà tù.',
        detail: 'Bạn có thể gắn thêm teleport effect hoặc directional streak phía trên content panel.',
      };
    case TileType.REST:
      return {
        badge: 'Rest',
        title: 'Vùng nghỉ',
        description: 'Tile này thiên về nhịp nghỉ, không gây thanh toán hay mua bán.',
        detail: 'Nền hiện tại đã ưu tiên ambience dịu; có thể giảm motion thêm nếu muốn thư hơn.',
      };
    case TileType.START:
    default:
      return {
        badge: 'Start',
        title: 'Điểm khởi hành',
        description: 'Tile này đánh dấu vòng mới và thường gắn với phần thưởng khi đi qua.',
        detail: 'Có thể thêm ánh sáng hoặc ribbon effect ở layer trên cùng mà không che text.',
      };
  }
};

const getPropertyRent = (property: Property | null) => {
  if (!property) return '$0';

  const rent = property.rentLevels
    ? property.rentLevels[property.buildingLevel] ?? property.rentLevels[0]
    : property.rent;

  return formatMoney(rent);
};

const formatMoney = (amount?: number) => `$${(amount ?? 0).toLocaleString()}`;
