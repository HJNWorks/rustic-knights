# Game rules

Coordinate system: `Position { x, y }` with `x` file 0-7 (a-h) and `y` rank 0-7. White starts on ranks 0-1. Conversion to chessops squares / UCI is in `frontend/src/game/rules/squares.ts`.

## Current (Phase 0)

`ChessGame` is an adapter around [chessops](https://github.com/niklasf/chessops) `Chess`. It holds a FEN position. Babylon `Board` / `Piece` apply already-legal moves to meshes.

- Start: `Chess.default()`, or `?fen=` on the Vite URL
- `legalDests(from)` drives contour highlights
- `play(from, to, promotion?)` refuses illegal moves, including moving into check
- Castling, en passant, promotion (chooser; queen if the adapter is called without a role)
- Check, checkmate, stalemate, insufficient material
- Outcome strings: `1-0`, `0-1`, `1/2-1/2`

Turn comes from `position.turn`. Opponent pieces are not selectable except as capture targets.

### Coordinate mapping

- File `x` 0-7 -> `a`-`h`
- Rank `y` 0-7 -> `1`-`8`
- `{x:4,y:1}` to `{x:4,y:3}` is `e2e4`

## Target (later phases)

Unchanged adapter. Phase 1 animates the same `PlayedMoveFlags`. Phase 2 feeds FEN to Stockfish. Phase 4 validates UCI on the server with `shakmaty`.
