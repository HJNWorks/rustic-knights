import { Chess, castlingSide } from 'chessops/chess';
import { parseFen, makeFen } from 'chessops/fen';
import { makeUci, rookCastlesTo, squareRank } from 'chessops/util';
import type { Move, Role } from 'chessops/types';
import type {
  ChessColor,
  ChessPieceType,
  MoveResult,
  PlayedMoveFlags,
  Position,
  PromotionRole,
} from '../../types/chess';
import { positionToSquare, squareToPosition } from './squares';

function roleToPieceType(role: Role): ChessPieceType {
  return role;
}

export class ChessGame {
  private position: Chess;
  private uciMoves: string[] = [];

  constructor(fen?: string) {
    this.position = this.positionFromFen(fen);
  }

  private positionFromFen(fen?: string): Chess {
    if (!fen) {
      return Chess.default();
    }
    const setup = parseFen(fen);
    if (setup.isErr) {
      throw new Error(`Invalid FEN: ${fen}`);
    }
    const loaded = Chess.fromSetup(setup.value);
    if (loaded.isErr) {
      throw new Error(`Illegal FEN setup: ${fen}`);
    }
    return loaded.value;
  }

  public loadFen(fen: string): void {
    this.position = this.positionFromFen(fen);
    this.uciMoves = [];
  }

  public placedPieces(): { type: ChessPieceType; color: ChessColor; position: Position }[] {
    const pieces: { type: ChessPieceType; color: ChessColor; position: Position }[] = [];
    for (const [square, piece] of this.position.board) {
      pieces.push({
        type: roleToPieceType(piece.role),
        color: piece.color,
        position: squareToPosition(square),
      });
    }
    return pieces;
  }

  public getCurrentTurn(): ChessColor {
    return this.position.turn;
  }

  public fen(): string {
    return makeFen(this.position.toSetup());
  }

  public isCheck(): boolean {
    return this.position.isCheck();
  }

  public outcome(): string | undefined {
    const result = this.position.outcome();
    if (!result) {
      return undefined;
    }
    if (result.winner === 'white') {
      return '1-0';
    }
    if (result.winner === 'black') {
      return '0-1';
    }
    return '1/2-1/2';
  }

  public isEnded(): boolean {
    return this.position.isEnd();
  }

  public legalDests(from: Position): Position[] {
    const dests = this.position.dests(positionToSquare(from));
    const result: Position[] = [];
    for (const square of dests) {
      result.push(squareToPosition(square));
    }
    return result;
  }

  public needsPromotion(from: Position, to: Position): boolean {
    const fromSquare = positionToSquare(from);
    const piece = this.position.board.get(fromSquare);
    if (!piece || piece.role !== 'pawn') {
      return false;
    }
    const toRank = squareRank(positionToSquare(to));
    return toRank === 0 || toRank === 7;
  }

  public play(from: Position, to: Position, promotion?: PromotionRole): MoveResult {
    if (this.position.isEnd()) {
      return { valid: false, message: 'Game is over', outcome: this.outcome() };
    }

    if (this.needsPromotion(from, to) && !promotion) {
      return {
        valid: false,
        needsPromotion: true,
        from,
        to,
        message: 'Promotion required',
      };
    }

    const move = this.buildMove(from, to, promotion);
    if (!this.position.isLegal(move)) {
      return { valid: false, message: 'Illegal move' };
    }

    const flags = this.inspectMove(move, promotion);
    this.position.play(move);
    this.uciMoves.push(makeUci(move));

    flags.check = this.position.isCheck();
    flags.mate = this.position.isCheckmate();
    flags.draw = this.position.isStalemate() || this.position.isInsufficientMaterial();
    const outcome = this.outcome();

    return {
      valid: true,
      from,
      to,
      flags,
      outcome,
    };
  }

  public getGameNotation(): string {
    return this.uciMoves.join(' ');
  }

  private buildMove(from: Position, to: Position, promotion?: PromotionRole): Move {
    const move: Move = {
      from: positionToSquare(from),
      to: positionToSquare(to),
    };
    if (promotion) {
      move.promotion = promotion;
    }
    return move;
  }

  private inspectMove(move: Move, promotion?: PromotionRole): PlayedMoveFlags {
    if (!('from' in move)) {
      return {
        capture: false,
        enPassant: false,
        check: false,
        mate: false,
        draw: false,
      };
    }

    const from = move.from;
    const to = move.to;
    const moving = this.position.board.get(from);
    const captured = this.position.board.get(to);
    const side = castlingSide(this.position, move);
    const enPassant = moving?.role === 'pawn' && this.position.epSquare === to && !captured;

    const flags: PlayedMoveFlags = {
      capture: Boolean(captured) || enPassant,
      enPassant,
      check: false,
      mate: false,
      draw: false,
    };

    if (captured) {
      flags.capturedType = roleToPieceType(captured.role);
    }

    if (enPassant) {
      flags.enPassantCapture = squareToPosition(to + (moving?.color === 'white' ? -8 : 8));
      flags.capturedType = 'pawn';
    }

    if (side && moving) {
      flags.castle = side;
      const rookFrom = this.position.castles.rook[moving.color][side];
      if (rookFrom !== undefined) {
        flags.rookFrom = squareToPosition(rookFrom);
        flags.rookTo = squareToPosition(rookCastlesTo(moving.color, side));
      }
    }

    if (promotion) {
      flags.promotion = promotion;
    }

    return flags;
  }
}
