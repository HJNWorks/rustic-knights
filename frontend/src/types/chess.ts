export type ChessPieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type ChessColor = 'white' | 'black';
export type PromotionRole = 'queen' | 'rook' | 'bishop' | 'knight';

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessColor;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayedMoveFlags {
  capture: boolean;
  enPassant: boolean;
  enPassantCapture?: Position;
  castle?: 'a' | 'h';
  rookFrom?: Position;
  rookTo?: Position;
  promotion?: PromotionRole;
  check: boolean;
  mate: boolean;
  draw: boolean;
  capturedType?: ChessPieceType;
}

export interface MoveResult {
  valid: boolean;
  message?: string;
  needsPromotion?: boolean;
  from?: Position;
  to?: Position;
  flags?: PlayedMoveFlags;
  outcome?: string;
}

export interface MoveRecord {
  piece: ChessPieceType;
  from: Position;
  to: Position;
  isWhite: boolean;
  turn: number;
}

export enum SquareHighlightState {
  DEFAULT,
  HOVER,
  SELECTED,
  VALID_MOVE,
  LAST_MOVE,
  CHECK,
  ENDANGERED,
  CONTOUR,
}
