import { parseSquare, makeSquare, squareFile, squareRank } from 'chessops/util';
import type { Square } from 'chessops/types';
import type { Position } from '../../types/chess';

export function positionToSquare(position: Position): Square {
  const file = String.fromCharCode('a'.charCodeAt(0) + position.x);
  const rank = String(position.y + 1);
  const square = parseSquare(`${file}${rank}`);
  if (square === undefined) {
    throw new Error(`Invalid board position ${position.x},${position.y}`);
  }
  return square;
}

export function squareToPosition(square: Square): Position {
  return {
    x: squareFile(square),
    y: squareRank(square),
  };
}

export function positionToAlgebraic(position: Position): string {
  return makeSquare(positionToSquare(position));
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
