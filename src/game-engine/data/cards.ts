import { TileType, type Card } from '../types/game';

export const CHANCE_CARDS: Card[] = [
  {
    id: 'chance-1',
    type: TileType.CHANCE,
    description: 'Bị phạt quá tốc độ. Trả 15$.',
    action: { type: 'PAY_MONEY', amount: 15 },
  },
  {
    id: 'chance-2',
    type: TileType.CHANCE,
    description: 'Ngân hàng trả lãi. Nhận 50$.',
    action: { type: 'RECEIVE_MONEY', amount: 50 },
  },
  {
    id: 'chance-3',
    type: TileType.CHANCE,
    description: 'Tiến đến ô Bắt Đầu. Nhận 200$.',
    action: { type: 'MOVE_TO_TILE', position: 0 },
  },
  {
    id: 'chance-4',
    type: TileType.CHANCE,
    description: 'Tiến đến Phố Hàng Đào.',
    action: { type: 'MOVE_TO_TILE', position: 43 },
  },
  {
    id: 'chance-5',
    type: TileType.CHANCE,
    description: 'Vào tù ngay lập tức. Không đi qua ô Bắt đầu, không nhận 200$.',
    action: { type: 'GO_TO_JAIL' },
  },
];

export const FORTUNE_CARDS: Card[] = [
  {
    id: 'fortune-1',
    type: TileType.FORTUNE,
    description: 'Phí khám bệnh. Trả 50$.',
    action: { type: 'PAY_MONEY', amount: 50 },
  },
  {
    id: 'fortune-2',
    type: TileType.FORTUNE,
    description: 'Bán cổ phiếu có lãi. Nhận 100$.',
    action: { type: 'RECEIVE_MONEY', amount: 100 },
  },
  {
    id: 'fortune-3',
    type: TileType.FORTUNE,
    description: 'Phí bảo hiểm đáo hạn. Nhận 100$.',
    action: { type: 'RECEIVE_MONEY', amount: 100 },
  },
  {
    id: 'fortune-4',
    type: TileType.FORTUNE,
    description: 'Đi học. Trả 50$.',
    action: { type: 'PAY_MONEY', amount: 50 },
  },
  {
    id: 'fortune-5',
    type: TileType.FORTUNE,
    description: 'Vào tù ngay lập tức. Không đi qua ô Bắt đầu, không nhận 200$.',
    action: { type: 'GO_TO_JAIL' },
  },
];
