export type CardSize = 'XL' | 'L' | 'M' | 'S';
export type CoinSize = 'SMALL' | 'BIG';

export type FrameStatus = 'NONE' | 'READY' | 'IN_PROGRESS' | 'CLOSED' | 'REALITY_LIMITS';

export type RingType = 'NONE' | 'KITCHEN' | 'SERVICE' | 'LOGISTICS' | 'MANAGEMENT';

export type PaletteType = 'STANDART' | 'ALTERNATIF' | 'OPERASYONEL';

export interface BoardItem {
  id: string;
  type: 'CARD' | 'COIN';
  size: CardSize | CoinSize;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  categoryTag?: string;
  frameStatus: FrameStatus;
  ringType?: RingType;
  ringTone?: 'LIGHT' | 'DARK';
  colorHex?: string;
  bgHex?: string;
  zIndex: number;
}

export interface BoardEdge {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  isDashed?: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  items: BoardItem[];
  edges: BoardEdge[];
  updatedAt: string;
}
