import { type BoardTile, TileType, type Property, PropertyGroup } from '../../types/game';

const MORTGAGE_RATIO = 0.5;

const tileId = (position: number) => `tile-${position}`;

type RentLevels = readonly [number, number, number, number, number, number];
type NonPropertyTileType = Exclude<TileType, TileType.PROPERTY>;

type BaseTileConfig = {
  type: TileType;
  name: string;
  shortName?: string;
  position: number;
  imageUrl: string;
};

type PropertyTileConfig = BaseTileConfig & {
  type: TileType.PROPERTY;
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
};

const BOARD_TILE_CONFIGS = [
  { type: TileType.START, name: 'Hồ Gươm - Xuất phát', shortName: 'BẮT ĐẦU', position: 0, imageUrl: '/assets/tiles/start.png' },
  {
    type: TileType.PROPERTY,
    name: 'Làng cổ Đường Lâm',
    shortName: 'Đường Lâm',
    position: 1,
    imageUrl: '',
    price: 60,
    groupId: PropertyGroup.BROWN,
    rentLevels: [2, 10, 30, 90, 160, 250],
  },
  { type: TileType.CHANCE, name: 'Khí Vận', shortName: 'KHÍ VẬN', position: 2, imageUrl: '/assets/tiles/chance-vertical.png' },
  {
    type: TileType.PROPERTY,
    name: 'Thành Cổ Loa',
    shortName: 'Cổ Loa',
    position: 3,
    imageUrl: '',
    price: 60,
    groupId: PropertyGroup.BROWN,
    rentLevels: [4, 20, 60, 180, 320, 450],
  },
  { type: TileType.TAX, name: 'Thuế thu nhập', shortName: 'THUẾ', position: 4, imageUrl: '/assets/tiles/tax.png' },
  {
    type: TileType.PROPERTY,
    name: 'Bến xe Giáp Bát',
    shortName: 'Giáp Bát',
    position: 5,
    imageUrl: '/assets/tiles/station.png',
    price: 200,
    rent: 25,
    groupId: PropertyGroup.STATION,
  },
  {
    type: TileType.PROPERTY,
    name: 'Làng gốm Bát Tràng',
    shortName: 'Bát Tràng',
    position: 6,
    imageUrl: '',
    price: 100,
    groupId: PropertyGroup.LIGHT_BLUE,
    rentLevels: [6, 30, 90, 270, 400, 550],
  },
  { type: TileType.FORTUNE, name: 'Cơ Hội', shortName: 'CƠ HỘI', position: 7, imageUrl: '/assets/tiles/fortune-vertical.png' },
  {
    type: TileType.PROPERTY,
    name: 'Chùa Tây Phương',
    shortName: 'Tây Phương',
    position: 8,
    imageUrl: '',
    price: 100,
    groupId: PropertyGroup.LIGHT_BLUE,
    rentLevels: [6, 30, 90, 270, 400, 550],
  },
  {
    type: TileType.PROPERTY,
    name: 'Vườn quốc gia Ba Vì',
    shortName: 'Ba Vì',
    position: 9,
    imageUrl: '',
    price: 120,
    groupId: PropertyGroup.LIGHT_BLUE,
    rentLevels: [8, 40, 100, 300, 450, 600],
  },
  { type: TileType.JAIL, name: 'Nhà tù Hỏa Lò / Thăm nuôi', shortName: 'NHÀ TÙ', position: 10, imageUrl: '/assets/tiles/jail.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Ngọc Lâm',
    shortName: 'Ngọc Lâm',
    position: 11,
    imageUrl: '',
    price: 140,
    groupId: PropertyGroup.PINK,
    rentLevels: [10, 50, 150, 450, 625, 750],
  },
  {
    type: TileType.PROPERTY,
    name: 'Nhà máy nước Yên Phụ',
    shortName: 'Nước Yên Phụ',
    position: 12,
    imageUrl: '',
    price: 150,
    rent: 0,
    groupId: PropertyGroup.UTILITY,
  },
  {
    type: TileType.PROPERTY,
    name: 'Khu đô thị Việt Hưng',
    shortName: 'Việt Hưng',
    position: 13,
    imageUrl: '',
    price: 140,
    groupId: PropertyGroup.PINK,
    rentLevels: [10, 50, 150, 450, 625, 750],
  },
  {
    type: TileType.PROPERTY,
    name: 'Phố Nguyễn Văn Cừ',
    shortName: 'Nguyễn Văn Cừ',
    position: 14,
    imageUrl: '',
    price: 160,
    groupId: PropertyGroup.PINK,
    rentLevels: [12, 60, 180, 500, 700, 900],
  },
  {
    type: TileType.PROPERTY,
    name: 'Ga Hà Nội',
    shortName: 'Ga Hà Nội',
    position: 15,
    imageUrl: '/assets/tiles/station.png',
    price: 200,
    rent: 25,
    groupId: PropertyGroup.STATION,
  },
  {
    type: TileType.PROPERTY,
    name: 'Văn Miếu - Quốc Tử Giám',
    shortName: 'Văn Miếu',
    position: 16,
    imageUrl: '',
    price: 180,
    groupId: PropertyGroup.ORANGE,
    rentLevels: [14, 70, 200, 550, 750, 950],
  },
  { type: TileType.CHANCE, name: 'Khí Vận', shortName: 'KHÍ VẬN', position: 17, imageUrl: '/assets/tiles/chance-horizontal.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Xã Đàn',
    shortName: 'Xã Đàn',
    position: 18,
    imageUrl: '',
    price: 180,
    groupId: PropertyGroup.ORANGE,
    rentLevels: [14, 70, 200, 550, 750, 950],
  },
  {
    type: TileType.PROPERTY,
    name: 'Royal City Nguyễn Trãi',
    shortName: 'Nguyễn Trãi',
    position: 19,
    imageUrl: '',
    price: 200,
    groupId: PropertyGroup.ORANGE,
    rentLevels: [16, 80, 220, 600, 800, 1000],
  },
  { type: TileType.REST, name: 'Công viên Thống Nhất', shortName: 'CÔNG VIÊN', position: 20, imageUrl: '/assets/tiles/rest.png' },
  {
    type: TileType.PROPERTY,
    name: 'Sân vận động Mỹ Đình',
    shortName: 'Mỹ Đình',
    position: 21,
    imageUrl: '',
    price: 220,
    groupId: PropertyGroup.RED,
    rentLevels: [18, 90, 250, 700, 875, 1050],
  },
  { type: TileType.FORTUNE, name: 'Cơ Hội', shortName: 'CƠ HỘI', position: 22, imageUrl: '/assets/tiles/fortune-vertical.png' },
  {
    type: TileType.PROPERTY,
    name: 'Trung tâm Hội nghị Quốc gia',
    shortName: 'Hội nghị QG',
    position: 23,
    imageUrl: '',
    price: 220,
    groupId: PropertyGroup.RED,
    rentLevels: [18, 90, 250, 700, 875, 1050],
  },
  {
    type: TileType.PROPERTY,
    name: 'Keangnam Landmark 72',
    shortName: 'Keangnam',
    position: 24,
    imageUrl: '',
    price: 240,
    groupId: PropertyGroup.RED,
    rentLevels: [20, 100, 300, 750, 925, 1100],
  },
  {
    type: TileType.PROPERTY,
    name: 'Bến xe Mỹ Đình',
    shortName: 'Bến xe Mỹ Đình',
    position: 25,
    imageUrl: '/assets/tiles/station.png',
    price: 200,
    rent: 25,
    groupId: PropertyGroup.STATION,
  },
  {
    type: TileType.PROPERTY,
    name: 'Phố Trần Duy Hưng',
    shortName: 'Trần Duy Hưng',
    position: 26,
    imageUrl: '',
    price: 260,
    groupId: PropertyGroup.YELLOW,
    rentLevels: [22, 110, 330, 800, 975, 1150],
  },
  {
    type: TileType.PROPERTY,
    name: 'Phố Duy Tân',
    shortName: 'Duy Tân',
    position: 27,
    imageUrl: '',
    price: 260,
    groupId: PropertyGroup.YELLOW,
    rentLevels: [22, 110, 330, 800, 975, 1150],
  },
  {
    type: TileType.PROPERTY,
    name: 'Nhà máy nước Pháp Vân',
    shortName: 'Nước Pháp Vân',
    position: 28,
    imageUrl: '',
    price: 150,
    rent: 0,
    groupId: PropertyGroup.UTILITY,
  },
  {
    type: TileType.PROPERTY,
    name: 'Phố Xuân Diệu',
    shortName: 'Xuân Diệu',
    position: 29,
    imageUrl: '',
    price: 280,
    groupId: PropertyGroup.YELLOW,
    rentLevels: [24, 120, 360, 850, 1025, 1200],
  },
  { type: TileType.GO_TO_JAIL, name: 'Vào Nhà tù Hỏa Lò', shortName: 'VÀO TÙ', position: 30, imageUrl: '/assets/tiles/go_to_jail.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Liễu Giai',
    shortName: 'Liễu Giai',
    position: 31,
    imageUrl: '',
    price: 300,
    groupId: PropertyGroup.GREEN,
    rentLevels: [26, 130, 390, 900, 1100, 1275],
  },
  {
    type: TileType.PROPERTY,
    name: 'Phố Kim Mã',
    shortName: 'Kim Mã',
    position: 32,
    imageUrl: '',
    price: 300,
    groupId: PropertyGroup.GREEN,
    rentLevels: [26, 130, 390, 900, 1100, 1275],
  },
  { type: TileType.CHANCE, name: 'Khí Vận', shortName: 'KHÍ VẬN', position: 33, imageUrl: '/assets/tiles/chance-horizontal.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Nguyễn Chí Thanh',
    shortName: 'Nguyễn Chí Thanh',
    position: 34,
    imageUrl: '',
    price: 320,
    groupId: PropertyGroup.GREEN,
    rentLevels: [28, 150, 450, 1000, 1200, 1400],
  },
  {
    type: TileType.PROPERTY,
    name: 'Ga Gia Lâm',
    shortName: 'Ga Gia Lâm',
    position: 35,
    imageUrl: '/assets/tiles/station.png',
    price: 200,
    rent: 25,
    groupId: PropertyGroup.STATION,
  },
  { type: TileType.FORTUNE, name: 'Cơ Hội', shortName: 'CƠ HỘI', position: 36, imageUrl: '/assets/tiles/fortune-horizontal.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Tràng Tiền',
    shortName: 'Tràng Tiền',
    position: 37,
    imageUrl: '',
    price: 350,
    groupId: PropertyGroup.DARK_BLUE,
    rentLevels: [35, 175, 500, 1100, 1300, 1500],
  },
  { type: TileType.TAX, name: 'Thuế xa xỉ', shortName: 'THUẾ XA XỈ', position: 38, imageUrl: '/assets/tiles/luxury_tax.png' },
  {
    type: TileType.PROPERTY,
    name: 'Phố Hàng Đào',
    shortName: 'Hàng Đào',
    position: 39,
    imageUrl: '',
    price: 400,
    groupId: PropertyGroup.DARK_BLUE,
    rentLevels: [50, 200, 600, 1400, 1700, 2000],
  },
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

const createSpecialTile = ({ type, name, shortName, position, imageUrl }: SpecialTileConfig): BoardTile => ({
  id: tileId(position),
  type,
  name,
  shortName: shortName || name,
  position,
  imageUrl,
});

const createPropertyTile = ({
  name,
  shortName,
  position,
  imageUrl,
  price,
  groupId,
  rent,
  rentLevels,
  buildingCost,
}: PropertyTileConfig): Property => ({
  id: tileId(position),
  type: TileType.PROPERTY,
  name,
  shortName: shortName || name,
  position,
  price,
  rent: rent ?? rentLevels?.[0] ?? 0,
  groupId,
  buildingLevel: 0,
  buildingCost: buildingCost ?? BUILDING_COST_BY_GROUP[groupId] ?? 0,
  ...(rentLevels ? { rentLevels: [...rentLevels] } : {}),
  isMortgaged: false,
  mortgageValue: price * MORTGAGE_RATIO,
  ...(imageUrl ? { imageUrl } : {}),
});

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