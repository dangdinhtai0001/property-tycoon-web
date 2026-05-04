import { type BoardTile, TileType, type Property, PropertyGroup, PropertyKind } from '../../types/game';
import { MORTGAGE_RATE } from '../../../config/gameplay';
import { TILE_NAMES } from '../../../config/text';

const tileId = (position: number) => `tile-${position}`;

type RentLevels = readonly [number, number, number, number, number, number];
type NonPropertyTileType = Exclude<TileType, TileType.PROPERTY>;

type BaseTileConfig = {
  type: TileType;
  name: string;
  shortName?: string;
  position: number;
  imageUrl: string;
  backgroundColor?: number;
};

type PropertyTileConfig = BaseTileConfig & {
  type: TileType.PROPERTY;
  kind?: PropertyKind; // Optional, can be inferred from groupId if missing
  price: number;
  groupId: PropertyGroup;
  rent?: number;
  rentLevels?: RentLevels;
  buildingCost?: number;
};

type SpecialTileConfig = BaseTileConfig & {
  type: NonPropertyTileType;
};

type BoardTileConfig = PropertyTileConfig | SpecialTileConfig;

const BUILDING_COST_BY_GROUP: Partial<Record<PropertyGroup, number>> = {
  [PropertyGroup.BROWN]: 50,
  [PropertyGroup.LIGHT_BLUE]: 50,
  [PropertyGroup.PINK]: 100,
  [PropertyGroup.ORANGE]: 100,
  [PropertyGroup.RED]: 150,
  [PropertyGroup.YELLOW]: 150,
  [PropertyGroup.GREEN]: 200,
  [PropertyGroup.DARK_BLUE]: 200,
  [PropertyGroup.PURPLE]: 250,
  [PropertyGroup.GRAY]: 250,
};

const getSpecialTileColor = (type: TileType): number | undefined => {
  if (type === TileType.CHANCE) return 0xFEF08A; // Yellow-200
  if (type === TileType.FORTUNE) return 0xFECACA; // Red-200
  if (type === TileType.TAX) return 0xFFFBEB;
  return undefined;
};

const BOARD_TILE_CONFIGS = [
  // --- BOTTOM ROW (0 to 13) ---
  { type: TileType.START, name: TILE_NAMES[0], shortName: 'BẮT ĐẦU', position: 0, imageUrl: '/assets/tiles/start.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[1], shortName: 'Đường Lâm', position: 1, imageUrl: '', price: 60, groupId: PropertyGroup.BROWN, rentLevels: [2, 10, 30, 90, 160, 250] },
  { type: TileType.PROPERTY, name: TILE_NAMES[2], shortName: 'Vạn Phúc', position: 2, imageUrl: '', price: 60, groupId: PropertyGroup.BROWN, rentLevels: [4, 20, 60, 180, 320, 450] },
  { type: TileType.PROPERTY, name: TILE_NAMES[3], shortName: 'Phố đi bộ', position: 3, imageUrl: '', price: 70, groupId: PropertyGroup.LIGHT_BLUE, rentLevels: [4, 20, 60, 180, 320, 450] },
  { type: TileType.CHANCE, name: TILE_NAMES[4], shortName: 'KHÍ VẬN', position: 4, imageUrl: '/assets/tiles/chance-vertical.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[5], shortName: 'Cổ Loa', position: 5, imageUrl: '', price: 80, groupId: PropertyGroup.LIGHT_BLUE, rentLevels: [4, 20, 60, 180, 320, 450] },
  { type: TileType.PROPERTY, name: TILE_NAMES[6], shortName: 'Ngọc Sơn', position: 6, imageUrl: '', price: 80, groupId: PropertyGroup.LIGHT_BLUE, rentLevels: [4, 20, 60, 180, 320, 450] },
  { type: TileType.TAX, name: TILE_NAMES[7], shortName: 'THUẾ TN', position: 7, imageUrl: '/assets/tiles/tax.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[8], shortName: 'Giáp Bát', position: 8, imageUrl: '/assets/tiles/station.png', price: 200, rent: 25, groupId: PropertyGroup.STATION },
  { type: TileType.PROPERTY, name: TILE_NAMES[9], shortName: 'Bát Tràng', position: 9, imageUrl: '', price: 100, groupId: PropertyGroup.PINK, rentLevels: [6, 30, 90, 270, 400, 550] },
  { type: TileType.FORTUNE, name: TILE_NAMES[10], shortName: 'CƠ HỘI', position: 10, imageUrl: '/assets/tiles/fortune-vertical.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[11], shortName: 'Tây Phương', position: 11, imageUrl: '', price: 100, groupId: PropertyGroup.PINK, rentLevels: [6, 30, 90, 270, 400, 550] },
  { type: TileType.PROPERTY, name: TILE_NAMES[12], shortName: 'Yên Sở', position: 12, imageUrl: '', price: 110, groupId: PropertyGroup.PINK, rentLevels: [7, 35, 95, 280, 420, 580] },
  { type: TileType.JAIL, name: TILE_NAMES[13], shortName: 'NHÀ TÙ', position: 13, imageUrl: '/assets/tiles/jail.png' },

  // --- LEFT ROW (14 to 23) ---
  { type: TileType.PROPERTY, name: TILE_NAMES[14], shortName: 'Ba Vì', position: 14, imageUrl: '', price: 120, groupId: PropertyGroup.ORANGE, rentLevels: [8, 40, 100, 300, 450, 600] },
  { type: TileType.PROPERTY, name: TILE_NAMES[15], shortName: 'Ngọc Lâm', position: 15, imageUrl: '', price: 140, groupId: PropertyGroup.ORANGE, rentLevels: [10, 50, 150, 450, 625, 750] },
  { type: TileType.PROPERTY, name: TILE_NAMES[16], shortName: 'Nước Y.Phụ', position: 16, imageUrl: '', price: 150, rent: 0, groupId: PropertyGroup.UTILITY },
  { type: TileType.CHANCE, name: TILE_NAMES[17], shortName: 'KHÍ VẬN', position: 17, imageUrl: '/assets/tiles/chance-horizontal.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[18], shortName: 'V.Hưng', position: 18, imageUrl: '', price: 140, groupId: PropertyGroup.ORANGE, rentLevels: [10, 50, 150, 450, 625, 750] },
  { type: TileType.PROPERTY, name: TILE_NAMES[19], shortName: 'Nguyễn Văn Cừ', position: 19, imageUrl: '', price: 160, groupId: PropertyGroup.RED, rentLevels: [12, 60, 180, 500, 700, 900] },
  { type: TileType.PROPERTY, name: TILE_NAMES[20], shortName: 'Ga Hà Nội', position: 20, imageUrl: '/assets/tiles/station.png', price: 200, rent: 25, groupId: PropertyGroup.STATION },
  { type: TileType.PROPERTY, name: TILE_NAMES[21], shortName: 'Văn Miếu', position: 21, imageUrl: '', price: 180, groupId: PropertyGroup.RED, rentLevels: [14, 70, 200, 550, 750, 950] },
  { type: TileType.PROPERTY, name: TILE_NAMES[22], shortName: 'Hạ tầng', position: 22, imageUrl: '', price: 180, groupId: PropertyGroup.RED, rentLevels: [14, 70, 200, 550, 750, 950] },
  { type: TileType.FORTUNE, name: TILE_NAMES[23], shortName: 'CƠ HỘI', position: 23, imageUrl: '/assets/tiles/fortune-horizontal.png' },

  // --- TOP ROW (24 to 37) ---
  { type: TileType.REST, name: TILE_NAMES[24], shortName: 'CÔNG VIÊN', position: 24, imageUrl: '/assets/tiles/rest.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[25], shortName: 'Xã Đàn', position: 25, imageUrl: '', price: 180, groupId: PropertyGroup.YELLOW, rentLevels: [14, 70, 200, 550, 750, 950] },
  { type: TileType.PROPERTY, name: TILE_NAMES[26], shortName: 'Nguyễn Trãi', position: 26, imageUrl: '', price: 200, groupId: PropertyGroup.YELLOW, rentLevels: [16, 80, 220, 600, 800, 1000] },
  { type: TileType.PROPERTY, name: TILE_NAMES[27], shortName: 'Mỹ Đình', position: 27, imageUrl: '', price: 220, groupId: PropertyGroup.YELLOW, rentLevels: [18, 90, 250, 700, 875, 1050] },
  { type: TileType.CHANCE, name: TILE_NAMES[28], shortName: 'KHÍ VẬN', position: 28, imageUrl: '/assets/tiles/chance-vertical.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[29], shortName: 'Hội nghị QG', position: 29, imageUrl: '', price: 220, groupId: PropertyGroup.GREEN, rentLevels: [18, 90, 250, 700, 875, 1050] },
  { type: TileType.PROPERTY, name: TILE_NAMES[30], shortName: 'Keangnam', position: 30, imageUrl: '', price: 240, groupId: PropertyGroup.GREEN, rentLevels: [20, 100, 300, 750, 925, 1100] },
  { type: TileType.TAX, name: TILE_NAMES[31], shortName: 'THUẾ HT', position: 31, imageUrl: '/assets/tiles/tax.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[32], shortName: 'Giáp Bát', position: 32, imageUrl: '/assets/tiles/station.png', price: 200, rent: 25, groupId: PropertyGroup.STATION },
  { type: TileType.PROPERTY, name: TILE_NAMES[33], shortName: 'Duy Tân', position: 33, imageUrl: '', price: 260, groupId: PropertyGroup.GREEN, rentLevels: [22, 110, 330, 800, 975, 1150] },
  { type: TileType.FORTUNE, name: TILE_NAMES[34], shortName: 'CƠ HỘI', position: 34, imageUrl: '/assets/tiles/fortune-vertical.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[35], shortName: 'Nước P.Vân', position: 35, imageUrl: '', price: 150, rent: 0, groupId: PropertyGroup.UTILITY },
  { type: TileType.PROPERTY, name: TILE_NAMES[36], shortName: 'Xuân Diệu', position: 36, imageUrl: '', price: 280, groupId: PropertyGroup.DARK_BLUE, rentLevels: [24, 120, 360, 850, 1025, 1200] },
  { type: TileType.GO_TO_JAIL, name: 'Vào Nhà tù Hỏa Lò', shortName: 'VÀO TÙ', position: 37, imageUrl: '/assets/tiles/go_to_jail.png' },

  // --- RIGHT ROW (Pos 38 to 47) ---
  // --- RIGHT ROW (38 to 47) ---
  { type: TileType.PROPERTY, name: TILE_NAMES[38], shortName: 'Liễu Giai', position: 38, imageUrl: '', price: 300, groupId: PropertyGroup.DARK_BLUE, rentLevels: [26, 130, 390, 900, 1100, 1275] },
  { type: TileType.PROPERTY, name: TILE_NAMES[39], shortName: 'Kim Mã', position: 39, imageUrl: '', price: 300, groupId: PropertyGroup.DARK_BLUE, rentLevels: [26, 130, 390, 900, 1100, 1275] },
  { type: TileType.CHANCE, name: TILE_NAMES[40], shortName: 'KHÍ VẬN', position: 40, imageUrl: '/assets/tiles/chance-horizontal.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[41], shortName: 'Nguyễn C.Thanh', position: 41, imageUrl: '', price: 320, groupId: PropertyGroup.PURPLE, rentLevels: [28, 150, 450, 1000, 1200, 1400] },
  { type: TileType.PROPERTY, name: TILE_NAMES[42], shortName: 'Ga Gia Lâm', position: 42, imageUrl: '', price: 320, groupId: PropertyGroup.PURPLE, rentLevels: [28, 150, 450, 1000, 1200, 1400] },
  { type: TileType.PROPERTY, name: TILE_NAMES[43], shortName: 'Tràng Tiền', position: 43, imageUrl: '', price: 350, groupId: PropertyGroup.PURPLE, rentLevels: [35, 175, 500, 1100, 1300, 1500] },
  { type: TileType.PROPERTY, name: TILE_NAMES[44], shortName: 'Gia Lâm', position: 44, imageUrl: '/assets/tiles/station.png', price: 200, rent: 25, groupId: PropertyGroup.STATION },
  { type: TileType.PROPERTY, name: TILE_NAMES[45], shortName: 'Phan Đình Phùng', position: 45, imageUrl: '', price: 350, groupId: PropertyGroup.GRAY, rentLevels: [35, 175, 500, 1100, 1300, 1500] },
  { type: TileType.FORTUNE, name: TILE_NAMES[46], shortName: 'CƠ HỘI', position: 46, imageUrl: '/assets/tiles/fortune-horizontal.png' },
  { type: TileType.PROPERTY, name: TILE_NAMES[47], shortName: 'Hàng Đào', position: 47, imageUrl: '', price: 400, groupId: PropertyGroup.GRAY, rentLevels: [50, 200, 600, 1400, 1700, 2000] },
] satisfies readonly BoardTileConfig[];

const validateBoardTileConfigs = (configs: readonly BoardTileConfig[]) => {
  const positions = new Set(configs.map(({ position }) => position));

  if (positions.size !== configs.length) {
    throw new Error('BOARD_TILE_CONFIGS has duplicated positions.');
  }

  for (let position = 0; position < configs.length; position += 1) {
    if (!positions.has(position)) {
      throw new Error(`BOARD_TILE_CONFIGS is missing position ${position}.`);
    }
  }

  return configs;
};

const createSpecialTile = ({ type, name, shortName, position, imageUrl, backgroundColor }: SpecialTileConfig): BoardTile => ({
  id: tileId(position),
  type,
  name,
  shortName: shortName || name,
  position,
  imageUrl,
  backgroundColor: backgroundColor ?? getSpecialTileColor(type),
});

const createPropertyTile = ({
  name,
  shortName,
  position,
  imageUrl,
  price,
  groupId,
  kind,
  rent,
  rentLevels,
  buildingCost,
  backgroundColor,
}: PropertyTileConfig): Property => {
  // Infer kind from groupId if not provided
  let inferredKind = kind;
  if (!inferredKind) {
    if (groupId === PropertyGroup.STATION) inferredKind = PropertyKind.STATION;
    else if (groupId === PropertyGroup.UTILITY) inferredKind = PropertyKind.UTILITY;
    else inferredKind = PropertyKind.LAND;
  }

  return {
    id: tileId(position),
    type: TileType.PROPERTY,
    kind: inferredKind,
    name,
    shortName: shortName || name,
    position,
    price,
    rent: rent ?? rentLevels?.[0] ?? 0,
    groupId,
    buildingLevel: 0,
    buildingCost: buildingCost ?? BUILDING_COST_BY_GROUP[groupId] ?? 0,
    backgroundColor: backgroundColor ?? getSpecialTileColor(TileType.PROPERTY),
    ...(rentLevels ? { rentLevels: [...rentLevels] } : {}),
    isMortgaged: false,
    mortgageValue: price * MORTGAGE_RATE,
    ...(imageUrl ? { imageUrl } : {}),
  };
};

const createBoardTile = (config: BoardTileConfig): BoardTile => {
  if (config.type === TileType.PROPERTY) {
    return createPropertyTile(config);
  }

  return createSpecialTile(config);
};

const buildBoard = (configs: readonly BoardTileConfig[]): BoardTile[] =>
  [...validateBoardTileConfigs(configs)]
    .sort((current, next) => current.position - next.position)
    .map(createBoardTile);

export const BASIC_BOARD: BoardTile[] = buildBoard(BOARD_TILE_CONFIGS);